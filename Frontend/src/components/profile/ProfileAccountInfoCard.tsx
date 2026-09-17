import { useState } from "react";
import { type UserResponse } from "../../utils/Types";

interface ProfileAccountInfoCardProps {
  user: UserResponse | null;
  onOpenChangePassword: () => void;
}

function formatDate(value?: string) {
  if (!value) return "Chưa có dữ liệu";
  try {
    const dt = new Date(value);
    const timeStr = dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const dateStr = dt.toLocaleDateString("vi-VN");
    return `${timeStr} ${dateStr}`;
  } catch {
    return value;
  }
}

export default function ProfileAccountInfoCard({
  user,
  onOpenChangePassword,
}: ProfileAccountInfoCardProps) {
  const [isEmailMasked, setIsEmailMasked] = useState(true);

  const email = user?.email || "";

  const renderEmailDisplay = () => {
    if (!email) return "Chưa cập nhật";
    if (!isEmailMasked) return email;

    const parts = email.split("@");
    if (parts.length < 2) return email;
    const namePart = parts[0];
    const domainPart = parts[1];
    const prefix = namePart.substring(0, Math.min(3, namePart.length));
    return `${prefix}***@${domainPart}`;
  };

  const isActive = user?.isActive !== false;
  const roleName = user?.roles && user.roles.length > 0 ? user.roles[0].replace("ROLE_", "") : "USER";

  return (
    <section className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Thông tin tài khoản
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Dữ liệu user đang đăng nhập
        </p>
      </div>

      {/* Info Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 space-y-1 hover:border-indigo-500/40 transition-colors">
          <span className="text-xs font-semibold text-slate-400">Tên đăng nhập</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {user?.username || "Chưa có dữ liệu"}
          </div>
        </div>

        {/* Full Name */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 space-y-1 hover:border-indigo-500/40 transition-colors">
          <span className="text-xs font-semibold text-slate-400">Họ và tên</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {user?.fullName || "Chưa cập nhật"}
          </div>
        </div>

        {/* Email with Toggle Eye */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 space-y-1 hover:border-indigo-500/40 transition-colors">
          <span className="text-xs font-semibold text-slate-400">Email</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span className="truncate pr-2">{renderEmailDisplay()}</span>
            {email ? (
              <button
                onClick={() => setIsEmailMasked(!isEmailMasked)}
                type="button"
                className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                title={isEmailMasked ? "Hiện Email đầy đủ" : "Ẩn Email"}
              >
                <i className={`fa-regular ${isEmailMasked ? "fa-eye" : "fa-eye-slash"}`}></i>
              </button>
            ) : null}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 space-y-1 hover:border-indigo-500/40 transition-colors">
          <span className="text-xs font-semibold text-slate-400">Trạng thái</span>
          <div
            className={`text-sm font-bold ${
              isActive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isActive ? "Đang hoạt động" : "Tài khoản bị khóa"}
          </div>
        </div>

        {/* Account Created Date */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 space-y-1 md:col-span-2 hover:border-indigo-500/40 transition-colors">
          <span className="text-xs font-semibold text-slate-400">Ngày tạo tài khoản</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {formatDate(user?.createdAt)}
          </div>
        </div>
      </div>

      {/* Footer Badges & Action */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            {roleName}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          onClick={onOpenChangePassword}
          type="button"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-key text-xs"></i>
          <span>Đổi mật khẩu</span>
        </button>
      </div>
    </section>
  );
}
