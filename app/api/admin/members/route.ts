import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin, createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/admin/members
 * 전체 회원 목록 및 상품 개수 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    // 모든 사용자와 상품 개수 조회
    const [members] = await db.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at as createdAt,
        COUNT(p.id) as productCount
       FROM users u
       LEFT JOIN products p ON u.id = p.author_id
       GROUP BY u.id, u.email, u.name, u.role, u.created_at
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return createErrorResponse(error);
  }
}
