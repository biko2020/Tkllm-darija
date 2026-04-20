import { IsUUID, IsString, IsOptional } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsUUID()
  taskId: string;

  @IsString()
  fileName: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}