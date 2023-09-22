import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable }                                                 from 'rxjs';
import { map }                                                        from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(content => ({
        content,
        statusCode: context.switchToHttp().getResponse().statusCode,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

