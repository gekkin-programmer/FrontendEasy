// src/modules/analytics/interfaces/analytics-response.interface.ts
export interface AnalyticsResponse {
  data: any;
  period: {
    type: string;
    startDate: Date;
    endDate: Date;
  };
  trends?: {
    revenueTrend: number;
    ordersTrend: number;
    averageOrderValueTrend: number;
  };
}

export interface RealTimeStats {
  today: {
    orders: number;
    revenue: number;
    averageOrderValue: number;
  };
  yesterday: {
    orders: number;
    revenue: number;
  };
  trends: {
    revenue: number;
    orders: number;
  };
  operations: {
    pendingOrders: number;
    processingOrders: number;
    activeDrivers: number;
    lowStockProducts: number;
  };
  updatedAt: Date;
}
