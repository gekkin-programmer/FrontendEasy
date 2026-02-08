import { Test, TestingModule } from '@nestjs/testing';
import { SmartSchedulingController } from './smart-scheduling.controller';

describe('SmartSchedulingController', () => {
  let controller: SmartSchedulingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartSchedulingController],
    }).compile();

    controller = module.get<SmartSchedulingController>(SmartSchedulingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
