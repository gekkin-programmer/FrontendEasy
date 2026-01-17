export interface NormalizedSocialPost {
  externalId: string;
  content: string;
  mediaUrls: string[];
  publishedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  metadata: Record<string, any>; // Raw JSON for AI analysis
}

export interface ISocialPlatform {
  /**
   * Fetches historical posts from the provider
   */
  getHistory(
    accessToken: string,
    externalAccountId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]>;

  /**
   * Refreshes the token if expired
   */
  refreshAccessToken(refreshToken: string): Promise<string>;
}