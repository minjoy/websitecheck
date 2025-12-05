// 즐겨찾기 관리 시스템 (API 기반)
import { Product } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Favorite {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

/**
 * 즐겨찾기 서비스
 */
export const favoritesService = {
  /**
   * 사용자의 즐겨찾기 목록 가져오기
   */
  async getUserFavorites(): Promise<Favorite[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch favorites:', response.status);
        return [];
      }

      const data = await response.json();
      return data.favorites || [];
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  },

  /**
   * 즐겨찾기 추가
   */
  async addFavorite(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '즐겨찾기 추가에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Add favorite error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },

  /**
   * 즐겨찾기 제거
   */
  async removeFavorite(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '즐겨찾기 제거에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Remove favorite error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },

  /**
   * 즐겨찾기 여부 확인
   */
  async isFavorite(productId: string): Promise<boolean> {
    try {
      const favorites = await this.getUserFavorites();
      return favorites.some(f => f.productId === productId);
    } catch (error) {
      console.error('Check favorite error:', error);
      return false;
    }
  },

  /**
   * 즐겨찾기 토글
   */
  async toggleFavorite(productId: string): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
    const isFav = await this.isFavorite(productId);

    if (isFav) {
      const result = await this.removeFavorite(productId);
      return { ...result, isFavorite: false };
    } else {
      const result = await this.addFavorite(productId);
      return { ...result, isFavorite: true };
    }
  },
};

// Deprecated: 하위 호환성을 위한 레거시 함수들 (사용하지 마세요)
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  console.warn('getUserFavorites is deprecated. Use favoritesService.getUserFavorites() instead');
  const favorites = await favoritesService.getUserFavorites();
  return favorites.map(f => f.productId);
};

export const addFavorite = async (userId: string, productId: string): Promise<boolean> => {
  console.warn('addFavorite is deprecated. Use favoritesService.addFavorite() instead');
  const result = await favoritesService.addFavorite(productId);
  return result.success;
};

export const removeFavorite = async (userId: string, productId: string): Promise<boolean> => {
  console.warn('removeFavorite is deprecated. Use favoritesService.removeFavorite() instead');
  const result = await favoritesService.removeFavorite(productId);
  return result.success;
};

export const isFavorite = async (userId: string, productId: string): Promise<boolean> => {
  console.warn('isFavorite is deprecated. Use favoritesService.isFavorite() instead');
  return await favoritesService.isFavorite(productId);
};

export const toggleFavorite = async (userId: string, productId: string): Promise<boolean> => {
  console.warn('toggleFavorite is deprecated. Use favoritesService.toggleFavorite() instead');
  const result = await favoritesService.toggleFavorite(productId);
  return result.isFavorite;
};
