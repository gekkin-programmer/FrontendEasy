import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBoardDto, UpdateBoardDto,
  CreateColumnDto, UpdateColumnDto,
  CreateCardDto, UpdateCardDto,
  MoveCardDto, CreateCardCommentDto
} from './dto/boards.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // BOARDS
  // ==========================================

  async createBoard(workspaceId: string, userId: string, dto: CreateBoardDto) {
    await this.verifyMembership(workspaceId, userId);

    return this.prisma.board.create({
      data: {
        workspaceId,
        ...dto,
        columns: {
          create: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 },
          ]
        }
      },
      include: { columns: true }
    });
  }

  async getBoards(workspaceId: string, userId: string) {
    await this.verifyMembership(workspaceId, userId);
    return this.prisma.board.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { columns: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBoardDetails(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
              include: {
                assignee: { select: { id: true, firstName: true, avatar: true } },
                labels: true,
                _count: { select: { comments: true } }
              }
            }
          }
        }
      }
    });

    if (!board) throw new NotFoundException('Board not found');
    await this.verifyMembership(board.workspaceId, userId);

    return board;
  }

  async updateBoard(boardId: string, userId: string, dto: UpdateBoardDto) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');
    await this.verifyMembership(board.workspaceId, userId, true);

    return this.prisma.board.update({
      where: { id: boardId },
      data: dto
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');
    await this.verifyMembership(board.workspaceId, userId, true);

    return this.prisma.board.delete({ where: { id: boardId } });
  }

  // ==========================================
  // COLUMNS
  // ==========================================

  async createColumn(boardId: string, userId: string, dto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');
    await this.verifyMembership(board.workspaceId, userId, true);

    return this.prisma.boardColumn.create({
      data: { boardId, ...dto }
    });
  }

  async updateColumn(columnId: string, userId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.boardColumn.findUnique({ 
      where: { id: columnId },
      include: { board: true }
    });
    if (!column) throw new NotFoundException('Column not found');
    await this.verifyMembership(column.board.workspaceId, userId, true);

    return this.prisma.boardColumn.update({
      where: { id: columnId },
      data: dto
    });
  }

  async deleteColumn(columnId: string, userId: string) {
    const column = await this.prisma.boardColumn.findUnique({ 
      where: { id: columnId },
      include: { board: true }
    });
    if (!column) throw new NotFoundException('Column not found');
    await this.verifyMembership(column.board.workspaceId, userId, true);

    return this.prisma.boardColumn.delete({ where: { id: columnId } });
  }

  // ==========================================
  // CARDS
  // ==========================================

  async createCard(columnId: string, userId: string, dto: CreateCardDto) {
    const column = await this.prisma.boardColumn.findUnique({ 
      where: { id: columnId },
      include: { board: true }
    });
    if (!column) throw new NotFoundException('Column not found');
    await this.verifyMembership(column.board.workspaceId, userId);

    const cardCount = await this.prisma.card.count({ where: { columnId } });

    const card = await this.prisma.card.create({
      data: {
        columnId,
        creatorId: userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assigneeId: dto.assigneeId,
        order: cardCount
      }
    });

    await this.logActivity(card.id, userId, 'created', { title: card.title });
    return card;
  }

  async getCardDetails(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: { include: { board: true } },
        assignee: { select: { id: true, firstName: true, avatar: true, email: true } },
        creator: { select: { id: true, firstName: true, avatar: true } },
        labels: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, firstName: true, avatar: true } } }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, firstName: true, avatar: true } } }
        }
      }
    });

    if (!card) throw new NotFoundException('Card not found');
    await this.verifyMembership(card.column.board.workspaceId, userId);

    return card;
  }

  async updateCard(cardId: string, userId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({ 
      where: { id: cardId },
      include: { column: { include: { board: true } } }
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.verifyMembership(card.column.board.workspaceId, userId);

    const updatedCard = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      }
    });

    await this.logActivity(cardId, userId, 'updated', dto);
    return updatedCard;
  }

  async moveCard(cardId: string, userId: string, dto: MoveCardDto) {
    const card = await this.prisma.card.findUnique({ 
      where: { id: cardId },
      include: { column: { include: { board: true } } }
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.verifyMembership(card.column.board.workspaceId, userId);

    const targetColumn = await this.prisma.boardColumn.findUnique({ where: { id: dto.columnId } });
    if (!targetColumn) throw new NotFoundException('Target column not found');

    const updatedCard = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        columnId: dto.columnId,
        order: dto.order
      }
    });

    if (card.columnId !== dto.columnId) {
      await this.logActivity(cardId, userId, 'moved', { 
        from: card.column.name, 
        to: targetColumn.name 
      });
    }

    return updatedCard;
  }

  async addComment(cardId: string, userId: string, dto: CreateCardCommentDto) {
    const card = await this.prisma.card.findUnique({ 
      where: { id: cardId },
      include: { column: { include: { board: true } } }
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.verifyMembership(card.column.board.workspaceId, userId);

    const comment = await this.prisma.cardComment.create({
      data: {
        cardId,
        authorId: userId,
        content: dto.content
      },
      include: { author: { select: { id: true, firstName: true, avatar: true } } }
    });

    await this.logActivity(cardId, userId, 'commented', { content: dto.content });
    return comment;
  }

  // ==========================================
  // CONVERT TO POST
  // ==========================================

  async convertToPost(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({ 
      where: { id: cardId },
      include: { column: { include: { board: true } } }
    });
    
    if (!card) throw new NotFoundException('Card not found');
    await this.verifyMembership(card.column.board.workspaceId, userId);

    if (card.postId) return this.prisma.post.findUnique({ where: { id: card.postId } });

    const post = await this.prisma.post.create({
      data: {
        workspaceId: card.column.board.workspaceId,
        content: `${card.title}\n\n${card.description || ''}`,
        createdById: userId,
        status: 'DRAFT',
      }
    });

    await this.prisma.card.update({
      where: { id: cardId },
      data: { postId: post.id }
    });

    await this.logActivity(cardId, userId, 'converted_to_post', { postId: post.id });

    return post;
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private async verifyMembership(workspaceId: string, userId: string, adminOnly = false) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member) throw new ForbiddenException('You are not a member of this workspace');
    
    if (adminOnly && member.role !== 'OWNER' && member.role !== 'ADMIN') {
      throw new ForbiddenException('Admin or Owner role required');
    }
  }

  private async logActivity(cardId: string, userId: string, action: string, details: any) {
    await this.prisma.cardActivity.create({
      data: {
        cardId,
        userId,
        action,
        details: details || {}
      }
    });
  }
}