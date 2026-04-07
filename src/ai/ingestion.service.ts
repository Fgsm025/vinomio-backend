import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFParse } from 'pdf-parse';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngestionService {
  // Embeddings are OpenAI-only (text-embedding-3-small). Groq does not expose this model; use OPENAI_API_KEY.
  private readonly embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
    dimensions: 1536,
  });

  constructor(private readonly prisma: PrismaService) {}

  async processPdf(pdfBuffer: Buffer, sourceName: string) {
    try {
      if (!process.env.OPENAI_API_KEY?.trim()) {
        throw new Error(
          'OPENAI_API_KEY is missing. Groq keys cannot be used with OpenAIEmbeddings; set OPENAI_API_KEY for ingestion.',
        );
      }

      const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
      let text: string;
      try {
        const textResult = await parser.getText();
        text = textResult.text;
      } finally {
        await parser.destroy();
      }

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await splitter.createDocuments([text]);

      for (const doc of docs) {
        const vector = await this.embeddings.embedQuery(doc.pageContent);
        if (vector.length !== 1536) {
          throw new Error(
            `Expected embedding dimension 1536, got ${vector.length} (check model and dimensions config).`,
          );
        }
        // pgvector text literal: '[f1,f2,...]' then cast with ::vector in SQL
        const vectorLiteral = `[${vector.join(',')}]`;

        await this.prisma.$executeRawUnsafe(
          `
        INSERT INTO document_chunks (id, content, embedding, source, category, country)
        VALUES ((gen_random_uuid())::text, $1, $2::vector, $3, 'vademecum', 'AR');
        `,
          doc.pageContent,
          vectorLiteral,
          sourceName,
        );
      }

      return { message: 'Ingestion complete', chunks: docs.length };
    } catch (error) {
      console.error('[IngestionService.processPdf]', error);
      throw error;
    }
  }
}
