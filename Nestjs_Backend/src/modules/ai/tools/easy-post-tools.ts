import { DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PostsService } from '../../posts/posts.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { SocialAccountsService } from '../../social-accounts/social-accounts.service';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { AnalyticsFilterDto, AnalyticsPeriod, AnalyticsType } from '../../analytics/dto/analytics-query.dto';
import { PostStatus } from '../../../common/enums/post-status.enum'; // Ensure this path is correct

// --- Zod Schemas for Tool Input Validation ---

/**
 * Schema for CreatePostTool input
 */
const createPostToolSchema = z.object({
  content: z.string().describe('The main text content of the social media post.'),
  platformIds: z.array(z.string()).describe('An array of social account IDs to publish to.'),
  scheduleDate: z.string().datetime().optional().describe('ISO string for scheduling date (e.g., "2026-02-01T10:00:00Z"). If omitted, post immediately.'),
  mediaIds: z.array(z.string()).optional().describe('An array of media IDs (e.g., from your media service) to include in the post.'),
  // If your CreatePostDto *does* allow a title, add it here and in the DTO
  // title: z.string().optional().describe('An optional title for the social media post.'),
});

/**
 * Schema for AnalyticsTool input
 */
const analyticsToolSchema = z.object({
  metric: z.enum([
    'overview', 'accounts', 'posts', 'best-time', 'hashtags', 'content-mix',
    'health', 'forecast', 'smart-copy'
  ]).describe('The specific analytics metric or insight to retrieve.'),
  workspaceId: z.string().optional().describe('The ID of the workspace for which to fetch analytics.'),
  period: z.nativeEnum(AnalyticsPeriod).optional().describe('Time period for the analytics (e.g., "MONTH").'),
  startDate: z.string().datetime().optional().describe('Start date for custom period (ISO string).'),
  endDate: z.string().datetime().optional().describe('End date for custom period (ISO string).'),
  limit: z.number().int().positive().optional().describe('Maximum number of items to return (e.g., for top posts).'),
});


/**
 * Factory function to create tools that require injected services.
 */
export const createEasyPostTools = (
  postsService: PostsService,
  analyticsService: AnalyticsService,
  socialAccountsService: SocialAccountsService,
  userId: string,
  workspaceId: string
) => {

  const tools = [
    new DynamicTool({
      name: 'get_analytics_insight',
      description: `
        Use this tool to retrieve various analytics insights for the current workspace.
        Input should be a JSON string that conforms to the following Zod schema:
        ${JSON.stringify(analyticsToolSchema._def.shape, null, 2)}
      `,
      func: async (input: string) => {
        try {
          const parsedInput = analyticsToolSchema.parse(JSON.parse(input));
          const { metric, workspaceId: toolWorkspaceId, period, startDate, endDate, limit } = parsedInput;

          // Security check
          if (toolWorkspaceId && toolWorkspaceId !== workspaceId) {
              return `Security alert: Access denied to workspace ${toolWorkspaceId}. Only data for current workspace ${workspaceId} can be accessed.`;
          }
          // The service requires strict Date objects. If the LLM didn't provide dates,
          // we default to the last 30 days so the code doesn't crash.
          const now = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);

          const strictQueryDates = {
            startDate: startDate ? new Date(startDate) : thirtyDaysAgo,
            endDate: endDate ? new Date(endDate) : now,
          };
          // --------------------------------

          // Initialize analyticsFilterDto (for reference, though service uses queryDates object)
          const analyticsFilterDto: AnalyticsFilterDto = {
            period: period,
            startDate: startDate, 
            endDate: endDate,     
            limit: limit,
          };

          switch (metric) {
            case 'overview':
              analyticsFilterDto.type = AnalyticsType.OVERVIEW;
              return JSON.stringify(await analyticsService.getOverviewAnalytics(workspaceId, strictQueryDates));
            
            case 'accounts':
              analyticsFilterDto.type = AnalyticsType.ACCOUNTS;
              return JSON.stringify(await analyticsService.getAccountsAnalytics(workspaceId, strictQueryDates));
            
            case 'posts':
              analyticsFilterDto.type = AnalyticsType.POSTS;
              // Pass strictQueryDates (Date objects) and the limit
              return JSON.stringify(await analyticsService.getTopPosts(workspaceId, strictQueryDates, limit || 10));
            
            case 'best-time':
              return JSON.stringify(await analyticsService.analyzeBestTimes(workspaceId));
            
            case 'hashtags':
              return JSON.stringify(await analyticsService.analyzeHashtags(workspaceId));
            
            case 'content-mix':
              return JSON.stringify(await analyticsService.analyzeContentMix(workspaceId));
            
            case 'health':
              return JSON.stringify(await analyticsService.analyzeAccountHealth(workspaceId));
            
            case 'forecast':
              return JSON.stringify(await analyticsService.calculateGrowthForecast(workspaceId));
            
            case 'smart-copy':
              return 'Smart copy generation requires additional text input. Please provide the text to analyze.';
            
            default: return 'Unknown analytics metric or metric not implemented.';
          }
        } catch (error) {
          return `Error fetching analytics: ${error.message}`;
        }
      },
    }),

    new DynamicTool({
        name: 'get_connected_social_accounts',
        description: `
            Use this tool to get a list of all social media accounts connected to the current workspace.
            Input should be an empty JSON object '{}'.
            Returns an array of objects, each with 'id', 'platform', 'username', and 'isActive' status.
            Example output: '[{"id": "acc1", "platform": "FACEBOOK", "username": "MyPage", "isActive": true}]'
        `,
        func: async (input: string) => {
            try {
                z.object({}).parse(JSON.parse(input || '{}'));
                const accounts = await socialAccountsService.findAll(userId);
                return JSON.stringify(accounts.map(acc => ({
                    id: acc.id,
                    platform: acc.platform,
                    username: acc.username,
                    isActive: acc.isActive
                })));
            } catch (error) {
                return `Error fetching social accounts: ${error.message}`;
            }
        }
    })
  ];

  return tools;
};