import { type FeedbackResponse } from "../../utils/Types";

interface FeedbackDetailModalProps {
  feedback: FeedbackResponse | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function FeedbackDetailModal({
  feedback,
  isOpen,
  onClose,
}: FeedbackDetailModalProps) {
  if (!isOpen || !feedback) return null;

  const senderName =
    feedback.senderName || feedback.username || feedback.userEmail || "Người gửi ẩn danh";
  const topic =
    feedback.type === "QUIZ"
      ? `Bài thi Quiz: ${feedback.quizTitle || feedback.quizCode || `#${feedback.quizId}`}`
      : "Góp ý & Báo lỗi hệ thống";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col relative text-slate-800 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            <i className="fa-solid fa-comment-dots" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chi Tiết Feedback
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[260px]">
              {topic}
            </h3>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2.5 mb-5">
          <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Người gửi:</span>
            <span className="font-bold text-slate-900 dark:text-white">{senderName}</span>
          </div>

          {feedback.userEmail && (
            <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700/60 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Email:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{feedback.userEmail}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Thời gian gửi:</span>
            <span className="text-slate-700 dark:text-slate-300">{formatDate(feedback.createdAt)}</span>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Nội dung góp ý:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {feedback.content}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-colors cursor-pointer"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
}
