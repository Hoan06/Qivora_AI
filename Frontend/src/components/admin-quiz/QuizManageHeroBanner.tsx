export default function QuizManageHeroBanner() {
  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden transition-all">
      <div className="flex flex-col gap-2 max-w-2xl z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-extrabold text-xs w-fit">
          <i className="fa-solid fa-book-journal-whills" /> Quiz Repository Management
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Quản Lý{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Kho Bài Thi Quiz
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Giám sát danh sách bài thi trắc nghiệm được khởi tạo trên toàn bộ hệ thống, kiểm tra mã Quiz code, xem trước nội dung hoặc xử lý các bài thi vi phạm.
        </p>
      </div>

      {/* Background Ambient Circle */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
