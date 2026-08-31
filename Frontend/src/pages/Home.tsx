import { useState } from "react";
import AuthModal from "../components/landing/AuthModal";
import BunnyAssistant from "../components/landing/BunnyAssistant";
import FaqSection from "../components/landing/FaqSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import Footer from "../components/landing/Footer";
import HeroSection from "../components/landing/HeroSection";
import Navbar from "../components/landing/Navbar";
import PlaygroundSection from "../components/landing/PlaygroundSection";
import StatsSection from "../components/landing/StatsSection";
import Toast from "../components/landing/Toast";

interface HomeProps {
  initialAuthModal?: "login" | "register";
}

export default function Home({ initialAuthModal }: HomeProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(!!initialAuthModal);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
    initialAuthModal || "login"
  );

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Ambient Subtle Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-500/10 via-cyan-500/5 to-transparent blur-3xl dark:from-purple-600/15 dark:via-cyan-500/10 z-0"></div>

      {/* NAVBAR */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* HERO SECTION */}
      <HeroSection onShowToast={showToast} />

      {/* STATS BAR */}
      <StatsSection />

      {/* FEATURES SECTION */}
      <FeaturesSection />

      {/* LIVE DEMO QUIZ PLAYGROUND */}
      <PlaygroundSection onShowToast={showToast} />

      {/* FAQ SECTION */}
      <FaqSection />

      {/* FOOTER */}
      <Footer />

      {/* LOTTIE BUNNY ASSISTANT WIDGET */}
      <BunnyAssistant onShowToast={showToast} />

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={handleCloseAuth}
        onShowToast={showToast}
      />

      {/* TOAST ALERT CONTAINER */}
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
