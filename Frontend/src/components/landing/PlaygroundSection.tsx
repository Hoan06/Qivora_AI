import { useState } from "react";

interface PlaygroundSectionProps {
  onShowToast: (msg: string) => void;
}

export default function PlaygroundSection({ onShowToast }: PlaygroundSectionProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const options = [
    { label: "A", text: "Đại tướng Võ Nguyên Giáp", isCorrect: true },
    { label: "B", text: "Đại tướng Nguyễn Chí Thanh", isCorrect: false },
    { label: "C", text: "Đại tướng Văn Tiến Dũng", isCorrect: false },
  ];

  const handleSelectAnswer = (index: number, isCorrect: boolean) => {
    setSelectedIdx(index);
    if (isCorrect) {
      onShowToast("Chính xác! +100 điểm thưởng");
    } else {
      onShowToast("Chưa đúng rồi, hãy thử lại!");
    }
  };

  return (
    <section id="playground" className="max-w-4xl mx-auto px-4 sm:px-6 my-24">
      <div className="reveal-on-scroll is-visible p-8 sm:p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-slate-900/50 to-cyan-500/5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <i className="fa-solid fa-circle-dot"></i> Live Test Demo
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            <i className="fa-regular fa-clock"></i> 00:30
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold mb-6 text-slate-900 dark:text-white">
          Câu hỏi: Ai là Tổng tư lệnh chỉ huy chiến dịch Điện Biên Phủ lừng lẫy năm 1954?
        </h3>

        <div className="space-y-3 mb-6">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            let statusClass = "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-purple-500/50";
            if (isSelected) {
              statusClass = opt.isCorrect
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
            }

            return (
              <button
                key={opt.label}
                onClick={() => handleSelectAnswer(idx, opt.isCorrect)}
                className={`opt-btn w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all flex items-center gap-3 ${statusClass}`}
              >
                <span className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {opt.label}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {selectedIdx !== null && options[selectedIdx].isCorrect && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
            <i className="fa-solid fa-circle-check font-bold mr-1"></i> <strong>Chính xác!</strong> Đại tướng Võ Nguyên Giáp là Tổng tư lệnh chỉ huy chiến dịch Điện Biên Phủ lịch sử.
          </div>
        )}
      </div>
    </section>
  );
}
