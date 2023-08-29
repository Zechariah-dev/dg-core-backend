import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import ParseObjectIdPipe from "src/pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorators/roles..decorator";
import { APP_ROLES } from "src/common/interfaces/auth.interface";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { FetchUsersQueryDto } from "./dtos/query.dto";
import { RolesGuard } from "../../../guards/role.guard";
import { UpdateForumDto } from "./dtos/update-forum.dto";

@Controller("admin")
@ApiTags("Admin")
@Roles(APP_ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly events: EventEmitter2
  ) {}

  @Patch("/users/:id/approval")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({
    description: "200, Creator account has been approved successfully",
  })
  @ApiNotFoundResponse({ description: "404, Creator account does not exist" })
  async approveCreator(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const creator = await this.adminService.approveCreatorAccount(id);

    if (!creator) {
      throw new NotFoundException("Creator account does not exist");
    }

    return {
      creator,
      message: "Creator account has been approved successfully",
    };
  }

  @Get("/users")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User accounts fetched successfully" })
  async fetchUsers(@Query() query: FetchUsersQueryDto) {
    const users = await this.adminService.retrieveUsers(query);

    return { users, message: "User accounts fetched successfully" };
  }

  @Get("/users/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User account fetched successfully" })
  @ApiNotFoundResponse({ description: "404, User account does not exist" })
  async fetchUser(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const user = await this.adminService.retrieveUser(id);

    if (!user) {
      throw new NotFoundException("User account does not exist");
    }

    return { user, message: "User account fetched successfully" };
  }

  @Patch("/users/:id/active")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User account active status has been toggled succesfully",
  })
  async toggleUserActiveStatus(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId
  ) {
    const userExists = await this.adminService.retrieveUser(id);

    if (!userExists) {
      throw new NotFoundException("User account does not exist");
    }

    const user = await this.adminService.updateUserAccount(id, {
      $set: { isActive: !userExists.isActive },
    });

    return {
      user,
      message: "User account active status has been toggled successfully",
    };
  }

  @Get("/forums")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Forums fetched successfully" })
  async getForums(@Query() query: any) {
    const forums = await this.adminService.findForums(query);

    return { forums, message: "Forums fetched successfully" };
  }

  @Patch("/forums/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User forum status updated successfully" })
  @ApiNotFoundResponse({ description: "400, Forum does not exist" })
  async approveForum(
    @Param("id") id: Types.ObjectId,
    @Body() body: UpdateForumDto
  ) {
    const forum = await this.adminService.approveForum(id, body);

    if (!forum) {
      throw new NotFoundException("Forum does not exist");
    }

    this.events.emit("notification.create", {
      user: forum.creator,
      title: `Forum has been ${body.approvalStatus}`,
      body: "",
    });

    return { forum, message: "User forum status updated successfully" };
  }
}
