import { Module } from "@nestjs/common";
import { MessagingGateway } from "./gateway";
import { GatewaySessionManager } from "./gateway.session";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "../messages/schemas/message.schema";
import { MessagesRepository } from "../messages/messages.repository";
import { ConversationsService } from "../conversations/conversations.service";
import { ConversationRepository } from "../conversations/conversation.repository";
import { UsersRepository } from "../users/users.repository";
import {
  Conversation,
  ConversationSchema,
} from "../conversations/schemas/conversation.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import {
  Notification,
  NotificationSchema,
} from "../notifications/schemas/notification.schema";
import { NotificationsRepository } from "../notifications/notification.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  providers: [
    MessagingGateway,
    GatewaySessionManager,
    ConversationsService,
    MessagesRepository,
    ConversationRepository,
    UsersRepository,
    NotificationsRepository
  ],
  exports: [MessagingGateway, GatewaySessionManager],
})
export class GatewayModule {}
