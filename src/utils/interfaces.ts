import { Socket} from "socket.io";
import { User } from "../modules/v1/users/schemas/user.schema"

export interface AuthenticatedSocket extends Socket {
  user?: User;
}
