import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, Query 
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  CreateBoardDto, UpdateBoardDto, 
  CreateColumnDto, UpdateColumnDto, 
  CreateCardDto, UpdateCardDto, 
  MoveCardDto, CreateCardCommentDto 
} from './dto/boards.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ==========================================
  // BOARDS
  // ==========================================

  @Post('workspace/:workspaceId')
  @ApiOperation({ summary: 'Create a new board in a workspace' })
  createBoard(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
    @Body() dto: CreateBoardDto
  ) {
    return this.boardsService.createBoard(workspaceId, req.user.sub, dto);
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'List all boards in a workspace' })
  getBoards(
    @Param('workspaceId') workspaceId: string,
    @Request() req
  ) {
    return this.boardsService.getBoards(workspaceId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board details including columns and cards' })
  getBoardDetails(@Param('id') id: string, @Request() req) {
    return this.boardsService.getBoardDetails(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update board settings' })
  updateBoard(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateBoardDto
  ) {
    return this.boardsService.updateBoard(id, req.user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  deleteBoard(@Param('id') id: string, @Request() req) {
    return this.boardsService.deleteBoard(id, req.user.sub);
  }

  // ==========================================
  // COLUMNS
  // ==========================================

  @Post(':boardId/columns')
  @ApiOperation({ summary: 'Add a column to a board' })
  createColumn(
    @Param('boardId') boardId: string,
    @Request() req,
    @Body() dto: CreateColumnDto
  ) {
    return this.boardsService.createColumn(boardId, req.user.sub, dto);
  }

  @Patch('columns/:id')
  @ApiOperation({ summary: 'Update column details' })
  updateColumn(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateColumnDto
  ) {
    return this.boardsService.updateColumn(id, req.user.sub, dto);
  }

  @Delete('columns/:id')
  @ApiOperation({ summary: 'Delete a column' })
  deleteColumn(@Param('id') id: string, @Request() req) {
    return this.boardsService.deleteColumn(id, req.user.sub);
  }

  // ==========================================
  // CARDS
  // ==========================================

  @Post('columns/:columnId/cards')
  @ApiOperation({ summary: 'Create a card in a column' })
  createCard(
    @Param('columnId') columnId: string,
    @Request() req,
    @Body() dto: CreateCardDto
  ) {
    return this.boardsService.createCard(columnId, req.user.sub, dto);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Get full card details (comments, activity)' })
  getCardDetails(@Param('id') id: string, @Request() req) {
    return this.boardsService.getCardDetails(id, req.user.sub);
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Update card fields' })
  updateCard(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateCardDto
  ) {
    return this.boardsService.updateCard(id, req.user.sub, dto);
  }

  @Patch('cards/:id/move')
  @ApiOperation({ summary: 'Move a card to another column/position' })
  moveCard(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: MoveCardDto
  ) {
    return this.boardsService.moveCard(id, req.user.sub, dto);
  }

  @Post('cards/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a card' })
  addComment(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateCardCommentDto
  ) {
    return this.boardsService.addComment(id, req.user.sub, dto);
  }

  // ==========================================
  // CONVERT TO POST
  // ==========================================

  @Post('cards/:id/convert-to-post')
  @ApiOperation({ summary: 'Convert card content into a social media post draft' })
  convertToPost(@Param('id') id: string, @Request() req) {
    return this.boardsService.convertToPost(id, req.user.sub);
  }
}