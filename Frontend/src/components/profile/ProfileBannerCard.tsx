import { useRef, type ChangeEvent } from "react";
import { type UserResponse } from "../../utils/Types";

interface ProfileBannerCardProps {
  user: UserResponse | null;
  avatarStatus?: "idle" | "pending" | "fulfilled" | "rejected";
  onAvatarChange: (file: File) => void;
}

function getInitials(name?: string, username?: string) {
  const displayName = name?.trim() || username?.trim() || "User";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfileBannerCard({
  user,
  avatarStatus,
  onAvatarChange,
}: ProfileBannerCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayName = user?.fullName || user?.username || "Người dùng Qivora";
  const usernameHandle = `@${user?.username || "user"}`;
  const initials = getInitials(user?.fullName, user?.username);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
      e.target.value = "";
    }
  };

  return (
    <section className="p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-purple-500/15 blur-3xl rounded-full"></div>

      {/* Banner Left Content */}
      <div className="max-w-xl space-y-3 text-left">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
          User Profile
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Hồ sơ <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">cá nhân</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Xem thông tin tài khoản đang đăng nhập, đổi ảnh đại diện và cập nhật mật khẩu. Mật khẩu hiện tại không bao giờ hiển thị trên giao diện.
        </p>
      </div>

      {/* Avatar Box Card Right */}
      <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center text-center min-w-[240px] shrink-0 shadow-sm backdrop-blur-md">
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-indigo-500/30 overflow-hidden mb-3 group">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Change Avatar Overlay Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarStatus === "pending"}
            type="button"
            className="absolute bottom-0 inset-x-0 bg-slate-900/80 hover:bg-indigo-600 text-white text-[11px] font-bold py-1.5 transition-colors backdrop-blur-sm"
          >
            {avatarStatus === "pending" ? "Đang tải..." : "Đổi ảnh"}
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
          {displayName}
        </h2>
        <span className="text-xs text-slate-400 font-medium">{usernameHandle}</span>
      </div>
    </section>
  );
}
