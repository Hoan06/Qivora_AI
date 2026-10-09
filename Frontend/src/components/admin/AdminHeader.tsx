import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { type UserResponse } from "../../utils/Types";

interface AdminHeaderProps {
  currentUser: UserResponse | null;
  onLogout: () => void;
}

export default function AdminHeader({ currentUser, onLogout }: AdminHeaderProps) {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });

  const profileRef = useRef<HTMLDivElement | null>(null);

  // Sync theme
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const displayName = currentUser?.fullName || currentUser?.username || "Administrator";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "A";

  const navLinks = [
    {
      to: "/admin/statistical",
      label: "Thống kê",
      icon: "fa-chart-pie",
      active: location.pathname === "/admin/statistical",
    },
    {
      to: "/admin/users",
      label: "Quản lý User",
      icon: "fa-users",
      active: location.pathname === "/admin/users",
    },
    {
      to: "/admin/quizzes",
      label: "Quản lý Quiz",
      icon: "fa-book-open",
      active: location.pathname === "/admin/quizzes",
    },
    {
      to: "/admin/feedback",
      label: "Feedback",
      icon: "fa-comments",
      active: location.pathname === "/admin/feedback",
    },
    {
      to: "/admin/documents",
      label: "Tài liệu AI",
      icon: "fa-book-bookmark",
      active: location.pathname === "/admin/documents",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/admin/statistical" className="flex items-center gap-3 group" title="Qivora Admin">
          <img
            src={logoImg}
            alt="Qivora Logo"
            className="h-10 w-auto rounded-xl object-contain shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300"
          />
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            Admin Center
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                item.active
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xs`} /> {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions: Theme Switcher & Admin Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* User View Switch Button */}
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Quay lại trang giao diện người dùng"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
            <span className="hidden sm:inline">Trang người dùng</span>
          </Link>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer"
            title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-sm text-amber-400" />
            ) : (
              <i className="fa-solid fa-moon text-sm text-slate-600" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              type="button"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 select-none hover:border-indigo-500/50 transition-all cursor-pointer"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 font-extrabold text-white text-xs flex items-center justify-center shadow-md">
                  {initials}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Quản trị hệ thống
                </span>
              </div>
              <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email || "admin@qivora.local"}
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-all"
                  onClick={() => setProfileOpen(false)}
                >
                  <i className="fa-solid fa-user-circle text-slate-400 text-sm" />
                  Hồ sơ cá nhân
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all text-left mt-1 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
