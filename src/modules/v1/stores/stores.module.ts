import { Module } from "@nestjs/common";
import { StoresController } from "./stores.controller";
import { StoresService } from "./stores.service";
import { StoresRepository } from "./stores.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Store, StoreSchema } from "./schemas/store.schema";
import { ProductsRepository } from "../products/products.repository";
import { Product, ProductSchema } from "../products/schemas/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Store.name,
        schema: StoreSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [StoresController],
  providers: [StoresService, StoresRepository, ProductsRepository],
})
export class StoresModule {}
