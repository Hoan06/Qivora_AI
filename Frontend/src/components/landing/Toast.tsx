import { useEffect, useState } from "react";

interface ToastProps {
  message: string | null;
  duration?: number;
  onClear?: () => void;
}

export default function Toast({ message, duration = 3000, onClear }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [currentMsg, setCurrentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setCurrentMsg(message);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onClear) onClear();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, duration, onClear]);

  if (!currentMsg && !visible) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs font-semibold transition-all duration-300 pointer-events-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
      <span>{currentMsg}</span>
    </div>
  );
}
