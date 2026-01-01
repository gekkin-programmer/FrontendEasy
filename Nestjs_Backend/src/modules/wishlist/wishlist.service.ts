// src/modules/wishlist/wishlist.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

interface MoveResult {
  productId: string;
  productName: string;
  success: boolean;
}

interface MoveError {
  productId: string;
  productName: string;
  error: string;
}

interface FlashSaleInfo {
  salePrice: number;
  originalPrice: number;
  discount: number;
  discountPercentage: number;
  endDate: Date;
  timeRemaining: number;
}

interface WishlistItemWithFlashSale {
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
    flashSale: FlashSaleInfo | null;
  };
}

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto) {
    const { productId } = addToWishlistDto;

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    // Vérifier si le produit est déjà dans la wishlist
    const existingWishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingWishlistItem) {
      throw new BadRequestException('Ce produit est déjà dans votre wishlist');
    }

    // Ajouter à la wishlist
    const wishlistItem = await this.prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
    });

    return wishlistItem;
  }

  async getUserWishlist(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [wishlistItems, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              images: true,
              category: true,
              bulkPricingRules: {
                where: { isActive: true },
                take: 1,
                orderBy: { minQuantity: 'asc' },
              },
            },
          },
        },
      }),
      this.prisma.wishlistItem.count({
        where: { userId },
      }),
    ]);

    // Vérifier les ventes flash pour chaque produit
    const now = new Date();
    const wishlistWithFlashSales: WishlistItemWithFlashSale[] = await Promise.all(
      wishlistItems.map(async (item): Promise<WishlistItemWithFlashSale> => {
        const flashSale = await this.prisma.productFlashSale.findFirst({
          where: {
            productId: item.productId,
            isActive: true,
            flashSale: {
              status: 'ACTIVE',
              startDate: { lte: now },
              endDate: { gte: now },
            },
          },
          include: {
            flashSale: true,
          },
        });

        return {
          ...item,
          product: {
            ...item.product,
            flashSale: flashSale
              ? {
                  salePrice: flashSale.salePrice,
                  originalPrice: flashSale.originalPrice,
                  discount: flashSale.originalPrice - flashSale.salePrice,
                  discountPercentage: Math.round(
                    ((flashSale.originalPrice - flashSale.salePrice) /
                      flashSale.originalPrice) *
                      100,
                  ),
                  endDate: flashSale.flashSale.endDate,
                  timeRemaining: flashSale.flashSale.endDate.getTime() - now.getTime(),
                }
              : null,
          },
        } as WishlistItemWithFlashSale;
      }),
    );

    return {
      items: wishlistWithFlashSales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async removeFromWishlist(userId: string, productId: string) {
    // Vérifier que l'élément existe
    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Produit non trouvé dans votre wishlist');
    }

    // Supprimer de la wishlist
    await this.prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return { message: 'Produit retiré de votre wishlist' };
  }

  async clearWishlist(userId: string) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprimer tous les éléments de la wishlist
    await this.prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return { message: 'Wishlist vidée avec succès' };
  }

  async checkInWishlist(userId: string, productId: string) {
    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return {
      isInWishlist: !!wishlistItem,
      product: wishlistItem?.product || null,
      addedAt: wishlistItem?.createdAt || null,
    };
  }

  async getWishlistCount(userId: string) {
    const count = await this.prisma.wishlistItem.count({
      where: { userId },
    });

    return { count };
  }

  async getMostWishlistedProducts(limit: number = 10) {
    const mostWishlisted = await this.prisma.wishlistItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    // Récupérer les détails des produits
    const products = await Promise.all(
      mostWishlisted.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: true,
            category: true,
          },
        });

        return {
          productId: item.productId,
          wishlistCount: item._count.productId,
          product: product,
        };
      }),
    );

    return products;
  }

  async moveWishlistToCart(userId: string, productIds?: string[]) {
    // Récupérer les éléments de la wishlist
    const whereCondition: any = { userId };
    if (productIds && productIds.length > 0) {
      whereCondition.productId = { in: productIds };
    }

    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: whereCondition,
      include: {
        product: true,
      },
    });

    if (wishlistItems.length === 0) {
      throw new BadRequestException('Aucun produit dans la wishlist à déplacer');
    }

    // Récupérer ou créer le panier de l'utilisateur
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: { items: true },
      });
    }

    const results: MoveResult[] = [];
    const errors: MoveError[] = [];

    for (const wishlistItem of wishlistItems) {
      try {
        // Vérifier si le produit est déjà dans le panier
        const existingCartItem = cart.items.find(
          (item) => item.productId === wishlistItem.productId,
        );

        if (existingCartItem) {
          // Mettre à jour la quantité
          await this.prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: {
              quantity: existingCartItem.quantity + 1,
              totalPrice: (existingCartItem.quantity + 1) * existingCartItem.unitPrice,
            },
          });
        } else {
          // Ajouter au panier
          await this.prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: wishlistItem.productId,
              quantity: 1,
              unitPrice: wishlistItem.product.price,
              originalUnitPrice: wishlistItem.product.price,
              totalPrice: wishlistItem.product.price,
            },
          });
        }

        // Supprimer de la wishlist
        await this.prisma.wishlistItem.delete({
          where: {
            userId_productId: {
              userId,
              productId: wishlistItem.productId,
            },
          },
        });

        results.push({
          productId: wishlistItem.productId,
          productName: wishlistItem.product.name,
          success: true,
        });
      } catch (error: any) {
        errors.push({
          productId: wishlistItem.productId,
          productName: wishlistItem.product.name,
          error: error.message,
        });
      }
    }

    // Mettre à jour les totaux du panier
    await this.updateCartTotals(cart.id);

    return {
      moved: results,
      errors,
      message: `${results.length} produit(s) déplacé(s) vers le panier`,
    };
  }

  private async updateCartTotals(cartId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal; // Pour l'instant, pas de discount ni frais de livraison

    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal,
        total,
      },
    });
  }

  async getWishlistStats(userId: string) {
    const [totalItems, recentlyAdded, mostExpensive, categories] = await Promise.all([
      this.prisma.wishlistItem.count({ where: { userId } }),
      this.prisma.wishlistItem.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      }),
      this.prisma.wishlistItem.findMany({
        where: { userId },
        take: 5,
        orderBy: {
          product: {
            price: 'desc',
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      }),
      this.prisma.$queryRaw<Array<{ id: string; name: string; count: bigint }>>`
        SELECT c.id, c.name, COUNT(w.id) as count
        FROM wishlist_items w
        JOIN products p ON w."productId" = p.id
        JOIN categories c ON p."categoryId" = c.id
        WHERE w."userId" = ${userId}
        GROUP BY c.id, c.name
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    return {
      totalItems,
      recentlyAdded,
      mostExpensive,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: Number(cat.count),
      })),
    };
  }
}