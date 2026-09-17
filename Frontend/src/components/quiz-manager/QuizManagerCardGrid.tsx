import { type QuizSummaryResponse } from "../../utils/Types";

interface QuizManagerCardGridProps {
  quizzes: QuizSummaryResponse[];
  onOpenDetail: (quiz: QuizSummaryResponse) => void;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
  onDeleteQuiz: (quiz: QuizSummaryResponse) => void;
}

function isQuizOpen(quiz: QuizSummaryResponse) {
  const now = Date.now();
  const started = quiz.startedAt ? new Date(quiz.startedAt).getTime() : null;
  const ended = quiz.endedAt ? new Date(quiz.endedAt).getTime() : null;
  return Boolean(quiz.isActive) && (started === null || started <= now) && (ended === null || ended >= now);
}

export default function QuizManagerCardGrid({
  quizzes,
  onOpenDetail,
  onCopyCode,
  onCopyLink,
  onDeleteQuiz,
}: QuizManagerCardGridProps) {
  if (quizzes.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
        <i className="fa-solid fa-folder-open text-4xl text-slate-300 dark:text-slate-600"></i>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Không tìm thấy bài quiz nào
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Tạo Quiz Bằng AI" để tạo bài thi mới.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        const active = isQuizOpen(quiz);
        return (
          <div
            key={quiz.id}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  onClick={() => onCopyCode(quiz.code)}
                  title="Bấm để sao chép mã"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-bold tracking-wider uppercase cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <i className="fa-regular fa-copy text-[10px]"></i>
                  <span>{quiz.code}</span>
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  <i className={`fa-solid ${active ? "fa-circle-check" : "fa-circle-xmark"} text-[10px]`}></i>
                  <span>{active ? "Đang mở" : "Đã khóa"}</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {quiz.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                {quiz.description || "Không có mô tả chi tiết."}
              </p>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 mb-5">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-clock text-indigo-500 text-xs"></i>
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">{quiz.timeLimit}</strong> phút
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-list text-indigo-500 text-xs"></i>
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">{quiz.totalQuestions}</strong> câu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-users text-indigo-500 text-xs"></i>
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">{quiz.totalAttempts || 0}</strong> lượt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-indigo-500 text-xs"></i>
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {quiz.hasPassword ? "Có mật khẩu" : "Công khai"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenDetail(quiz)}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <i className="fa-solid fa-chart-pie text-xs"></i>
                <span>Báo cáo & Bảng điểm</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onCopyLink(quiz.code)}
                  type="button"
                  title="Sao chép link tham gia thi"
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
                >
                  <i className="fa-solid fa-link text-xs"></i>
                </button>

                <button
                  onClick={() => onDeleteQuiz(quiz)}
                  type="button"
                  title="Xóa bài quiz"
                  className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-colors border border-rose-500/20"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
