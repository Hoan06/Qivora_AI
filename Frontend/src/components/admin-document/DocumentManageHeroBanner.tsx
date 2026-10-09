interface DocumentManageHeroBannerProps {
  onOpenIngestModal: () => void;
}

export default function DocumentManageHeroBanner({
  onOpenIngestModal,
}: DocumentManageHeroBannerProps) {
  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden transition-colors">
      <div className="flex flex-col gap-2 max-w-2xl z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs w-fit">
          <i className="fa-solid fa-brain"></i> RAG Knowledge Repository
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Quản Lý{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Tài Liệu & Cơ Sở Tri Thức AI
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Nạp tài liệu, kiểm tra vector chunks và quản lý cơ sở tri thức RAG cho AI Chatbox và bộ tạo đề thi thông minh Qivora.
        </p>
      </div>

      <div className="flex items-center gap-3 z-10">
        <button
          onClick={onOpenIngestModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Nạp tài liệu mới
        </button>
      </div>

      {/* Ambient Glow Circle */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
}
