import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
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

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  private logger = new Logger(ConversationsController.name);

  constructor(
    private readonly conversationsService: ConversationsService,
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
  async getUserConversations(@Req() req: AuthRequest) {
    const conversations = await this.conversationsService.getConversations(
      req.user._id
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

    if (conversation) {
      throw new NotFoundException("Conversation does not exist");
    }

    return { message: "Conversation fetched successfully", conversation };
  }
}
