import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export enum MarketingGoal {
  SALES = 'SALES', // "Buy now"
  BRAND_AWARENESS = 'AWARENESS', // "We exist"
  ENGAGEMENT = 'ENGAGEMENT', // "Comment below"
  EDUCATION = 'EDUCATION', // "Did you know?"
  VIRALITY = 'VIRALITY', // Memes, trends
}

export enum MediaEnhancementType {
  AUTO_FIX = 'AUTO_FIX', // Light & Color correction
  UPSCALE = 'UPSCALE', // Low res -> High res
  PLATFORM_OPTIMIZE = 'OPTIMIZE', // Crop 9:16 for Reels, 4:5 for Feed
  REMOVE_BACKGROUND = 'REMOVE_BG',
}

export class AnalyzeAndGenerateDto {
  @IsUrl()
  mediaUrl: string; // The image/video to analyze

  @IsString()
  userIntent: string; // e.g. "I want to sell this car fast"

  @IsEnum(MarketingGoal)
  goal: MarketingGoal;

  @IsOptional()
  platforms: string[]; // ['FACEBOOK', 'WHATSAPP']
}
