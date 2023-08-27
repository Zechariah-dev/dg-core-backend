import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateForumDto } from "./dtos/create-forum.dto";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import ParseObjectIdPipe from "src/pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { FetchForumsQueryDto } from "./dtos/query.dto";
import { UpdateForumDto } from "./dtos/update-forum.dto";
import { CreateCommentDto } from "./dtos/create-comment.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { Roles } from "../../../decorators/roles..decorator";
import { APP_ROLES } from "../../../common/interfaces/auth.interface";
import { RolesGuard } from "../../../guards/role.guard";

@Controller("forums")
@ApiTags("Forum")
export class ForumsController {
  constructor(
    private readonly forumsService: ForumsService,
    private readonly awsService: AwsS3Service
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ description: "201, Forum created successfully" })
  async createForum(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateForumDto,
    @Req() req: AuthRequest
  ) {
    const image = await this.awsService.uploadImage(file);
    const forum = await this.forumsService.create({
      ...body,
      image,
      creator: req.user._id,
    });

    return { forum, message: "Forum created successfully" };
  }

  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({ description: "200, Forum fetched successfully" })
  @ApiNotFoundResponse({ description: "404, Forum does not exist" })
  async getOne(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const forum = await this.forumsService.findById(id);

    if (!forum) {
      throw new NotFoundException("Forum does not exist");
    }

    return { forum, message: "Forum fetched successfully" };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Forums fetched successfully" })
  async fetchAll(@Query() query: FetchForumsQueryDto) {
    const forums = await this.forumsService.find(
      { deletedAt: null },
      {},
      query
    );

    return { forums, message: "Forums fetched successfully" };
  }

  @Get("/user/all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "200, User forums fetched successfully" })
  async fetchUserForums(
    @Query() query: FetchForumsQueryDto,
    @Req() req: AuthRequest
  ) {
    const forums = await this.forumsService.find(
      { creator: req.user._id, deletedAt: null },
      {},
      query
    );

    return { forums, message: "Use forums fetched successfully" };
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({
    description: "200, Forum has been deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "404, Forum does not exist",
  })
  async deleteForum(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Req() req: AuthRequest
  ) {
    const forum = await this.forumsService.delete({
      creator: req.user._id,
      _id: id,
    });

    if (!forum) {
      throw new NotFoundException("Forum does not exist");
    }

    return { message: "Forum has been deleted successfully", forum };
  }

  @Patch("/user/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({ description: "200, Forum has been updated successfully" })
  @ApiNotFoundResponse({ description: "400, Forum does not exist" })
  async updateForum(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateForumDto,
    @Req() req: AuthRequest
  ) {
    const forumExists = await this.forumsService.findOne({
      creator: req.user._id,
      _id: id,
    });

    if (!forumExists) {
      throw new NotFoundException("Forum does not exist");
    }

    const forum = await this.forumsService.update(
      {
        creator: req.user._id,
        _id: id,
      },
      body
    );

    return { forum, message: "Forum has been updated successfully" };
  }

  @Post("/:id/comment")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: "200, Forum comment has been added successfully",
  })
  @ApiNotFoundResponse({ description: "200, Forum does not exist" })
  async addComment(
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: CreateCommentDto,
    @Req() req: AuthRequest
  ) {
    const forumExists = await this.forumsService.findOne({
      _id: id,
    });

    if (!forumExists) {
      throw new NotFoundException("Forum does not exist");
    }

    const forum = await this.forumsService.update(
      { _id: id },
      { $push: { comments: { user: req.user._id, ...body } } }
    );

    return { forum, message: "Forum comment has been added successfully" };
  }

  @Get("/users/engaged")
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: "200, User engaged forums fetched successfully",
  })
  async getUserEngagedForums(
    @Req() req: AuthRequest,
    @Query() query: FetchForumsQueryDto
  ) {
    const forums = await this.forumsService.findEngaged(req.user._id, query);

    return { message: "User engaged forums fetched successfully", forums };
  }

  @Get("/users/pending")
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserPendingForums(
    @Req() req: AuthRequest,
    @Query() query: FetchForumsQueryDto
  ) {
    const forums = await this.forumsService.findPending(req.user._id, query);

    return {
      message: "User pending approval forums fetched successfully",
      forums,
    };
  }
}
