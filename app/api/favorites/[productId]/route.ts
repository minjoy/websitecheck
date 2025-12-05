import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';

/**
 * DELETE /api/favorites/:productId
 * 즐겨찾기 제거
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const currentUser = requireAuth(request);

    // 즐겨찾기 삭제
    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [currentUser.userId, productId]
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: '즐겨찾기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '즐겨찾기가 제거되었습니다',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return createErrorResponse(error);
  }
}
