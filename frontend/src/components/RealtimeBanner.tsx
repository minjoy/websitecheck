'use client';

import { useEffect, useState } from 'react';

interface ActionLog {
  userName: string;
  actionText: string;
  createdAt: string;
}

interface Stats {
  todayUsers: number;
  todayClicks: number;
}

export default function RealtimeBanner() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [stats, setStats] = useState<Stats>({ todayUsers: 0, todayClicks: 0 });

  useEffect(() => {
    // SSE 연결
    const eventSource = new EventSource('http://localhost:3001/api/sse/live-banner');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'ACTION_LOG') {
        setActionLogs((prev) => [data.payload, ...prev].slice(0, 10));
      }

      if (data.type === 'STATS') {
        setStats(data.payload);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* 좌측: 실시간 액션 로그 */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                실시간
              </span>
              <div className="animate-scroll">
                {actionLogs.length > 0 ? (
                  <span className="text-sm">
                    {actionLogs[0].actionText}
                  </span>
                ) : (
                  <span className="text-sm">실시간 활동 정보를 불러오는 중...</span>
                )}
              </div>
            </div>
          </div>

          {/* 우측: 통계 */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs opacity-80">오늘 이용자</div>
              <div className="text-2xl font-bold">{stats.todayUsers.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs opacity-80">오늘 클릭</div>
              <div className="text-2xl font-bold">{stats.todayClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
