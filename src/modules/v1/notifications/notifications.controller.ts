import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";

@Controller("notifications")
@ApiTags("Notification")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @ApiOkResponse({
    description: "200, User notifications fetched successfully",
  })
  async getUserNotifications(@Req() req: AuthRequest) {
    const notifications = await this.notificationsService.findByUser(
      req.user._id
    );

    return {
      notifications,
      message: "User notifications fetched successfully",
    };
  }

  @Delete(":id")
  @ApiOkResponse({ description: "200, Notification deleted successfully" })
  @ApiNotFoundResponse({ description: "404, Notification does not exist" })
  async deleteNotification(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const notification = await this.notificationsService.deleteOne(
      id,
      req.user._id
    );

    if (!notification) {
      throw new NotFoundException("Notification does not exist");
    }

    return { message: "Notification deleted successfully", notification };
  }

  @Patch("/:id")
  @ApiOkResponse({ description: "200, Notification read successfully" })
  @ApiNotFoundResponse({ description: "404, Notification does not exist" })
  async readNotification(@Param("id", ParseObjectIdPipe) id: Types.ObjectId, @Req() req: AuthRequest) {
    const notification = await this.notificationsService.read(id, req.user._id);

    if (!notification) {
      throw new NotFoundException("Notification does not exist")
    }

    return { notification, message: "Notification read successfully" }
  }
}
