import { Module } from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { ForumsController } from "./forums.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Forum, ForumSchema } from "./schema/forum.schema";
import { ForumsRepository } from "./forums.repository";
import { AwsS3Service } from "src/common/services/aws-s3.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Forum.name,
        schema: ForumSchema,
      },
    ]),
  ],
  controllers: [ForumsController],
  providers: [ForumsService, ForumsRepository, AwsS3Service],
})
export class ForumsModule {}
