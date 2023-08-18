import { Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { createConversationDto } from "./dtos/create-conversation.dto";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  private logger = new Logger(ConversationsController.name);

  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body() createConversationPayload: createConversationDto,
    @Req() req: AuthRequest
  ) {
    this.logger.log("Creating Conversation: createConversation");
    const conversation = await this.conversationsService.create(
      req.user,
      createConversationPayload
    );
  }
}
