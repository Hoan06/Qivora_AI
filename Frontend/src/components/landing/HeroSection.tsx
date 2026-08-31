import React, { useState } from "react";

interface HeroSectionProps {
  onShowToast: (msg: string) => void;
  onJoinQuizPin?: (pin: string) => void;
}

const topics = [
  { id: "hist", title: "Lịch Sử 12 - Điện Biên Phủ", icon: "📜", label: "Lịch Sử 12" },
  { id: "py", title: "Python Basic & Data Structures", icon: "🐍", label: "Python Basic" },
  { id: "toeic", title: "Từ vựng TOEIC Reading 600+", icon: "🇬🇧", label: "TOEIC 600+" },
];

export default function HeroSection({ onShowToast, onJoinQuizPin }: HeroSectionProps) {
  const [pinInput, setPinInput] = useState("");
  const [activeTopic, setActiveTopic] = useState("hist");
  const [simPrompt, setSimPrompt] = useState("Tạo 5 câu trắc nghiệm Lịch Sử 12 - Điện Biên Phủ");
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [simOutput, setSimOutput] = useState<{ title: string; loaded: boolean }>({
    title: "Tạo 5 câu trắc nghiệm Lịch Sử 12 - Điện Biên Phủ",
    loaded: true,
  });

  const handleJoinQuiz = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = pinInput.trim();
    if (!pin) {
      onShowToast("Vui lòng nhập mã phòng thi!");
      return;
    }
    onShowToast(`Đang tham gia phòng thi [${pin.toUpperCase()}]...`);
    if (onJoinQuizPin) onJoinQuizPin(pin);
  };

  const handleSelectTopic = (topicId: string, topicTitle: string) => {
    setActiveTopic(topicId);
    const newPrompt = "Tạo 5 câu trắc nghiệm " + topicTitle;
    setSimPrompt(newPrompt);
    runSimulation(newPrompt);
  };

  const runSimulation = (promptText = simPrompt) => {
    setIsSimLoading(true);
    setTimeout(() => {
      setIsSimLoading(false);
      setSimOutput({
        title: promptText,
        loaded: true,
      });
    }, 500);
  };

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
      {/* Tag Badge */}
      <div className="reveal-on-scroll is-visible inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
        <i className="fa-solid fa-sparkles text-emerald-500"></i> Next-Gen AI Quiz Platform 2.5
      </div>

      {/* Headline */}
      <h1 className="reveal-on-scroll is-visible text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-6">
        Tạo Đề Thi & Kiểm Tra <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
          Thông Minh Với AI
        </span>
      </h1>

      {/* Subtitle */}
      <p className="reveal-on-scroll is-visible max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
        Biến tài liệu PDF, hình ảnh hay ý tưởng bài học thành bộ câu hỏi trắc nghiệm chuẩn hóa trong vài giây. Tối ưu trải nghiệm giảng dạy và học tập thời gian thực.
      </p>

      {/* Quick PIN Join Input */}
      <div className="reveal-on-scroll is-visible max-w-lg mx-auto mb-16">
        <form
          onSubmit={handleJoinQuiz}
          className="p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-2 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-all duration-300"
        >
          <div className="pl-4 text-purple-500">
            <i className="fa-solid fa-terminal text-lg"></i>
          </div>
          <input
            type="text"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Nhập mã Quiz phòng thi (VD: QZ-9921)..."
            className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold py-2.5"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-md hover:shadow-purple-500/30 hover:opacity-95 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            Vào thi <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </form>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 flex items-center justify-center gap-1.5">
          <i className="fa-regular fa-keyboard"></i> Nhấn{" "}
          <kbd className="px-1.5 py-0.5 text-[11px] rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            Enter
          </kbd>{" "}
          sau khi nhập mã
        </p>
      </div>

      {/* AI SIMULATOR / VISUAL HOLDER */}
      <div className="reveal-on-scroll is-visible max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-left">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-robot text-cyan-500"></i> AI Generator Live Simulator
          </span>
        </div>

        {/* Topic Pills Holder */}
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTopic(t.id, t.title)}
              className={`topic-pill px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeTopic === t.id
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Input Box & Output Card Holder */}
        <div className="flex gap-3 bg-slate-100 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 items-center">
          <i className="fa-solid fa-wand-magic-sparkles text-purple-500 pl-2"></i>
          <input
            type="text"
            value={simPrompt}
            onChange={(e) => setSimPrompt(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={() => runSimulation()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Sinh Quiz
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 min-h-[110px]">
          {isSimLoading ? (
            <div className="text-xs font-semibold text-purple-500 flex items-center gap-2 py-4">
              <i className="fa-solid fa-spinner fa-spin"></i> AI đang trích xuất câu hỏi...
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check"></i> Đã sinh 5 câu hỏi trắc nghiệm chuẩn hóa (0.5s)
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                {simOutput.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                  Option A
                </div>
                <div className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                  Option B (Đáp án đúng)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
