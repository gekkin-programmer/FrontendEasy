import {
  Controller, Get, Post, Delete, Query, Body,
  Req, Res, UseGuards, HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { CanvaService } from './canva.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CanvaExportDto, CanvaImportAssetDto } from './dto/canva.dto';

@Controller('canva')
export class CanvaController {
  constructor(private readonly canva: CanvaService) {}

  // ─── OAuth ────────────────────────────────────────────────────────────────

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  startOAuth(@Query('workspaceId') workspaceId: string, @Req() req: any) {
    const url = this.canva.generateAuthUrl(workspaceId, req.user.id);
    return { url };
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const { workspaceId } = await this.canva.handleCallback(code, state);
    // Redirect back to frontend — MediaGallery detects the ?canva=connected param
    const frontendUrl = process.env.FRONTEND_URL || 'https://eazypost.cm';
    res.redirect(`${frontendUrl}/dashboard/${workspaceId}?canva=connected`);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  disconnect(@Query('workspaceId') workspaceId: string) {
    return this.canva.disconnect(workspaceId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Query('workspaceId') workspaceId: string) {
    const conn = await this.canva.isConnected(workspaceId);
    return { connected: !!conn, expiresAt: conn?.expiresAt };
  }

  // ─── Designs (Exports API) ─────────────────────────────────────────────────

  @Get('designs')
  @UseGuards(JwtAuthGuard)
  listDesigns(
    @Query('workspaceId') workspaceId: string,
    @Query('continuation') continuation?: string,
  ) {
    return this.canva.listDesigns(workspaceId, continuation);
  }

  @Post('export')
  @UseGuards(JwtAuthGuard)
  createExport(@Body() dto: CanvaExportDto) {
    return this.canva.createExportJob(dto.workspaceId, dto.designId, dto.format);
  }

  @Get('export/status')
  @UseGuards(JwtAuthGuard)
  getExportStatus(
    @Query('workspaceId') workspaceId: string,
    @Query('jobId') jobId: string,
  ) {
    return this.canva.getExportJob(workspaceId, jobId);
  }

  @Post('export/save')
  @UseGuards(JwtAuthGuard)
  saveExportToLibrary(
    @Body() body: { workspaceId: string; jobId: string; filename: string; folderId?: string },
    @Req() req: any,
  ) {
    return this.canva.importExportedDesign(
      body.workspaceId,
      req.user.id,
      body.jobId,
      body.filename,
      body.folderId,
    );
  }

  // ─── Assets API ────────────────────────────────────────────────────────────

  @Get('assets')
  @UseGuards(JwtAuthGuard)
  listAssets(
    @Query('workspaceId') workspaceId: string,
    @Query('continuation') continuation?: string,
  ) {
    return this.canva.listAssets(workspaceId, continuation);
  }

  @Post('assets/import')
  @UseGuards(JwtAuthGuard)
  importAsset(@Body() dto: CanvaImportAssetDto, @Req() req: any) {
    return this.canva.importAssetToLibrary(
      dto.workspaceId,
      req.user.id,
      dto.assetId,
      dto.folderId,
    );
  }
}
