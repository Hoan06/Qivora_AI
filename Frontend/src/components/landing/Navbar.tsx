import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";

interface NavbarProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light") return false;
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center group" title="Qivora AI">
          <img
            src={logo}
            alt="Qivora Logo"
            className="h-10 w-auto rounded-xl object-contain shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Trang chủ
          </a>
          <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Tính năng
          </a>
          <a href="#playground" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Thử nghiệm
          </a>
          <a href="#faq" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Actions: Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 shadow-sm"
            title="Chuyển đổi Chế độ Sáng / Tối"
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-lg text-amber-400"></i>
            ) : (
              <i className="fa-solid fa-moon text-lg"></i>
            )}
          </button>

          <button
            onClick={() => onOpenAuth("login")}
            className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            Đăng nhập
          </button>

          <button
            onClick={() => onOpenAuth("register")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            Bắt đầu ngay <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
