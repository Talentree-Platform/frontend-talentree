export interface KbItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  externalUrl: string;
  fileUrl: string;
  contentType: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  viewCount: number;
  isBookmarked: boolean;
  createdAt: string;
}

export interface KbRecommendation {
  id: number;
  title: string;
  summary: string;
  contentType: string;
  category: string;
  thumbnailUrl: string;
  reasonLabel: string;
}

export interface KbPaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface KbApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  timestamp: string;
}

export interface KbFilters {
  search?: string;
  category?: string;
  contentType?: string;
  tag?: string;
  pageIndex?: number;
  pageSize?: number;
}