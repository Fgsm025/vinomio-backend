import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating or ingesting a document chunk into the vector database.
 * Used during the RAG (Retrieval-Augmented Generation) ingestion pipeline.
 */
export class CreateDocumentChunkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1_000_000)
  content!: string;

  /**
   * The vector representation of the content.
   * Length 1536 is standard for OpenAI (text-embedding-3-small / ada-002).
   */
  @IsArray()
  @ArrayMinSize(1536)
  @ArrayMaxSize(1536)
  @IsNumber({}, { each: true })
  embedding!: number[];

  /**
   * Original filename or source identifier (e.g. "vademecum-senasa-2025.pdf")
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  source?: string;

  /**
   * Knowledge classification (e.g. "vademecum", "regulations", "crop_guide")
   */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  category?: string;

  /**
   * Specific crop identifier related to this chunk (e.g. "vid", "olivo")
   */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  cropId?: string;

  /**
   * ISO country code for localized agricultural data (defaults to AR in persistence if omitted)
   */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  country?: string;
}
