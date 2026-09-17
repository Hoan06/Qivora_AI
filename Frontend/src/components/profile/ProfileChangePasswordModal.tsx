import { useState, type FormEvent } from "react";

interface ProfileChangePasswordModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => void;
}

export default function ProfileChangePasswordModal({
  isOpen,
  isPending,
  onClose,
  onSubmit,
}: ProfileChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [oldError, setOldError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let hasError = false;

    setOldError("");
    setNewError("");
    setConfirmError("");

    if (!oldPassword) {
      setOldError("Vui lòng nhập mật khẩu hiện tại.");
      hasError = true;
    }
    if (!newPassword || newPassword.length < 6) {
      setNewError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      hasError = true;
    }
    if (!confirmNewPassword || newPassword !== confirmNewPassword) {
      setConfirmError("Xác nhận mật khẩu mới không khớp.");
      hasError = true;
    }

    if (hasError) return;

    onSubmit({ oldPassword, newPassword, confirmNewPassword });
  };

  const handleModalClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setOldError("");
    setNewError("");
    setConfirmError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-500/20">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Đổi Mật Khẩu
            </h3>
          </div>
          <button
            onClick={handleModalClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu hiện tại
            </label>
            <div className="relative flex items-center">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (oldError) setOldError("");
                }}
                placeholder="Nhập mật khẩu cũ..."
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors ${
                  oldError
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 text-xs"
              >
                <i className={`fa-regular ${showOld ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {oldError && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                <span>{oldError}</span>
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newError) setNewError("");
                }}
                placeholder="Từ 6 đến 100 ký tự..."
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors ${
                  newError
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 text-xs"
              >
                <i className={`fa-regular ${showNew ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {newError && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                <span>{newError}</span>
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (confirmError) setConfirmError("");
                }}
                placeholder="Nhập lại mật khẩu mới..."
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors ${
                  confirmError
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 text-xs"
              >
                <i className={`fa-regular ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {confirmError && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                <span>{confirmError}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              onClick={handleModalClose}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-shield-halved text-xs"></i>
              <span>{isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
