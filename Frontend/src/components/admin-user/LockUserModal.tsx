import { type UserResponse } from "../../utils/Types";

interface LockUserModalProps {
  user: UserResponse | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LockUserModal({
  user,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: LockUserModalProps) {
  if (!isOpen || !user) return null;

  const isCurrentlyLocked = user.isActive === false;
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

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-3 ${
            isCurrentlyLocked
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shadow-emerald-500/20"
              : "bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-amber-500/20"
          }`}
        >
          <i className={`fa-solid ${isCurrentlyLocked ? "fa-lock-open" : "fa-lock"}`} />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          {isCurrentlyLocked ? "Xác Nhận Mở Khóa Tài Khoản" : "Xác Nhận Khóa Tài Khoản"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {isCurrentlyLocked ? (
            <>
              Bạn có chắc chắn muốn mở khóa tài khoản{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                "{displayName}" ({user.username})
              </strong>
              ? User sẽ có thể đăng nhập lại vào hệ thống.
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn khóa tài khoản{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                "{displayName}" ({user.username})
              </strong>
              ? User sẽ không thể truy cập các tính năng làm bài thi.
            </>
          )}
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
            className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isCurrentlyLocked
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
            }`}
          >
            {isLoading ? "Đang xử lý..." : isCurrentlyLocked ? "Xác nhận mở" : "Xác nhận khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
