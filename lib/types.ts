export interface Product {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  imageUrl: string;
  marketplace: 'coupang' | 'naver' | 'gmarket' | '11st';
  productUrl: string;
  rating: number;
  reviewCount: number;
  dealDate: string;
  category: string;
  tags: string[];
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
