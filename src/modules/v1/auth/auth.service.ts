import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./auth.interface";
import { ConfigService } from "@nestjs/config";
import jwt from "../../../constants/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdatePasswordDto } from "./dtos/reset-password.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService
  ) { }

  async generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: jwt.token_expiry.access_token_expiry,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: jwt.token_expiry.refresh_token_expiry,
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get("JWT_SECRET"),
      ignoreExpiration: true,
    });
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get("JWT_REEFRESH_SECRET"),
    });
  }

  async forwardPasswordResetMail(email: string, name: string) {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: jwt.token_expiry.password_reset,
      }
    );

    const appUrl = this.configService.getOrThrow("CLIENT_URL");

    const url = `${appUrl}/reset-password/${token}`;

    const result = await this.mailerService.sendMail({
      to: email,
      subject: "Reset Password",
      template: "password_reset",
      context: {
        url,
        name,
      },
    });

    this.logger.log("Password reset result", result);
  }

  async forwardEmailVerificationMail(email: string, name: string) {
    const token = this.jwtService.sign(
      {
        email,
      },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: jwt.token_expiry.email_verification,
      }
    );

    const appUrl = this.configService.getOrThrow("CLIENT_URL");

    const url = `${appUrl}/verify/${token}?email=${email}`;

    const result = await this.mailerService.sendMail({
      to: email,
      subject: "Verify Email Address",
      template: "verify_email",
      context: {
        url,
        name,
      },
    });

    this.logger.log("Email verification result", result);

    return result
  }

  async updateResetPassword(body: UpdatePasswordDto) {
    const tokenPayload = await this.jwtService.verify(body.token, { secret: this.configService.get("JWT_SECRET"), ignoreExpiration: true })

    const now = new Date()

    if (tokenPayload.exp && tokenPayload.exp < now.getTime()) {
      throw new BadRequestException("Token has expired");

    }

    const user = await this.usersService.findByEmail(tokenPayload.email);

    if (!user) {
      throw new UnauthorizedException("User account doesn't exist")
    }

    const updatedUser = await this.usersService.updatePassword(user._id, body.password)

    return { message: "User password reset successfully", updatedUser }
  }
}
