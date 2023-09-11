import { Injectable } from "@nestjs/common";
import { ForumsRepository } from "../forums/forums.repository";
import { ProductsRepository } from "../products/products.repository";
import { APPROVAL_STATUS } from "../../../constants";

@Injectable()
export class SearchService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly forumsReppository: ForumsRepository
  ) {}

  async search(query: string) {
    const products = await this.productsRepository.find({
      title: { $regex: query, $options: "i" },
    });

    const forums = await this.forumsReppository.find({
      title: { $regex: query, $options: "i" },
      approvalStatus: APPROVAL_STATUS.APPROVED,
    });

    return { forums, products };
  }
}
