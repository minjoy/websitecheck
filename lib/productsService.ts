// 상품 관리 서비스 (API 기반)
import { Product, ReviewSummary } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * 상품 서비스
 */
export const productsService = {
  /**
   * 모든 상품 가져오기
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch products:', response.status);
        return [];
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  },

  /**
   * 특정 날짜의 상품 가져오기
   */
  async getProductsByDate(date: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products?date=${date}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch products by date:', response.status);
        return [];
      }

      const data = await response.json();
      const products = data.products || [];

      // 클라이언트 측 필터링 및 정렬
      return products
        .filter((p: Product) => {
          const dealStart = new Date(p.dealDate);
          const dealEnd = new Date(p.dealEndDate);
          const targetDate = new Date(date);
          return dealStart <= targetDate && targetDate <= dealEnd;
        })
        .sort((a: Product, b: Product) => {
          // 검증된 상품을 먼저 표시
          if (a.isVerified && !b.isVerified) return -1;
          if (!a.isVerified && b.isVerified) return 1;
          // 최신순
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    } catch (error) {
      console.error('Get products by date error:', error);
      return [];
    }
  },

  /**
   * 오늘의 딜 가져오기
   */
  async getTodayDeals(): Promise<{ date: string; products: Product[] }> {
    const today = new Date().toISOString().split('T')[0];
    const products = await this.getProductsByDate(today);
    return {
      date: today,
      products,
    };
  },

  /**
   * ID로 상품 가져오기
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch product:', response.status);
        return null;
      }

      const data = await response.json();
      return data.product || null;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  },

  /**
   * 상품 추가
   */
  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '상품 추가에 실패했습니다' };
      }

      return { success: true, product: data.product };
    } catch (error) {
      console.error('Add product error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },

  /**
   * 상품 수정
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '상품 수정에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },

  /**
   * 상품 삭제
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '상품 삭제에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete product error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },
};

/**
 * 리뷰 서비스
 */
export const reviewsService = {
  /**
   * 상품의 리뷰 요약 가져오기
   */
  async getReviewSummary(productId: string): Promise<ReviewSummary | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${productId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch review:', response.status);
        return null;
      }

      const data = await response.json();
      return data.review || null;
    } catch (error) {
      console.error('Get review error:', error);
      return null;
    }
  },

  /**
   * 리뷰 요약 저장
   */
  async saveReviewSummary(productId: string, review: ReviewSummary): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${productId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '리뷰 저장에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Save review error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },
};
