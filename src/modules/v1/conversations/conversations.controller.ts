import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { createConversationDto } from "./dtos/create-conversation.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { APP_ROLES } from "src/common/interfaces/auth.interface";
import { Roles } from "src/decorators/roles..decorator";
import { RolesGuard } from "src/guards/role.guard";
import { MessagesService } from "../messages/messages.service";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  private logger = new Logger(ConversationsController.name);

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messsgeService: MessagesService,
    private readonly events: EventEmitter2
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "201, Conversation created successfully" })
  async createConversation(
    @Body() createConversationPayload: createConversationDto,
    @Req() req: AuthRequest
  ) {
    this.logger.log("Creating Conversation: createConversation");

    const conversation = await this.conversationsService.create(
      req.user,
      createConversationPayload
    );

    this.events.emit("conversation.create", conversation);

    if (createConversationPayload.message) {
      const message = await this.messsgeService.create({
        author: req.user._id,
        conversation: conversation._id,
        content: createConversationPayload.message,
      });
      this.events.emit("message.create", message);
    }

    return {
      message: "Conversation created successfully",
      data: conversation,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User conversations retrieved successfully",
  })
  async getUserConversations(
    @Query("search") search: string,
    @Req() req: AuthRequest
  ) {
    const conversations = await this.conversationsService.getConversations(
      req.user._id,
      req.user.role,
      search
    );

    return {
      message: "User conversations retrieved successfully",
      conversations,
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Conversation fetched successfully" })
  @ApiNotFoundResponse({ description: "404, Conversation does not exist" })
  async getConversation(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const conversation = await this.conversationsService.findById(id);

    if (!conversation) {
      throw new NotFoundException("Conversation does not exist");
    }

    return { message: "Conversation fetched successfully", conversation };
  }

  @Get("/check/:recipient")
  @ApiOkResponse({
    description: "200, Check conversation existence successfully",
  })
  async checkExistence(
    @Param("recipient", ParseObjectIdPipe) recipient: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const conversation = await this.conversationsService.isCreated(
      req.user._id,
      recipient
    );

    return {
      message: "Check conversation existence successfully",
      conversation,
    };
  }

  @Patch("/read/:id")
  @ApiOkResponse({
    description: "200, Conversation received messages read successfully",
  })
  @ApiNotFoundResponse({ description: "404, Conversation does not exist" })
  async readConversationMessages(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const conversation = await this.conversationsService.findById(id);

    if (!conversation) {
      throw new NotFoundException("Conversation does not exist");
    }

    await this.conversationsService.readMessages(id, req.user._id);

    return {
      message: "Conversation received messages read successfully",
      conversation,
    };
  }

  @Get("/unread/count")
  @ApiOkResponse({
    description: "200, Number of user unread messages fetcheds successfully",
  })
  async getUnreadConversation(@Req() req: AuthRequest) {
    const unreadMessages = await this.conversationsService.unreadMessages(
      req.user._id,
      req.user.role
    );

    return {
      unreadMessages,
      message: "Number of user unread messages fetched successfully",
    };
  }

  @Post("/creator/request-review")
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async requestReview(
    @Query("conversationId", ParseObjectIdPipe) conversationId: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    return await this.conversationsService.requestConsumerReview(
      conversationId,
      req.user._id
    );
  }
}
