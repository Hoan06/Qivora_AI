import { type AdminStatisticsResponse } from "../../utils/Types";

interface UserStatsBadgesProps {
  statistics: AdminStatisticsResponse | null;
  totalElements: number;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function UserStatsBadges({
  statistics,
  totalElements,
}: UserStatsBadgesProps) {
  const total = statistics?.totalUsers ?? totalElements;
  const adminCount = statistics?.totalAdmins ?? 1;
  const userCount = Math.max(0, total - adminCount);
  const lockedCount = statistics?.lockedUsers ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* 1. Tổng Tài Khoản */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-users" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tổng Tài Khoản
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(total)} User
          </span>
        </div>
      </div>

      {/* 2. Học Viên (User) */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-graduation-cap" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Học Viên (User)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(userCount)} Tài khoản
          </span>
        </div>
      </div>

      {/* 3. Quản Trị (Admin) */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-user-shield" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Quản Trị (Admin)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(adminCount)} Tài khoản
          </span>
        </div>
      </div>

      {/* 4. Đang Bị Khóa */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-user-lock" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Đang Bị Khóa
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {formatNumber(lockedCount)} Tài khoản
          </span>
        </div>
      </div>
    </div>
  );
}
