// src/modules/analytics/dto/analytics-filter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AnalyticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export enum AnalyticsType {
  SALES = 'sales',
  ORDERS = 'orders',
  PRODUCTS = 'products',
  REGIONS = 'regions',
  DRIVERS = 'drivers',
  OVERVIEW = 'overview'
}

export class AnalyticsFilterDto {
  @ApiProperty({ 
    enum: AnalyticsPeriod, 
    default: AnalyticsPeriod.MONTH, 
    required: false 
  })
  @IsEnum(AnalyticsPeriod)
  @IsOptional()
  period?: AnalyticsPeriod;

  @ApiProperty({ 
    enum: AnalyticsType, 
    default: AnalyticsType.OVERVIEW, 
    required: false 
  })
  @IsEnum(AnalyticsType)
  @IsOptional()
  type?: AnalyticsType;

  @ApiProperty({ 
    required: false,
    description: 'Date de début (format: YYYY-MM-DD) - utilisé avec period="custom"' 
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    required: false,
    description: 'Date de fin (format: YYYY-MM-DD) - utilisé avec period="custom"' 
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ 
    required: false,
    description: 'Limite de résultats (par exemple pour les top produits)' 
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number;

  @ApiProperty({ 
    required: false,
    description: 'Région spécifique pour filtrer' 
  })
  @IsString()
  @IsOptional()
  region?: string;
}