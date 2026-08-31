import { useEffect, useRef, useState } from "react";

interface BunnyAssistantProps {
  onShowToast: (msg: string) => void;
}

const bunnyMessages = [
  "Xin chào! 👋",
  "Ngày hôm nay của bạn thế nào? 😊",
  "Bạn cần tôi hỗ trợ gì về hệ thống không? 🚀",
  "Qivora AI có thể giúp bạn tạo đề thi chỉ trong 10s! ✨",
];

export default function BunnyAssistant({ onShowToast }: BunnyAssistantProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(true);

  useEffect(() => {
    // Load lottie animation using window.lottie
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

  const nextMessage = () => {
    setBubbleScale(false);
    setTimeout(() => {
      setMsgIndex((prev) => (prev + 1) % bunnyMessages.length);
      setBubbleScale(true);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextMessage();
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    nextMessage();
    onShowToast("Trợ lý Thỏ Qivora luôn sẵn sàng hỗ trợ bạn!");
  };

  return (
    <div id="bunnyContainer" className="fixed bottom-4 left-4 z-50 flex flex-col items-start pointer-events-auto">
      {/* Floating Speech Bubble */}
      <div
        className={`relative max-w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-500 mb-2 origin-bottom-left ${
          bubbleScale ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <span>{bunnyMessages[msgIndex]}</span>
        {/* Bubble tail pointer */}
        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45"></div>
      </div>

      {/* Bunny Lottie Player Button */}
      <div
        onClick={handleClick}
        className="w-20 h-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300 drop-shadow-xl"
        title="Click để trò chuyện với Trợ lý Thỏ!"
      >
        <div ref={containerRef} className="w-full h-full"></div>
      </div>
    </div>
  );
}
