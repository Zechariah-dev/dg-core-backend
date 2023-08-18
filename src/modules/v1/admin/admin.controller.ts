import {
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

@Controller("admin")
@ApiTags("Admin")
@Roles(APP_ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
