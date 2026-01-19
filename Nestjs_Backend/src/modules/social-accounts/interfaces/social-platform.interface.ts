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
  // ➤ NEW: Optional Comments Array
  comments?: {
    externalId: string;
    content: string;
    authorName: string;
    authorId?: string;
    publishedAt: Date;
  }[];
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

  /**
   * ➤ NEW: Reply to a specific comment (Optional implementation)
   */
  replyToComment?(
    accessToken: string,
    commentId: string,
    message: string
  ): Promise<string>;
}