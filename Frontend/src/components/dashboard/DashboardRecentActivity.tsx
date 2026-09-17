import { type QuizAttemptHistoryResponse } from "../../utils/Types";

interface DashboardRecentActivityProps {
  recentAttempts: QuizAttemptHistoryResponse[];
}

export default function DashboardRecentActivity({ recentAttempts }: DashboardRecentActivityProps) {
  return (
    <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm space-y-3">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Hoạt động mới</h3>

      {recentAttempts.length > 0 ? (
        <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          {recentAttempts.map((attempt, index) => {
            const isLast = index === recentAttempts.length - 1;
            const dotColor = index % 2 === 0 ? "bg-indigo-500" : "bg-emerald-500";
            return (
              <li
                key={attempt.attemptId || index}
                className={`flex items-start gap-2.5 ${
                  !isLast ? "pb-2.5 border-b border-slate-100 dark:border-slate-800/80" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`}></span>
                <span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {Number(attempt.score || 0)} điểm
                  </strong>{" "}
                  từ quiz {attempt.quizTitle}.
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-xs text-slate-400 py-2">Chưa có hoạt động mới gần đây.</div>
      )}
    </div>
  );
}
