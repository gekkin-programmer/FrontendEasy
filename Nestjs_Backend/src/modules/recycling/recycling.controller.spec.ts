jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingController } from './recycling.controller';
import { RecyclingService } from './recycling.service';

describe('RecyclingController', () => {
  let controller: RecyclingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclingController],
      providers: [
        {
          provide: RecyclingService,
          useValue: {
            getRecyclableCandidates: jest.fn(),
            toggleEvergreen: jest.fn(),
            recyclePost: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecyclingController>(RecyclingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
