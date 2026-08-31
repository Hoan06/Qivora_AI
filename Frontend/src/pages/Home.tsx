import FeedbackFloatingButton from "../components/landing/FeedbackFloatingButton";
import FinalCtaSection from "../components/landing/FinalCtaSection";
import Footer from "../components/landing/Footer";
import HeroSection from "../components/landing/HeroSection";
import LandingScrollEffects from "../components/landing/LandingScrollEffects";
import MiniQuizDemo from "../components/landing/MiniQuizDemo";
import Navbar from "../components/landing/Navbar";
import ParticleCanvas from "../components/landing/ParticleCanvas";
import SplashScreen from "../components/landing/SplashScreen";
import StatsSection from "../components/landing/StatsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import "../styles/landing.css";

const features = [
  {
    icon: "🤖",
    title: "AI Tạo Đề Tự Động",
    description: "Nhập chủ đề, AI sinh câu hỏi tức thì với độ khó và số câu tùy chọn.",
  },
  {
    icon: "⚡",
    title: "Thi Thời Gian Thực",
    description: "Đếm ngược, tự nộp bài và chấm điểm ngay sau khi hoàn thành.",
  },
  {
    icon: "🔒",
    title: "Bảo Vệ Đề Thi",
    description: "Mật khẩu phòng thi, giới hạn thời gian và trạng thái mở đóng rõ ràng.",
  },
  {
    icon: "📊",
    title: "Phân Tích Kết Quả",
    description: "Xem điểm, đáp án đúng sai và giải thích chi tiết sau mỗi lần thi.",
  },
  {
    icon: "🌐",
    title: "Chia Sẻ Dễ Dàng",
    description: "Gửi link ngắn hoặc QZ-Code để người học tham gia trong vài giây.",
  },
  {
    icon: "👑",
    title: "Bảng Xếp Hạng",
    description: "Cạnh tranh lành mạnh theo điểm số, thời gian và tiến bộ học tập.",
  },
];

const steps = [
  {
    number: "1",
    title: "🔍 Tìm hoặc Tạo Quiz",
    description: "Nhập mã quiz có sẵn hoặc dùng AI để tạo đề mới.",
  },
  {
    number: "2",
    title: "🎯 Làm Bài & Cạnh Tranh",
    description: "Đồng hồ đếm ngược, chọn A/B/C/D và theo dõi tiến độ.",
  },
  {
    number: "3",
    title: "🏆 Xem Kết Quả",
    description: "Nhận điểm số, giải thích đáp án và cải thiện sau mỗi lần thi.",
  },
];

export default function Home() {
  return (
    <main className="qv-page">
      <LandingScrollEffects />
      <SplashScreen />
      <ParticleCanvas />

      <div className="qv-aurora" aria-hidden="true">
        <span className="qv-blob qv-blob-1" />
        <span className="qv-blob qv-blob-2" />
        <span className="qv-blob qv-blob-3" />
      </div>

      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeedbackFloatingButton />

      <section className="qv-section" id="features">
        <div className="qv-container">
          <h2 className="qv-title qv-reveal">Tại Sao Chọn Qivora?</h2>
          <p className="qv-subtitle qv-reveal">
            Một nền tảng quiz hiện đại cho tạo đề, làm bài, chấm điểm và cải thiện kiến thức nhanh hơn.
          </p>

          <div className="qv-feature-grid">
            {features.map((feature) => (
              <article className="qv-card qv-feature qv-tilt-card" key={feature.title}>
                <div className="qv-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="qv-section">
        <div className="qv-container">
          <h2 className="qv-title qv-reveal">Chỉ 3 Bước Đơn Giản</h2>
          <p className="qv-subtitle qv-reveal">
            Từ ý tưởng đến bài thi hoàn chỉnh, mọi thứ được gom trong một quy trình thật gọn.
          </p>

          <div className="qv-steps">
            {steps.map((step) => (
              <article className="qv-card qv-step" key={step.number}>
                <div className="qv-cube">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <MiniQuizDemo />
      <TestimonialsSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
