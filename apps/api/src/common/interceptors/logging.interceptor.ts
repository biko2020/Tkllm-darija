import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;
    const userId = user?.id || 'anonymous';
    const startTime = Date.now();

    this.logger.log(`➡️ ${method} ${url} | User: ${userId} | IP: ${ip}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(`⬅️ ${method} ${url} | ${duration}ms | Status: 200`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`❌ ${method} ${url} | ${duration}ms | Error: ${error.message}`);
        },
      }),
    );
  }
}