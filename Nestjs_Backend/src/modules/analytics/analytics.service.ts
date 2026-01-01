// src/modules/analytics/analytics.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsFilterDto, AnalyticsPeriod, AnalyticsType } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(filters: AnalyticsFilterDto) {
    const { period = AnalyticsPeriod.MONTH, type = AnalyticsType.OVERVIEW, startDate, endDate, limit, region } = filters;

    switch (type) {
      case AnalyticsType.OVERVIEW:
        return this.getOverviewAnalytics(period, startDate, endDate, region);
      case AnalyticsType.SALES:
        return this.getSalesAnalytics(period, startDate, endDate, region);
      case AnalyticsType.ORDERS:
        return this.getOrdersAnalytics(period, startDate, endDate, region);
      case AnalyticsType.PRODUCTS:
        return this.getProductsAnalytics(period, startDate, endDate, limit, region);
      case AnalyticsType.REGIONS:
        return this.getRegionsAnalytics(period, startDate, endDate, limit);
      case AnalyticsType.DRIVERS:
        return this.getDriversAnalytics(period, startDate, endDate, limit);
      default:
        return this.getOverviewAnalytics(period, startDate, endDate, region);
    }
  }

  private async getOverviewAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    region?: string,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);

    const whereCondition: any = {
      createdAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
      status: 'DELIVERED',
    };

    if (region) {
      whereCondition.deliveryRegion = region;
    }

    const [
      totalOrders,
      totalRevenue,
      averageOrderValue,
      deliveredOrders,
      pendingOrders,
      processingOrders,
      topProducts,
      topRegions,
    ] = await Promise.all([
      // Total des commandes
      this.prisma.order.count({ where: whereCondition }),

      // Total des revenus
      this.prisma.order.aggregate({
        where: whereCondition,
        _sum: { total: true },
      }),

      // Valeur moyenne des commandes
      this.prisma.order.aggregate({
        where: whereCondition,
        _avg: { total: true },
      }),

      // Commandes livrées
      this.prisma.order.count({
        where: { ...whereCondition, status: 'DELIVERED' },
      }),

      // Commandes en attente
      this.prisma.order.count({
        where: { ...whereCondition, status: 'PENDING' },
      }),

      // Commandes en cours de traitement
      this.prisma.order.count({
        where: {
          ...whereCondition,
          status: { in: ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'ASSIGNED_TO_DRIVER'] },
        },
      }),

      // Top 5 produits
      this.getTopProducts(5, dateRange.startDate, dateRange.endDate, region),

      // Top régions
      this.getTopRegions(5, dateRange.startDate, dateRange.endDate),
    ]);

    return {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum?.total || 0,
        averageOrderValue: averageOrderValue._avg?.total || 0,
        deliveredOrders,
        pendingOrders,
        processingOrders,
        cancellationRate: await this.getCancellationRate(dateRange.startDate, dateRange.endDate, region),
      },
      topProducts,
      topRegions,
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getSalesAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    region?: string,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);
    const groupByFormat = this.getGroupByFormat(period);

    // Construire la requête pour grouper par période
    let query = `
      SELECT 
        DATE_TRUNC('${groupByFormat}', o."createdAt") as period,
        COUNT(o.id) as orders_count,
        SUM(o.total) as total_revenue,
        AVG(o.total) as avg_order_value
      FROM orders o
      WHERE o."createdAt" >= '${dateRange.startDate.toISOString()}'
        AND o."createdAt" <= '${dateRange.endDate.toISOString()}'
        AND o.status = 'DELIVERED'
    `;

    if (region) {
      query += ` AND o."deliveryRegion" = '${region}'`;
    }

    query += `
      GROUP BY DATE_TRUNC('${groupByFormat}', o."createdAt")
      ORDER BY period ASC
    `;

    const salesData = await this.prisma.$queryRawUnsafe<Array<{
      period: Date;
      orders_count: bigint;
      total_revenue: number;
      avg_order_value: number;
    }>>(query);

    // Formater les données pour le frontend
    const formattedData = salesData.map((item) => ({
      label: this.formatPeriodLabel(item.period, period),
      amount: Number(item.total_revenue) || 0,
      orders: Number(item.orders_count) || 0,
      averageOrderValue: Number(item.avg_order_value) || 0,
    }));

    // Calculer les tendances
    const trends = this.calculateTrends(formattedData);

    return {
      data: formattedData,
      trends,
      summary: {
        totalRevenue: formattedData.reduce((sum, item) => sum + item.amount, 0),
        totalOrders: formattedData.reduce((sum, item) => sum + item.orders, 0),
        averageOrderValue: formattedData.length > 0 
          ? formattedData.reduce((sum, item) => sum + item.averageOrderValue, 0) / formattedData.length 
          : 0,
      },
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getOrdersAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    region?: string,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);

    const whereCondition: any = {
      createdAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    if (region) {
      whereCondition.deliveryRegion = region;
    }

    // Statistiques par statut de commande
    const statusStats = await this.prisma.order.groupBy({
      by: ['status'],
      where: whereCondition,
      _count: { id: true },
    });

    // Commandes par méthode de paiement
    const paymentMethodStats = await this.prisma.order.groupBy({
      by: ['paymentMethod'],
      where: whereCondition,
      _count: { id: true },
    });

    // Temps moyen de traitement
    const processingTime = await this.getAverageProcessingTime(dateRange.startDate, dateRange.endDate);

    const totalOrdersCount = statusStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const totalPaymentOrders = paymentMethodStats.reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      statusDistribution: statusStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        percentage: totalOrdersCount > 0 ? (stat._count.id / totalOrdersCount) * 100 : 0,
      })),
      paymentMethodDistribution: paymentMethodStats.map(stat => ({
        method: stat.paymentMethod,
        count: stat._count.id,
        percentage: totalPaymentOrders > 0 ? (stat._count.id / totalPaymentOrders) * 100 : 0,
      })),
      processingTime,
      totalOrders: totalOrdersCount,
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getProductsAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    limit: number = 10,
    region?: string,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);
    
    // Récupérer les produits les plus vendus
    const topProducts = await this.getTopProducts(limit, dateRange.startDate, dateRange.endDate, region);

    // Récupérer les produits les plus consultés
    const mostViewedProducts = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        images: true,
        viewCount: true,
        purchaseCount: true,
        price: true,
      },
    });

    // Récupérer les produits en rupture de stock
    const outOfStockProducts = await this.prisma.product.findMany({
      where: {
        OR: [
          { status: 'OUT_OF_STOCK' },
          { trackQuantity: true, quantity: { lte: 0 } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        images: true,
        quantity: true,
        updatedAt: true,
      },
    });

    // Récupérer les produits avec le meilleur taux de conversion
    const conversionRateProducts = mostViewedProducts.map(product => ({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url || null,
      views: product.viewCount,
      purchases: product.purchaseCount,
      conversionRate: product.viewCount > 0 ? (product.purchaseCount / product.viewCount) * 100 : 0,
      revenue: product.purchaseCount * product.price,
    })).sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, limit);

    return {
      topSelling: topProducts,
      mostViewed: mostViewedProducts,
      outOfStock: outOfStockProducts,
      bestConversionRate: conversionRateProducts,
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getRegionsAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    limit: number = 10,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);

    // Commandes par région
    const ordersByRegion = await this.prisma.order.groupBy({
      by: ['deliveryRegion'],
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: 'DELIVERED',
      },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Clients par région
    const customersByRegion = await this.prisma.$queryRawUnsafe<Array<{region: string, customer_count: bigint}>>(`
      SELECT 
        a.region,
        COUNT(DISTINCT o."userId") as customer_count
      FROM orders o
      JOIN addresses a ON o."shippingAddressId" = a.id
      WHERE o."createdAt" >= '${dateRange.startDate.toISOString()}'
        AND o."createdAt" <= '${dateRange.endDate.toISOString()}'
        AND o.status = 'DELIVERED'
      GROUP BY a.region
      ORDER BY customer_count DESC
      LIMIT ${limit}
    `);

    // Valeur moyenne par commande par région
    const avgOrderValueByRegion = await this.prisma.order.groupBy({
      by: ['deliveryRegion'],
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: 'DELIVERED',
      },
      _avg: { total: true },
    });

    const formattedOrdersByRegion = ordersByRegion.map(region => {
      const avgRegion = avgOrderValueByRegion.find(avg => avg.deliveryRegion === region.deliveryRegion);
      return {
        region: region.deliveryRegion,
        orders: region._count?.id || 0,
        revenue: region._sum?.total || 0,
        averageOrderValue: avgRegion?._avg?.total || 0,
      };
    });

    return {
      ordersByRegion: formattedOrdersByRegion,
      customersByRegion: customersByRegion.map(item => ({
        region: item.region,
        customerCount: Number(item.customer_count),
      })),
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getDriversAnalytics(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
    limit: number = 10,
  ) {
    const dateRange = this.getDateRange(period, startDate, endDate);

    // Livreurs les plus performants
    const topDrivers = await this.prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
        assignedOrders: {
          some: {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
            status: 'DELIVERED',
          },
        },
      },
      include: {
        assignedOrders: {
          where: {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
            status: 'DELIVERED',
          },
        },
      },
      orderBy: { completedDeliveries: 'desc' },
      take: limit,
    });

    // Statistiques de performance des livreurs
    const driverPerformance = topDrivers.map(driver => ({
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      phone: driver.phone,
      vehicle: `${driver.vehicleType} (${driver.vehiclePlate})`,
      completedDeliveries: driver.completedDeliveries,
      periodDeliveries: driver.assignedOrders.length,
      averageRating: driver.rating || 0,
      regions: driver.regions as string[],
    }));

    // Temps moyen de livraison par livreur
    const deliveryTimes = await this.getAverageDeliveryTimes(dateRange.startDate, dateRange.endDate);

    return {
      topDrivers: driverPerformance,
      deliveryTimes,
      summary: {
        totalDrivers: await this.prisma.driver.count({ where: { status: 'ACTIVE' } }),
        activeDrivers: await this.prisma.driver.count({ where: { status: 'ACTIVE', isOnline: true } }),
        totalDeliveries: driverPerformance.reduce((sum, driver) => sum + driver.periodDeliveries, 0),
      },
      period: {
        type: period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  private async getTopProducts(limit: number, startDate: Date, endDate: Date, region?: string) {
    const whereCondition: any = {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'DELIVERED',
      },
    };

    if (region) {
      whereCondition.order.deliveryRegion = region;
    }

    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: whereCondition,
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Récupérer les détails des produits
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            images: true,
            price: true,
          },
        });

        return {
          productId: item.productId,
          productName: product?.name || 'Produit inconnu',
          productImage: product?.images[0]?.url || null,
          quantitySold: item._sum?.quantity || 0,
          revenue: item._sum?.totalPrice || 0,
          averagePrice: product?.price || 0,
        };
      })
    );

    return productDetails;
  }

  private async getTopRegions(limit: number, startDate: Date, endDate: Date) {
    const regions = await this.prisma.order.groupBy({
      by: ['deliveryRegion'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'DELIVERED',
      },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return regions.map(region => ({
      region: region.deliveryRegion,
      orders: region._count?.id || 0,
      revenue: region._sum?.total || 0,
    }));
  }

  private async getCancellationRate(startDate: Date, endDate: Date, region?: string) {
    const whereCondition: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (region) {
      whereCondition.deliveryRegion = region;
    }

    const [totalOrders, cancelledOrders] = await Promise.all([
      this.prisma.order.count({ where: whereCondition }),
      this.prisma.order.count({ 
        where: { 
          ...whereCondition,
          status: 'CANCELLED',
        },
      }),
    ]);

    return totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  }

  private async getAverageProcessingTime(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'DELIVERED',
        trackingEvents: {
          some: {
            status: { in: ['CONFIRMED', 'DELIVERED'] },
          },
        },
      },
      include: {
        trackingEvents: {
          where: {
            status: { in: ['CONFIRMED', 'DELIVERED'] },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (orders.length === 0) return 0;

    const totalProcessingTime = orders.reduce((sum, order) => {
      const confirmedEvent = order.trackingEvents.find(e => e.status === 'CONFIRMED');
      const deliveredEvent = order.trackingEvents.find(e => e.status === 'DELIVERED');
      
      if (confirmedEvent && deliveredEvent) {
        const processingTime = deliveredEvent.createdAt.getTime() - confirmedEvent.createdAt.getTime();
        return sum + processingTime;
      }
      return sum;
    }, 0);

    return totalProcessingTime / (orders.length * 3600000); // Retourne en heures
  }

  private async getAverageDeliveryTimes(startDate: Date, endDate: Date) {
    const deliveries = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'DELIVERED',
        assignedDriverId: { not: null },
        trackingEvents: {
          some: {
            status: { in: ['ASSIGNED_TO_DRIVER', 'DELIVERED'] },
          },
        },
      },
      include: {
        assignedDriver: true,
        trackingEvents: {
          where: {
            status: { in: ['ASSIGNED_TO_DRIVER', 'DELIVERED'] },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const driverTimes = new Map<string, number[]>();

    deliveries.forEach(order => {
      if (order.assignedDriverId && order.trackingEvents.length >= 2) {
        const assignedEvent = order.trackingEvents.find(e => e.status === 'ASSIGNED_TO_DRIVER');
        const deliveredEvent = order.trackingEvents.find(e => e.status === 'DELIVERED');

        if (assignedEvent && deliveredEvent) {
          const deliveryTime = deliveredEvent.createdAt.getTime() - assignedEvent.createdAt.getTime();
          const driverId = order.assignedDriverId;

          if (!driverTimes.has(driverId)) {
            driverTimes.set(driverId, []);
          }
          driverTimes.get(driverId)!.push(deliveryTime);
        }
      }
    });

    const averageTimes: Array<{
      driverId: string;
      driverName: string;
      averageDeliveryTime: number;
      deliveriesCount: number;
    }> = [];

    for (const [driverId, times] of driverTimes.entries()) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        select: { firstName: true, lastName: true },
      });

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      averageTimes.push({
        driverId,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Inconnu',
        averageDeliveryTime: averageTime / 60000, // Convertir en minutes
        deliveriesCount: times.length,
      });
    }

    return averageTimes.sort((a, b) => a.averageDeliveryTime - b.averageDeliveryTime);
  }

  private getDateRange(period: AnalyticsPeriod, customStartDate?: string, customEndDate?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case AnalyticsPeriod.DAY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case AnalyticsPeriod.WEEK:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case AnalyticsPeriod.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case AnalyticsPeriod.YEAR:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case AnalyticsPeriod.CUSTOM:
        if (!customStartDate || !customEndDate) {
          throw new BadRequestException('Les dates de début et de fin sont requises pour la période personnalisée');
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return { startDate, endDate };
  }

  private getGroupByFormat(period: AnalyticsPeriod): string {
    switch (period) {
      case AnalyticsPeriod.DAY:
        return 'hour';
      case AnalyticsPeriod.WEEK:
        return 'day';
      case AnalyticsPeriod.MONTH:
        return 'day';
      case AnalyticsPeriod.YEAR:
        return 'month';
      default:
        return 'day';
    }
  }

  private formatPeriodLabel(date: Date, period: AnalyticsPeriod): string {
    const d = new Date(date);
    
    switch (period) {
      case AnalyticsPeriod.DAY:
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      case AnalyticsPeriod.WEEK:
      case AnalyticsPeriod.MONTH:
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      case AnalyticsPeriod.YEAR:
        return d.toLocaleDateString('fr-FR', { month: 'long' });
      default:
        return d.toLocaleDateString('fr-FR');
    }
  }

  private calculateTrends(data: any[]) {
    if (data.length < 2) {
      return {
        revenueTrend: 0,
        ordersTrend: 0,
        averageOrderValueTrend: 0,
      };
    }

    const lastPeriod = data[data.length - 1];
    const previousPeriod = data[data.length - 2];

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenueTrend: calculateTrend(lastPeriod.amount, previousPeriod.amount),
      ordersTrend: calculateTrend(lastPeriod.orders, previousPeriod.orders),
      averageOrderValueTrend: calculateTrend(lastPeriod.averageOrderValue, previousPeriod.averageOrderValue),
    };
  }

  // Méthode pour récupérer des statistiques en temps réel (dashboard)
  async getRealTimeStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const [
      todayOrders,
      todayRevenue,
      yesterdayOrders,
      yesterdayRevenue,
      pendingOrders,
      processingOrders,
      activeDrivers,
      lowStockProducts,
    ] = await Promise.all([
      // Commandes aujourd'hui
      this.prisma.order.count({
        where: {
          createdAt: { gte: todayStart },
          status: { not: 'CANCELLED' },
        },
      }),

      // Revenu aujourd'hui
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart },
          status: 'DELIVERED',
        },
        _sum: { total: true },
      }),

      // Commandes hier
      this.prisma.order.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
          status: { not: 'CANCELLED' },
        },
      }),

      // Revenu hier
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
          status: 'DELIVERED',
        },
        _sum: { total: true },
      }),

      // Commandes en attente
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),

      // Commandes en traitement
      this.prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'ASSIGNED_TO_DRIVER'] },
        },
      }),

      // Livreurs actifs
      this.prisma.driver.count({
        where: { status: 'ACTIVE', isOnline: true },
      }),

      // Produits en stock faible
      this.prisma.product.count({
        where: {
          trackQuantity: true,
          quantity: { lte: 10, gt: 0 },
        },
      }),
    ]);

    // Calculer les tendances
    const yesterdayRevenueTotal = yesterdayRevenue._sum?.total || 0;
    const todayRevenueTotal = todayRevenue._sum?.total || 0;
    
    const revenueTrend = yesterdayRevenueTotal
      ? ((todayRevenueTotal - yesterdayRevenueTotal) / yesterdayRevenueTotal) * 100
      : 0;

    const ordersTrend = yesterdayOrders
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
      : 0;

    return {
      today: {
        orders: todayOrders,
        revenue: todayRevenueTotal,
        averageOrderValue: todayOrders > 0 ? todayRevenueTotal / todayOrders : 0,
      },
      yesterday: {
        orders: yesterdayOrders,
        revenue: yesterdayRevenueTotal,
      },
      trends: {
        revenue: revenueTrend,
        orders: ordersTrend,
      },
      operations: {
        pendingOrders,
        processingOrders,
        activeDrivers,
        lowStockProducts,
      },
      updatedAt: now,
    };
  }
}