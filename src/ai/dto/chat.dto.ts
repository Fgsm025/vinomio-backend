import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsString()
  @IsNotEmpty()
  farmId: string;
}
