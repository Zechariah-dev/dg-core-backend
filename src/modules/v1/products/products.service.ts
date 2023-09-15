import { Injectable } from "@nestjs/common";
import { ProductsRepository } from "./products.repository";
import { CreateProductPayload } from "./dtos/create-product.dto";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Product } from "./schemas/product.schema";
import { FetchProductQueryDto } from "./dtos/query.dto";
import { FavoritesRepository } from "../favorites/favorites.repository";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly favoritesRepository: FavoritesRepository
  ) {}

  async createProduct(payload: CreateProductPayload) {
    const sku = this.generateSku(payload.title);
    const product = await this.productsRepository.create({ ...payload, sku });

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
    query: FetchProductQueryDto,
    userId?: string
  ) {
    try {
      const { page, limit, sort, ...rest } = query;

      const parsedFilter = this.parseFilter(rest);

      const data = await this.productsRepository.find(
        {
          ...filter,
          ...parsedFilter,
          deletedAt: null,
        },
        projection,
        {
          page,
          skip: (page - 1) * limit,
          sort: sort ?? "-createdAt",
        }
      );

      const productIds = data.map((product) => product._id);

      const favorites = await this.favoritesRepository.find({
        product: { $in: productIds },
        user: userId,
      });

      const favoriteMap = new Map(
        favorites.map((favorite) => [favorite.product._id.toString(), favorite])
      );

      const refinedData = await Promise.all(
        data.map((product) => ({
          ...product.toJSON(),
          isFavorite: !!favoriteMap.get(product._id.toString()),
        }))
      );

      return refinedData;
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
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

  private generateSku(name: string) {
    return name.replace(" ", "-") + Math.floor(Math.random() + 1000);
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

    if (query.category) {
      Object.assign(filter, { category: query.category });
    }

    if (query.rating) {
      Object.assign(filter, { rating: { $gte: query.rating } });
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
