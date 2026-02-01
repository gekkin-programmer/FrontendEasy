import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCreatorFundDto {
  @ApiProperty({ description: 'Total followers across all platforms' })
  @IsNumber()
  @Min(1000)
  totalFollowers: number;

  @ApiProperty({ description: 'Content niche (e.g., Tech, Marketing)' })
  @IsString()
  @IsNotEmpty()
  niche: string;

  @ApiProperty({ description: 'Why you want to join', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tiktokHandle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  youtubeHandle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedinHandle?: string;
}