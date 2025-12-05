import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';
import { createProductSchema, productQuerySchema } from '@/lib/validators/product';

/**
 * GET /api/products
 * 상품 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // 쿼리 파라미터 검증
    const query = productQuerySchema.parse(params);

    // WHERE 조건 생성
    const conditions: string[] = [];
    const values: (string | boolean)[] = [];

    if (query.type) {
      conditions.push('type = ?');
      values.push(query.type);
    }

    if (query.marketplace) {
      conditions.push('marketplace = ?');
      values.push(query.marketplace);
    }

    if (query.category) {
      conditions.push('category = ?');
      values.push(query.category);
    }

    if (query.isVerified !== undefined) {
      conditions.push('is_verified = ?');
      values.push(query.isVerified);
    }

    if (query.dealDate) {
      conditions.push('deal_date = ?');
      values.push(query.dealDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 총 개수 조회
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      values
    );
    const total = (countResult as Record<string, unknown>[])[0].total as number;

    // 상품 목록 조회
    const offset = (query.page - 1) * query.limit;
    const [products] = await db.query(
      `SELECT
        id, title, original_price as originalPrice, sale_price as salePrice,
        discount_rate as discountRate, image_url as imageUrl, marketplace,
        product_url as productUrl, rating, review_count as reviewCount,
        deal_date as dealDate, deal_end_date as dealEndDate, category, tags,
        is_verified as isVerified, author_id as authorId, author_name as authorName,
        type, partners_text as partnersText, created_at as createdAt
       FROM products
       ${whereClause}
       ORDER BY ${query.sortBy === 'created_at' ? 'created_at' : query.sortBy === 'discount_rate' ? 'discount_rate' : 'sale_price'} ${query.order}
       LIMIT ? OFFSET ?`,
      [...values, query.limit, offset]
    );

    // tags를 JSON에서 배열로 파싱
    const parsedProducts = (products as Record<string, unknown>[]).map(product => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
    }));

    return NextResponse.json({
      products: parsedProducts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error: unknown) {
    console.error('Get products error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: '쿼리 파라미터가 올바르지 않습니다', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}

/**
 * POST /api/products
 * 상품 등록
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const body = await request.json();

    // 유효성 검증
    const validatedData = createProductSchema.parse(body);

    // 블랙리스트 확인 (관리자는 제외)
    if (currentUser.role !== 'admin') {
      const [blacklist] = await db.query(
        'SELECT id FROM blacklist WHERE user_id = ?',
        [currentUser.userId]
      );

      if (Array.isArray(blacklist) && blacklist.length > 0) {
        return NextResponse.json(
          { error: '업로드 권한이 제한되었습니다. 관리자에게 문의해주세요.' },
          { status: 403 }
        );
      }
    }

    // 할인율 계산
    const discountRate = Math.round(
      ((validatedData.originalPrice - validatedData.salePrice) / validatedData.originalPrice) * 100
    );

    // 상품 타입 결정
    const productType = currentUser.role === 'admin' ? 'deal' : 'group-buy';

    // 사용자 정보 조회
    const [users] = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [currentUser.userId]
    );
    const userName = Array.isArray(users) && users.length > 0 ? (users[0] as Record<string, unknown>).name : '알 수 없음';

    // 상품 생성
    const productId = uuidv4();
    const tags = productType === 'group-buy' ? ['공구소식'] : ['특가'];

    await db.query(
      `INSERT INTO products (
        id, title, original_price, sale_price, discount_rate, image_url,
        marketplace, product_url, rating, review_count, deal_date, deal_end_date,
        category, tags, is_verified, author_id, author_name, type, partners_text, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        productId,
        validatedData.title,
        validatedData.originalPrice,
        validatedData.salePrice,
        discountRate,
        validatedData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        validatedData.marketplace,
        validatedData.productUrl,
        validatedData.rating || 0,
        validatedData.reviewCount || 0,
        validatedData.dealDate,
        validatedData.dealEndDate,
        validatedData.category || '기타',
        JSON.stringify(tags),
        currentUser.role === 'admin',
        currentUser.userId,
        userName,
        productType,
        validatedData.partnersText || null,
      ]
    );

    // 생성된 상품 조회
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    const product = (products as Record<string, unknown>[])[0];

    return NextResponse.json(
      {
        product: {
          ...product,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags as string) : product.tags,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create product error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}
