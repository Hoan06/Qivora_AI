import { type AdminStatisticsResponse } from "../../utils/Types";

interface QuizStatsBadgesProps {
  statistics: AdminStatisticsResponse | null;
  totalElements: number;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function QuizStatsBadges({
  statistics,
  totalElements,
}: QuizStatsBadgesProps) {
  const total = statistics?.totalQuizzes ?? totalElements;
  const activeCount = statistics?.activeQuizzes ?? 0;
  const inactiveCount = statistics?.inactiveQuizzes ?? 0;
  const attemptsCount = statistics?.totalAttempts ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* 1. Tổng Số Quiz */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-pink-500/5">
        <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-book-open" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tổng Số Quiz
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(total)} Bài
          </span>
        </div>
      </div>

      {/* 2. Đang Mở Công Khai */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-earth-americas" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Đang Mở Công Khai
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(activeCount)} Bài
          </span>
        </div>
      </div>

      {/* 3. Riêng Tư / Đang Khóa */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-amber-500/5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-lock" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Riêng Tư / Đang Khóa
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(inactiveCount)} Bài
          </span>
        </div>
      </div>

      {/* 4. Tổng Lượt Làm Bài */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-file-pen" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tổng Lượt Làm Bài
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(attemptsCount)} Lượt
          </span>
        </div>
      </div>
    </div>
  );
}
