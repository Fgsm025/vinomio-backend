import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentosController } from './documentos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentosController],
})
export class DocumentosModule {}
