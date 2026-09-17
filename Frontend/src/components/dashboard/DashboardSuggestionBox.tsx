interface DashboardSuggestionBoxProps {
  onActionClick?: () => void;
}

export default function DashboardSuggestionBox({ onActionClick }: DashboardSuggestionBoxProps) {
  return (
    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-500 border-t border-r border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <i className="fa-regular fa-lightbulb text-sm"></i>
        </div>
        <div>
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Gợi ý hôm nay</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Làm một quiz ngắn để tăng điểm và cạnh tranh bảng xếp hạng hệ thống.
          </p>
        </div>
      </div>
      <button
        onClick={onActionClick}
        type="button"
        className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors shrink-0"
      >
        Thực hiện ngay
      </button>
    </div>
  );
}
