import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const { method, url, body } = request;

    // Only audit sensitive operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap({
          next: async () => {
            try {
              await this.prisma.auditLog.create({
                data: {
                  userId,
                  action: `${method} ${url.split('?')[0]}`,
                  resource: url.split('/')[2] || 'Unknown',
                  resourceId: body.id || null,
                  ipAddress: request.ip,
                  userAgent: request.headers['user-agent'],
                  metadata: body,
                },
              });
            } catch (e) {
              // Silent fail - don't break the request
            }
          },
        }),
      );
    }

    return next.handle();
  }
}