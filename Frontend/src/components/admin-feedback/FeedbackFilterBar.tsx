interface FeedbackFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export default function FeedbackFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: FeedbackFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md min-w-[240px]">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên người gửi hoặc chủ đề..."
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Filter Select */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 font-semibold cursor-pointer transition-colors"
        >
          <option value="ALL">Tất cả phản hồi</option>
          <option value="UNREAD">Chưa đọc</option>
          <option value="READ">Đã đọc</option>
          <option value="SYSTEM">Hệ thống (SYSTEM)</option>
          <option value="QUIZ">Bài thi Quiz (QUIZ)</option>
        </select>
      </div>
    </div>
  );
}
