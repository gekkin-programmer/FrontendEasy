import { Test, TestingModule } from '@nestjs/testing';
import { CreatorFundController } from './creator-fund.controller';
import { CreatorFundService } from './creator-fund.service';

describe('CreatorFundController', () => {
  let controller: CreatorFundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorFundController],
      providers: [
        {
          provide: CreatorFundService,
          useValue: {
            apply: jest.fn(),
            findAll: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CreatorFundController>(CreatorFundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
