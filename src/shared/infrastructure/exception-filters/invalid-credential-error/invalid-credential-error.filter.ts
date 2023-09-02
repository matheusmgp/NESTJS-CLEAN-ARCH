import { InvalidCredentialError } from '@/shared/application/errors/invalid-credential-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply } from 'fastify';
@Catch(InvalidCredentialError)
export class InvalidCredentialErrorFilter implements ExceptionFilter {
  catch(exception: InvalidCredentialError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response.status(401).send({
      statusCode: 401,
      error: 'Invalid Credential',
      message: exception.message,
    });
  }
}
