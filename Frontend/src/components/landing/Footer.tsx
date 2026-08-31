import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Qivora Logo" className="h-6 w-auto rounded-lg object-contain" />
          <span>© 2026 Qivora AI. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
            Điều khoản
          </a>
          <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
            Bảo mật
          </a>
          <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
}
