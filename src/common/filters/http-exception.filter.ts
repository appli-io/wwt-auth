import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, } from '@nestjs/common';
import { FastifyReply, FastifyRequest }                                  from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    let {message} = exception.getResponse() as any;

    if (Array.isArray(message)) message = message.join(', ');

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message || exception.message || null,
    };

    this.logger.error('HTTP Exception Filter: ' + JSON.stringify(exception.getResponse()));

    response.code(status).send(errorResponse);
  }
}
