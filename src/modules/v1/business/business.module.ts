import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { Business, BusinessSchema } from "./schemas/business.schema";
import { BusinessRepository } from "./business.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Business.name,
        schema: BusinessSchema,
      },
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessRepository],
})
export class BusinessModule {}
