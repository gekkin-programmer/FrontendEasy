import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingService } from './recycling.service';

describe('RecyclingService', () => {
  let service: RecyclingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecyclingService],
    }).compile();

    service = module.get<RecyclingService>(RecyclingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
