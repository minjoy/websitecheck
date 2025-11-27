import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getTodayDeals } from "@/lib/mockData";

export default function Home() {
  const deals = getTodayDeals();

  return (
    <main className="min-h-screen">
      <Hero />

      {/* 상품 그리드 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              오늘의 추천 상품
            </span>
          </h3>
          <p className="text-gray-400">
            AI가 엄선한 {deals.products.length}개의 특가 상품
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="glass inline-block px-6 py-3 rounded-full mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI 특가
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            매일 업데이트되는 스마트한 쇼핑 가이드
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 AI 특가. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
