import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin, createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/admin/members/[userId]/products
 * 특정 회원의 상품 목록 조회 (관리자 전용)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    requireAdmin(request);

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 해당 사용자의 상품 목록 조회
    const [products] = await db.query(
      `SELECT
        id,
        title,
        price,
        original_price as originalPrice,
        image_url as imageUrl,
        product_url as productUrl,
        category,
        type,
        is_verified as isVerified,
        created_at as createdAt
       FROM products
       WHERE author_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get member products error:', error);
    return createErrorResponse(error);
  }
}
