import { type AdminStatisticsResponse } from "../../utils/Types";

interface FeedbackStatsBadgesProps {
  statistics: AdminStatisticsResponse | null;
  totalFeedbacks: number;
  unreadCount: number;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function FeedbackStatsBadges({
  statistics,
  totalFeedbacks,
  unreadCount,
}: FeedbackStatsBadgesProps) {
  const total = statistics?.totalFeedback ?? totalFeedbacks;
  const unread = statistics?.unreadFeedback ?? unreadCount;
  const read = Math.max(0, total - unread);
  const processedRate = total > 0 ? Math.round((read / total) * 100) : 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* 1. Tổng Phản Hồi */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-comment-dots" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tổng Phản Hồi
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(total)} Phản hồi
          </span>
        </div>
      </div>

      {/* 2. Đã Đọc / Đã Xử Lý */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-envelope-open" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Đã Đọc / Đã Xử Lý
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(read)} Phản hồi
          </span>
        </div>
      </div>

      {/* 3. Chưa Đọc */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-envelope" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Chưa Đọc
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(unread)} Phản hồi
          </span>
        </div>
      </div>

      {/* 4. Tỷ Lệ Xử Lý */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-circle-check" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tỷ Lệ Xử Lý
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {processedRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
