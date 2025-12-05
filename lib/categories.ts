// 카테고리 관리 및 사용자 관심사 시스템

export const CATEGORIES = [
  '전자기기',
  '패션/의류',
  '뷰티/화장품',
  '식품/건강',
  '홈/리빙',
  '스포츠/레저',
  '도서/문구',
  '완구/취미',
  '반려동물',
  '여행/티켓',
  '디지털콘텐츠',
  '생활/주방',
  '가구/인테리어',
  '출산/육아',
  '자동차용품',
  '기타'
] as const;

export type Category = typeof CATEGORIES[number];

const USER_INTERESTS_KEY = 'user_interests';

export interface UserInterests {
  userId: string;
  categories: Category[];
  updatedAt: string;
}

// 모든 사용자 관심사 가져오기
function getAllUserInterests(): UserInterests[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(USER_INTERESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load user interests:', error);
    return [];
  }
}

// 사용자 관심사 저장
function saveUserInterests(interests: UserInterests[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_INTERESTS_KEY, JSON.stringify(interests));
    window.dispatchEvent(new Event('interests-change'));
  } catch (error) {
    console.error('Failed to save user interests:', error);
  }
}

// 특정 사용자의 관심사 가져오기
export function getUserInterests(userId: string): Category[] {
  const allInterests = getAllUserInterests();
  const userInterest = allInterests.find(i => i.userId === userId);
  return userInterest ? userInterest.categories : [];
}

// 사용자 관심사 업데이트
export function updateUserInterests(userId: string, categories: Category[]): boolean {
  try {
    const allInterests = getAllUserInterests();
    const existingIndex = allInterests.findIndex(i => i.userId === userId);

    const newInterest: UserInterests = {
      userId,
      categories,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      allInterests[existingIndex] = newInterest;
    } else {
      allInterests.push(newInterest);
    }

    saveUserInterests(allInterests);
    return true;
  } catch (error) {
    console.error('Failed to update user interests:', error);
    return false;
  }
}

// 카테고리 매칭 점수 계산
export function calculateCategoryMatchScore(
  productCategories: string[],
  userInterests: Category[]
): number {
  if (userInterests.length === 0 || productCategories.length === 0) {
    return 0;
  }

  // 일치하는 카테고리 개수 계산
  const matchCount = productCategories.filter(cat =>
    userInterests.includes(cat as Category)
  ).length;

  // 매칭 점수: 일치하는 카테고리 개수 × 10점
  return matchCount * 10;
}

// 상품 카테고리 유효성 검사
export function isValidCategory(category: string): category is Category {
  return CATEGORIES.includes(category as Category);
}

// 여러 카테고리 유효성 검사
export function validateCategories(categories: string[]): Category[] {
  return categories.filter(isValidCategory);
}
