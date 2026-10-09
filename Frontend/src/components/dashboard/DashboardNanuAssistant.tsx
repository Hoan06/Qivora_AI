import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLocalUserMessage,
  resetChatConversation,
  sendChatMessage,
} from "../../api/chatSlice";
import { type AppDispatch, type RootState } from "../../store/store";

const nanuMessages = [
  "Bạn cần tôi hỗ trợ gì không? 👋",
  "Hỏi tôi bất kỳ điều gì về hệ thống nhé! ✨",
  "Hôm nay bạn đã ôn luyện bài tập chưa? 📚",
  "Bạn muốn tìm tài liệu hay tạo đề thi AI? 😊",
];

export default function DashboardNanuAssistant() {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(true);
  const [inputText, setInputText] = useState("");

  // Redux chat state
  const { messages, status } = useSelector((state: RootState) => state.chat);
  const isThinking = status === "pending";

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

  // Scroll to bottom when new messages arrive or when thinking
  useEffect(() => {
    if (chatOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, chatOpen]);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isThinking) return;

    // 1. Thêm tin nhắn của user vào UI ngay lập tức
    dispatch(addLocalUserMessage(text));
    setInputText("");

    // 2. Gửi request đến Backend RAG Chat API
    void dispatch(sendChatMessage(text));
  };

  const handleResetConversation = () => {
    dispatch(resetChatConversation());
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
          className={`relative max-w-[230px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-500 mb-2.5 origin-bottom-right cursor-pointer hover:scale-105 ${
            bubbleScale ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <span>{nanuMessages[msgIdx]}</span>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45"></div>
        </div>
      )}

      {/* Popup Chatbox Modal */}
      {chatOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 origin-bottom-right flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-base shadow-inner">
                🐰
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Nanu AI Assistant
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 font-medium">RAG</span>
                </div>
                <div className="text-[10px] text-indigo-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sẵn sàng giải đáp
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetConversation}
                type="button"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
              </button>
              <button
                onClick={toggleChat}
                type="button"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Đóng chat"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="p-4 h-80 overflow-y-auto space-y-3.5 text-xs bg-slate-50/80 dark:bg-slate-900/60 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "max-w-[90%]"
                }`}
              >
                {msg.sender === "nanu" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">
                    N
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white font-medium max-w-[85%] rounded-tr-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-xs"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex items-start gap-2.5 max-w-[90%] animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">
                  N
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-sm rounded-tl-xs">
                  <span className="text-[11px] font-semibold">Nanu đang soạn tin...</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={logsEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isThinking}
              placeholder={isThinking ? "Nanu đang trả lời..." : "Hỏi Nanu về kiến thức, tài liệu..."}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer"
              title="Gửi tin nhắn"
            >
              {isThinking ? (
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-xs"></i>
              )}
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
