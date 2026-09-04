import { Link, useNavigate } from "react-router-dom";
import { type QuizAttemptHistoryResponse } from "../../utils/Types";

interface DashboardRecentQuizListProps {
  recentAttempts: QuizAttemptHistoryResponse[];
  onShowToast: (msg: string) => void;
}

function getQuizBadge(title?: string) {
  const cleanTitle = title?.trim() || "Quiz";
  return cleanTitle
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DashboardRecentQuizList({
  recentAttempts,
  onShowToast,
}: DashboardRecentQuizListProps) {
  const navigate = useNavigate();

  return (
    <div
      id="quickQuiz"
      className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Tiếp tục học</h3>
        <Link
          to="/quiz-inventory"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {recentAttempts.length > 0 ? (
          recentAttempts.map((attempt) => {
            const isCompleted = attempt.status === "COMPLETED";
            const targetId = attempt.quizCode || attempt.quizId;
            return (
              <div
                key={attempt.attemptId || attempt.quizId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                    }`}
                  >
                    {getQuizBadge(attempt.quizTitle)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {attempt.quizTitle}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {attempt.quizCode ? `${attempt.quizCode} · ` : ""}
                      {isCompleted ? "Đã hoàn thành" : "Đang làm"} · {Number(attempt.score || 0)} điểm
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onShowToast(`Mở bài thi: ${attempt.quizTitle}`);
                    navigate(`/take-quiz/${targetId}`);
                  }}
                  type="button"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm ${
                    isCompleted
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                  title={isCompleted ? "Xem lại kết quả" : "Tiếp tục làm quiz"}
                >
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                Q
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Chưa có lịch sử làm quiz
                </div>
                <div className="text-xs text-slate-400">Vào kho quiz để bắt đầu bài đầu tiên.</div>
              </div>
            </div>
            <Link
              to="/quiz-inventory"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors shrink-0 shadow-sm"
            >
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
