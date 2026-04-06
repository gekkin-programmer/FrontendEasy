import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ example: 'Hello Africa! #Tech' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'cmk...workspace' })
  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @ApiProperty({
    example: ['cmk...1', 'cmk...2'],
    description: 'IDs of Social Accounts',
  })
  @IsArray()
  @IsString({ each: true })
  socialAccountIds: string[];

  @ApiProperty({ example: ['cmk...media1'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @ApiProperty({ example: '2026-01-20T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiProperty({ enum: PostStatus, example: 'DRAFT' })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ example: { youtube: { title: 'My Video' } }, required: false })
  @IsOptional()
  @IsObject()
  platformMeta?: Record<string, any>;
}
