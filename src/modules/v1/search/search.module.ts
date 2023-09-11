import { Module } from "@nestjs/common";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";
import { Forum, ForumSchema } from "../forums/schema/forum.schema";
import { Product, ProductSchema } from "../products/schemas/product.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductsRepository } from "../products/products.repository";
import { ForumsRepository } from "../forums/forums.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Forum.name,
        schema: ForumSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService, ProductsRepository, ForumsRepository],
})
export class SearchModule {}
