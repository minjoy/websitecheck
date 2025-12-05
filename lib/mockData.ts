import { Product, ReviewSummary, DailyDeals } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: '삼성 갤럭시 버즈3 프로 블루투스 이어폰',
    originalPrice: 329000,
    salePrice: 199000,
    discountRate: 40,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    marketplace: 'coupang',
    productUrl: '#',
    rating: 4.8,
    reviewCount: 1243,
    dealDate: '2025-11-27',
    category: '전자기기',
    tags: ['인기', '특가', '무료배송']
  },
  {
    id: '2',
    title: 'LG 스타일러 블랙에디션 의류관리기',
    originalPrice: 1890000,
    salePrice: 1290000,
    discountRate: 32,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    marketplace: 'naver',
    productUrl: '#',
    rating: 4.9,
    reviewCount: 892,
    dealDate: '2025-11-27',
    category: '생활가전',
    tags: ['프리미엄', '특가']
  },
  {
    id: '3',
    title: '다이슨 V15 디텍트 무선청소기',
    originalPrice: 1299000,
    salePrice: 799000,
    discountRate: 38,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
    marketplace: 'gmarket',
    productUrl: '#',
    rating: 4.7,
    reviewCount: 2156,
    dealDate: '2025-11-27',
    category: '생활가전',
    tags: ['베스트', '특가', '무료배송']
  },
  {
    id: '4',
    title: '애플 에어팟 프로 2세대 USB-C',
    originalPrice: 359000,
    salePrice: 289000,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80',
    marketplace: '11st',
    productUrl: '#',
    rating: 4.9,
    reviewCount: 3421,
    dealDate: '2025-11-27',
    category: '전자기기',
    tags: ['인기', '신제품']
  },
  {
    id: '5',
    title: '필립스 에어프라이어 XXL 7L 대용량',
    originalPrice: 389000,
    salePrice: 249000,
    discountRate: 36,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
    marketplace: 'coupang',
    productUrl: '#',
    rating: 4.6,
    reviewCount: 1876,
    dealDate: '2025-11-27',
    category: '주방가전',
    tags: ['특가', '무료배송']
  },
  {
    id: '6',
    title: '샤오미 공기청정기 4 프로',
    originalPrice: 459000,
    salePrice: 329000,
    discountRate: 28,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    marketplace: 'naver',
    productUrl: '#',
    rating: 4.8,
    reviewCount: 987,
    dealDate: '2025-11-27',
    category: '생활가전',
    tags: ['추천', '특가']
  }
];

export const mockReviewSummaries: Record<string, ReviewSummary> = {
  '1': {
    productId: '1',
    overallSentiment: 'positive',
    pros: [
      '뛰어난 노이즈 캔슬링 기능',
      '착용감이 매우 편안함',
      '긴 배터리 수명 (최대 30시간)',
      '삼성 기기와 완벽한 연동'
    ],
    cons: [
      '아이폰 사용자에게는 제한적인 기능',
      '가격이 다소 비싼 편'
    ],
    keyPoints: [
      '최신 블루투스 5.3 기술 적용',
      'IPX7 방수 등급으로 땀과 물에 강함',
      '360도 오디오 지원으로 몰입감 극대화',
      '터치 컨트롤이 직관적이고 정확함'
    ],
    aiInsight: 'AI 분석 결과, 삼성 갤럭시 사용자에게 최적화된 제품입니다. 특히 노이즈 캔슬링 성능이 경쟁 제품 대비 우수하며, 장시간 착용에도 불편함이 없다는 평가가 많습니다. 현재 할인가는 출시 이후 최저가로 구매하기 좋은 시점입니다.',
    totalReviews: 1243,
    averageRating: 4.8
  },
  '2': {
    productId: '2',
    overallSentiment: 'positive',
    pros: [
      '의류 관리 효과가 탁월함',
      '조용한 작동음',
      '세련된 디자인',
      '다양한 의류에 사용 가능'
    ],
    cons: [
      '전기 소비량이 다소 높음',
      '크기가 커서 설치 공간 필요'
    ],
    keyPoints: [
      '스팀과 열풍으로 주름 제거',
      '냄새 제거 기능이 뛰어남',
      '정전기 방지 효과',
      '문 안쪽에 바지 전용 행거 포함'
    ],
    aiInsight: '프리미엄 의류 관리 솔루션을 찾는 사용자에게 강력 추천합니다. 특히 정장이나 고급 의류를 자주 입는 직장인에게 유용합니다. 현재 32% 할인가는 매우 합리적인 가격입니다.',
    totalReviews: 892,
    averageRating: 4.9
  },
  '3': {
    productId: '3',
    overallSentiment: 'positive',
    pros: [
      '강력한 흡입력',
      '미세먼지 측정 디스플레이',
      '다양한 헤드 구성',
      '긴 사용 시간'
    ],
    cons: [
      '무게가 다소 무거움',
      '가격대가 높은 편'
    ],
    keyPoints: [
      '레이저로 미세먼지 가시화',
      '자동 흡입력 조절 기능',
      'HEPA 필터로 99.99% 먼지 포집',
      '분당 125,000회 회전'
    ],
    aiInsight: '반려동물이 있거나 알레르기가 있는 가정에 특히 추천합니다. 현재 38% 할인가는 출시가 대비 매우 저렴한 가격으로, 다이슨 제품 구매를 고려 중이라면 좋은 기회입니다.',
    totalReviews: 2156,
    averageRating: 4.7
  }
};

export const getTodayDeals = (): DailyDeals => {
  const today = new Date().toISOString().split('T')[0];
  return {
    date: today,
    products: mockProducts
  };
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getReviewSummary = (productId: string): ReviewSummary | undefined => {
  return mockReviewSummaries[productId];
};

export const getAllProducts = (): Product[] => {
  return mockProducts;
};

export const deleteProduct = (id: string, userId: string): boolean => {
  // Mock implementation - always returns success
  console.log(`Deleting product ${id} by user ${userId}`);
  return true;
};

export const addProduct = (product: Partial<Product>): Product => {
  // Mock implementation - returns a new product with generated ID
  const newProduct: Product = {
    id: String(mockProducts.length + 1),
    title: product.title || '',
    originalPrice: product.originalPrice || 0,
    salePrice: product.salePrice || 0,
    discountRate: product.discountRate || 0,
    imageUrl: product.imageUrl || '',
    marketplace: product.marketplace || 'coupang',
    productUrl: product.productUrl || '#',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    dealDate: product.dealDate || new Date().toISOString().split('T')[0],
    category: product.category || '',
    tags: product.tags || []
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const saveReviewSummary = (productId: string, summary: Partial<ReviewSummary>): ReviewSummary => {
  // Mock implementation - saves and returns the review summary
  const newSummary: ReviewSummary = {
    productId,
    overallSentiment: summary.overallSentiment || 'neutral',
    pros: summary.pros || [],
    cons: summary.cons || [],
    keyPoints: summary.keyPoints || [],
    aiInsight: summary.aiInsight || '',
    totalReviews: summary.totalReviews || 0,
    averageRating: summary.averageRating || 0
  };
  mockReviewSummaries[productId] = newSummary;
  return newSummary;
};
