export default function FeedbackManageHeroBanner() {
  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden transition-all">
      <div className="flex flex-col gap-2 max-w-2xl z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs w-fit">
          <i className="fa-solid fa-comments" /> User Feedback Inbox
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Quản Lý{" "}
          <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
            Ý Kiến & Phản Hồi
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Tiếp nhận các báo lỗi, đóng góp ý kiến về tính năng và trải nghiệm người dùng trên hệ thống Qivora.
        </p>
      </div>

      {/* Background Ambient Circle */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
