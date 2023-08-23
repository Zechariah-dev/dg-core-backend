import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersService } from "../users/users.service";
import { UsersRepository } from "../users/users.repository";
import { User, UserSchema } from "../users/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { BusinessRepository } from "../business/business.repository";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import { AwsS3Service } from "src/common/services/aws-s3.service";
import { BusinessService } from "../business/business.service";
import { GoogleStrategy } from "./google.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Business.name,
        schema: BusinessSchema,
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    UsersRepository,
    BusinessRepository,
    JwtStrategy,
    GoogleStrategy,
    AwsS3Service,
    BusinessService,
  ],
})
export class AuthModule {}
