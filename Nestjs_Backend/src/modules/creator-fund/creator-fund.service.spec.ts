import { Test, TestingModule } from '@nestjs/testing';
import { CreatorFundService } from './creator-fund.service';

describe('CreatorFundService', () => {
  let service: CreatorFundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreatorFundService],
    }).compile();

    service = module.get<CreatorFundService>(CreatorFundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
