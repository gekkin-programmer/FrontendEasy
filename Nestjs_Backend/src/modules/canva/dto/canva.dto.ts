import { IsString, IsIn, IsOptional } from 'class-validator';

export class CanvaExportDto {
  @IsString()
  workspaceId: string;

  @IsString()
  designId: string;

  @IsIn(['jpg', 'png', 'gif', 'mp4', 'pdf'])
  format: 'jpg' | 'png' | 'gif' | 'mp4' | 'pdf';

  @IsOptional()
  @IsString()
  folderId?: string;
}

export class CanvaImportAssetDto {
  @IsString()
  workspaceId: string;

  @IsString()
  assetId: string;

  @IsOptional()
  @IsString()
  folderId?: string;
}
