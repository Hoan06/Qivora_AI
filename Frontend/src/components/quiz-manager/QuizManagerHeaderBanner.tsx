import { Link } from "react-router-dom";

interface QuizManagerHeaderBannerProps {
  onRefresh: () => void;
}

export default function QuizManagerHeaderBanner({ onRefresh }: QuizManagerHeaderBannerProps) {
  return (
    <section className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 backdrop-blur-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-3 max-w-2xl text-left">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
          <i className="fa-solid fa-sliders text-xs"></i> Personal Quiz Dashboard
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Quản Lý Quiz Cá Nhân
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Theo dõi tất cả bộ đề thi trắc nghiệm do bạn khởi tạo. Xem kết quả chi tiết của thí sinh, quản lý mã tham gia và xuất báo cáo kết quả thi.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          onClick={onRefresh}
          type="button"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-rotate text-xs"></i>
          <span>Làm mới</span>
        </button>

        <Link
          to="/quiz-ai"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Tạo Quiz Bằng AI</span>
        </Link>
      </div>
    </section>
  );
}
