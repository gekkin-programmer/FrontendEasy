import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingController } from './recycling.controller';

describe('RecyclingController', () => {
  let controller: RecyclingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclingController],
    }).compile();

    controller = module.get<RecyclingController>(RecyclingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
