import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/favorites
 * 즐겨찾기 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const [favorites] = await db.query(
      `SELECT
        f.id, f.product_id as productId, f.created_at as createdAt,
        p.title, p.original_price as originalPrice, p.sale_price as salePrice,
        p.discount_rate as discountRate, p.image_url as imageUrl, p.marketplace,
        p.product_url as productUrl, p.rating, p.review_count as reviewCount,
        p.deal_date as dealDate, p.deal_end_date as dealEndDate, p.category, p.tags,
        p.is_verified as isVerified, p.author_id as authorId, p.author_name as authorName,
        p.type, p.partners_text as partnersText
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [currentUser.userId]
    );

    const parsedFavorites = (favorites as Record<string, unknown>[]).map(fav => ({
      id: fav.id,
      productId: fav.productId,
      createdAt: fav.createdAt,
      product: {
        id: fav.productId,
        title: fav.title,
        originalPrice: fav.originalPrice,
        salePrice: fav.salePrice,
        discountRate: fav.discountRate,
        imageUrl: fav.imageUrl,
        marketplace: fav.marketplace,
        productUrl: fav.productUrl,
        rating: fav.rating,
        reviewCount: fav.reviewCount,
        dealDate: fav.dealDate,
        dealEndDate: fav.dealEndDate,
        category: fav.category,
        tags: typeof fav.tags === 'string' ? JSON.parse(fav.tags) : fav.tags,
        isVerified: fav.isVerified,
        authorId: fav.authorId,
        authorName: fav.authorName,
        type: fav.type,
        partnersText: fav.partnersText,
      },
    }));

    return NextResponse.json({ favorites: parsedFavorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return createErrorResponse(error);
  }
}

/**
 * POST /api/favorites
 * 즐겨찾기 추가
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const [products] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이미 즐겨찾기에 있는지 확인
    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [currentUser.userId, productId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: '이미 즐겨찾기에 추가되었습니다' },
        { status: 400 }
      );
    }

    // 즐겨찾기 추가
    const [result] = await db.query(
      'INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, NOW())',
      [currentUser.userId, productId]
    );

    const insertId = (result as { insertId: number }).insertId;

    return NextResponse.json(
      {
        id: insertId,
        productId,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add favorite error:', error);
    return createErrorResponse(error);
  }
}
