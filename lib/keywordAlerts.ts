// 키워드 알림 관리 시스템 (API 기반)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface KeywordAlert {
  userId: string;
  keywords: string[];
  email: string;
  createdAt: string;
}

/**
 * 키워드 알림 서비스
 */
export const keywordsService = {
  /**
   * 사용자의 키워드 목록 가져오기
   */
  async getUserKeywords(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/keywords`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch keywords:', response.status);
        return [];
      }

      const data = await response.json();
      return data.keywords || [];
    } catch (error) {
      console.error('Get keywords error:', error);
      return [];
    }
  },

  /**
   * 키워드 추가
   */
  async addKeyword(keyword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!keyword.trim()) {
        return { success: false, error: '키워드를 입력해주세요' };
      }

      const response = await fetch(`${API_BASE_URL}/keywords`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '키워드 추가에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Add keyword error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },

  /**
   * 키워드 제거
   */
  async removeKeyword(keyword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/keywords/${encodeURIComponent(keyword)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '키워드 제거에 실패했습니다' };
      }

      return { success: true };
    } catch (error) {
      console.error('Remove keyword error:', error);
      return { success: false, error: '서버 에러가 발생했습니다' };
    }
  },
};

// Deprecated: 하위 호환성을 위한 레거시 함수들 (사용하지 마세요)
export const getUserKeywords = async (userId: string): Promise<string[]> => {
  console.warn('getUserKeywords is deprecated. Use keywordsService.getUserKeywords() instead');
  return await keywordsService.getUserKeywords();
};

export const addKeyword = async (userId: string, email: string, keyword: string): Promise<boolean> => {
  console.warn('addKeyword is deprecated. Use keywordsService.addKeyword() instead');
  const result = await keywordsService.addKeyword(keyword);
  return result.success;
};

export const removeKeyword = async (userId: string, keyword: string): Promise<boolean> => {
  console.warn('removeKeyword is deprecated. Use keywordsService.removeKeyword() instead');
  const result = await keywordsService.removeKeyword(keyword);
  return result.success;
};

// Deprecated: 서버 측에서 처리됩니다
// 상품 정보와 매칭되는 키워드 알림 찾기
export const findMatchingAlerts = (
  productTitle: string,
  productCategory: string,
  productTags: string[],
  authorId: string
): Array<{ email: string; keyword: string }> => {
  console.warn('findMatchingAlerts is deprecated. Keyword matching is handled on the server');
  return [];
};

// Deprecated: 서버 측에서 처리됩니다
// 이메일 알림 보내기 (개발 환경에서는 콘솔 출력)
export const sendKeywordAlertEmail = (
  email: string,
  keyword: string,
  productType: 'deal' | 'group-buy'
): void => {
  console.warn('sendKeywordAlertEmail is deprecated. Email notifications are handled on the server');
};
