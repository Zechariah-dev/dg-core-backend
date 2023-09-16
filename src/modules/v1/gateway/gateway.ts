import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GatewaySessionManager } from "./gateway.session";
import { AuthenticatedSocket } from "../../../utils/interfaces";
import { Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CreateMessageResponse, NotificationResponse } from "../../../types";
import { MessagesRepository } from "../messages/messages.repository";
import { ConversationRepository } from "../conversations/conversation.repository";
import { NotificationsRepository } from "../notifications/notification.repository";

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly sessions: GatewaySessionManager,
    private readonly messagesRepository: MessagesRepository,
    private readonly conversationsRepository: ConversationRepository,
    private readonly notificationRepository: NotificationsRepository
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket) {
    this.logger.log("Incoming Connection");
    this.sessions.setUserSocket(socket.user._id, socket);
    socket.emit("connected", {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.log("Disconnecting Socket!!");
    this.sessions.removeUserSocket(socket.user._id);
  }

  @SubscribeMessage("createMessage")
  handleCreateMessage(@MessageBody() data: any) {
    this.logger.log("Create Message", data);
  }

  @OnEvent("conversation.create")
  async handleConversationCreate(payload: any) {
    const recipientSocket = this.sessions.getUserSocket(payload.recipient);
    if (recipientSocket) recipientSocket.emit("onConversation", payload);
  }

  @OnEvent("message.create")
  async handleMessageCreateEvent(payload: CreateMessageResponse) {
    this.logger.log("Gateway - message.create");
    const { message } = payload;

    const { author, conversation } = await this.messagesRepository.findOne({
      _id: message._id,
    });

    const { creator, recipient } = await this.conversationsRepository.findOne({
      _id: conversation._id,
    });

    const authorSocket = this.sessions.getUserSocket(author._id);
    const recipientSocket =
      author._id === creator._id
        ? this.sessions.getUserSocket(recipient._id)
        : this.sessions.getUserSocket(creator._id);

    if (authorSocket) authorSocket.emit("onMessage", payload);
    if (recipientSocket) recipientSocket.emit("onMessage", payload);
  }

  @OnEvent("notification.create")
  async handleNotificationCreate(payload: NotificationResponse) {
    const { isAdmin, ...rest } = payload;

    if (isAdmin) {
      const adminSockets = this.sessions.getAdminSockets();

      Promise.all(
        adminSockets.map(async (socket) => {
          const notification = await this.notificationRepository.create({
            ...rest,
            user: socket.user._id,
          });

          socket.emit("notification", notification);
        })
      );
    } else {
      const notification = await this.notificationRepository.create(rest);
      const userSocket = this.sessions.getUserSocket(rest.user);

      // emit new notification to user
      userSocket.emit("notification", notification);
    }
  }
}
