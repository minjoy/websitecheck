-- ========================================
-- [1] 사용자 프로필 확장 (인구통계 + 직업 정보 + 팝업 플래그)
-- ========================================

ALTER TABLE users
  -- 인구통계 정보
  ADD COLUMN gender ENUM('MALE','FEMALE','OTHER','NO_ANSWER') NULL COMMENT '성별',
  ADD COLUMN age_group ENUM('AGE_20S','AGE_30S','AGE_40S','AGE_50S_PLUS') NULL COMMENT '연령대',
  ADD COLUMN life_stage ENUM(
    'SINGLE',              -- 1인 가구 / 미혼
    'COUPLE_NO_CHILD',     -- 커플/신혼, 아이 없음
    'PARENTS_BABY_0_3',    -- 0~3세 자녀
    'PARENTS_CHILD_4_7',   -- 4~7세 자녀
    'PARENTS_CHILD_8_13',  -- 8~13세 자녀
    'MULTI_GENERATION',    -- 부모/가족과 동거
    'OTHER'
  ) NULL COMMENT '생활 단계',
  ADD COLUMN residence_type ENUM('ONE_ROOM','APARTMENT','HOUSE','OFFICETEL','DORM','OTHER') NULL COMMENT '거주 형태',
  ADD COLUMN region_type ENUM('SEOUL_METRO','METRO_CITY','LOCAL_CITY','RURAL') NULL COMMENT '지역 유형',
  ADD COLUMN income_level ENUM('UNDER_2M','IN_2_4M','IN_4_6M','IN_6_8M','OVER_8M','NO_ANSWER') NULL COMMENT '소득 수준',

  -- 직업 정보
  ADD COLUMN job_industry ENUM(
    'OFFICE_BUSINESS',   -- 사무/경영
    'IT_DEV',           -- IT/개발
    'DESIGN_CREATIVE',  -- 디자인/창작
    'EDU_TEACHER',      -- 교육/강사
    'MEDICAL_HEALTH',   -- 의료/건강
    'SALES_SERVICE',    -- 영업/서비스
    'SELF_EMPLOYED',    -- 자영업
    'STUDENT',          -- 학생
    'HOME_MAKER',       -- 주부/주부
    'OTHER'
  ) NULL COMMENT '업종',
  ADD COLUMN job_role ENUM('STAFF','MANAGER','EXECUTIVE','FREELANCER','OWNER','OTHER') NULL COMMENT '직급',
  ADD COLUMN work_style ENUM('FULL_REMOTE','HYBRID','ON_SITE','SHIFT','IRREGULAR','OTHER') NULL COMMENT '근무 형태',
  ADD COLUMN daily_pattern ENUM('MORNING_PERSON','NIGHT_PERSON','NO_PATTERN') NULL COMMENT '생활 패턴',

  -- 프로필 완성 및 팝업 제어
  ADD COLUMN profile_completed_at DATETIME NULL COMMENT '프로필 완성 시각',
  ADD COLUMN suppress_profile_popup TINYINT(1) NOT NULL DEFAULT 0 COMMENT '프로필 팝업 숨김 여부 (0: 노출, 1: 숨김)',

  ADD INDEX idx_life_stage (life_stage),
  ADD INDEX idx_job_industry (job_industry),
  ADD INDEX idx_profile_completed (profile_completed_at);
