import { type UserResponse } from "../../utils/Types";

interface DeleteUserModalProps {
  user: UserResponse | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  user,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  const displayName = user.fullName || user.username;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center text-center relative text-slate-800 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20 mb-3">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Xác Nhận Xóa User
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn xóa tài khoản{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            "{displayName}" ({user.username})
          </strong>
          ? Tất cả dữ liệu của user này sẽ bị gỡ bỏ khỏi hệ thống.
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
