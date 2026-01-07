import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsPeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export enum AnalyticsType {
  OVERVIEW = 'OVERVIEW',
  ACCOUNTS = 'ACCOUNTS', // Performance by Platform
  POSTS = 'POSTS',       // Top Content
}

export class AnalyticsFilterDto {
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;

  @IsOptional()
  @IsEnum(AnalyticsType)
  type?: AnalyticsType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}