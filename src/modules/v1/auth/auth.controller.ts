import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dtos/user-register.dto";
import { UsersService } from "../users/users.service";
import { UserProfileRegisterDto } from "./dtos/user-profile-register.dto";
import ParseObjectIdPipe from "../../../pipes/parse-object-id.pipe";
import { Types } from "mongoose";
import { UserLoginDto } from "./dtos/user-login.dto";
import * as bcrypt from "bcrypt";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { GoogleOAuthGuard } from "../../..//guards/google-oauth.guard";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { CacUploadDto } from "./dtos/cac-upload.dto";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { BusinessService } from "../business/business.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service,
    private readonly businessService: BusinessService,
    private readonly events: EventEmitter2
  ) {}

  @Post("/register")
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: "201, User account was created successfully",
  })
  @ApiUnprocessableEntityResponse({
    description: "422, Provided email is already in use",
  })
  async register(@Body() body: UserRegisterDto) {
    const userExists = await this.usersService.findByEmail(body.email);

    if (userExists) {
      throw new UnprocessableEntityException(
        "Provided email is already in use"
      );
    }

    const user = await this.usersService.create(body);

    return { user, message: "User account was created successfully" };
  }

  @Post("/register/profile/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User profile registration was completed successfully",
  })
  @ApiNotFoundResponse({ description: "400, User does not exist" })
  async registerProfile(
    @Body() body: UserProfileRegisterDto,
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId
  ) {
    const userExists = await this.usersService.findById(id);

    if (!userExists) {
      throw new NotFoundException("User does not exist");
    }

    const user = await this.usersService.updateProfile({ _id: id }, body);

    await this.authService.forwardEmailVerificationMail(
      user.email,
      user.fullname.split(" ")[0]
    );

    this.events.emit("notification.create", {
      user: user._id,
      title: "You are welcome",
      body: `
      We're thrilled to have you join us on this exciting journey. Get ready to explore a world of possibilities, connect with like-minded individuals, and unlock amazing features designed just for you.

      Stay tuned for updates, tips, and special offers that will enhance your experience. If you have any questions or need assistance, our support team is here to help.
      
      Thank you for choosing OurApp. Let's make great things happen together! 🚀
      
      Best regards,
      The OurApp Team
      `,
    });

    return {
      user,
      message: "User profile registration was completed successfully",
    };
  }

  @Post("/register/cac/:id")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOkResponse({ description: "200, " })
  @ApiNotFoundResponse({ description: "400, User does not exist" })
  async registerCacProfile(
    @UploadedFile() file: Express.Multer.File,
    @Param("id", ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: CacUploadDto
  ) {
    const location = await this.awsS3Service.uploadImage(file);

    const businessExist = await this.businessService.findOne({ creator: id });
    if (!businessExist) {
      throw new NotFoundException("Business does not exist");
    }

    await this.businessService.update(
      { creator: id },
      { ...body, cacDocument: location }
    );

    const user = await this.usersService.findById(id);

    return {
      user,
      message: "Business Credentials has been uploaded successfully",
    };
  }

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200 - user logged in successfully",
  })
  @ApiBadRequestResponse({ description: "400, Invalid credentials" })
  @ApiUnauthorizedResponse({ description: "401, Account has been deactivated" })
  async login(@Body() body: UserLoginDto) {
    const user = await this.usersService.findByEmail(body.email);

    if (!user) {
      throw new BadRequestException("invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account have been deactivated");
    }

    if (!user.isVerified) {
      throw new BadRequestException("Email is not verified");
    }

    const isMatch = await bcrypt.compare(body.password, user.password);

    if (!isMatch) {
      throw new BadRequestException("Incorrect password");
    }

    const tokens = await this.authService.generateTokens({
      userId: user._id,
      email: user.email,
    });

    return { user, tokens };
  }

  @Get("/verify-email/:token")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, User account verified successfully",
  })
  @ApiBadRequestResponse({
    description: "400, User account does not exist",
  })
  async verifyEmail(@Param("token") token: string) {
    const payload = await this.authService.verifyToken(token);

    if (payload.exp * 1000 < Date.now()) {
      throw new BadRequestException("Email Verification token has expired");
    }

    const userExists = await this.usersService.findByEmail(payload.email);

    if (!userExists) {
      throw new BadRequestException("User account does not exist");
    }

    const user = await this.usersService.updateProfile(
      {
        email: payload.email,
      },
      {
        isVerified: true,
      }
    );

    return { message: "User account verified successfully", user };
  }

  @Get("/resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Email verification resend successfully" })
  async resendEmailVerification(@Query("email") email: string) {
    const userExist = await this.usersService.findByEmail(email);

    if (!userExist) {
      throw new BadRequestException("Invalid email address");
    }

    await this.authService.forwardEmailVerificationMail(
      userExist.email,
      userExist.fullname.split(" ")[0]
    );

    return { message: "Email verification resend successfully" };
  }

  @Post("/refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "200, Tokens has been refreshed successfully",
  })
  async refreshToken(@Body() { token }: RefreshTokenDto) {
    const payload = await this.authService.verifyRefreshToken(token);

    const tokens = await this.authService.generateTokens({
      userId: payload.userId,
      email: payload.email,
    });

    return { tokens, message: "Tokens has been refreshed successfully" };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async validateUser(@Req() req: AuthRequest) {
    const user = await this.usersService.findById(req.user._id);

    return user;
  }

  @Get("/google-redirect")
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOAuthGuard)
  async googleOauthRedirect(@Req() req) {
    const userExists = await this.usersService.findByEmail(req.user.email);

    if (userExists) {
      throw new BadRequestException("User email address already in user");
    }

    const user = await this.usersService.createOauthUser(req.user);

    const tokens = await this.authService.generateTokens({
      userId: user._id,
      email: user.email,
    });

    return { message: "Google auth login successful", user, tokens };
  }

  @Post("/reset-password")
  async resetPassword(@Body() { email }: ResetPasswordDto) {
    const userExist = await this.usersService.findByEmail(email);

    if (!userExist) {
      throw new NotFoundException("User account does not exist");
    }

    const result = await this.authService.forwardPasswordResetMail(
      userExist.email,
      userExist.fullname.split(" ")[0]
    );

    return result;
  }
}
