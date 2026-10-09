import { useMemo } from "react";
import { type AdminStatisticsResponse } from "../../utils/Types";

interface AdminDonutChartProps {
  statistics: AdminStatisticsResponse;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function AdminDonutChart({ statistics }: AdminDonutChartProps) {
  const { activeQuizzes, inactiveQuizzes, deletedQuizzes, totalQuizzes } = statistics;

  const { activePercent, activeOffset, inactiveOffset, totalCalculated } = useMemo(() => {
    const total = totalQuizzes > 0 ? totalQuizzes : (activeQuizzes + inactiveQuizzes + deletedQuizzes);
    if (!total || total <= 0) {
      return {
        activePercent: 0,
        activeOffset: 0,
        inactiveOffset: 0,
        totalCalculated: 0,
      };
    }

    const aPct = Math.round((activeQuizzes / total) * 100);

    const circumference = 2 * Math.PI * 58; // ~364.42
    const aLength = (activeQuizzes / total) * circumference;
    const iLength = (inactiveQuizzes / total) * circumference;

    return {
      activePercent: aPct,
      activeOffset: circumference - aLength,
      inactiveOffset: circumference - iLength,
      totalCalculated: total,
    };
  }, [activeQuizzes, inactiveQuizzes, deletedQuizzes, totalQuizzes]);

  const circumference = 2 * Math.PI * 58; // 364.42

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl shadow-indigo-500/5 transition-all">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Tỷ Lệ Trạng Thái Quiz
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Phân bố Quiz hoạt động và bản nháp
        </p>
      </div>

      <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background circle track */}
          <circle
            cx="70"
            cy="70"
            r="58"
            className="stroke-slate-100 dark:stroke-slate-700/60"
            strokeWidth="14"
            fill="transparent"
          />

          {totalCalculated > 0 && activeQuizzes > 0 && (
            <circle
              cx="70"
              cy="70"
              r="58"
              stroke="#6366f1"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={activeOffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          )}

          {totalCalculated > 0 && inactiveQuizzes > 0 && (
            <circle
              cx="70"
              cy="70"
              r="58"
              stroke="#f59e0b"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={inactiveOffset}
              style={{
                transformOrigin: "center",
                transform: `rotate(${(activeQuizzes / (totalCalculated || 1)) * 360}deg)`,
              }}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {activePercent}%
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Đang hoạt động
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-xs font-bold">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" /> Quiz công khai
          </span>
          <span className="text-slate-900 dark:text-white font-extrabold">
            {formatNumber(activeQuizzes)} bài
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" /> Quiz riêng tư / Nháp
          </span>
          <span className="text-slate-900 dark:text-white font-extrabold">
            {formatNumber(inactiveQuizzes)} bài
          </span>
        </div>

        {deletedQuizzes > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-400" /> Đã lưu trữ / Xóa mềm
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-extrabold">
              {formatNumber(deletedQuizzes)} bài
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
