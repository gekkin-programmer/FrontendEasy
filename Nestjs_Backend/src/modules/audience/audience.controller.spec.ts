import { Test, TestingModule } from '@nestjs/testing';
import { AudienceController } from './audience.controller';
import { AudienceService } from './audience.service';

describe('AudienceController', () => {
  let controller: AudienceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudienceController],
      providers: [
        {
          provide: AudienceService,
          useValue: {
            getTopFans: jest.fn(),
            getSegmentationStats: jest.fn(),
            syncAudience: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AudienceController>(AudienceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
