interface QuizManagerToolbarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sortFilter: string;
  onSortFilterChange: (val: string) => void;
}

export default function QuizManagerToolbar({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  sortFilter,
  onSortFilterChange,
}: QuizManagerToolbarProps) {
  return (
    <section className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-md">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề hoặc mã quiz (VD: QZ-1029)..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter & Sort Selects */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang mở (Active)</option>
          <option value="INACTIVE">Đã khóa (Inactive)</option>
        </select>

        <select
          value={sortFilter}
          onChange={(e) => onSortFilterChange(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="NEWEST">Mới nhất</option>
          <option value="MOST_ATTEMPTS">Nhiều lượt làm nhất</option>
          <option value="MOST_QUESTIONS">Nhiều câu hỏi nhất</option>
        </select>
      </div>
    </section>
  );
}
