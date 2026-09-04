interface DashboardStatsGridProps {
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number;
  totalScore: number;
  myRank?: number;
}

function formatCompactScore(score: number) {
  if (score >= 1000) return `${(score / 1000).toFixed(score % 1000 === 0 ? 0 : 1)}k`;
  return new Intl.NumberFormat("vi-VN").format(score);
}

function formatAverageScore(score: number) {
  return Number.isInteger(score) ? score.toString() : score.toFixed(1);
}

export default function DashboardStatsGrid({
  totalAttempts,
  completedAttempts,
  inProgressAttempts,
  averageScore,
  totalScore,
  myRank,
}: DashboardStatsGridProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Quiz đã làm */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Quiz đã làm
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
          {totalAttempts}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {completedAttempts} lượt đã hoàn thành
        </div>
      </div>

      {/* Độ chính xác */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Độ chính xác
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
          {formatAverageScore(averageScore)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Điểm trung bình mỗi bài
        </div>
      </div>

      {/* Rank cá nhân */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Rank cá nhân
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">
          {myRank ? `#${myRank}` : "--"}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {myRank ? "Theo điểm hệ thống" : "Chưa có xếp hạng"}
        </div>
      </div>

      {/* Điểm tích lũy */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Điểm tích lũy
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCompactScore(totalScore)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {inProgressAttempts} lượt đang làm
        </div>
      </div>
    </section>
  );
}
