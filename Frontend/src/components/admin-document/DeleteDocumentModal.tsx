import { type DocumentResponse } from "../../utils/Types";

interface DeleteDocumentModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDocumentModal({
  document: doc,
  onClose,
  onConfirm,
}: DeleteDocumentModalProps) {
  if (!doc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl max-w-sm w-full p-6 flex flex-col relative text-slate-800 dark:text-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20 mb-4">
          <i className="fa-solid fa-trash-can"></i>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">
          Xác nhận xóa tài liệu?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          Bạn có chắc muốn xóa vĩnh viễn tài liệu{" "}
          <span className="font-bold text-slate-800 dark:text-slate-200 break-all">
            "{doc.name}"
          </span>
          ?
        </p>

        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 font-semibold mb-6 flex items-start gap-2 text-left">
          <i className="fa-solid fa-triangle-exclamation text-xs mt-0.5 flex-shrink-0"></i>
          <span>
            Hành động này sẽ xóa toàn bộ vector chunks liên quan trong cơ sở dữ liệu PgVector và không thể khôi phục.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-trash-can"></i> Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
