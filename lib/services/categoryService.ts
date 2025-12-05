// ========================================
// 카테고리 DB 서비스
// ========================================

import db from '@/lib/db';
import type { ProductCategory, CategoryScore } from '../types/category';

/**
 * 모든 카테고리 조회
 */
export async function getAllCategories(): Promise<ProductCategory[]> {
  const [rows] = await db.query(
    `SELECT
      id, parent_id as parentId, name, code, depth, display_order as displayOrder,
      created_at as createdAt, updated_at as updatedAt
     FROM product_categories
     ORDER BY display_order ASC, id ASC`
  );

  return rows as ProductCategory[];
}

/**
 * 카테고리 코드로 카테고리 조회
 */
export async function getCategoryByCode(code: string): Promise<ProductCategory | null> {
  const [rows] = await db.query(
    `SELECT
      id, parent_id as parentId, name, code, depth, display_order as displayOrder,
      created_at as createdAt, updated_at as updatedAt
     FROM product_categories
     WHERE code = ?`,
    [code]
  );

  const categories = rows as ProductCategory[];
  return categories.length > 0 ? categories[0] : null;
}

/**
 * 카테고리 ID로 카테고리 조회
 */
export async function getCategoryById(id: number): Promise<ProductCategory | null> {
  const [rows] = await db.query(
    `SELECT
      id, parent_id as parentId, name, code, depth, display_order as displayOrder,
      created_at as createdAt, updated_at as updatedAt
     FROM product_categories
     WHERE id = ?`,
    [id]
  );

  const categories = rows as ProductCategory[];
  return categories.length > 0 ? categories[0] : null;
}

/**
 * 상품에 카테고리 매핑 저장
 *
 * @param productId 상품 ID
 * @param categoryScores 카테고리 점수 배열
 */
export async function saveProductCategories(
  productId: number,
  categoryScores: CategoryScore[]
): Promise<void> {
  if (categoryScores.length === 0) return;

  // 기존 매핑 삭제 (재분류 시)
  await db.query(
    'DELETE FROM product_categories_map WHERE product_id = ?',
    [productId]
  );

  // 새 매핑 삽입
  for (let i = 0; i < categoryScores.length; i++) {
    const cat = categoryScores[i];
    const category = await getCategoryByCode(cat.categoryCode);

    if (!category) {
      console.warn(`Category not found: ${cat.categoryCode}`);
      continue;
    }

    await db.query(
      `INSERT INTO product_categories_map
        (product_id, category_id, score, is_suggested, is_primary, created_at)
       VALUES (?, ?, ?, 1, ?, NOW())`,
      [
        productId,
        category.id,
        cat.score,
        cat.isPrimary ? 1 : 0,
      ]
    );
  }
}

/**
 * 상품의 카테고리 매핑 조회
 */
export async function getProductCategories(productId: number): Promise<CategoryScore[]> {
  const [rows] = await db.query(
    `SELECT
      pc.id, pc.name, pc.code,
      pcm.score, pcm.is_primary as isPrimary
     FROM product_categories_map pcm
     JOIN product_categories pc ON pcm.category_id = pc.id
     WHERE pcm.product_id = ?
     ORDER BY pcm.is_primary DESC, pcm.score DESC`,
    [productId]
  );

  interface CategoryRow {
    id: number;
    name: string;
    code: string;
    score: number;
    isPrimary: number;
  }

  return (rows as CategoryRow[]).map(row => ({
    categoryId: row.id,
    categoryCode: row.code,
    categoryName: row.name,
    score: row.score,
    isPrimary: row.isPrimary === 1,
  }));
}
