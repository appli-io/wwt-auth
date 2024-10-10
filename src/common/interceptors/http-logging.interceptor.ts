import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError }                                             from 'rxjs';
import { catchError, tap }                                                    from 'rxjs/operators';
import { Reflector }                                                          from '@nestjs/core';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly _logger = new Logger('ExecutionTime');
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this._logger.log(`${ response.statusCode } | [${ method }] ${ url } - ${ context.getClass().name }.${ context.getHandler().name } executed in ${ delay }ms`);
      }),
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        console.error(`${ response.statusCode } | [${ method }] ${ url } - ${ delay }ms`);
        return throwError(error);
      }),
    );
  }
}
