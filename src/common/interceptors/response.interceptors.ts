import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
        map(data => {
            if(data && data.statusCode) {
                response.status(data.statusCode);
            }
            return data;
        })
    )
  }
}