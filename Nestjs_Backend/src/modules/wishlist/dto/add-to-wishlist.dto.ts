// src/modules/wishlist/dto/add-to-wishlist.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ description: 'ID du produit' })
  @IsString()
  productId: string;
}