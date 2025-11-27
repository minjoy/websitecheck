'use client';

import { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  index: number;
}

const marketplaceColors = {
  coupang: 'from-red-500 to-pink-500',
  naver: 'from-green-500 to-emerald-500',
  gmarket: 'from-orange-500 to-amber-500',
  '11st': 'from-blue-500 to-cyan-500',
};

const marketplaceNames = {
  coupang: '쿠팡',
  naver: '네이버',
  gmarket: 'G마켓',
  '11st': '11번가',
};

export default function ProductCard({ product, index }: ProductCardProps) {
  const discountAmount = product.originalPrice - product.salePrice;
  const formattedOriginalPrice = product.originalPrice.toLocaleString();
  const formattedSalePrice = product.salePrice.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="glass glass-hover rounded-2xl overflow-hidden h-full flex flex-col">
        {/* 이미지 섹션 */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />

          {/* 할인율 배지 */}
          <div className="absolute top-4 right-4">
            <div className={`bg-gradient-to-r ${marketplaceColors[product.marketplace]} text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg`}>
              {product.discountRate}%
            </div>
          </div>

          {/* 마켓플레이스 배지 */}
          <div className="absolute top-4 left-4">
            <div className="glass px-3 py-1 rounded-full text-sm font-semibold">
              {marketplaceNames[product.marketplace]}
            </div>
          </div>

          {/* 태그 */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className="glass px-3 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="p-6 flex-1 flex flex-col">
          {/* 카테고리 */}
          <div className="text-sm text-purple-300 mb-2">{product.category}</div>

          {/* 제품명 */}
          <h3 className="text-lg font-bold mb-4 line-clamp-2 flex-1 group-hover:text-purple-300 transition-colors">
            {product.title}
          </h3>

          {/* 평점 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="ml-1 font-semibold">{product.rating}</span>
            </div>
            <span className="text-gray-400 text-sm">
              ({product.reviewCount.toLocaleString()}개 리뷰)
            </span>
          </div>

          {/* 가격 */}
          <div className="space-y-1 mb-4">
            <div className="text-sm text-gray-400 line-through">
              {formattedOriginalPrice}원
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {formattedSalePrice}원
              </span>
            </div>
            <div className="text-sm text-green-400">
              {discountAmount.toLocaleString()}원 할인
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Link
              href={`/product/${product.id}`}
              className="flex-1 glass glass-hover text-center py-3 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              리뷰 요약 보기
            </Link>
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-center py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              구매하기
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
