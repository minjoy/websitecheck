export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🛍️ 마켓플레이스 딜
            </h1>
            <nav className="flex gap-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900">
                로그인
              </a>
              <a href="/signup" className="text-gray-600 hover:text-gray-900">
                회원가입
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            오늘의 특가 상품을 확인하세요
          </h2>
          <p className="text-xl text-gray-600">
            AI가 자동으로 분류한 최적의 딜 정보
          </p>
        </div>

        {/* 섹션 안내 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">🔥 공동구매 특가</h3>
            <p className="text-gray-600">
              사용자들이 직접 올린 실시간 공동구매 정보를 확인하세요.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">✅ 검증된 추천 상품</h3>
            <p className="text-gray-600">
              관리자가 직접 검증한 믿을 수 있는 특가 상품입니다.
            </p>
          </div>
        </div>

        {/* 주요 기능 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">주요 기능</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h4 className="font-bold mb-2">자동 카테고리 분류</h4>
              <p className="text-sm text-gray-600">
                AI가 상품명을 분석하여 자동으로 카테고리를 분류합니다
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔔</div>
              <h4 className="font-bold mb-2">키워드 알림</h4>
              <p className="text-sm text-gray-600">
                관심 키워드를 등록하면 새 상품 등록 시 이메일로 알림을 받습니다
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <h4 className="font-bold mb-2">즐겨찾기</h4>
              <p className="text-sm text-gray-600">
                마음에 드는 상품을 즐겨찾기에 추가하여 관리하세요
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 마켓플레이스 딜 사이트. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
