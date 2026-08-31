import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [quizCode, setQuizCode] = useState("");

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
  };

  const resetScene = () => {
    if (sceneRef.current) {
      sceneRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <section className="qv-hero" id="home">
      <div className="qv-container qv-hero-grid">
        <div className="qv-hero-content">
          <div className="qv-badge">
            <span>✨</span> Powered by GenAI
          </div>

          <h1>
            Học Thông Minh Hơn Cùng <span>AI Quiz</span>
          </h1>

          <p>
            Tạo đề thi, luyện tập thông minh và cạnh tranh bảng xếp hạng - tất cả trong một nền tảng
            được tăng cường bởi trí tuệ nhân tạo.
          </p>

          <form
            className="qv-join"
            onSubmit={(event) => {
              event.preventDefault();
              if (!quizCode.trim()) return;
              navigate(`/take-quiz/${encodeURIComponent(quizCode.trim())}`);
            }}
          >
            <input
              aria-label="Nhập mã quiz"
              onChange={(event) => setQuizCode(event.target.value)}
              placeholder="Nhập mã Quiz VD: QZAB12CD"
              value={quizCode}
            />
            <button className="qv-btn qv-btn-gradient" type="submit">
              Vào thi ngay →
            </button>
          </form>

          <div className="qv-cta-row">
            <button className="qv-btn qv-btn-gradient" type="button">
              🚀 Bắt đầu miễn phí
            </button>
            <button className="qv-btn qv-btn-ghost" type="button">
              ▶ Xem demo
            </button>
          </div>

          <div className="qv-social-proof">
            <div>
              <span>🧑‍🎓</span>
              <span>👩‍🏫</span>
              <span>🧑‍💻</span>
              <span>👩‍🔬</span>
            </div>
            <b>10,000+ học sinh đang sử dụng</b>
          </div>
        </div>

        <div className="qv-visual" onMouseLeave={resetScene} onMouseMove={handleMouseMove}>
          <div className="qv-mascot">
            <div>Hôm nay học gì nào? 🎉</div>
            <span>🦉</span>
          </div>

          <div className="qv-quiz-stack" ref={sceneRef}>
            <article className="qv-card qv-quiz-card qv-left">
              <span>🔬</span>
              <h3>Vật Lý 12</h3>
              <p>15 câu · Khó</p>
              <i style={{ transform: "scaleX(.42)" }} />
            </article>

            <article className="qv-card qv-quiz-card qv-main">
              <span>📚</span>
              <h3>Lịch Sử Việt Nam</h3>
              <p>20 câu · Trung bình · 65%</p>
              <i style={{ transform: "scaleX(.65)" }} />
            </article>

            <article className="qv-card qv-quiz-card qv-right">
              <span>🎵</span>
              <h3>Âm Nhạc Đại Cương</h3>
              <p>10 câu · Dễ</p>
              <i style={{ transform: "scaleX(.78)" }} />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
