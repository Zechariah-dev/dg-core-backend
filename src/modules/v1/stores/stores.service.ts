import { FetchStoreQueryDto } from "./dtos/query.dto";
import { Injectable } from "@nestjs/common";
import { StoresRepository } from "./stores.repository";
import { CreateStoreDto } from "./dtos/create-store.dto";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Store } from "./schemas/store.schema";
import { ProductsRepository } from "../products/products.repository";

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly productsRepository: ProductsRepository
  ) {}

  async create(payload: CreateStoreDto, creator: Types.ObjectId) {
    return this.storesRepository.create({ ...payload, creator });
  }

  async findById(_id: Types.ObjectId) {
    return this.storesRepository.findOne({ _id });
  }

  async findOne(query: FilterQuery<Store>) {
    return this.storesRepository.findOne(query);
  }

  async update(
    _id: Types.ObjectId,
    creator: Types.ObjectId,
    payload: UpdateQuery<Partial<Store>>
  ) {
    return this.storesRepository.findOneAndUpdate(
      { _id, creator },
      { ...payload }
    );
  }

  async find(
    filter: FilterQuery<Store>,
    projection: unknown | null,
    query: FetchStoreQueryDto
  ) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.storesRepository.find(
      {
        ...filter,
        ...parsedFilter,
        deletedAt: null,
      },
      projection,
      { page, skip: (page - 1) * limit }
    );
  }

  async delete(_id: Types.ObjectId, creator: Types.ObjectId) {
    const store = await this.storesRepository.softDelete({ _id, creator });

    // TODO: decide what will happen to a store products after deleting
    // if (store) {
    //   await this.productsRepository.deleteMany({ store: store._id });
    // }

    return store;
  }

  async findProductsByStore(store: Types.ObjectId) {
    return this.productsRepository.find({ store });
  }

  private parseFilter(query: Partial<FetchStoreQueryDto>): object {
    const filter = {};

    if (query.search) {
      Object.assign(filter, { name: { $regex: query.search, $options: "i" } });
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
