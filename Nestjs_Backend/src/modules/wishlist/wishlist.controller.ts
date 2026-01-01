// src/modules/wishlist/wishlist.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Req,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

interface WishlistItemResponse {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    price: number;
    description: string | null;
    summary: string | null;
    images: Array<{
      id: string;
      productId: string;
      url: string;
      alt: string | null;
      order: number;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    bulkPricingRules: Array<{
      id: string;
      productId: string;
      minQuantity: number;
      pricingType: string;
      value: number;
      calculatedUnitPrice: number;
    }>;
    flashSale: {
      salePrice: number;
      originalPrice: number;
      discount: number;
      discountPercentage: number;
      endDate: Date;
      timeRemaining: number;
    } | null;
  };
}

interface UserWishlistResponse {
  items: WishlistItemResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface MoveToCartResult {
  productId: string;
  productName: string;
  success: boolean;
}

interface MoveToCartError {
  productId: string;
  productName: string;
  error: string;
}

interface MoveToCartResponse {
  moved: MoveToCartResult[];
  errors: MoveToCartError[];
  message: string;
}

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
// @UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un produit à la wishlist' })
  @ApiResponse({ status: 201, description: 'Produit ajouté à la wishlist' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async addToWishlist(@Req() req, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.id, addToWishlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir la wishlist de l\'utilisateur' })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 20 })
  async getUserWishlist(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<UserWishlistResponse> {
    return this.wishlistService.getUserWishlist(req.user.id, page, limit);
  }

  @Get('count')
  @ApiOperation({ summary: 'Obtenir le nombre d\'éléments dans la wishlist' })
  async getWishlistCount(@Req() req) {
    return this.wishlistService.getWishlistCount(req.user.id);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Vérifier si un produit est dans la wishlist' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  async checkInWishlist(@Req() req, @Param('productId') productId: string) {
    return this.wishlistService.checkInWishlist(req.user.id, productId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de la wishlist' })
  async getWishlistStats(@Req() req) {
    return this.wishlistService.getWishlistStats(req.user.id);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer un produit de la wishlist' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Vider la wishlist' })
  async clearWishlist(@Req() req) {
    return this.wishlistService.clearWishlist(req.user.id);
  }

  @Post('move-to-cart')
  @ApiOperation({ summary: 'Déplacer les produits de la wishlist vers le panier' })
  async moveWishlistToCart(
    @Req() req,
    @Body() body?: { productIds?: string[] },
  ): Promise<MoveToCartResponse> {
    return this.wishlistService.moveWishlistToCart(req.user.id, body?.productIds);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Obtenir les produits les plus ajoutés aux wishlists' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  async getMostWishlistedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.wishlistService.getMostWishlistedProducts(limit);
  }
}