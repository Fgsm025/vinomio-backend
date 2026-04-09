import { Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import { PDFParse } from 'pdf-parse';
import { Prisma } from '@prisma/client';
import {
  normalizeCountryForChunkStorage,
  normalizeDocumentCategory,
} from './farm-country-normalize';
import { PrismaService } from '../prisma/prisma.service';

export interface IngestPdfOptions {
  /** ISO code, English label as in Farm.country, or GLOBAL */
  country?: string;
  category?: string;
  /** When set, chunks are private to this user; skips LLM metadata (uses MANUAL + country). */
  ownerId?: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  private readonly embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
    dimensions: 1536,
  });

  constructor(private readonly prisma: PrismaService) {}

  private parseMetadataJson(text: string): { country: string; category: string } {
    try {
      const o = JSON.parse(text) as Record<string, unknown>;
      const country = typeof o.country === 'string' ? o.country.trim() : 'AR';
      const category =
        typeof o.category === 'string' ? o.category.trim() : 'VADEMECUM';
      return { country, category };
    } catch {
      return { country: 'AR', category: 'VADEMECUM' };
    }
  }

  private async extractMetadataWithLLM(
    excerpt: string,
  ): Promise<{ country: string; category: string }> {
    const system = `You extract metadata from agricultural regulatory or technical PDF excerpts.
Return JSON only with keys "country" and "category" (no markdown).
- country: ISO 3166-1 alpha-2 code (AR, ES, CL, US, FR, ...) for the main jurisdiction the document applies to. Use "GLOBAL" only if the text is clearly international (e.g. GlobalGAP, Rainforest Alliance, EU-wide with no single country) and not specific to one nation.
- category: exactly one of NORMATIVA, VADEMECUM, MANUAL, CERTIFICACION, OTHER.`;

    const user = `Excerpt:\n---\n${excerpt.slice(0, 3000)}\n---`;

    if (process.env.OPENAI_API_KEY?.trim()) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.1,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      const text = res.choices[0]?.message?.content ?? '{}';
      return this.parseMetadataJson(text);
    }

    if (process.env.GROQ_API_KEY?.trim()) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const res = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `${system} Output raw JSON only.`,
          },
          { role: 'user', content: user },
        ],
      });
      const text = res.choices[0]?.message?.content ?? '{}';
      return this.parseMetadataJson(text);
    }

    this.logger.warn(
      'No OPENAI_API_KEY or GROQ_API_KEY for metadata extraction; using defaults',
    );
    return { country: 'AR', category: 'VADEMECUM' };
  }

  /**
   * @param prismaTx When provided, chunk INSERTs use this client (caller must wrap in `$transaction`).
   *   When omitted, INSERTs run inside an internal transaction (all chunks or none).
   */
  async processPdf(
    pdfBuffer: Buffer,
    sourceName: string,
    options?: IngestPdfOptions,
    prismaTx?: Prisma.TransactionClient,
  ) {
    try {
      if (!process.env.OPENAI_API_KEY?.trim()) {
        throw new Error(
          'OPENAI_API_KEY is missing. Groq keys cannot be used with OpenAIEmbeddings; set OPENAI_API_KEY for ingestion.',
        );
      }

      const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
      let fullText: string;
      try {
        const textResult = await parser.getText();
        fullText = textResult.text;
      } finally {
        await parser.destroy();
      }

      const ownerId = options?.ownerId?.trim() ? options.ownerId.trim() : null;

      let countryRaw: string;
      let categoryRaw: string;

      if (ownerId) {
        countryRaw = options?.country?.trim() || 'AR';
        categoryRaw = 'MANUAL';
      } else {
        const needAiCountry = !options?.country?.trim();
        const needAiCategory = !options?.category?.trim();
        let ai: { country: string; category: string } | null = null;
        if (needAiCountry || needAiCategory) {
          try {
            ai = await this.extractMetadataWithLLM(fullText);
          } catch (e) {
            this.logger.error('extractMetadataWithLLM failed', e);
            ai = { country: 'AR', category: 'VADEMECUM' };
          }
        }

        countryRaw =
          options?.country?.trim() || ai?.country?.trim() || 'AR';
        categoryRaw =
          options?.category?.trim() || ai?.category?.trim() || 'VADEMECUM';
      }

      const countryForDb = normalizeCountryForChunkStorage(countryRaw);
      const category = normalizeDocumentCategory(categoryRaw);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await splitter.createDocuments([fullText]);

      type ChunkRow = {
        content: string;
        vectorLiteral: string;
        sourceName: string;
        category: string;
        countryForDb: string;
        ownerId: string | null;
      };
      const chunkRows: ChunkRow[] = [];

      for (const doc of docs) {
        const vector = await this.embeddings.embedQuery(doc.pageContent);
        if (vector.length !== 1536) {
          throw new Error(
            `Expected embedding dimension 1536, got ${vector.length} (check model and dimensions config).`,
          );
        }
        const vectorLiteral = `[${vector.join(',')}]`;
        chunkRows.push({
          content: doc.pageContent,
          vectorLiteral,
          sourceName,
          category,
          countryForDb,
          ownerId,
        });
      }

      const insertAll = async (client: Pick<Prisma.TransactionClient, '$executeRawUnsafe'>) => {
        for (const row of chunkRows) {
          await client.$executeRawUnsafe(
            `
        INSERT INTO document_chunks (id, content, embedding, source, category, country, owner_id)
        VALUES ((gen_random_uuid())::text, $1, $2::vector, $3, $4, $5, $6);
        `,
            row.content,
            row.vectorLiteral,
            row.sourceName,
            row.category,
            row.countryForDb,
            row.ownerId,
          );
        }
      };

      if (prismaTx) {
        await insertAll(prismaTx);
      } else {
        await this.prisma.$transaction(async (innerTx) => {
          await insertAll(innerTx);
        });
      }

      return {
        message: 'Ingestion complete',
        chunks: docs.length,
        country: countryForDb,
        category,
        ownerId: ownerId ?? undefined,
      };
    } catch (error) {
      this.logger.error('[IngestionService.processPdf]', error);
      throw error;
    }
  }
}
