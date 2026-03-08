import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: {
            createBoard: jest.fn(),
            getBoards: jest.fn(),
            getBoard: jest.fn(),
            updateBoard: jest.fn(),
            deleteBoard: jest.fn(),
            createColumn: jest.fn(),
            updateColumn: jest.fn(),
            deleteColumn: jest.fn(),
            createCard: jest.fn(),
            getCards: jest.fn(),
            updateCard: jest.fn(),
            moveCard: jest.fn(),
            deleteCard: jest.fn(),
            addComment: jest.fn(),
            getComments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
