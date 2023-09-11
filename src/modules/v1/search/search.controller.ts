import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { ApiOkResponse } from "@nestjs/swagger";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "200, Search results successful" })
  async searchSystem(@Query("query") query: string) {
    const result = await this.searchService.search(query);

    return { message: "Search results successful", ...result };
  }
}
