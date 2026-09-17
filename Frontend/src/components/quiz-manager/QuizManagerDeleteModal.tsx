import { type QuizSummaryResponse } from "../../utils/Types";

interface QuizManagerDeleteModalProps {
  isOpen: boolean;
  quiz: QuizSummaryResponse | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function QuizManagerDeleteModal({
  isOpen,
  quiz,
  isPending,
  onClose,
  onConfirm,
}: QuizManagerDeleteModalProps) {
  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
        {/* Modal Header */}
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-bold border border-rose-500/20">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="font-extrabold text-base text-rose-900 dark:text-rose-200">
              Xác Nhận Xóa Bài Thi
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-300 flex items-center justify-center text-xs transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            Bạn có chắc chắn muốn xóa bài thi{" "}
            <strong className="text-rose-600 dark:text-rose-400">"{quiz.title}"</strong> (
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{quiz.code}</span>) không?
          </p>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <i className="fa-solid fa-circle-info text-sm mt-0.5 shrink-0"></i>
            <span>
              Hành động này sẽ xóa vĩnh viễn bài thi và toàn bộ dữ liệu làm bài của thí sinh. Thao tác này không thể hoàn tác.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
              <span>{isPending ? "Đang xóa..." : "Đồng ý xóa"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
