import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { type UserResponse } from "../../utils/Types";

interface DashboardHeaderProps {
  currentUser: UserResponse | null;
  onLogout: () => void;
}

export default function DashboardHeader({ currentUser, onLogout }: DashboardHeaderProps) {
  const location = useLocation();
  const isHomeActive = location.pathname === "/";

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const displayName = currentUser?.fullName || currentUser?.username || "Thành viên Qivora";
  const userEmail = currentUser?.email || currentUser?.username || "huyhoan13032006@gmail.com";
  const avatarUrl =
    currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`;

  useEffect(() => {
    const closeDropdowns = () => {
      setPracticeOpen(false);
      setCreateQuizOpen(false);
      setProfileOpen(false);
    };
    window.addEventListener("click", closeDropdowns);
    return () => window.removeEventListener("click", closeDropdowns);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center group" title="Qivora AI">
          <img
            src={logoImg}
            alt="Qivora Logo"
            className="h-10 w-auto rounded-xl object-contain shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              isHomeActive
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <i className="fa-solid fa-house text-xs"></i> Trang chủ
          </Link>

          {/* DROPDOWN "LUYỆN ĐỀ" */}
          <div className="relative group" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setPracticeOpen(!practiceOpen);
                setCreateQuizOpen(false);
                setProfileOpen(false);
              }}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-graduation-cap text-xs"></i> Luyện đề{" "}
              <i
                className={`fa-solid fa-chevron-down text-[10px] opacity-70 transition-transform duration-200 ${
                  practiceOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`${
                practiceOpen ? "flex" : "hidden"
              } group-hover:flex flex-col absolute top-full left-0 pt-2 w-56 z-50`}
            >
              <div className="bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-lg py-2 backdrop-blur-xl">
                <Link
                  to="/quiz-manager"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    🎓
                  </span>
                  <div>
                    <div className="font-bold text-sm">Luyện Thi TOEIC</div>
                    <div className="text-[10px] text-slate-400">Đề Listening & Reading</div>
                  </div>
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
                <Link
                  to="/quiz-manager"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    📚
                  </span>
                  <div>
                    <div className="font-bold text-sm">Luyện Grammar</div>
                    <div className="text-[10px] text-slate-400">Ngữ pháp Anh văn tổng hợp</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* DROPDOWN "TẠO BÀI THI" */}
          <div className="relative group" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setCreateQuizOpen(!createQuizOpen);
                setPracticeOpen(false);
                setProfileOpen(false);
              }}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-file-pen text-xs text-indigo-500"></i> Tạo bài thi{" "}
              <i
                className={`fa-solid fa-chevron-down text-[10px] opacity-70 transition-transform duration-200 ${
                  createQuizOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`${
                createQuizOpen ? "flex" : "hidden"
              } group-hover:flex flex-col absolute top-full left-0 pt-2 w-60 z-50`}
            >
              <div className="bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-lg py-2 backdrop-blur-xl">
                <Link
                  to="/quiz-create"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    ✍️
                  </span>
                  <div>
                    <div className="font-bold text-sm">Tạo thủ công</div>
                    <div className="text-[10px] text-slate-400">Tự nhập câu hỏi & đáp án</div>
                  </div>
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
                <Link
                  to="/quiz-ai"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    ✨
                  </span>
                  <div>
                    <div className="font-bold text-sm">Tạo bằng AI</div>
                    <div className="text-[10px] text-slate-400">Tự động sinh từ tài liệu & prompt</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Actions: Theme Switcher & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            title="Chuyển chế độ Sáng / Tối"
            type="button"
          >
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"} text-sm`}></i>
          </button>

          {/* Profile Dropdown */}
          <div className="relative group" onClick={(e) => e.stopPropagation()}>
            <div
              onClick={() => {
                setProfileOpen(!profileOpen);
                setPracticeOpen(false);
                setCreateQuizOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors select-none"
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Thành viên Qivora</span>
              </div>
              <i
                className={`fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              ></i>
            </div>

            {/* Profile Menu Box */}
            <div
              className={`${
                profileOpen ? "flex" : "hidden"
              } group-hover:flex flex-col absolute top-full right-0 pt-2 w-56 z-50`}
            >
              <div className="bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl py-2 backdrop-blur-xl">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{displayName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  <i className="fa-regular fa-user text-slate-400"></i> Hồ sơ cá nhân
                </Link>
                <Link
                  to="/quiz-manager"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  <i className="fa-solid fa-list-check text-slate-400"></i> Quản lí quiz cá nhân
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
                <button
                  onClick={onLogout}
                  type="button"
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
