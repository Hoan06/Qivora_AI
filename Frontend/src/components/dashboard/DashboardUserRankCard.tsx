interface DashboardUserRankCardProps {
  myRank?: number;
  totalAttempts: number;
  totalScore: number;
}

function formatCompactScore(score: number) {
  if (score >= 1000) return `${(score / 1000).toFixed(score % 1000 === 0 ? 0 : 1)}k`;
  return new Intl.NumberFormat("vi-VN").format(score);
}

export default function DashboardUserRankCard({
  myRank,
  totalAttempts,
  totalScore,
}: DashboardUserRankCardProps) {
  return (
    <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm space-y-3">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Xếp hạng của bạn</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
          <span className="text-slate-500 dark:text-slate-400">Toàn hệ thống</span>
          <strong className="font-extrabold text-indigo-600 dark:text-indigo-400">
            {myRank ? `#${myRank}` : "--"}
          </strong>
        </div>
        <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
          <span className="text-slate-500 dark:text-slate-400">Lượt đã làm</span>
          <strong className="font-extrabold text-slate-800 dark:text-slate-200">
            {totalAttempts}
          </strong>
        </div>
        <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
          <span className="text-slate-500 dark:text-slate-400">Tổng điểm</span>
          <strong className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCompactScore(totalScore)}
          </strong>
        </div>
      </div>
    </div>
  );
}
