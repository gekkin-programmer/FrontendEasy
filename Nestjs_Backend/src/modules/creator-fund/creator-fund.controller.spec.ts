import { Test, TestingModule } from '@nestjs/testing';
import { CreatorFundController } from './creator-fund.controller';

describe('CreatorFundController', () => {
  let controller: CreatorFundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorFundController],
    }).compile();

    controller = module.get<CreatorFundController>(CreatorFundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
