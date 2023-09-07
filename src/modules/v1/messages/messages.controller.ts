import { createMessageDto } from "./dtos/create-message.dto";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron } from "@nestjs/schedule";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private eventEmitter: EventEmitter2
  ) {}

  @Cron("45 * * * * ")
  async forwardUnreadMessageNotification() {
    await this.messagesService.cronHandler();
  }

  @Throttle(5, 10)
  @Post("/:id")
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "201, Message created successfully" })
  async createMessage(
    @Body() createMessagePayload: createMessageDto,
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const response = await this.messagesService.create({
      author: req.user._id,
      conversation: id,
      ...createMessagePayload,
    });
    this.eventEmitter.emit("message.create", response);
    return { response, message: "Message created successfully" };
  }

  @SkipThrottle()
  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, Conversation messages fetched successfully",
  })
  async getMessagesFromConversation(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId
  ) {
    const messages = await this.messagesService.getMessages(id);

    return { messages, message: "Conversation messages fetched successfully" };
  }
}
