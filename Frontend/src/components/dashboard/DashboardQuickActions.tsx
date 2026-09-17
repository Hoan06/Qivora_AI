import { Link, useNavigate } from "react-router-dom";

interface DashboardQuickActionsProps {
  onShowToast: (msg: string) => void;
  onFocusRoomPin?: () => void;
}

export default function DashboardQuickActions({
  onShowToast,
  onFocusRoomPin,
}: DashboardQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Thao tác nhanh</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            onShowToast("Chuyển sang trang tạo quiz thủ công...");
            navigate("/quiz-create");
          }}
          type="button"
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between group"
        >
          <span>Tạo quiz thủ công</span>
          <i className="fa-solid fa-plus text-indigo-500 group-hover:scale-125 transition-transform"></i>
        </button>

        <Link
          to="/quiz-ai"
          onClick={() => onShowToast("Chuyển sang trang tạo quiz bằng AI...")}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all flex items-center justify-between group"
        >
          <span>Tạo quiz bằng AI</span>
          <i className="fa-solid fa-wand-magic-sparkles text-violet-500 group-hover:scale-125 transition-transform"></i>
        </Link>

        <button
          onClick={() => {
            onShowToast("Hãy nhập mã phòng thi ở ô tìm kiếm trên banner!");
            if (onFocusRoomPin) onFocusRoomPin();
          }}
          type="button"
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-between group"
        >
          <span>Nhập mã phòng</span>
          <i className="fa-solid fa-right-to-bracket text-emerald-500 group-hover:scale-125 transition-transform"></i>
        </button>
      </div>
    </div>
  );
}
