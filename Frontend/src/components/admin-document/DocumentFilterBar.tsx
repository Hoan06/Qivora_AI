interface DocumentFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function DocumentFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: DocumentFilterBarProps) {
  const filterOptions = [
    { key: "ALL", label: "Tất cả" },
    { key: "COMPLETED", label: "Hoàn tất" },
    { key: "PROCESSING", label: "Đang nạp" },
    { key: "FAILED", label: "Lỗi" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md min-w-[240px]">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên file hoặc người tải..."
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1 text-xs font-bold transition-colors">
          {filterOptions.map((opt) => {
            const isActive = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onStatusFilterChange(opt.key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
