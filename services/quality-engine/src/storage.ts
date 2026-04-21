import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION') || 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY')!,
      },
      forcePathStyle: true,
    });
  }

  async downloadAudio(audioUrl: string, jobId: string): Promise<string> {
    try {
      const key = audioUrl.split('/').pop() || `${jobId}.webm`;
      const bucket = this.configService.get<string>('S3_BUCKET_AUDIO') || 'tkllm-audio';

      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);

      const localPath = `/tmp/${jobId}-${key}`;
      const buffer = await response.Body.transformToByteArray();
      await writeFile(localPath, buffer);

      this.logger.log(`Downloaded audio for job ${jobId} → ${localPath}`);
      return localPath;
    } catch (error) {
      this.logger.error(`Failed to download audio for job ${jobId}:`, error);
      throw error;
    }
  }

  async uploadTranscript(transcript: string, jobId: string): Promise<string> {
    const bucket = this.configService.get<string>('S3_BUCKET_DATASETS') || 'tkllm-datasets';
    const key = `transcripts/${jobId}.txt`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: transcript,
      ContentType: 'text/plain',
    });

    await this.s3Client.send(command);
    this.logger.log(`Uploaded transcript for job ${jobId}`);

    return `s3://${bucket}/${key}`;
  }
}