interface QuizManagerPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  displayedCount: number;
  first: boolean;
  last: boolean;
  onPageChange: (nextPage: number) => void;
}

export default function QuizManagerPagination({
  page,
  totalPages,
  totalElements,
  displayedCount,
  first,
  last,
  onPageChange,
}: QuizManagerPaginationProps) {
  if (totalElements === 0) return null;

  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Hiển thị {displayedCount} / {totalElements} bài quiz
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={first}
          type="button"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <i className="fa-solid fa-chevron-left text-[10px]"></i>
          <span>Trước</span>
        </button>

        <span className="px-3 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
          {page + 1} / {Math.max(1, totalPages)}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={last || page + 1 >= totalPages}
          type="button"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <span>Sau</span>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </section>
  );
}
