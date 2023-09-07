/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterQuery,
  Model,
  Document,
  ClientSession,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  public async create(
    payload: unknown,
    session?: ClientSession
  ): Promise<T | any> {
    if (session) return this.model.create(payload, { session });
    return this.model.create(payload);
  }

  public async findOne(
    query: FilterQuery<T>,
    projections?: any | null
  ): Promise<T | null> {
    return this.model.findOne(query, projections).lean();
  }

  public async findOneAndUpdate(
    query: FilterQuery<T>,
    payload: UpdateQuery<Partial<T>>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(query, payload, {
        new: true,
        ...options,
      })
      .lean();
  }

  public async find(
    query: FilterQuery<T>,
    projections?: any | null,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model.find(query, projections, options).lean();
  }

  public async findWithPopulation(
    query: FilterQuery<T>,
    population: any,
    projections?: any | null,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model
      .find(query, projections, options)
      .populate(population)
      .lean();
  }
  public async deleteOne(query: FilterQuery<T>) {
    return this.model.findOneAndDelete({ ...query });
  }

  public async deleteMany(query: FilterQuery<T>) {
    return this.model.deleteMany({ ...query });
  }

  public async softDelete(query: FilterQuery<T>) {
    return this.model.findByIdAndUpdate(
      { ...query },
      { deletedAt: new Date() }
    );
  }
  public async aggregate(aggregation: Array<any>) {
    return this.model.aggregate(aggregation);
  }

  public async count(query: FilterQuery<T>) {
    return this.model.count(query)
  }
}
