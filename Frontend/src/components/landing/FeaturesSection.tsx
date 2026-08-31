export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 my-24">
      <div className="reveal-on-scroll is-visible text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          Tính Năng Nổi Bật
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4 text-slate-900 dark:text-white">
          Tối Ưu Cho Việc Dạy & Học
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Giao diện tối giản nhưng đầy đủ những công cụ AI mạnh mẽ nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="reveal-on-scroll is-visible p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-lg hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl mb-6">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Tạo Đề AI 1-Click</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Tự động đọc file PDF, ảnh chụp trang sách hoặc văn bản để sinh ra bộ câu hỏi trắc nghiệm chuẩn ma trận.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            Tìm hiểu thêm <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </div>
        </div>

        {/* Card 2 */}
        <div className="reveal-on-scroll is-visible p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl mb-6">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Thi Realtime & Anti-Cheat</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Phòng thi trực tuyến thời gian thực, đếm ngược đồng hồ và cảnh báo thông minh khi học viên gian lận.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
            Tìm hiểu thêm <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </div>
        </div>

        {/* Card 3 */}
        <div className="reveal-on-scroll is-visible p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-lg hover:border-pink-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl mb-6">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Phân Tích AI Chuyên Sâu</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Báo cáo kết quả chi tiết, chỉ ra chính xác lỗ hổng kiến thức và xuất bài thi ra file Word/PDF tiện lợi.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
            Tìm hiểu thêm <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
