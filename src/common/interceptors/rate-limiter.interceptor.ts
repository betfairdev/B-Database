import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
  private store: RateLimitStore = {};
  private readonly limit: number;
  private readonly ttl: number;

  constructor(private configService: ConfigService) {
    this.limit = this.configService.get<number>('THROTTLE_LIMIT', 10);
    this.ttl = this.configService.get<number>('THROTTLE_TTL', 60) * 1000; // Convert to ms
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request);
    const now = Date.now();

    // Clean up expired entries
    this.cleanup(now);

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.ttl,
      };
      this.store[key] = entry;
    }

    // Check rate limit
    if (entry.count >= this.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    entry.count++;

    return next.handle();
  }

  private generateKey(request: any): string {
    // Use IP address and user ID if available
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }

  private cleanup(now: number): void {
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}