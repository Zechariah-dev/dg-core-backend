import { Product, ProductDocument } from "./schemas/product.schema";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";

export class ProductsRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>
  ) {
    super(productsModel);
  }

  public async find(
    query: FilterQuery<ProductDocument>,
    projections?: unknown | null,
    options?: QueryOptions<unknown>
  ): Promise<ProductDocument[]> {
    return this.productsModel.find(query, projections, options).populate([
      {
        path: "seller",
        select: "image fullname email phone _id",
      },
      {
        path: "categories",
        select: "name description image",
      },
    ]);
  }

  public findOne(
    query: FilterQuery<ProductDocument>,
    projections?: unknown
  ): Promise<ProductDocument> {
    return this.productsModel.findOne(query, projections).populate([
      {
        path: "seller",
        select: "image fullname email phone _id",
      },
      {
        path: "categories",
        select: "name description image",
      },
    ]);
  }
}
