import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import { BusinessRepository } from "../business/business.repository";
import {
  Conversation,
  ConversationSchema,
} from "../conversations/schemas/conversation.schema";
import { ConversationRepository } from "../conversations/conversation.repository";
import { Product, ProductSchema } from "../products/schemas/product.schema";
import { ProductsRepository } from "../products/products.repository";

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
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    AwsS3Service,
    BusinessRepository,
    ConversationRepository,
    ProductsRepository,
  ],
})
export class UsersModule {}
