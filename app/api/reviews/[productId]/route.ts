import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/reviews/:productId
 * 특정 상품의 리뷰 요약 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const [reviews] = await db.query(
      `SELECT
        product_id as productId, overall_sentiment as overallSentiment,
        pros, cons, key_points as keyPoints, ai_insight as aiInsight,
        total_reviews as totalReviews, average_rating as averageRating
       FROM review_summaries
       WHERE product_id = ?`,
      [productId]
    );

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: '리뷰 요약을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const review = reviews[0] as Record<string, unknown>;

    return NextResponse.json({
      productId: review.productId,
      overallSentiment: review.overallSentiment,
      pros: typeof review.pros === 'string' ? JSON.parse(review.pros) : review.pros,
      cons: typeof review.cons === 'string' ? JSON.parse(review.cons) : review.cons,
      keyPoints: typeof review.keyPoints === 'string' ? JSON.parse(review.keyPoints) : review.keyPoints,
      aiInsight: review.aiInsight,
      totalReviews: review.totalReviews,
      averageRating: typeof review.averageRating === 'string' || typeof review.averageRating === 'number' ? parseFloat(String(review.averageRating)) : 0,
    });
  } catch (error) {
    console.error('Get review summary error:', error);
    return createErrorResponse(error);
  }
}
