export interface Product {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  imageUrl: string;
  marketplace: 'coupang' | 'naver' | 'gmarket' | '11st' | 'instagram' | 'blog' | 'cafe' | 'other';
  productUrl: string;
  rating: number;
  reviewCount: number;
  dealDate: string;
  category: string;
  tags: string[];
  // Extended fields
  type?: 'deal' | 'group-buy';
  dealEndDate?: string;
  isVerified?: boolean;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  metadata?: {
    groupBuyMinCount?: number;
    groupBuyCurrentCount?: number;
    groupBuyDeadline?: string;
  };
}

export interface ReviewSummary {
  productId: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  pros: string[];
  cons: string[];
  keyPoints: string[];
  aiInsight: string;
  totalReviews: number;
  averageRating: number;
}

export interface DailyDeals {
  date: string;
  products: Product[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
  // Profile fields
  gender?: string | null;
  ageGroup?: string | null;
  lifeStage?: string | null;
  residenceType?: string | null;
  regionType?: string | null;
  incomeLevel?: string | null;
  jobIndustry?: string | null;
  jobRole?: string | null;
  workStyle?: string | null;
  dailyPattern?: string | null;
  profileCompletedAt?: string | null;
  suppressProfilePopup?: boolean;
  shouldShowProfilePopup?: boolean;
}
