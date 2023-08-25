import { Injectable } from "@nestjs/common";
import { ProductsRepository } from "./products.repository";
import { CreateProductPayload } from "./dtos/create-product.dto";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Product } from "./schemas/product.schema";
import { FetchProductQueryDto } from "./dtos/query.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async createProduct(payload: CreateProductPayload) {
    const product = await this.productsRepository.create(payload);

    return product;
  }

  async findByTitle(title: string) {
    return this.productsRepository.findOne({ title });
  }

  async findById(_id: Types.ObjectId) {
    return this.productsRepository.findOne({ _id });
  }

  async findOne(query: FilterQuery<Product>) {
    return this.productsRepository.findOne({
      ...query,
      deletedAt: null,
    });
  }

  async find(
    filter: FilterQuery<Product>,
    projection: unknown | null,
    query: FetchProductQueryDto
  ) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.productsRepository.find(
      {
        ...filter,
        ...parsedFilter,
        deletedAt: null,
      },
      projection,
      {
        page,
        skip: (page - 1) * limit,
      }
    );
  }

  async deleteProduct(_id: Types.ObjectId, seller: Types.ObjectId) {
    return this.productsRepository.findOneAndUpdate(
      { _id, seller, deletedAt: null },
      { deletedAt: new Date() }
    );
  }

  async update(
    _id: Types.ObjectId,
    seller: Types.ObjectId,
    payload: UpdateQuery<Partial<Product>>
  ) {
    return this.productsRepository.findOneAndUpdate(
      { _id, seller },
      { ...payload }
    );
  }

  async increaseViews(_id: Types.ObjectId) {
    return this.productsRepository.findOneAndUpdate(
      { _id },
      { $inc: { views: 1 } }
    );
  }

  private parseFilter(query: Partial<FetchProductQueryDto>): object {
    const filter = {};

    if (query.category) {
      Object.assign(filter, { categories: { $in: [query.category] } });
    }

    if (query.search) {
      Object.assign(filter, { title: { $regex: query.search, $options: "i" } });
    }

    if (query.section) {
      Object.assign(filter, { sections: { $in: [query.section] } });
    }

    if (query.date) {
      const startDate = new Date(query.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(query.date);
      endDate.setHours(23, 59, 59, 59);

      Object.assign(filter, { createdAt: { $gte: startDate, $lte: endDate } });
    }

    return filter;
  }
}
