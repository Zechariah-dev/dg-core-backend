import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductsRepository } from "./products.repository";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { FavoritesRepository } from "../favorites/favorites.repository";
import { Favorite, FavoriteSchema } from "../favorites/schemas/favorite.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Favorite.name,
        schema: FavoriteSchema,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    AwsS3Service,
    FavoritesRepository,
  ],
})
export class ProductsModule {}
