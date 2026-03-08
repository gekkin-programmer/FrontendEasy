// src/modules/analytics/dto/product-analytics.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductAnalyticsDto {
  @ApiProperty({ description: 'ID du produit' })
  productId: string;

  @ApiProperty({ description: 'Nom du produit' })
  productName: string;

  @ApiProperty({ description: "URL de l'image du produit" })
  productImage: string;

  @ApiProperty({ description: 'Nombre vendu' })
  quantitySold: number;

  @ApiProperty({ description: 'Revenu généré' })
  revenue: number;

  @ApiProperty({ description: 'Vue du produit' })
  views: number;

  @ApiProperty({ description: 'Taux de conversion' })
  conversionRate: number;
}
