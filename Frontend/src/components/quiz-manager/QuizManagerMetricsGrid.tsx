interface QuizManagerMetricsGridProps {
  totalQuizzes: number;
  totalAttempts: number;
  activeQuizzes: number;
  avgScoreText?: string;
}

export default function QuizManagerMetricsGrid({
  totalQuizzes,
  totalAttempts,
  activeQuizzes,
  avgScoreText = "8.2 / 10",
}: QuizManagerMetricsGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Quizzes */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm flex items-center gap-4 hover:border-indigo-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0 border border-blue-500/20">
          <i className="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {totalQuizzes}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng số bài Quiz
          </div>
        </div>
      </div>

      {/* Total Attempts */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm flex items-center gap-4 hover:border-emerald-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/20">
          <i className="fa-solid fa-user-pen"></i>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {totalAttempts}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng lượt thi
          </div>
        </div>
      </div>

      {/* Active Quizzes */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm flex items-center gap-4 hover:border-amber-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0 border border-amber-500/20">
          <i className="fa-solid fa-square-check"></i>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {activeQuizzes}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Bài thi đang mở
          </div>
        </div>
      </div>

      {/* Candidate Avg Score */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm flex items-center gap-4 hover:border-purple-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0 border border-purple-500/20">
          <i className="fa-solid fa-award"></i>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {avgScoreText}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Điểm trung bình thí sinh
          </div>
        </div>
      </div>
    </section>
  );
}
