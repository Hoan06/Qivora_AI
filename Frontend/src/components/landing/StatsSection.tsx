import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: "📝", label: "Quiz đã tạo", suffix: "+", target: 50000 },
  { icon: "👥", label: "Lượt làm bài", suffix: "+", target: 200000 },
  { icon: "🏆", label: "Người dùng", suffix: "+", target: 10000 },
  { icon: "🤖", label: "Độ hài lòng", suffix: "%", target: 99 },
];

function AnimatedStat({ icon, label, suffix, target }: (typeof stats)[number]) {
  const [value, setValue] = useState(0);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const startedAt = performance.now();
        const duration = 1300;

        const tick = (time: number) => {
          const progress = Math.min((time - startedAt) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;

          setValue(Math.floor(target * eased));

          if (progress < 1) {
            window.requestAnimationFrame(tick);
          }
        };

        card.classList.add("is-visible");
        window.requestAnimationFrame(tick);
        observer.unobserve(card);
      },
      { threshold: 0.32 },
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [target]);

  return (
    <article className="qv-card qv-stat qv-tilt-card qv-reveal" ref={cardRef}>
      <span>{icon}</span>
      <strong>
        {value.toLocaleString("vi-VN")}
        {suffix}
      </strong>
      <p>{label}</p>
    </article>
  );
}

export default function StatsSection() {
  return (
    <section className="qv-section" id="stats">
      <div className="qv-container qv-stats">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
