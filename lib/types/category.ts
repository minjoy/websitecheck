// ========================================
// 상품 카테고리 타입 정의
// ========================================

export interface ProductCategory {
  id: number;
  parentId: number | null;
  name: string;
  code: string;
  depth: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryKeyword {
  id: number;
  categoryId: number;
  keyword: string;
  weight: number;
  keywordType: 'CORE' | 'SECONDARY';
  createdAt: string;
}

export interface ProductCategoryMap {
  id: number;
  productId: number;
  categoryId: number;
  score: number;
  isSuggested: boolean;
  isPrimary: boolean;
  createdAt: string;
}

// 카테고리 점수 결과
export interface CategoryScore {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  score: number;
  isPrimary: boolean;
}

// 카테고리 코드 타입
export type CategoryCode =
  | 'SMALL_APPLIANCE'
  | 'LIVING_ITEM'
  | 'KITCHEN_ITEM'
  | 'CLEANING_ORGANIZING'
  | 'HOME_DECO'
  | 'OFFICE_WORK'
  | 'BABY_MOM'
  | 'HEALTH_WELLNESS'
  | 'HOBBY_ENTERTAINMENT'
  | 'PET_SUPPLIES'
  | 'BEAUTY_CARE'
  | 'FOOD_BEVERAGE'
  | 'FASHION_CLOTHING'
  | 'ELECTRONICS'
  | 'FURNITURE_INTERIOR';
