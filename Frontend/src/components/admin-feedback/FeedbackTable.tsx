import { type FeedbackResponse } from "../../utils/Types";

interface FeedbackTableProps {
  feedbacks: FeedbackResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  status: string;
  onPageChange: (page: number) => void;
  onViewDetail: (feedback: FeedbackResponse) => void;
  onRequestDelete: (feedback: FeedbackResponse) => void;
}

function formatDate(value?: string) {
  if (!value) return "Không có";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getSenderName(feedback: FeedbackResponse) {
  return feedback.senderName || feedback.username || feedback.userEmail || "Người gửi ẩn danh";
}

function getInitials(name?: string, fallback?: string) {
  const displayName = name?.trim() || fallback?.trim() || "User";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function FeedbackTable({
  feedbacks,
  page,
  size,
  totalElements,
  totalPages,
  status,
  onPageChange,
  onViewDetail,
  onRequestDelete,
}: FeedbackTableProps) {
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col gap-4">
      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700/70 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-700/70 uppercase tracking-wider">
              <th className="p-4">STT</th>
              <th className="p-4">Người gửi</th>
              <th className="p-4">Chủ đề</th>
              <th className="p-4">Nội dung chi tiết</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
            {status === "pending" && feedbacks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin text-cyan-500" />
                    <span>Đang tải danh sách phản hồi...</span>
                  </div>
                </td>
              </tr>
            ) : feedbacks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Không tìm thấy phản hồi nào phù hợp.
                </td>
              </tr>
            ) : (
              feedbacks.map((fb, idx) => {
                const stt = page * size + idx + 1;
                const sender = getSenderName(fb);
                const topic =
                  fb.type === "QUIZ"
                    ? `Quiz: ${fb.quizTitle || fb.quizCode || `#${fb.quizId}`}`
                    : "Hệ thống Qivora";

                return (
                  <tr
                    key={fb.id}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-4 text-slate-400 font-mono">#{stt}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 font-bold text-white text-xs flex items-center justify-center shadow-sm">
                          {getInitials(sender, fb.username)}
                        </div>
                        <div className="flex flex-col">
                          <span className="leading-tight">{sender}</span>
                          {fb.userEmail && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {fb.userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            fb.type === "QUIZ"
                              ? "bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/20"
                              : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {fb.type}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]" title={topic}>
                          {topic}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs">
                      <p className="truncate" title={fb.content}>
                        {fb.content}
                      </p>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {formatDate(fb.createdAt)}
                    </td>
                    <td className="p-4">
                      {fb.isRead ? (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold text-[11px]">
                          Đã đọc
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">
                          Chưa đọc
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View details */}
                        <button
                          type="button"
                          onClick={() => onViewDetail(fb)}
                          className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                          title="Xem chi tiết nội dung"
                        >
                          <i className="fa-solid fa-eye text-xs" />
                        </button>

                        {/* Delete feedback */}
                        <button
                          type="button"
                          onClick={() => onRequestDelete(fb)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Xóa phản hồi"
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
          Hiển thị {startItem} - {endItem} trong tổng số {totalElements} phản hồi
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500 transition-colors"
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
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
                }`}
              >
                {pNum + 1}
              </button>
            ))}

          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500 transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
