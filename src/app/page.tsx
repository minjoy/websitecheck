'use client';

// 더미 데이터
const groupBuyProducts = [
  {
    id: 1,
    title: '삼성 갤럭시북4 프로 16인치 노트북',
    price: 1890000,
    discountRate: 35,
    originalPrice: 2900000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=갤럭시북4',
  },
  {
    id: 2,
    title: 'LG 그램 17인치 초경량 노트북',
    price: 1650000,
    discountRate: 40,
    originalPrice: 2750000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=LG그램',
  },
  {
    id: 3,
    title: '다이슨 V15 무선청소기',
    price: 590000,
    discountRate: 45,
    originalPrice: 1090000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=다이슨',
  },
  {
    id: 4,
    title: '에어팟 프로 2세대',
    price: 289000,
    discountRate: 30,
    originalPrice: 410000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=에어팟프로',
  },
];

const specialDeals = [
  {
    id: 5,
    title: '아이패드 프로 11인치 M2 칩',
    price: 950000,
    discountRate: 25,
    originalPrice: 1270000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=아이패드프로',
  },
  {
    id: 6,
    title: '소니 WH-1000XM5 노이즈캔슬링 헤드폰',
    price: 298000,
    discountRate: 35,
    originalPrice: 460000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=소니헤드폰',
  },
  {
    id: 7,
    title: '삼성 비스포크 AI 에어컨 23평형',
    price: 1590000,
    discountRate: 30,
    originalPrice: 2270000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=비스포크에어컨',
  },
  {
    id: 8,
    title: 'LG 올레드 C3 65인치 스마트 TV',
    price: 2490000,
    discountRate: 40,
    originalPrice: 4150000,
    url: '#',
    imageUrl: 'https://via.placeholder.com/300x300?text=LG올레드TV',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero 섹션 */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* 몽환적 배경 애니메이션 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI 배지 */}
            <div className="inline-block mb-6">
              <div className="glass px-6 py-2 rounded-full inline-flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-sm font-semibold">AI 기반 상품 추천</span>
              </div>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                매일 찾아주는
              </span>
              <br />
              <span className="text-white">최고의 특가</span>
            </h1>

            {/* 설명 */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              AI가 분석한 신뢰도 높은 특가 상품을 매일 업데이트합니다.
              <br />
              스마트한 쇼핑으로 현명한 구매 결정을 내리세요.
            </p>

            {/* 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  40%
                </div>
                <div className="text-sm text-gray-400 mt-2">평균 할인율</div>
              </div>
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  4.8★
                </div>
                <div className="text-sm text-gray-400 mt-2">평균 평점</div>
              </div>
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  매일
                </div>
                <div className="text-sm text-gray-400 mt-2">업데이트</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              똑똑한 쇼핑을 위한 필수 기능
            </span>
          </h3>
          <p className="text-gray-400">
            AI가 제공하는 스마트한 쇼핑 경험
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 공동구매 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">🔥</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              공동구매 특가
            </h4>
            <p className="text-gray-300">
              사용자들이 직접 올린 실시간 공동구매 정보를 확인하세요
            </p>
          </div>

          {/* 검증 상품 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">✅</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              검증된 추천 상품
            </h4>
            <p className="text-gray-300">
              관리자가 직접 검증한 믿을 수 있는 특가 상품
            </p>
          </div>

          {/* 자동 분류 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">🤖</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI 자동 분류
            </h4>
            <p className="text-gray-300">
              상품명을 AI가 분석하여 자동으로 카테고리 분류
            </p>
          </div>

          {/* 키워드 알림 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">🔔</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              키워드 알림
            </h4>
            <p className="text-gray-300">
              관심 키워드 상품 등록 시 이메일로 즉시 알림
            </p>
          </div>

          {/* 즐겨찾기 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">⭐</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              즐겨찾기
            </h4>
            <p className="text-gray-300">
              마음에 드는 상품을 저장하고 한눈에 관리
            </p>
          </div>

          {/* 실시간 배너 */}
          <div className="glass p-8 rounded-3xl glass-hover">
            <div className="text-5xl mb-4">📊</div>
            <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              실시간 통계
            </h4>
            <p className="text-gray-300">
              오늘의 이용자 수와 인기 상품을 실시간으로
            </p>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="text-center mt-16">
          <a
            href="/signup"
            className="glass px-8 py-4 rounded-full inline-block text-lg font-semibold glass-hover"
          >
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              지금 시작하기 →
            </span>
          </a>
        </div>
      </section>

      {/* 공동구매 특가 섹션 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              🔥 공동구매 특가
            </span>
          </h2>
          <p className="text-gray-400">사용자들이 직접 올린 실시간 공동구매</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {groupBuyProducts.map((product) => (
            <a
              key={product.id}
              href={product.url}
              className="glass rounded-2xl overflow-hidden glass-hover group"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-6xl">📦</div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="text-sm glass px-2 py-1 rounded-full text-red-400 font-semibold">
                    {product.discountRate}%
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toLocaleString()}원
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 관리자 추천 특가 섹션 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ✅ 관리자 추천 특가
            </span>
          </h2>
          <p className="text-gray-400">검증된 믿을 수 있는 특가 상품</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialDeals.map((product) => (
            <a
              key={product.id}
              href={product.url}
              className="glass rounded-2xl overflow-hidden glass-hover group"
            >
              <div className="aspect-square bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <div className="text-6xl">⭐</div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="text-sm glass px-2 py-1 rounded-full text-red-400 font-semibold">
                    {product.discountRate}%
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toLocaleString()}원
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="glass inline-block px-6 py-3 rounded-full mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              마켓플레이스 딜
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            매일 업데이트되는 스마트한 쇼핑 가이드
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 마켓플레이스 딜. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
