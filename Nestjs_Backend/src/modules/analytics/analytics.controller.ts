// // src/modules/analytics/analytics.controller.ts
// import { 
//   Controller, 
//   Get, 
//   Query, 
//   UseGuards,
//   Req 
// } from '@nestjs/common';
// import { 
//   ApiTags, 
//   ApiOperation, 
//   ApiResponse, 
//   ApiBearerAuth,
//   ApiQuery 
// } from '@nestjs/swagger';
// import { AnalyticsService } from './analytics.service';
// import { AnalyticsFilterDto, AnalyticsType, AnalyticsPeriod } from './dto/analytics-query.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from 'src/common/guards/roles.decorator';

// @ApiTags('Analytics')
// @ApiBearerAuth()
// @Controller('analytics')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN', 'MANAGER')
// export class AnalyticsController {
//   constructor(private readonly analyticsService: AnalyticsService) {}

//   @Get()
//   @ApiOperation({ summary: 'Obtenir les statistiques d\'analyse' })
//   @ApiQuery({ name: 'period', enum: AnalyticsPeriod, required: false })
//   @ApiQuery({ name: 'type', enum: AnalyticsType, required: false })
//   @ApiQuery({ name: 'startDate', required: false })
//   @ApiQuery({ name: 'endDate', required: false })
//   @ApiQuery({ name: 'limit', required: false })
//   @ApiQuery({ name: 'region', required: false })
//   async getAnalytics(@Query() filterDto: AnalyticsFilterDto) {
//     return this.analyticsService.getAnalytics(filterDto);
//   }

//   @Get('realtime')
//   @ApiOperation({ summary: 'Obtenir les statistiques en temps réel pour le dashboard' })
//   async getRealTimeStats() {
//     return this.analyticsService.getRealTimeStats();
//   }

//   @Get('export')
//   @ApiOperation({ summary: 'Exporter les données analytiques (format CSV/Excel)' })
//   @ApiQuery({ name: 'period', enum: AnalyticsPeriod, required: false })
//   @ApiQuery({ name: 'type', enum: AnalyticsType, required: false })
//   @ApiQuery({ name: 'startDate', required: false })
//   @ApiQuery({ name: 'endDate', required: false })
//   async exportAnalytics(@Query() filterDto: AnalyticsFilterDto) {
//     const analytics = await this.analyticsService.getAnalytics(filterDto);
    
//     // Pour l'instant, retourner les données JSON
//     // Dans une version future, on pourrait générer un fichier CSV ou Excel
//     return {
//       data: analytics,
//       exportFormat: 'json',
//       exportedAt: new Date(),
//       fileName: `analytics-${filterDto.type || 'overview'}-${new Date().toISOString().split('T')[0]}.json`,
//     };
//   }
// }