const productLinks = ["Tạo quiz AI", "Phòng thi", "Lịch sử điểm", "Bảng xếp hạng"];
const companyLinks = ["Về Qivora", "Blog", "Liên hệ", "Điều khoản"];

export default function Footer() {
  return (
    <footer className="qv-footer">
      <div className="qv-container qv-footer-grid">
        <div>
          <a className="qv-brand" href="#home">
            <span>Q</span>ivora
          </a>
          <p>Quiz Master with AI cho học tập, kiểm tra và cạnh tranh kiến thức thông minh.</p>
          <div className="qv-socials">
            <span>🌐</span>
            <span>💬</span>
            <span>▶</span>
            <span>📚</span>
          </div>
        </div>

        <div>
          <h3>Sản phẩm</h3>
          {productLinks.map((link) => (
            <a href="#home" key={link}>
              {link}
            </a>
          ))}
        </div>

        <div>
          <h3>Công ty</h3>
          {companyLinks.map((link) => (
            <a href="#home" key={link}>
              {link}
            </a>
          ))}
        </div>

        <div>
          <h3>Newsletter</h3>
          <p>Nhận mẹo học tập và cập nhật tính năng mới.</p>
          <form className="qv-newsletter" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Email newsletter" placeholder="Email của bạn" />
            <button type="submit">→</button>
          </form>
        </div>
      </div>

      <div className="qv-container qv-copyright">
        <span>© 2026 Qivora. All rights reserved.</span>
        <span>Made for smarter quizzes.</span>
      </div>
    </footer>
  );
}
