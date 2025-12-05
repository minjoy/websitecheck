'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { getAllProducts } from '@/lib/mockData';

interface Activity {
  id: string;
  type: 'view' | 'favorite' | 'purchase';
  message: string;
  timestamp: number;
}

const activityMessages = {
  view: ['님이 특가 상품을 조회했습니다', '님이 공구소식을 확인했습니다'],
  favorite: ['님이 상품을 즐겨찾기에 추가했습니다', '님이 특가를 즐겨찾기했습니다'],
  purchase: ['님이 특가 상품을 구매했습니다', '님이 공구에 참여했습니다'],
};

const randomNames = [
  '김*민', '이*영', '박*준', '최*아', '정*우',
  '강*희', '조*진', '윤*서', '장*호', '임*수',
  '한*미', '오*석', '서*정', '권*혁', '황*나',
  '안*준', '송*희', '홍*민', '신*경', '유*현'
];

const getRandomName = () => randomNames[Math.floor(Math.random() * randomNames.length)];
const getRandomMessage = (type: Activity['type']) => {
  const messages = activityMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

export default function LiveActivityBanner() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [todaySavings, setTodaySavings] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const { scrollY } = useScroll();

  // 스크롤 감지 - 헤더가 숨겨지면 배너를 top-0으로 이동
  useMotionValueEvent(scrollY, "change", (latest) => {
    setHeaderHidden(latest > 100);
  });

  // 초기 데이터 설정 및 방문자 추적
  useEffect(() => {
    const loadData = async () => {
      try {
        // 상품 데이터에서 총 할인액 계산
        const products = await getAllProducts();
        const totalSavings = products.reduce((sum, p) => sum + (p.originalPrice - p.salePrice), 0);
        setTodaySavings(totalSavings);

        // 실제 통계 가져오기
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setOnlineUsers(stats.visitorCount);
          setViewCount(stats.viewCount);
        }

        // 방문자 추적 (세션당 1회만)
        const hasVisited = sessionStorage.getItem('has_visited_today');
        if (!hasVisited) {
          await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'visitor' }),
          });
          sessionStorage.setItem('has_visited_today', 'true');

          // 방문자 수 즉시 업데이트
          const updatedStatsResponse = await fetch('/api/stats');
          if (updatedStatsResponse.ok) {
            const updatedStats = await updatedStatsResponse.json();
            setOnlineUsers(updatedStats.visitorCount);
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadData();
  }, []);

  // 실시간 활동 생성
  useEffect(() => {
    const generateActivity = () => {
      const types: Activity['type'][] = ['view', 'favorite', 'purchase'];
      const type = types[Math.floor(Math.random() * types.length)];
      const name = getRandomName();
      const message = getRandomMessage(type);

      const newActivity: Activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type,
        message: `${name}${message}`,
        timestamp: Date.now(),
      };

      setCurrentActivity(newActivity);

      // 조회수 증가 (실제 API 호출)
      if (type === 'view') {
        fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'view' }),
        })
          .then(res => res.json())
          .then(stats => {
            setViewCount(stats.viewCount);
          })
          .catch(err => console.error('Failed to increment view:', err));
      }
    };

    // 초기 활동 생성
    generateActivity();

    // 3-7초마다 새로운 활동 생성
    const interval = setInterval(() => {
      generateActivity();
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(interval);
  }, []);

  // 실시간 통계 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setOnlineUsers(stats.visitorCount);
          setViewCount(stats.viewCount);
        }
      } catch (error) {
        console.error('Failed to refresh stats:', error);
      }
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed left-0 right-0 z-40 w-full bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border-b border-purple-500/20 backdrop-blur-sm"
      animate={{ top: headerHidden ? '0px' : '80px' }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between py-2 md:py-3 gap-2 md:gap-6">
          {/* 실시간 활동 피드 */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {currentActivity && (
                <motion.div
                  key={currentActivity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <span className="flex-shrink-0 text-sm md:text-base">
                    {currentActivity.type === 'view' && '👀'}
                    {currentActivity.type === 'favorite' && '❤️'}
                    {currentActivity.type === 'purchase' && '🛒'}
                  </span>
                  <span className="text-gray-300 truncate">{currentActivity.message}</span>
                  <span className="flex-shrink-0">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-2 md:gap-6 text-xs md:text-sm">
            {/* 실시간 접속자 - 모바일에서 숨김 */}
            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-400">접속자</span>
              <span className="font-bold text-green-400">{onlineUsers.toLocaleString()}</span>
            </div>

            {/* 오늘의 총 할인액 - 모바일에서 숨김 */}
            <div className="hidden md:flex items-center gap-2 border-l border-purple-500/20 pl-6">
              <span className="text-gray-400">오늘 총 할인</span>
              <motion.span
                key={todaySavings}
                initial={{ scale: 1.2, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#c084fc' }}
                className="font-bold"
              >
                {todaySavings.toLocaleString()}원
              </motion.span>
            </div>

            {/* 누적 조회수 - 작은 모바일에서도 숨김, 중간 사이즈 이상에서만 표시 */}
            <div className="hidden sm:flex items-center gap-2 md:border-l border-purple-500/20 md:pl-6">
              <span className="text-gray-400 hidden sm:inline">오늘 조회</span>
              <motion.span
                key={viewCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-bold text-blue-400"
              >
                {viewCount.toLocaleString()}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
