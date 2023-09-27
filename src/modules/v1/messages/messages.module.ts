import {Module} from "@nestjs/common";
import {MessagesService} from "./messages.service";
import {MessagesController} from "./messages.controller";
import {MessagesRepository} from "./messages.repository";
import {ConversationsService} from "../conversations/conversations.service";
import {MongooseModule} from "@nestjs/mongoose";
import {Message, MessageSchema} from "./schemas/message.schema";
import {
    Conversation,
    ConversationSchema,
} from "../conversations/schemas/conversation.schema";
import {ConversationRepository} from "../conversations/conversation.repository";
import {UsersRepository} from "../users/users.repository";
import {User, UserSchema} from "../users/schemas/user.schema";
import {ReviewRequestsRepository} from "../reviews/review-request.repository";
import {ReviewRequest, ReviewRequestSchema} from "../reviews/schemas/review-request.schema";

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
                name: ReviewRequest.name,
                schema: ReviewRequestSchema
            }
        ]),
    ],
    controllers: [MessagesController],
    providers: [
        MessagesService,
        MessagesRepository,
        ConversationsService,
        ConversationRepository,
        UsersRepository,
        ReviewRequestsRepository,
    ],
})
export class MessagesModule {
}
