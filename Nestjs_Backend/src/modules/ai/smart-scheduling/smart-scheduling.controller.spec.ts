import { Test, TestingModule } from '@nestjs/testing';
import { SmartSchedulingController } from './smart-scheduling.controller';
import { SmartSchedulingService } from './smart-scheduling.service';

describe('SmartSchedulingController', () => {
  let controller: SmartSchedulingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartSchedulingController],
      providers: [
        {
          provide: SmartSchedulingService,
          useValue: {
            getSuggestions: jest.fn(),
            getHeatmap: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SmartSchedulingController>(
      SmartSchedulingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
