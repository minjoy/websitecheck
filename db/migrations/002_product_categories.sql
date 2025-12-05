-- ========================================
-- [2] 상품 카테고리 & 자동 분류 시스템
-- ========================================

-- 2-1. 상품 카테고리 테이블
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT NULL COMMENT '상위 카테고리 ID',
  name VARCHAR(100) NOT NULL COMMENT '카테고리 이름 (한글)',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '카테고리 코드 (영문)',
  depth TINYINT NOT NULL DEFAULT 1 COMMENT '깊이 (1: 대분류, 2: 중분류)',
  display_order INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='상품 카테고리';

-- 2-2. 카테고리 키워드 라이브러리 테이블
CREATE TABLE IF NOT EXISTS category_keywords (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL COMMENT '카테고리 ID',
  keyword VARCHAR(100) NOT NULL COMMENT '키워드',
  weight FLOAT NOT NULL DEFAULT 1.0 COMMENT '가중치 (핵심: 2.0, 서브: 1.0)',
  keyword_type ENUM('CORE','SECONDARY') NOT NULL DEFAULT 'CORE' COMMENT '키워드 유형',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_category_keyword (category_id, keyword),
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  INDEX idx_keyword (keyword),
  INDEX idx_category_type (category_id, keyword_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='카테고리 키워드';

-- 2-3. 상품-카테고리 매핑 테이블 (products 테이블은 이미 존재한다고 가정)
CREATE TABLE IF NOT EXISTS product_categories_map (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL COMMENT '상품 ID',
  category_id BIGINT NOT NULL COMMENT '카테고리 ID',
  score FLOAT NOT NULL COMMENT '카테고리 매칭 점수 (0~1)',
  is_suggested TINYINT(1) NOT NULL DEFAULT 1 COMMENT '자동 추천 여부',
  is_primary TINYINT(1) NOT NULL DEFAULT 0 COMMENT '대표 카테고리 여부',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_product_category (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_category (category_id),
  INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='상품-카테고리 매핑';

-- ========================================
-- 초기 카테고리 데이터 삽입
-- ========================================

INSERT INTO product_categories (name, code, depth, display_order) VALUES
  ('생활가전', 'SMALL_APPLIANCE', 1, 1),
  ('리빙용품', 'LIVING_ITEM', 1, 2),
  ('주방용품', 'KITCHEN_ITEM', 1, 3),
  ('청소/정리', 'CLEANING_ORGANIZING', 1, 4),
  ('홈데코', 'HOME_DECO', 1, 5),
  ('사무/업무', 'OFFICE_WORK', 1, 6),
  ('육아/출산', 'BABY_MOM', 1, 7),
  ('건강/웰니스', 'HEALTH_WELLNESS', 1, 8),
  ('취미/여가', 'HOBBY_ENTERTAINMENT', 1, 9),
  ('반려동물', 'PET_SUPPLIES', 1, 10),
  ('뷰티/케어', 'BEAUTY_CARE', 1, 11),
  ('식품', 'FOOD_BEVERAGE', 1, 12),
  ('패션/의류', 'FASHION_CLOTHING', 1, 13),
  ('전자기기', 'ELECTRONICS', 1, 14),
  ('가구/인테리어', 'FURNITURE_INTERIOR', 1, 15);
