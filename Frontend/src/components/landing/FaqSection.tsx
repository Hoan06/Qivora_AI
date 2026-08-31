import { useState } from "react";

const faqList = [
  {
    id: 1,
    question: "Qivora AI sinh đề trắc nghiệm có chính xác không?",
    answer:
      "Qivora sử dụng AI Gemini được tối ưu hóa theo chương trình GD&ĐT và quốc tế, đảm bảo độ chính xác đáp án trên 99.8%. Bạn hoàn toàn có thể chỉnh sửa đáp án trước khi phát hành.",
  },
  {
    id: 2,
    question: "Tôi có thể tải file PDF hoặc ảnh tài liệu lên không?",
    answer:
      "Có! Qivora hỗ trợ file PDF, Word, ảnh chụp trang sách hoặc ghi chú để AI tự đọc và tạo bộ câu hỏi trắc nghiệm tương ứng.",
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleFaq = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 my-24">
      <div className="reveal-on-scroll is-visible text-center mb-12">
        <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
          Giải Đáp Thắc Mắc
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900 dark:text-white">
          Câu Hỏi Thường Gặp
        </h2>
      </div>

      <div className="space-y-4">
        {faqList.map((item) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="reveal-on-scroll is-visible border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/70 dark:bg-slate-900/50 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(item.id)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span>{item.question}</span>
                <i
                  className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                ></i>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
