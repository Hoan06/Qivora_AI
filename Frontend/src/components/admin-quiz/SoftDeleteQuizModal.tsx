import { useState } from "react";
import { type QuizSummaryResponse } from "../../utils/Types";

interface SoftDeleteQuizModalProps {
  quiz: QuizSummaryResponse | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function SoftDeleteQuizModal({
  quiz,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: SoftDeleteQuizModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !quiz) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do xóa mềm bài thi quiz.");
      return;
    }

    try {
      setError(null);
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch {
      setError("Xóa bài thi thất bại, vui lòng thử lại!");
    }
  };

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
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Xóa Mềm Quiz Vi Phạm
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bài thi sẽ bị ẩn khỏi học viên nhưng vẫn lưu trong cơ sở dữ liệu
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Bạn đang chuẩn bị xóa mềm bài thi{" "}
          <strong className="text-slate-900 dark:text-white">"{quiz.title}"</strong> (
          <span className="font-mono text-indigo-500">{quiz.code}</span>).
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Lý do xóa bài thi <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ví dụ: Nội dung vi phạm tiêu chuẩn cộng đồng, quiz spam, nội dung sai lệch..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-white outline-none focus:border-rose-500 transition-colors resize-none"
            />
            {error && (
              <span className="text-xs text-rose-500 font-semibold">{error}</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận xóa mềm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
