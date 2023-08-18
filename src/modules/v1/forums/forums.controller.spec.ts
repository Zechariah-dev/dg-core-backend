import { Test, TestingModule } from '@nestjs/testing';
import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';

describe('ForumsController', () => {
  let controller: ForumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumsController],
      providers: [ForumsService],
    }).compile();

    controller = module.get<ForumsController>(ForumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
