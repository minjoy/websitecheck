import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(1, '제품명을 입력해주세요').max(500, '제품명은 최대 500자까지 가능합니다'),
  originalPrice: z.number().positive('정가는 0보다 커야 합니다'),
  salePrice: z.number().positive('할인가는 0보다 커야 합니다'),
  imageUrl: z.string().url('올바른 이미지 URL을 입력해주세요').optional(),
  marketplace: z.enum(['coupang', 'naver', 'gmarket', '11st', 'instagram', 'blog', 'cafe', 'other']),
  productUrl: z.string().url('올바른 상품 URL을 입력해주세요'),
  dealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
  dealEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
  category: z.string().optional(),
  partnersText: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
}).refine(data => data.salePrice < data.originalPrice, {
  message: '할인가는 정가보다 낮아야 합니다',
  path: ['salePrice'],
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['deal', 'group-buy']).optional(),
  marketplace: z.enum(['coupang', 'naver', 'gmarket', '11st', 'instagram', 'blog', 'cafe', 'other']).optional(),
  category: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  dealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['created_at', 'discount_rate', 'sale_price']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
