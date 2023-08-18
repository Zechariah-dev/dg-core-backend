// import { UsersService } from "./../users/users.service";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext, Logger } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { authorize } from "@thream/socketio-jwt";

export class WebSocketAdapter extends IoAdapter {
  private logger = new Logger(WebSocketAdapter.name);

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);

    // const configService = this.app.get(ConfigService);
    // const usersService = this.app.get(UsersService);

    // server.use(
    //   authorize({
    //     secret: configService.get("JWT_SECRET"),
    //     onAuthentication: async (decodedToken: any) => {
    //       const user = await usersService.findByEmail(decodedToken.email);
    //       return user;
    //     },
    //   })
    // );

    return server;
  }
}
