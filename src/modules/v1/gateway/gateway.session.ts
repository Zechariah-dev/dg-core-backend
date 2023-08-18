import { Injectable } from "@nestjs/common";
import { AuthenticatedSocket } from "../../../utils/interfaces";
import { Types } from "mongoose";

export interface IGatewaySessionManager {
  getUserSocket(id: Types.ObjectId): AuthenticatedSocket;
  setUserSocket(id: Types.ObjectId, socket: AuthenticatedSocket): void;
  removeUserSocket(id: Types.ObjectId): void;
  getSockets(): Map<Types.ObjectId, AuthenticatedSocket>;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private readonly sessions: Map<Types.ObjectId, AuthenticatedSocket> =
    new Map();

  getUserSocket(id: Types.ObjectId): AuthenticatedSocket {
    return this.sessions.get(id);
  }

  setUserSocket(id: Types.ObjectId, socket: AuthenticatedSocket): void {
    this.sessions.set(id, socket);
  }

  removeUserSocket(id: Types.ObjectId): void {
    this.sessions.delete(id);
  }

  getSockets(): Map<Types.ObjectId, AuthenticatedSocket> {
    return this.sessions;
  }
}
