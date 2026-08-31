import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchClientHomeData, resetClientHomeState } from "../api/clientHomeSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, fetchTopRankings, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import "../styles/dashboard.css";

type Particle = {
  c: string;
  r: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  z: number;
};

function DashboardIcon({ name }: { name: "ai" | "book" | "home" | "manage" | "profile" }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return (
      <svg {...props}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg {...props}>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-1.5z" />
        <path d="M8 7h7" />
        <path d="M8 11h8" />
      </svg>
    );
  }

  if (name === "ai") {
    return (
      <svg {...props}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </svg>
    );
  }

  if (name === "manage") {
    return (
      <svg {...props}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <path d="M8 6v12" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...props}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  return null;
}

function CupIcon() {
  return (
    <svg className="qvh-cup" viewBox="0 0 24 24">
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4z" fill="currentColor" />
      <path d="M8 6H5a3 3 0 0 0 3 3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 6h3a3 3 0 0 1-3 3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="2" />
      <path d="M9 20h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M10 16h4v4h-4z" fill="currentColor" />
    </svg>
  );
}

function getInitials(name?: string, username?: string) {
  const displayName = name?.trim() || username?.trim() || "User";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCompactScore(score: number) {
  if (score >= 1000) return `${(score / 1000).toFixed(score % 1000 === 0 ? 0 : 1)}k`;
  return new Intl.NumberFormat("vi-VN").format(score);
}

function formatAverageScore(score: number) {
  return Number.isInteger(score) ? score.toString() : score.toFixed(1);
}

function getQuizBadge(title?: string) {
  const cleanTitle = title?.trim() || "Quiz";
  return cleanTitle
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function HomeConfirmLogin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, rankings, rankStatus, status } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { recentAttempts, stats } = useSelector((state: RootState) => state.clientHome);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = currentUser?.fullName || currentUser?.username || "Bạn";
  const leaderboard = rankings.slice(0, 3);
  const myRank = useMemo(() => {
    const currentId = currentUser?.id;
    const currentUsername = currentUser?.username;
    return rankings.find((item) => item.userId === currentId || item.username === currentUsername)?.rank;
  }, [currentUser, rankings]);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchClientHomeData());
    void dispatch(fetchTopRankings(100));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetClientHomeState());
      navigate("/login");
    }
  }, [dispatch, navigate, status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const colors = ["#6c63ff", "#ff6584", "#ffbd59", "#4de2ff"];
    let animationFrame = 0;
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      particles = Array.from({ length: window.innerWidth < 700 ? 48 : 76 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        z: Math.random() * 1.5 + 0.4,
        c: colors[index % colors.length],
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        const px = (pointer.x - window.innerWidth / 2) * 0.006 * particle.z;
        const py = (pointer.y - window.innerHeight / 2) * 0.006 * particle.z;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = window.innerWidth + 20;
        if (particle.x > window.innerWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = window.innerHeight + 20;
        if (particle.y > window.innerHeight + 20) particle.y = -20;

        context.beginPath();
        context.arc(particle.x + px, particle.y + py, particle.r * particle.z, 0, Math.PI * 2);
        context.fillStyle = particle.c;
        context.shadowBlur = 18;
        context.shadowColor = particle.c;
        context.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const distance = Math.hypot(particle.x - next.x, particle.y - next.y);

          if (distance < 120) {
            context.beginPath();
            context.moveTo(particle.x + px, particle.y + py);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(255,255,255,${(1 - distance / 120) * 0.13})`;
            context.lineWidth = 1;
            context.shadowBlur = 0;
            context.stroke();
          }
        }
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handlePointerMove);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Vẫn xoá trạng thái local nếu backend từ chối cookie.
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetClientHomeState());
    navigate("/login");
  };

  return (
    <main className="qvh-page">
      <canvas ref={canvasRef} className="qvh-particles" />

      <div className="qvh-app">
        <aside className="qvh-sidebar">
          <div className="qvh-brand">
            <div className="qvh-brand-mark">Q</div>
            <span>Qivora</span>
          </div>

          <nav className="qvh-nav">
            <button className="active" type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="home" />
              </span>
              Trang chủ
            </button>
            <button onClick={() => navigate("/quiz-inventory")} type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="book" />
              </span>
              Kho quiz
            </button>
            <button onClick={() => navigate("/quiz-ai")} type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="ai" />
              </span>
              Tạo bằng AI
            </button>
            <button onClick={() => navigate("/quiz-manager")} type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="manage" />
              </span>
              Quản lí quiz cá nhân
            </button>
            <button onClick={() => navigate("/profile")} type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="profile" />
              </span>
              Hồ sơ
            </button>
          </nav>

          <div className="qvh-side-card">
            <strong>Gợi ý hôm nay</strong>
            <p>Làm một quiz ngắn để tăng điểm và cạnh tranh bảng xếp hạng hệ thống.</p>
          </div>
        </aside>

        <section className="qvh-main">
          <header className="qvh-topbar">
            <div className="qvh-profile-wrap">
              <button className="qvh-profile" onClick={() => setProfileOpen((value) => !value)} type="button">
                {currentUser?.avatar ? (
                  <img alt={displayName} className="qvh-avatar" src={currentUser.avatar} />
                ) : (
                  <div className="qvh-avatar">{getInitials(currentUser?.fullName, currentUser?.username)}</div>
                )}
                <div>
                  <strong>{displayName}</strong>
                  <small>Thành viên Qivora</small>
                </div>
              </button>

              {profileOpen ? (
                <div className="qvh-profile-menu">
                  <strong>{displayName}</strong>
                  <span>{currentUser?.email || currentUser?.username || "Tài khoản Qivora"}</span>
                  <button onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <section className="qvh-hero">
            <div className="qvh-hero-content">
              <div className="qvh-eyebrow">Bảng điều khiển học tập</div>
              <h1>
                Chào mừng quay lại, <span>học tiếp thôi.</span>
              </h1>
              <p>Theo dõi điểm số, làm quiz nhanh, tạo đề bằng AI và cạnh tranh thứ hạng cùng người học khác trên hệ thống.</p>

              <div className="qvh-actions">
                <button className="qvh-primary-btn" onClick={() => navigate("/quiz-inventory")} type="button">
                  Làm quiz ngay
                </button>
                <button className="qvh-ghost-btn" onClick={() => navigate("/quiz-create")} type="button">
                  Tạo quiz mới
                </button>
              </div>
            </div>

            <div className="qvh-hero-visual">
              <div className="qvh-quiz-card-3d">
                <h3>Lịch Sử Việt Nam</h3>
                <p>20 câu · Trung bình · 65%</p>
                <div className="qvh-progress">
                  <i />
                </div>
              </div>
            </div>
          </section>

          <section className="qvh-grid">
            <article className="qvh-card qvh-stat">
              <div className="qvh-stat-label">Quiz đã làm</div>
              <div className="qvh-stat-value">{stats.totalAttempts}</div>
              <div className="qvh-stat-note">{stats.completedAttempts} lượt đã hoàn thành</div>
            </article>

            <article className="qvh-card qvh-stat">
              <div className="qvh-stat-label">Độ chính xác</div>
              <div className="qvh-stat-value">{formatAverageScore(stats.averageScore)}</div>
              <div className="qvh-stat-note">Điểm trung bình mỗi bài</div>
            </article>

            <article className="qvh-card qvh-stat">
              <div className="qvh-stat-label">Rank cá nhân</div>
              <div className="qvh-stat-value">{myRank ? `#${myRank}` : "--"}</div>
              <div className="qvh-stat-note">{myRank ? "Theo điểm hệ thống" : "Chưa có xếp hạng"}</div>
            </article>

            <article className="qvh-card qvh-stat">
              <div className="qvh-stat-label">Điểm tích lũy</div>
              <div className="qvh-stat-value">
                {formatCompactScore(stats.totalScore)}
              </div>
              <div className="qvh-stat-note">{stats.inProgressAttempts} lượt đang làm</div>
            </article>

            <article className="qvh-card qvh-continue">
              <div className="qvh-panel-title">
                <h2>Tiếp tục học</h2>
                <a href="#all">Xem tất cả</a>
              </div>

              <div className="qvh-lesson-list">
                {recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => (
                    <div className="qvh-lesson" key={attempt.attemptId}>
                      <div className="qvh-lesson-badge">{getQuizBadge(attempt.quizTitle)}</div>
                      <div>
                        <h3>{attempt.quizTitle}</h3>
                        <p>
                          {attempt.quizCode} · {attempt.status === "COMPLETED" ? "Đã hoàn thành" : "Đang làm"} · {Number(attempt.score || 0)} điểm
                        </p>
                      </div>
                      <button onClick={() => navigate(`/take-quiz/${attempt.quizCode || attempt.quizId}`)} type="button">→</button>
                    </div>
                  ))
                ) : (
                  <div className="qvh-lesson">
                    <div className="qvh-lesson-badge">Q</div>
                    <div>
                      <h3>Chưa có lịch sử làm quiz</h3>
                      <p>Vào kho quiz để bắt đầu bài đầu tiên.</p>
                    </div>
                    <button onClick={() => navigate("/quiz-inventory")} type="button">→</button>
                  </div>
                )}
              </div>
            </article>

            <article className="qvh-card qvh-leaderboard">
              <div className="qvh-panel-title">
                <h2>Top điểm hệ thống</h2>
                <a href="#rank">{rankStatus === "rejected" ? "Chưa tải được" : "Bảng xếp hạng"}</a>
              </div>

              <div className="qvh-top-list">
                {leaderboard.map((user) => (
                  <div className="qvh-top-user" key={`${user.rank}-${user.username}`}>
                    <div className="qvh-top-avatar-wrap">
                      <CupIcon />
                      {user.avatar ? (
                        <img alt={user.fullName || user.username} className="qvh-top-avatar" src={user.avatar} />
                      ) : (
                        <div className="qvh-top-avatar">{getInitials(user.fullName, user.username)}</div>
                      )}
                    </div>
                    <div className="qvh-top-name">
                      <strong>{user.fullName || user.username}</strong>
                      <span>Hạng {user.rank} · {user.rank === 1 ? "Siêu tốc" : user.rank === 2 ? "Bền bỉ" : "Chính xác"}</span>
                    </div>
                    <div className="qvh-top-score">{formatCompactScore(user.totalScore)}</div>
                  </div>
                ))}
                {leaderboard.length === 0 ? (
                  <div className="qvh-lesson">
                    <div className="qvh-lesson-badge">Q</div>
                    <div>
                      <h3>Chưa có bảng xếp hạng</h3>
                      <p>Hoàn thành quiz để xuất hiện trong top điểm.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>

            <article className="qvh-card qvh-quick">
              <div className="qvh-panel-title">
                <h2>Thao tác nhanh</h2>
              </div>
              <button onClick={() => navigate("/quiz-create")} type="button">Tạo quiz thủ công <span>+</span></button>
              <button onClick={() => navigate("/quiz-ai")} type="button">Tạo quiz bằng AI <span>+</span></button>
              <button onClick={() => navigate("/quiz-inventory")} type="button">Nhập mã phòng <span>→</span></button>
            </article>

            <article className="qvh-card qvh-rank">
              <div className="qvh-panel-title">
                <h2>Xếp hạng của bạn</h2>
              </div>
              <div className="qvh-rank-row"><span>Toàn hệ thống</span><strong>{myRank ? `#${myRank}` : "--"}</strong></div>
              <div className="qvh-rank-row"><span>Lượt đã làm</span><strong>{stats.totalAttempts}</strong></div>
              <div className="qvh-rank-row"><span>Tổng điểm</span><strong>{formatCompactScore(stats.totalScore)}</strong></div>
            </article>

            <article className="qvh-card qvh-activity">
              <div className="qvh-panel-title">
                <h2>Hoạt động mới</h2>
              </div>
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => (
                  <div className="qvh-activity-item" key={`activity-${attempt.attemptId}`}>
                    <div className="qvh-dot" />
                    <p>
                      <strong>{Number(attempt.score || 0)} điểm</strong> từ quiz {attempt.quizTitle}.
                    </p>
                  </div>
                ))
              ) : (
                <div className="qvh-activity-item">
                  <div className="qvh-dot" />
                  <p><strong>Chưa có hoạt động</strong> trong tài khoản này.</p>
                </div>
              )}
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
