// 이메일 인증 코드 관리 시스템
const VERIFICATION_CODES_KEY = 'ai-deal-verification-codes';
const CODE_EXPIRY_MS = 30 * 60 * 1000; // 30분

export interface VerificationCode {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
}

// 4자리 난수 생성
const generateCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// 모든 인증 코드 가져오기
const getAllCodes = (): VerificationCode[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(VERIFICATION_CODES_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
};

// 인증 코드 저장
const saveCodes = (codes: VerificationCode[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
};

// 만료된 코드 제거
const cleanupExpiredCodes = (): void => {
  const codes = getAllCodes();
  const now = Date.now();
  const validCodes = codes.filter(c => c.expiresAt > now);
  saveCodes(validCodes);
};

// 이메일 인증 코드 발송 (개발 환경에서는 콘솔에 출력)
export const sendVerificationCode = (email: string): { success: boolean; code?: string; error?: string } => {
  if (!email || !email.includes('@')) {
    return { success: false, error: '유효한 이메일 주소를 입력해주세요.' };
  }

  // 만료된 코드 정리
  cleanupExpiredCodes();

  const code = generateCode();
  const now = Date.now();

  const newCode: VerificationCode = {
    email,
    code,
    createdAt: now,
    expiresAt: now + CODE_EXPIRY_MS,
  };

  // 기존 코드들 가져오기
  let codes = getAllCodes();

  // 해당 이메일의 이전 코드 제거 (새 코드가 발송되면 이전 코드는 무효화)
  codes = codes.filter(c => c.email !== email);

  // 새 코드 추가
  codes.push(newCode);
  saveCodes(codes);

  // 개발 환경: 콘솔에 코드 출력
  console.log(`\n📧 [이메일 인증 코드]`);
  console.log(`받는 사람: ${email}`);
  console.log(`인증 코드: ${code}`);
  console.log(`유효 시간: 30분`);
  console.log(`만료 시각: ${new Date(newCode.expiresAt).toLocaleString('ko-KR')}\n`);

  // 실제 프로덕션에서는 여기서 이메일 발송 API 호출
  // await sendEmailAPI(email, code);

  return { success: true, code }; // 개발용으로 코드를 반환
};

// 인증 코드 확인
export const verifyCode = (email: string, inputCode: string): { success: boolean; error?: string } => {
  if (!email || !inputCode) {
    return { success: false, error: '이메일과 인증 코드를 입력해주세요.' };
  }

  // 만료된 코드 정리
  cleanupExpiredCodes();

  const codes = getAllCodes();
  const codeEntry = codes.find(c => c.email === email);

  if (!codeEntry) {
    return { success: false, error: '발송된 인증 코드가 없습니다. 인증 코드를 재발송해주세요.' };
  }

  const now = Date.now();
  if (codeEntry.expiresAt <= now) {
    // 만료된 코드 제거
    const updatedCodes = codes.filter(c => c.email !== email);
    saveCodes(updatedCodes);
    return { success: false, error: '인증 코드가 만료되었습니다. 새로운 코드를 발송해주세요.' };
  }

  if (codeEntry.code !== inputCode) {
    return { success: false, error: '인증 코드가 일치하지 않습니다.' };
  }

  // 인증 성공 - 해당 코드 제거
  const updatedCodes = codes.filter(c => c.email !== email);
  saveCodes(updatedCodes);

  return { success: true };
};

// 남은 시간 확인 (분 단위)
export const getRemainingTime = (email: string): number => {
  const codes = getAllCodes();
  const codeEntry = codes.find(c => c.email === email);

  if (!codeEntry) return 0;

  const now = Date.now();
  const remaining = codeEntry.expiresAt - now;

  if (remaining <= 0) return 0;

  return Math.ceil(remaining / 60000); // 분 단위로 반환
};
