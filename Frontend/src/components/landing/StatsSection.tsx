import { useEffect, useRef, useState } from "react";

interface CounterItemProps {
  target: number;
  decimals?: number;
  suffix?: string;
  useComma?: boolean;
  label: string;
}

function CounterItem({ target, decimals = 0, suffix = "", useComma = false, label }: CounterItemProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            let startTimestamp: number | null = null;
            const duration = 2000;

            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const current = target * easeProgress;
              setVal(current);

              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            window.requestAnimationFrame(step);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  let formatted = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toString();
  if (useComma) {
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formatted = parts.join(".");
  }

  return (
    <div ref={ref}>
      <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
        {formatted}
        {suffix}
      </div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 my-16">
      <div className="reveal-on-scroll is-visible grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-lg text-center shadow-lg">
        <CounterItem target={500000} useComma suffix="+" label="Quiz Đã Khởi Tạo" />
        <CounterItem target={99.8} decimals={1} suffix="%" label="Độ Chính Xác AI" />
        <CounterItem target={4.9} decimals={1} suffix=" / 5.0" label="Đánh Giá Tuyệt Đối" />
        <CounterItem target={50000} useComma suffix="+" label="Người Dùng Tin Tưởng" />
      </div>
    </section>
  );
}
