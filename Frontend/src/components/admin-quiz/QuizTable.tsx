import { Link } from "react-router-dom";
import { type QuizSummaryResponse } from "../../utils/Types";

interface QuizTableProps {
  quizzes: QuizSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  listStatus: string;
  deleteStatus: string;
  onPageChange: (page: number) => void;
  onRequestDelete: (quiz: QuizSummaryResponse) => void;
}

export default function QuizTable({
  quizzes,
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  listStatus,
  deleteStatus,
  onPageChange,
  onRequestDelete,
}: QuizTableProps) {
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col gap-4">
      {/* Table container */}
      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700/70 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-700/70 uppercase tracking-wider">
              <th className="p-4">STT</th>
              <th className="p-4">Tiêu đề Quiz</th>
              <th className="p-4">Mã Quiz</th>
              <th className="p-4">Số câu</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Người tạo</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
            {listStatus === "pending" && quizzes.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin text-pink-500" />
                    <span>Đang tải danh sách bài thi Quiz...</span>
                  </div>
                </td>
              </tr>
            ) : quizzes.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Không tìm thấy bài thi Quiz nào phù hợp.
                </td>
              </tr>
            ) : (
              quizzes.map((quiz, idx) => {
                const stt = page * size + idx + 1;
                const isDeleted = Boolean(quiz.isDeleted);
                const isClosed = quiz.isActive === false && !isDeleted;
                const isOpen = quiz.isActive !== false && !isDeleted;

                return (
                  <tr
                    key={quiz.id || quiz.code}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-4 text-slate-400 font-mono">#{stt}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="flex flex-col">
                        <span className="truncate leading-tight text-sm" title={quiz.title}>
                          {quiz.title}
                        </span>
                        {quiz.description && (
                          <span
                            className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5"
                            title={quiz.description}
                          >
                            {quiz.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/20">
                        {quiz.code}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {quiz.totalQuestions || 0} câu
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {quiz.timeLimit || 0} phút
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {quiz.creatorFullName || quiz.creatorUsername || "Hệ thống Qivora"}
                    </td>
                    <td className="p-4">
                      {isDeleted ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">
                          Đã xóa
                        </span>
                      ) : isClosed ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">
                          Đang khóa
                        </span>
                      ) : isOpen ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                          Đang mở
                        </span>
                      ) : null}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Preview / Take Quiz */}
                        <Link
                          to={`/take-quiz/${quiz.code}`}
                          className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                          title="Xem trước bài làm"
                        >
                          <i className="fa-solid fa-eye text-xs" />
                        </Link>

                        {/* Soft Delete */}
                        <button
                          type="button"
                          disabled={isDeleted || deleteStatus === "pending"}
                          onClick={() => onRequestDelete(quiz)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDeleted
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white"
                          }`}
                          title={isDeleted ? "Quiz đã bị xóa" : "Xóa mềm quiz vi phạm"}
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2 gap-3">
        <span>
          Hiển thị {startItem} - {endItem} trong tổng số {totalElements} bài thi Quiz
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={first || page <= 0}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Trước
          </button>

          {Array.from({ length: totalPages || 1 }, (_, i) => i)
            .slice(Math.max(0, page - 2), Math.max(5, page + 3))
            .map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => onPageChange(pNum)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  pNum === page
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                }`}
              >
                {pNum + 1}
              </button>
            ))}

          <button
            type="button"
            disabled={last || page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
