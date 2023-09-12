import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "./categories.repository";
import { FilterQuery, Types } from "mongoose";
import { Category } from "./schemas/category.schema";
import { CreateCategoryPayload } from "./dtos/create-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(payload: CreateCategoryPayload) {
    return this.categoryRepository.create(payload);
  }

  async findByName(name: string) {
    return this.categoryRepository.findOne({ name });
  }
  I;
  async findById(_id: Types.ObjectId) {
    return this.categoryRepository.findOne({
      _id,
    });
  }

  async update(_id: Types.ObjectId, payload: Partial<Category>) {
    return this.categoryRepository.findOneAndUpdate(
      {
        _id,
      },
      payload
    );
  }

  async softDelete(_id: Types.ObjectId) {
    return this.categoryRepository.findOneAndUpdate(
      { _id },
      { deletedAt: new Date() }
    );
  }

  async find(
    query: FilterQuery<Category>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projection: any | null,
    page: number,
    limit: number
  ) {
    return this.categoryRepository.find(
      {
        ...query,
        deletedAt: null,
      },
      projection,
      {
        page,
        skip: (page - 1) * limit,
        sort: "-createdAt",
      }
    );
  }

  async search(query: string) {
    return this.categoryRepository.search(query);
  }
}
