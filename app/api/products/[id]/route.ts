import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';
import { updateProductSchema } from '@/lib/validators/product';

/**
 * GET /api/products/:id
 * 상품 상세 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [products] = await db.query(
      `SELECT
        id, title, original_price as originalPrice, sale_price as salePrice,
        discount_rate as discountRate, image_url as imageUrl, marketplace,
        product_url as productUrl, rating, review_count as reviewCount,
        deal_date as dealDate, deal_end_date as dealEndDate, category, tags,
        is_verified as isVerified, author_id as authorId, author_name as authorName,
        type, partners_text as partnersText, created_at as createdAt
       FROM products
       WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const product = products[0] as Record<string, unknown>;

    return NextResponse.json({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return createErrorResponse(error);
  }
}

/**
 * PUT /api/products/:id
 * 상품 수정
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const currentUser = requireAuth(request);
    const body = await request.json();

    // 유효성 검증
    const validatedData = updateProductSchema.parse(body);

    // 기존 상품 조회
    const [products] = await db.query(
      'SELECT author_id FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const product = products[0] as { author_id: string };

    // 권한 확인 (작성자 또는 관리자만)
    if (product.author_id !== currentUser.userId && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 할인율 재계산 (가격이 변경된 경우)
    let discountRate: number | undefined;
    if (validatedData.originalPrice && validatedData.salePrice) {
      discountRate = Math.round(
        ((validatedData.originalPrice - validatedData.salePrice) / validatedData.originalPrice) * 100
      );
    }

    // 업데이트할 필드 생성
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean)[] = [];

    if (validatedData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(validatedData.title);
    }
    if (validatedData.originalPrice !== undefined) {
      updateFields.push('original_price = ?');
      updateValues.push(validatedData.originalPrice);
    }
    if (validatedData.salePrice !== undefined) {
      updateFields.push('sale_price = ?');
      updateValues.push(validatedData.salePrice);
    }
    if (discountRate !== undefined) {
      updateFields.push('discount_rate = ?');
      updateValues.push(discountRate);
    }
    if (validatedData.imageUrl !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(validatedData.imageUrl);
    }
    if (validatedData.marketplace !== undefined) {
      updateFields.push('marketplace = ?');
      updateValues.push(validatedData.marketplace);
    }
    if (validatedData.productUrl !== undefined) {
      updateFields.push('product_url = ?');
      updateValues.push(validatedData.productUrl);
    }
    if (validatedData.rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(validatedData.rating);
    }
    if (validatedData.reviewCount !== undefined) {
      updateFields.push('review_count = ?');
      updateValues.push(validatedData.reviewCount);
    }
    if (validatedData.dealDate !== undefined) {
      updateFields.push('deal_date = ?');
      updateValues.push(validatedData.dealDate);
    }
    if (validatedData.dealEndDate !== undefined) {
      updateFields.push('deal_end_date = ?');
      updateValues.push(validatedData.dealEndDate);
    }
    if (validatedData.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(validatedData.category);
    }
    if (validatedData.partnersText !== undefined) {
      updateFields.push('partners_text = ?');
      updateValues.push(validatedData.partnersText);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '업데이트할 항목이 없습니다' },
        { status: 400 }
      );
    }

    // 상품 업데이트
    await db.query(
      `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...updateValues, id]
    );

    // 업데이트된 상품 조회
    const [updatedProducts] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    const updatedProduct = (updatedProducts as Record<string, unknown>[])[0];

    return NextResponse.json({
      product: {
        ...updatedProduct,
        tags: typeof updatedProduct.tags === 'string' ? JSON.parse(updatedProduct.tags) : updatedProduct.tags,
      },
    });
  } catch (error: unknown) {
    console.error('Update product error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/products/:id
 * 상품 삭제
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const currentUser = requireAuth(request);

    // 기존 상품 조회
    const [products] = await db.query(
      'SELECT author_id FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const product = products[0] as { author_id: string };

    // 권한 확인 (작성자 또는 관리자만)
    if (product.author_id !== currentUser.userId && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 상품 삭제
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({
      message: '상품이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return createErrorResponse(error);
  }
}
