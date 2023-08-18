import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { Category, CategoryDocument } from "./schemas/category.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {
    super(categoryModel);
  }

  async search(query: string) {
    return this.categoryModel.find({
      name: { $regex: new RegExp(query, "gi") },
    });
  }
}
