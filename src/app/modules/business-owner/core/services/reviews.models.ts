export interface Review {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  rating: number;
  reviewText: string;
  isAnonymous: boolean;
  hasResponse: boolean;
  ownerResponse: string;
  responseAt: string;
  canEditResponse: boolean;
  sentimentScore: number;
  sentimentLabel: string;
  flaggedToxic: boolean;
  createdAt: string;
}

export interface ReviewFilters {
  rating?: number;
  productId?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export interface ReviewPaginatedData {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Review[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface ReviewAnalyticsDistribution {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface ReviewSentimentTrend {
  month: string;
  averageSentiment: number;
  reviewCount: number;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  totalResponded: number;
  responseRate: number;
  distribution: ReviewAnalyticsDistribution;
  sentimentTrend: ReviewSentimentTrend[];
}

export interface ReviewApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[] | null;
  timestamp: string;
}

export interface RespondToReviewRequest {
  response: string;
}