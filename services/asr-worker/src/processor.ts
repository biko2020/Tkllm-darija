import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  constructor(
    private configService: ConfigService,
    private storage: StorageService,
  ) {}

  async processTranscriptionRequest(payload: any) {
    const { jobId, audioUrl, taskId, contributorId } = payload;

    try {
      this.logger.log(`Processing transcription job ${jobId} for task ${taskId}`);

      // 1. Download audio from S3/MinIO
      const localPath = await this.storage.downloadAudio(audioUrl, jobId);

      // 2. Run Whisper inference (Python)
      const model = this.configService.get<string>('WHISPER_MODEL') || 'small';
      const { stdout } = await execAsync(
        `python models/whisper/loader.py --model ${model} --audio "${localPath}"`
      );

      const result = JSON.parse(stdout);

      // 3. Upload transcript back to storage
      await this.storage.uploadTranscript(result.transcript, jobId);

      // 4. Publish completion event
      // (You can use Kafka producer here or emit via Redis)

      this.logger.log(`Transcription completed for job ${jobId}`);
    } catch (error) {
      this.logger.error(`Failed to process job ${jobId}:`, error);
      // Publish failure event
    }
  }
}