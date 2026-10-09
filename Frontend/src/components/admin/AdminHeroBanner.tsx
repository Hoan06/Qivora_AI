interface AdminHeroBannerProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function AdminHeroBanner({
  onRefresh,
  isRefreshing,
}: AdminHeroBannerProps) {
  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden transition-all">
      <div className="flex flex-col gap-2 max-w-2xl z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs w-fit">
          <i className="fa-solid fa-shield-halved" /> Control Panel
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Bảng Điều Khiển{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Quản Trị Hệ Thống
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Theo dõi các chỉ số thời gian thực, giám sát lượng làm bài thi Quiz, quản lý người dùng và phản hồi hệ thống Qivora.
        </p>
      </div>

      <div className="flex items-center gap-3 z-10">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          title="Tải lại dữ liệu thống kê từ máy chủ"
        >
          <i className={`fa-solid fa-rotate ${isRefreshing ? "fa-spin" : ""}`} />
          <span>{isRefreshing ? "Đang cập nhật..." : "Làm mới dữ liệu"}</span>
        </button>
      </div>

      {/* Background Ambient Circle */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
