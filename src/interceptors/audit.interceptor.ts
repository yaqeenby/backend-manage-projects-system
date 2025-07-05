import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      const userId = request.user.id;
      if (request.body) {
        if (!request.body.createdBy) request.body.createdBy = userId;
        request.body.updatedBy = userId;
      }
    }

    return next.handle().pipe(tap());
  }
}
