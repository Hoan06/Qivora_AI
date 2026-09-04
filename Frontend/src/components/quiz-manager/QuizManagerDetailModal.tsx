import { type QuizManageDetailResponse, type QuizSummaryResponse } from "../../utils/Types";

interface QuizManagerDetailModalProps {
  isOpen: boolean;
  quiz: QuizSummaryResponse | null;
  detail: QuizManageDetailResponse | null;
  isPending?: boolean;
  onClose: () => void;
  onExportCSV: () => void;
}

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    const dt = new Date(value);
    return dt.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return value;
  }
}

export default function QuizManagerDetailModal({
  isOpen,
  quiz,
  detail,
  isPending,
  onClose,
  onExportCSV,
}: QuizManagerDetailModalProps) {
  if (!isOpen || !quiz) return null;

  const resultsList = detail?.results || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {quiz.title}
              </h3>
              <p className="text-xs text-slate-400">
                Mã bài thi:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{quiz.code}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Thời gian làm bài
              </div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {quiz.timeLimit} phút
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Số câu hỏi
              </div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {quiz.totalQuestions} câu
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tổng thí sinh
              </div>
              <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {quiz.totalAttempts || resultsList.length} lượt
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Mật khẩu bài thi
              </div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {quiz.hasPassword ? "🔒 Có bảo vệ" : "🌐 Tự do vào thi"}
              </div>
            </div>
          </div>

          {/* Table Header & Export CSV Action */}
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Danh Sách Thí Sinh Đã Tham Gia
            </h4>
            <button
              onClick={onExportCSV}
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-excel text-emerald-500 text-xs"></i>
              <span>Xuất Excel / CSV</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80">
            {isPending ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải dữ liệu thí sinh...
              </div>
            ) : resultsList.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700/80">
                  <tr>
                    <th className="p-3">Thí Sinh</th>
                    <th className="p-3">Loại Tài Khoản</th>
                    <th className="p-3">Điểm Số</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3">Bắt Đầu Lúc</th>
                    <th className="p-3">Nộp Bài Lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {resultsList.map((res) => {
                    const scoreNum = Number(res.score || 0);
                    const scoreColor =
                      scoreNum >= 8
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : scoreNum >= 5
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400";

                    return (
                      <tr
                        key={res.attemptId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-bold">{res.participantName}</div>
                          <div className="text-[10px] text-slate-400">
                            {res.participantEmail || "N/A"}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.guest
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {res.guest ? "Khách" : "Thành viên"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-lg font-extrabold ${scoreColor}`}>
                            {scoreNum.toFixed(1)} điểm
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-500 flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-[10px]"></i>
                            <span>Hoàn thành</span>
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{formatDate(res.startedAt)}</td>
                        <td className="p-3 text-slate-400">{formatDate(res.completedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có lượt thi nào từ thí sinh.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
