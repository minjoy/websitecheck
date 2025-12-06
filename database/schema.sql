-- ==========================================
-- 마켓플레이스 딜 사이트 MySQL 스키마
-- MySQL 8.0+
-- ==========================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS marketplace_deals
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE marketplace_deals;

-- ==========================================
-- 1. users: 회원 정보 + 프로필
-- ==========================================
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- 기본 인증 정보
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,

  -- 프로필: 인구통계
  gender ENUM('MALE', 'FEMALE', 'OTHER', 'NO_ANSWER') NULL,
  age_group ENUM('AGE_20S', 'AGE_30S', 'AGE_40S', 'AGE_50S_PLUS') NULL,
  life_stage ENUM(
    'SINGLE',                 -- 1인 가구 / 미혼
    'COUPLE_NO_CHILD',        -- 커플/신혼, 아이 없음
    'PARENTS_BABY_0_3',       -- 영유아 자녀 (0-3세)
    'PARENTS_CHILD_4_7',      -- 유아 자녀 (4-7세)
    'PARENTS_CHILD_8_13',     -- 초등학생 자녀 (8-13세)
    'MULTI_GENERATION',       -- 3세대 이상
    'OTHER'
  ) NULL,
  residence_type ENUM('ONE_ROOM', 'APARTMENT', 'HOUSE', 'OFFICETEL', 'DORM', 'OTHER') NULL,
  region_type ENUM('SEOUL_METRO', 'METRO_CITY', 'LOCAL_CITY', 'RURAL') NULL,
  income_level ENUM('UNDER_2M', 'IN_2_4M', 'IN_4_6M', 'IN_6_8M', 'OVER_8M', 'NO_ANSWER') NULL,

  -- 프로필: 직업
  job_industry ENUM(
    'OFFICE_BUSINESS',
    'IT_DEV',
    'DESIGN_CREATIVE',
    'EDU_TEACHER',
    'MEDICAL_HEALTH',
    'SALES_SERVICE',
    'SELF_EMPLOYED',
    'STUDENT',
    'HOME_MAKER',
    'OTHER'
  ) NULL,
  job_role ENUM('STAFF', 'MANAGER', 'EXECUTIVE', 'FREELANCER', 'OWNER', 'OTHER') NULL,
  work_style ENUM('FULL_REMOTE', 'HYBRID', 'ON_SITE', 'SHIFT', 'IRREGULAR', 'OTHER') NULL,
  daily_pattern ENUM('MORNING_PERSON', 'NIGHT_PERSON', 'NO_PATTERN') NULL,

  -- 프로필 팝업 제어
  profile_completed_at DATETIME NULL,
  suppress_profile_popup TINYINT(1) NOT NULL DEFAULT 0,

  -- 타임스탬프
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_email_verified (email_verified),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. email_verification_tokens: 이메일 인증 토큰
-- ==========================================
CREATE TABLE email_verification_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. password_reset_tokens: 비밀번호 재설정 토큰
-- ==========================================
CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. product_categories: 카테고리 계층 구조
-- ==========================================
CREATE TABLE product_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  depth INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_code (code),
  INDEX idx_depth (depth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. category_keywords: 카테고리별 키워드 라이브러리
-- ==========================================
CREATE TABLE category_keywords (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  weight FLOAT NOT NULL DEFAULT 1.0,
  keyword_type ENUM('CORE', 'SECONDARY') NOT NULL DEFAULT 'SECONDARY',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  INDEX idx_category_id (category_id),
  INDEX idx_keyword (keyword),
  INDEX idx_keyword_type (keyword_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. products: 상품 (공동구매 + 검증 상품)
-- ==========================================
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- 등록자 정보
  user_id BIGINT UNSIGNED NULL,  -- NULL이면 관리자/시스템 등록
  is_group_buy TINYINT(1) NOT NULL DEFAULT 0,
  is_admin_verified TINYINT(1) NOT NULL DEFAULT 0,

  -- 기본 상품 정보
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  thumbnail_url VARCHAR(500) NULL,
  external_url VARCHAR(500) NULL,  -- 외부 링크 (구매 페이지)

  -- 가격 정보
  normal_price INT NOT NULL DEFAULT 0,
  sale_price INT NOT NULL DEFAULT 0,
  discount_rate FLOAT NOT NULL DEFAULT 0,  -- % (자동 계산)

  -- 검증된 상품 전용 필드
  source_site VARCHAR(255) NULL,
  review_count INT NULL,
  pros TEXT NULL,
  cons TEXT NULL,
  summary TEXT NULL,

  -- 파트너스 문구 (선택)
  partner_label VARCHAR(255) NULL,

  -- 통계
  view_count INT NOT NULL DEFAULT 0,
  click_count INT NOT NULL DEFAULT 0,
  favorite_count INT NOT NULL DEFAULT 0,

  -- 상태
  status ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',

  -- 타임스탬프
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_is_group_buy (is_group_buy),
  INDEX idx_is_admin_verified (is_admin_verified),
  INDEX idx_created_at (created_at),
  INDEX idx_discount_rate (discount_rate),
  FULLTEXT idx_fulltext_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. product_categories_map: 상품-카테고리 매핑
-- ==========================================
CREATE TABLE product_categories_map (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  score FLOAT NOT NULL DEFAULT 0,  -- 0~1 스코어
  is_primary TINYINT(1) NOT NULL DEFAULT 0,  -- 대표 카테고리 여부
  is_suggested TINYINT(1) NOT NULL DEFAULT 1,  -- 자동 추천 여부
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_category (product_id, category_id),
  INDEX idx_product_id (product_id),
  INDEX idx_category_id (category_id),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. favorites: 즐겨찾기
-- ==========================================
CREATE TABLE favorites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. keyword_alerts: 키워드 알림 설정
-- ==========================================
CREATE TABLE keyword_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. keyword_alert_logs: 키워드 알림 발송 로그
-- ==========================================
CREATE TABLE keyword_alert_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keyword_alert_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  notification_channel ENUM('EMAIL') NOT NULL DEFAULT 'EMAIL',
  notified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (keyword_alert_id) REFERENCES keyword_alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_keyword_alert_id (keyword_alert_id),
  INDEX idx_product_id (product_id),
  INDEX idx_notified_at (notified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. user_actions: 회원 액션 로그 (실시간 배너용)
-- ==========================================
CREATE TABLE user_actions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  action_type ENUM(
    'SIGNUP',
    'LOGIN',
    'PRODUCT_CREATED',
    'PRODUCT_VIEWED',
    'PRODUCT_CLICKED',
    'FAVORITED',
    'UNFAVORITED'
  ) NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 12. user_category_weights: 추천 시스템용 가중치 (선택)
-- ==========================================
CREATE TABLE user_category_weights (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  weight FLOAT NOT NULL DEFAULT 0,
  last_calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_id),
  INDEX idx_user_id (user_id),
  INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 초기 카테고리 데이터 삽입
-- ==========================================
INSERT INTO product_categories (id, parent_id, name, code, depth, display_order) VALUES
(1, NULL, '소형 가전', 'SMALL_APPLIANCE', 0, 1),
(2, NULL, '생활용품', 'LIVING_ITEM', 0, 2),
(3, NULL, '육아/유아동', 'BABY_MOM', 0, 3),
(4, NULL, '식품', 'FOOD', 0, 4),
(5, NULL, '패션/뷰티', 'FASHION_BEAUTY', 0, 5),
(6, NULL, '디지털/가전', 'DIGITAL_ELECTRONICS', 0, 6),
(7, NULL, '가구/인테리어', 'FURNITURE_INTERIOR', 0, 7),
(8, NULL, '스포츠/레저', 'SPORTS_LEISURE', 0, 8),
(9, NULL, '도서/문구', 'BOOK_STATIONERY', 0, 9),
(10, NULL, '기타', 'OTHER', 0, 99);

-- ==========================================
-- 초기 카테고리 키워드 데이터 삽입
-- ==========================================
INSERT INTO category_keywords (category_id, keyword, weight, keyword_type) VALUES
-- 소형 가전
(1, '에어프라이어', 2.0, 'CORE'),
(1, '커피머신', 2.0, 'CORE'),
(1, '에스프레소', 2.0, 'CORE'),
(1, '믹서기', 2.0, 'CORE'),
(1, '전기포트', 1.0, 'SECONDARY'),
(1, '토스터', 1.0, 'SECONDARY'),

-- 육아/유아동
(3, '기저귀', 2.0, 'CORE'),
(3, '유모차', 2.0, 'CORE'),
(3, '젖병', 2.0, 'CORE'),
(3, '분유', 2.0, 'CORE'),
(3, '이유식', 1.0, 'SECONDARY'),
(3, '아기옷', 1.0, 'SECONDARY'),

-- 식품
(4, '쌀', 2.0, 'CORE'),
(4, '과일', 2.0, 'CORE'),
(4, '채소', 2.0, 'CORE'),
(4, '육류', 2.0, 'CORE'),
(4, '간식', 1.0, 'SECONDARY'),
(4, '음료', 1.0, 'SECONDARY');

-- ==========================================
-- 트리거: discount_rate 자동 계산
-- ==========================================
DELIMITER $$

CREATE TRIGGER calculate_discount_rate_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
  IF NEW.normal_price > 0 THEN
    SET NEW.discount_rate = ROUND(((NEW.normal_price - NEW.sale_price) / NEW.normal_price) * 100, 2);
  ELSE
    SET NEW.discount_rate = 0;
  END IF;
END$$

CREATE TRIGGER calculate_discount_rate_before_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  IF NEW.normal_price > 0 THEN
    SET NEW.discount_rate = ROUND(((NEW.normal_price - NEW.sale_price) / NEW.normal_price) * 100, 2);
  ELSE
    SET NEW.discount_rate = 0;
  END IF;
END$$

DELIMITER ;

-- ==========================================
-- 스키마 생성 완료
-- ==========================================
