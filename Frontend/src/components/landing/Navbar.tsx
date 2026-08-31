import { useEffect, useState } from "react";

const navLinks = [
  { label: "Trang chủ", href: "#home" },
  { label: "Khám phá", href: "#stats" },
  { label: "Tính năng", href: "#features" },
  { label: "Bảng xếp hạng", href: "#demo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("qv-menu-open", open);
    return () => document.body.classList.remove("qv-menu-open");
  }, [open]);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <nav className={`qv-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="qv-container qv-nav-inner">
          <a className="qv-brand" href="#home" onClick={closeDrawer}>
            <span>Q</span>ivora
          </a>

          <div className="qv-nav-links">
            {navLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="qv-nav-actions">
            <button className="qv-btn qv-btn-ghost" onClick={() => window.location.assign("/login")} type="button">
              Đăng nhập
            </button>
            <button className="qv-btn qv-btn-gradient" onClick={() => window.location.assign("/register")} type="button">
              Bắt đầu miễn phí
            </button>
          </div>

          <button
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="qv-menu-btn"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </nav>

      <aside className={`qv-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {navLinks.map((link) => (
          <a href={link.href} key={link.href} onClick={closeDrawer}>
            {link.label}
          </a>
        ))}
        <a href="/login" onClick={closeDrawer}>
          Đăng nhập
        </a>
      </aside>
    </>
  );
}
