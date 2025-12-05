// 블랙리스트 관리 시스템
const BLACKLIST_STORAGE_KEY = 'ai-deal-blacklist';

export interface BlacklistEntry {
  userId: string;
  userEmail: string;
  userName: string;
  blacklistedAt: string;
  reason?: string;
}

// 블랙리스트 가져오기
export const getBlacklist = (): BlacklistEntry[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(BLACKLIST_STORAGE_KEY);
  if (!stored) return [];

  return JSON.parse(stored);
};

// 사용자가 블랙리스트에 있는지 확인
export const isUserBlacklisted = (userId: string): boolean => {
  const blacklist = getBlacklist();
  return blacklist.some(entry => entry.userId === userId);
};

// 블랙리스트에 사용자 추가
export const addToBlacklist = (
  userId: string,
  userEmail: string,
  userName: string,
  reason?: string
): boolean => {
  if (typeof window === 'undefined') return false;

  const blacklist = getBlacklist();

  // 이미 블랙리스트에 있는지 확인
  if (blacklist.some(entry => entry.userId === userId)) {
    return false;
  }

  const newEntry: BlacklistEntry = {
    userId,
    userEmail,
    userName,
    blacklistedAt: new Date().toISOString(),
    reason,
  };

  const updated = [...blacklist, newEntry];
  localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updated));

  return true;
};

// 블랙리스트에서 사용자 제거
export const removeFromBlacklist = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const blacklist = getBlacklist();
  const updated = blacklist.filter(entry => entry.userId !== userId);

  if (updated.length === blacklist.length) {
    return false; // 제거할 항목이 없음
  }

  localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updated));
  return true;
};
