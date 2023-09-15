import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { User } from "../modules/v1/users/schemas/user.schema";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<User>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any
  ): User {
    return user;
  }
}
