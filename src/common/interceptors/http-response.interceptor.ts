import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from '@nestjs/common';
import { Observable }                                                  from 'rxjs';
import { map }                                                         from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((content) => {
        const timestamp = new Date().toISOString();

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp,
          path: request.url,
          method: request.method,
          content,
        };
      }),
    );
  }
}
