import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserProfileUpdateDto } from "./dtos/user-profile-update.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import * as bcrypt from "bcrypt";
import { Roles } from "src/decorators/roles..decorator";
import { APP_ROLES } from "src/common/interfaces/auth.interface";
import { RolesGuard } from "../../../guards/role.guard";
import { UpdateUserSettingDto } from "./dtos/update-user-setting.dto";
import { OptionalJwtAuthGuard } from "../../../guards/optional-auth.guard";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";

@Controller("users")
@ApiTags("User")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service
  ) { }

  @Post("/profile")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User profile updated successfully" })
  async updateProfile(
    @Body() body: UserProfileUpdateDto,
    @Req() req: AuthRequest
  ) {
    if (body.username) {
      const isUsernameAvailable = await this.usersService.isUsernameAvailable(
        req.user._id,
        body.username
      );

      if (!isUsernameAvailable) {
        throw new BadRequestException("Username is not available");
      }
    }

    const user = await this.usersService.updateProfile(
      { _id: req.user._id },
      body
    );

    return { user, message: "User profile updated successfully" };
  }

  @Post("/profile/images")
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "image",
        maxCount: 1,
      },
      {
        name: "coverImage",
        maxCount: 1,
      },
    ])
  )
  async updateProfileImages(
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Req() req: AuthRequest
  ) {
    const { image, coverImage } = files;
    const payload: { [key: string]: string } = {};

    if (image && image.length > 0) {
      const location = await this.awsS3Service.uploadImage(image[0]);
      payload.image = location;
    }

    if (coverImage && coverImage.length > 0) {
      const location = await this.awsS3Service.uploadImage(coverImage[0]);
      payload.coverImage = location;
    }

    const user = await this.usersService.updateProfile(
      { _id: req.user._id },
      payload
    );

    return { user, message: "Profile images uploaded successfully" };
  }

  @Get("/username/:username")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Confirmed username availability" })
  async checkUsernameAvailability(
    @Param("username") username: string,
    @Req() req: AuthRequest
  ) {
    const success = await this.usersService.isUsernameAvailable(
      req.user._id,
      username
    );

    return { success, message: "Confirmed username availability" };
  }

  @Post("/change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, User password updated successfully" })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req: AuthRequest
  ) {
    const isMatch = await bcrypt.compare(body.password, req.user.password);

    if (!isMatch) {
      throw new BadRequestException("Incorrect password");
    }

    const user = await this.usersService.updatePassword(
      req.user._id,
      body.newPassword
    );

    return { user, message: "User password updated successfully" };
  }

  @Post("/documents/id")
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(RolesGuard)
  @ApiOkResponse({
    description: "200, Creator identification document uploaded successfully",
  })
  async uploadCreatorIdDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { idDocumentType: string },
    @Req() req: AuthRequest
  ) {
    const location = await this.awsS3Service.uploadImage(file);

    const user = await this.usersService.updateProfile(
      { _id: req.user._id },
      { ...body, idDocumentFile: location }
    );

    return {
      user,
      message: "Creator Identification document uploaded successfully",
    };
  }

  @Get("/insights")
  @HttpCode(HttpStatus.OK)
  @Roles(APP_ROLES.CREATOR)
  @UseGuards(RolesGuard)
  @ApiOkResponse({
    description: "200, User insights data fetched successfully",
  })
  async getUserInsights(@Req() req: AuthRequest) {
    const insights = await this.usersService.getInsights(req.user._id);

    return { message: "User insights data fetched successfully", insights };
  }

  @Patch("/settings")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User settings has been updated successfully",
  })
  async updateUserSettings(
    @Body() body: UpdateUserSettingDto,
    @Req() req: AuthRequest
  ) {
    const setting = await this.usersService.updateSetting(req.user._id, body);

    return { message: "User settings has been updated successfully", setting };
  }

  @Get("/creator/profile/:id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOkResponse({ description: "200, Creator profile fetched successfully" })
  async getCreatorProfile(@Param("id", ParseObjectIdPipe) id: Types.ObjectId) {
    const response = await this.usersService.getCreatorProfile(id);

    return { ...response, message: "Creator profile fetched successfully" }
  }
}
