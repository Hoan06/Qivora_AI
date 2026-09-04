import { useState, type FormEvent } from "react";
import { type QuizAttemptHistoryResponse, type UserResponse } from "../../utils/Types";

interface DashboardHeroBannerProps {
  currentUser: UserResponse | null;
  recentAttempt?: QuizAttemptHistoryResponse;
  onJoinRoom: (pin: string) => void;
}

export default function DashboardHeroBanner({
  currentUser,
  recentAttempt,
  onJoinRoom,
}: DashboardHeroBannerProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    onJoinRoom(pin.trim());
  };

  const displayName = currentUser?.fullName || currentUser?.username || "học tiếp thôi!";
  const progressTitle = recentAttempt?.quizTitle || "Lịch Sử Việt Nam";
  const progressPercent = recentAttempt
    ? Math.min(100, Math.round((Number(recentAttempt.score || 0) / 10) * 100))
    : 65;

  return (
    <section className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-3 max-w-2xl text-left">
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
          Bảng điều khiển học tập
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Chào mừng quay lại,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">{displayName}!</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Theo dõi điểm số, làm quiz nhanh, tạo đề bằng AI và cạnh tranh thứ hạng cùng người học khác trên hệ thống.
        </p>

        {/* Quick Quiz PIN Form */}
        <div className="pt-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-500 transition-all shadow-sm max-w-md"
          >
            <div className="flex items-center gap-2.5 pl-3 w-full">
              <i className="fa-solid fa-key text-indigo-500 text-sm"></i>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã phòng thi (VD: QZ-9921)..."
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none uppercase tracking-wider placeholder:normal-case placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Vào thi</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Progress Widget */}
      <div className="w-full md:w-80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
            {progressTitle}
          </span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {progressPercent}%
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {recentAttempt
            ? `${recentAttempt.status === "COMPLETED" ? "Đã hoàn thành" : "Đang làm"} · ${recentAttempt.score || 0} điểm`
            : "20 câu · Trung bình · 65% hoàn thành"}
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
}
