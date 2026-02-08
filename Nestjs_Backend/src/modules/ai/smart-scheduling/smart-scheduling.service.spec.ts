import { Test, TestingModule } from '@nestjs/testing';
import { SmartSchedulingService } from './smart-scheduling.service';

describe('SmartSchedulingService', () => {
  let service: SmartSchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartSchedulingService],
    }).compile();

    service = module.get<SmartSchedulingService>(SmartSchedulingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
