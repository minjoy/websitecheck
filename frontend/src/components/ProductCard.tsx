'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productAPI } from '@/lib/api';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    thumbnailUrl: string;
    normalPrice: number;
    salePrice: number;
    discountRate: number;
    isGroupBuy: boolean;
    favoriteCount: number;
  };
  isVerified?: boolean;
}

export default function ProductCard({ product, isVerified }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(product.favoriteCount);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await productAPI.toggleFavorite(product.id);
      setIsFavorited(res.data.isFavorite);
      setFavoriteCount(res.data.favoriteCount);

      // 토스트 메시지 표시
      showToast(res.data.isFavorite ? '즐겨찾기에 추가되었습니다' : '즐겨찾기에서 제거되었습니다');
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast('로그인이 필요합니다');
      } else {
        showToast('오류가 발생했습니다');
      }
    }
  };

  const showToast = (message: string) => {
    // 간단한 토스트 (실제로는 toast 라이브러리 사용 권장)
    alert(message);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        {/* 썸네일 */}
        <div className="relative aspect-square">
          <Image
            src={product.thumbnailUrl || '/placeholder.png'}
            alt={product.title}
            fill
            className="object-cover"
          />

          {/* 좌측 상단 태그 */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {product.isGroupBuy ? '공동구매' : '검증 상품'}
            </span>
          </div>

          {/* 할인율 (좌측 상단 태그 하단) */}
          {product.discountRate > 0 && (
            <div className="absolute top-12 left-3">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {product.discountRate.toFixed(0)}% 할인
              </span>
            </div>
          )}

          {/* 하트 버튼 (우측 하단) */}
          <button
            onClick={handleFavoriteClick}
            className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFavorited ? 'red' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke={isFavorited ? 'red' : 'currentColor'}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-gray-400 line-through text-sm">
              {product.normalPrice.toLocaleString()}원
            </span>
            <span className="text-red-600 font-bold text-xl">
              {product.salePrice.toLocaleString()}원
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="red"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="red"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <span>{favoriteCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
