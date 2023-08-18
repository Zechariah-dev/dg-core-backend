import { Injectable } from "@nestjs/common";
import { BusinessRepository } from "./business.repository";
import { FilterQuery } from "mongoose";
import { Business } from "./schemas/business.schema";

@Injectable()
export class BusinessService {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async update(query: FilterQuery<Business>, payload: Partial<Business>) {
    return await this.businessRepository.findOneAndUpdate(query, payload);
  }

  async findOne(query: FilterQuery<Business>) {
    return await this.businessRepository.findOne(query);
  }
}
