interface DocumentStatsBadgesProps {
  totalDocs: number;
  completedDocs: number;
  processingDocs: number;
  totalChunks: number;
}

export default function DocumentStatsBadges({
  totalDocs,
  completedDocs,
  processingDocs,
  totalChunks,
}: DocumentStatsBadgesProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-book-bookmark"></i>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng Tài Liệu</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {totalDocs} File
          </span>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Đã Hoàn Tất</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {completedDocs} Sẵn sàng
          </span>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-rotate"></i>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Đang Xử Lý</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {processingDocs} Đang nạp
          </span>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-indigo-500/5 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
          <i className="fa-solid fa-cubes"></i>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vector Chunks</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {totalChunks} Chunks
          </span>
        </div>
      </div>
    </div>
  );
}
