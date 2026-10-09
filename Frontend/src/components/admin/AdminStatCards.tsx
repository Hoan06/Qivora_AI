import { Link } from "react-router-dom";
import { type AdminStatisticsResponse } from "../../utils/Types";

interface AdminStatCardsProps {
  statistics: AdminStatisticsResponse;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getPercent(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export default function AdminStatCards({ statistics }: AdminStatCardsProps) {
  const activeUserPercent = getPercent(statistics.activeUsers, statistics.totalUsers);
  const activeQuizPercent = getPercent(statistics.activeQuizzes, statistics.totalQuizzes);
  const completedRate = getPercent(statistics.completedAttempts, statistics.totalAttempts);
  
  const processedFeedbackCount = Math.max(0, statistics.totalFeedback - statistics.unreadFeedback);
  const feedbackProcessedRate = statistics.totalFeedback > 0 
    ? getPercent(processedFeedbackCount, statistics.totalFeedback) 
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: User */}
      <Link
        to="/admin/users"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all shadow-lg shadow-indigo-500/5 cursor-pointer block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tổng Người Dùng
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-user-group" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(statistics.totalUsers)}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up" /> {activeUserPercent > 0 ? `+${activeUserPercent}%` : "100%"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(activeUserPercent, 10)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {formatNumber(statistics.activeUsers)} tài khoản đang mở
          </span>
        </div>
      </Link>

      {/* Metric 2: Quiz */}
      <Link
        to="/admin/quizzes"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all shadow-lg shadow-pink-500/5 cursor-pointer block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tổng Bài Quiz
          </span>
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-book-open" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(statistics.totalQuizzes)}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up" /> {activeQuizPercent > 0 ? `+${activeQuizPercent}%` : "100%"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(activeQuizPercent, 10)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {formatNumber(statistics.activeQuizzes)} bài thi công khai
          </span>
        </div>
      </Link>

      {/* Metric 3: Attempts */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all shadow-lg shadow-amber-500/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Lượt Làm Bài
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-chart-line" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(statistics.totalAttempts)}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up" /> {completedRate > 0 ? `${completedRate}%` : "100%"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(completedRate, 10)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {formatNumber(statistics.completedAttempts)} lượt hoàn thành bài thi
          </span>
        </div>
      </div>

      {/* Metric 4: Feedback */}
      <Link
        to="/admin/feedback"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all shadow-lg shadow-cyan-500/5 cursor-pointer block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Phản Hồi Feedback
          </span>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-comment-dots" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(statistics.totalFeedback)}
            </span>
            <span className="text-xs font-bold text-cyan-500 flex items-center gap-1">
              <i className="fa-solid fa-circle-check" /> {feedbackProcessedRate}% Đã xử lý
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(feedbackProcessedRate, 10)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {statistics.unreadFeedback > 0
              ? `${formatNumber(statistics.unreadFeedback)} phản hồi chưa đọc`
              : "0 phản hồi tồn đọng"}
          </span>
        </div>
      </Link>
    </div>
  );
}
