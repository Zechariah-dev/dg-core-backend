/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const response: Response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const { message: res, ...rest } = data;
        const message =
          statusCode >= 300
            ? data instanceof HttpException
              ? data.getResponse()["message"]
              : "error"
            : res
            ? res
            : "success";
        return {
          data:
            Object.keys(rest).length > 1 ? rest : rest[Object.keys(rest)[0]],
          statusCode,
          message,
        };
      })
    );
  }
}
