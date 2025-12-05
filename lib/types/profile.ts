// ========================================
// 사용자 프로필 타입 정의
// ========================================

// 인구통계 ENUM 타입
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'NO_ANSWER';
export type AgeGroup = 'AGE_20S' | 'AGE_30S' | 'AGE_40S' | 'AGE_50S_PLUS';
export type LifeStage =
  | 'SINGLE'              // 1인 가구 / 미혼
  | 'COUPLE_NO_CHILD'     // 커플/신혼, 아이 없음
  | 'PARENTS_BABY_0_3'    // 0~3세 자녀
  | 'PARENTS_CHILD_4_7'   // 4~7세 자녀
  | 'PARENTS_CHILD_8_13'  // 8~13세 자녀
  | 'MULTI_GENERATION'    // 부모/가족과 동거
  | 'OTHER';
export type ResidenceType = 'ONE_ROOM' | 'APARTMENT' | 'HOUSE' | 'OFFICETEL' | 'DORM' | 'OTHER';
export type RegionType = 'SEOUL_METRO' | 'METRO_CITY' | 'LOCAL_CITY' | 'RURAL';
export type IncomeLevel = 'UNDER_2M' | 'IN_2_4M' | 'IN_4_6M' | 'IN_6_8M' | 'OVER_8M' | 'NO_ANSWER';

// 직업 ENUM 타입
export type JobIndustry =
  | 'OFFICE_BUSINESS'   // 사무/경영
  | 'IT_DEV'           // IT/개발
  | 'DESIGN_CREATIVE'  // 디자인/창작
  | 'EDU_TEACHER'      // 교육/강사
  | 'MEDICAL_HEALTH'   // 의료/건강
  | 'SALES_SERVICE'    // 영업/서비스
  | 'SELF_EMPLOYED'    // 자영업
  | 'STUDENT'          // 학생
  | 'HOME_MAKER'       // 주부
  | 'OTHER';
export type JobRole = 'STAFF' | 'MANAGER' | 'EXECUTIVE' | 'FREELANCER' | 'OWNER' | 'OTHER';
export type WorkStyle = 'FULL_REMOTE' | 'HYBRID' | 'ON_SITE' | 'SHIFT' | 'IRREGULAR' | 'OTHER';
export type DailyPattern = 'MORNING_PERSON' | 'NIGHT_PERSON' | 'NO_PATTERN';

// 사용자 프로필 인터페이스
export interface UserProfile {
  // 인구통계
  gender?: Gender | null;
  ageGroup?: AgeGroup | null;
  lifeStage?: LifeStage | null;
  residenceType?: ResidenceType | null;
  regionType?: RegionType | null;
  incomeLevel?: IncomeLevel | null;

  // 직업
  jobIndustry?: JobIndustry | null;
  jobRole?: JobRole | null;
  workStyle?: WorkStyle | null;
  dailyPattern?: DailyPattern | null;

  // 메타
  profileCompletedAt?: string | null;
  suppressProfilePopup?: boolean;
}

// 팝업 결정 타입
export type PopupDecision = 'LATER' | 'NEVER_SHOW_AGAIN';

// 한글 레이블 매핑
export const GENDER_LABELS: Record<Gender, string> = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
  NO_ANSWER: '답변 안 함',
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  AGE_20S: '20대',
  AGE_30S: '30대',
  AGE_40S: '40대',
  AGE_50S_PLUS: '50대 이상',
};

export const LIFE_STAGE_LABELS: Record<LifeStage, string> = {
  SINGLE: '1인 가구 / 미혼',
  COUPLE_NO_CHILD: '커플/신혼 (자녀 없음)',
  PARENTS_BABY_0_3: '0~3세 자녀',
  PARENTS_CHILD_4_7: '4~7세 자녀',
  PARENTS_CHILD_8_13: '8~13세 자녀',
  MULTI_GENERATION: '부모/가족과 동거',
  OTHER: '기타',
};

export const RESIDENCE_TYPE_LABELS: Record<ResidenceType, string> = {
  ONE_ROOM: '원룸/오피스텔',
  APARTMENT: '아파트',
  HOUSE: '단독주택/빌라',
  OFFICETEL: '오피스텔',
  DORM: '기숙사',
  OTHER: '기타',
};

export const REGION_TYPE_LABELS: Record<RegionType, string> = {
  SEOUL_METRO: '수도권',
  METRO_CITY: '광역시',
  LOCAL_CITY: '지방 도시',
  RURAL: '농어촌',
};

export const INCOME_LEVEL_LABELS: Record<IncomeLevel, string> = {
  UNDER_2M: '200만원 미만',
  IN_2_4M: '200~400만원',
  IN_4_6M: '400~600만원',
  IN_6_8M: '600~800만원',
  OVER_8M: '800만원 이상',
  NO_ANSWER: '답변 안 함',
};

export const JOB_INDUSTRY_LABELS: Record<JobIndustry, string> = {
  OFFICE_BUSINESS: '사무/경영',
  IT_DEV: 'IT/개발',
  DESIGN_CREATIVE: '디자인/창작',
  EDU_TEACHER: '교육/강사',
  MEDICAL_HEALTH: '의료/건강',
  SALES_SERVICE: '영업/서비스',
  SELF_EMPLOYED: '자영업',
  STUDENT: '학생',
  HOME_MAKER: '주부',
  OTHER: '기타',
};

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  STAFF: '사원/주임',
  MANAGER: '대리/과장',
  EXECUTIVE: '부장 이상',
  FREELANCER: '프리랜서',
  OWNER: '사업자',
  OTHER: '기타',
};

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  FULL_REMOTE: '완전 재택',
  HYBRID: '하이브리드',
  ON_SITE: '전체 출근',
  SHIFT: '교대근무',
  IRREGULAR: '불규칙',
  OTHER: '기타',
};

export const DAILY_PATTERN_LABELS: Record<DailyPattern, string> = {
  MORNING_PERSON: '아침형 인간',
  NIGHT_PERSON: '저녁형 인간',
  NO_PATTERN: '불규칙',
};
