import { useEffect, useRef, useState, type FormEvent } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "nanu";
  text: string;
}

const nanuMessages = [
  "Bạn cần tôi hỗ trợ gì không? 👋",
  "Cần tạo bài quiz AI nhanh không nào? ✨",
  "Hôm nay bạn đã ôn luyện bài tập chưa? 📚",
  "Bạn cần tôi hỗ trợ gì không? 😊",
];

export default function DashboardNanuAssistant() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(true);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "nanu",
      text: "Chào bạn, tôi là Nanu - trợ lý hệ thống Qivora! Bạn có thắc mắc gì cứ hỏi tôi nhé! 😊",
    },
  ]);

  // Load Lottie Bunny Animation
  useEffect(() => {
    let anim: any = null;
    const lottieGlobal = (window as any).lottie;

    if (containerRef.current && lottieGlobal) {
      try {
        anim = lottieGlobal.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/bunny.json",
        });
      } catch (err) {
        console.error("Lottie load error:", err);
      }
    }

    return () => {
      if (anim && anim.destroy) anim.destroy();
    };
  }, []);

  // Periodic Speech Bubble Rotation
  useEffect(() => {
    if (chatOpen) return;
    const timer = setInterval(() => {
      setBubbleScale(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % nanuMessages.length);
        setBubbleScale(true);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      let reply =
        "Tôi có thể giúp bạn tạo bài trắc nghiệm AI, luyện thi TOEIC/Grammar hoặc kiểm tra bảng xếp hạng cá nhân!";
      const lower = text.toLowerCase();
      if (lower.includes("toeic") || lower.includes("grammar") || lower.includes("luyện")) {
        reply =
          "Bạn có thể nhấp vào mục **Luyện đề** trên thanh Menu để tham gia thử sức các bộ đề TOEIC Listening/Reading hoặc bài tập Grammar chuẩn hóa nhé!";
      } else if (lower.includes("ai") || lower.includes("tạo")) {
        reply =
          "Bạn hãy nhấp vào nút **Tạo bằng AI** trên thanh Menu để gửi file PDF/tài liệu cho AI tự động sinh bộ quiz trắc nghiệm chỉ trong vài giây!";
      } else if (lower.includes("rank") || lower.includes("điểm") || lower.includes("hạng")) {
        reply =
          "Hãy hoàn thành thêm các bộ quiz trong kho đề để liên tục tăng điểm tích lũy và vươn lên Top 1 Bảng xếp hạng nhé!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "nanu",
          text: reply,
        },
      ]);
    }, 600);
  };

  return (
    <div
      id="nanuWidgetContainer"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto"
    >
      {/* Speech Bubble */}
      {!chatOpen && (
        <div
          onClick={toggleChat}
          className={`relative max-w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-500 mb-2.5 origin-bottom-right cursor-pointer hover:scale-105 ${
            bubbleScale ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <span>{nanuMessages[msgIdx]}</span>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45"></div>
        </div>
      )}

      {/* Popup Chatbox Modal */}
      {chatOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">Nanu Assistant</div>
                <div className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Trợ lý Qivora AI
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              type="button"
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Logs */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-slate-900/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "max-w-[85%]"
                }`}
              >
                {msg.sender === "nanu" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                    N
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white font-medium max-w-[85%]"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập thắc mắc của bạn..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      )}

      {/* Bunny Lottie Button */}
      <div
        onClick={toggleChat}
        className="relative group cursor-pointer"
        title="Nhấp để trò chuyện với Trợ lý Thỏ Nanu!"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300 drop-shadow-xl flex items-center justify-center">
          <div ref={containerRef} className="w-full h-full"></div>
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
      </div>
    </div>
  );
}
