import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminStatistics,
  resetAdminStatisticsState,
} from "../api/adminStatisticsSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type AdminStatisticsResponse } from "../utils/Types";
import "../styles/dashboard.css";

const emptyStatistics: AdminStatisticsResponse = {
  totalUsers: 0,
  activeUsers: 0,
  lockedUsers: 0,
  totalAdmins: 0,
  totalQuizzes: 0,
  activeQuizzes: 0,
  inactiveQuizzes: 0,
  deletedQuizzes: 0,
  totalAttempts: 0,
  completedAttempts: 0,
  inProgressAttempts: 0,
  guestAttempts: 0,
  registeredUserAttempts: 0,
  totalFeedback: 0,
  unreadFeedback: 0,
};

function AdminIcon({ name }: { name: "chart" | "feedback" | "quiz" | "user" }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.3,
    viewBox: "0 0 24 24",
  };

  if (name === "chart") {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16V9" />
        <path d="M13 16V6" />
        <path d="M18 16v-4" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "quiz") {
    return (
      <svg {...props}>
        <path d="M9 11h6" />
        <path d="M9 15h6" />
        <path d="M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function getInitials(name?: string, username?: string) {
  const displayName = name?.trim() || username?.trim() || "Admin";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function Statistical() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const { statistics, status: statisticsStatus } = useSelector(
    (state: RootState) => state.adminStatistics,
  );
  const { currentUser, status: userStatus } = useSelector(
    (state: RootState) => state.user,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const data = statistics || emptyStatistics;
  const displayName = currentUser?.fullName || currentUser?.username || "Administrator";
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const activeQuizPercent = getPercent(data.activeQuizzes, data.totalQuizzes);

  const barItems = useMemo(
    () => [
      { label: "User", value: data.totalUsers, c1: "#6c63ff", c2: "#524bdf" },
      { label: "Active", value: data.activeUsers, c1: "#35d394", c2: "#1fa978" },
      { label: "Quiz", value: data.totalQuizzes, c1: "#ff6584", c2: "#db4771" },
      { label: "Attempts", value: data.totalAttempts, c1: "#ffbd59", c2: "#f48b37" },
      { label: "Done", value: data.completedAttempts, c1: "#28d7f5", c2: "#169bc8" },
      { label: "Feedback", value: data.totalFeedback, c1: "#6c63ff", c2: "#ff6584" },
    ],
    [data],
  );

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected" || statisticsStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminStatisticsState());
      navigate("/login");
    }
  }, [dispatch, navigate, statisticsStatus, userStatus]);

  useEffect(() => {
    if (userStatus === "fulfilled" && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate, userStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const drawLine = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const pointsData = [
        data.activeUsers,
        data.lockedUsers,
        data.activeQuizzes,
        data.inactiveQuizzes,
        data.completedAttempts,
        data.unreadFeedback,
      ];
      const labels = ["Active", "Locked", "Quiz", "Closed", "Done", "Unread"];
      const max = Math.max(...pointsData, 1);
      const padding = 42;

      context.clearRect(0, 0, w, h);
      context.strokeStyle = "rgba(123, 129, 152, 0.12)";
      context.lineWidth = 1;

      for (let index = 0; index < 5; index += 1) {
        const y = padding + ((h - padding * 2) / 4) * index;
        context.beginPath();
        context.moveTo(padding, y);
        context.lineTo(w - padding, y);
        context.stroke();
      }

      const points = pointsData.map((value, index) => {
        const x = padding + ((w - padding * 2) / (pointsData.length - 1)) * index;
        const y = h - padding - (value / max) * (h - padding * 2);
        return { x, y, label: labels[index] };
      });

      const gradient = context.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#6c63ff");
      gradient.addColorStop(0.55, "#ff6584");
      gradient.addColorStop(1, "#ffbd59");

      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
          return;
        }

        const prev = points[index - 1];
        const cx = (prev.x + point.x) / 2;
        context.bezierCurveTo(cx, prev.y, cx, point.y, point.x, point.y);
      });
      context.strokeStyle = gradient;
      context.lineWidth = 5;
      context.lineCap = "round";
      context.stroke();

      context.lineTo(points[points.length - 1].x, h - padding);
      context.lineTo(points[0].x, h - padding);
      context.closePath();

      const area = context.createLinearGradient(0, padding, 0, h);
      area.addColorStop(0, "rgba(108, 99, 255, 0.18)");
      area.addColorStop(1, "rgba(255, 101, 132, 0)");
      context.fillStyle = area;
      context.fill();

      points.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 7, 0, Math.PI * 2);
        context.fillStyle = "#fff";
        context.fill();

        context.beginPath();
        context.arc(point.x, point.y, 4, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        context.fillStyle = "#7b8198";
        context.font = "800 12px Poppins";
        context.textAlign = "center";
        context.fillText(point.label, point.x, h - 17);
      });
    };

    drawLine();
    window.addEventListener("resize", drawLine);

    return () => window.removeEventListener("resize", drawLine);
  }, [data]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Van xoa local state neu token/cookie da het han.
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  return (
    <main className="qvad-page">
      <div className="qvad-app">
        <aside className="qvad-sidebar">
          <div className="qvad-brand">
            <div className="qvad-brand-mark">Q</div>
            <div>
              <h1>Qivora</h1>
              <span>Admin System</span>
            </div>
          </div>

          <nav className="qvad-nav">
            <button className="active" type="button">
              <AdminIcon name="chart" />
              <span>Thống kê</span>
            </button>
            <button onClick={() => navigate("/admin/users")} type="button">
              <AdminIcon name="user" />
              <span>Quản lí user</span>
            </button>
            <button onClick={() => navigate("/admin/quizzes")} type="button">
              <AdminIcon name="quiz" />
              <span>Quản lí quiz</span>
            </button>
            <button onClick={() => navigate("/admin/feedback")} type="button">
              <AdminIcon name="feedback" />
              <span>Quản lí feedback</span>
            </button>
          </nav>

          <div className="qvad-admin-card">
            <strong>{displayName}</strong>
            <span>Quản trị hệ thống Qivora</span>
          </div>
        </aside>

        <section className="qvad-main">
          <header className="qvad-topbar">
            <div className="qvad-title">
              <h2>Thống kê hệ thống</h2>
              <p>Theo dõi tổng quan người dùng, quiz và hoạt động trong hệ thống.</p>
            </div>

            <div className="qvad-profile-wrap">
              <button
                className="qvad-profile"
                onClick={() => setProfileOpen((value) => !value)}
                type="button"
              >
                {currentUser?.avatar ? (
                  <img alt={displayName} className="qvad-avatar" src={currentUser.avatar} />
                ) : (
                  <div className="qvad-avatar">
                    {getInitials(currentUser?.fullName, currentUser?.username)}
                  </div>
                )}
                <div>
                  <strong>{displayName}</strong>
                  <span>{currentUser?.email || "admin@qivora.local"}</span>
                </div>
              </button>

              {profileOpen ? (
                <div className="qvad-profile-menu">
                  <strong>{displayName}</strong>
                  <span>{currentUser?.email || currentUser?.username || "Tài khoản admin"}</span>
                  <button onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <section className="qvad-stats-grid">
            <article className="qvad-stat-card purple">
              <div className="qvad-stat-icon">
                <AdminIcon name="user" />
              </div>
              <div className="qvad-stat-label">Tổng user</div>
              <div className="qvad-stat-value">{formatNumber(data.totalUsers)}</div>
              <div className="qvad-stat-note">{formatNumber(data.activeUsers)} đang hoạt động</div>
            </article>

            <article className="qvad-stat-card pink">
              <div className="qvad-stat-icon">
                <AdminIcon name="quiz" />
              </div>
              <div className="qvad-stat-label">Tổng quiz</div>
              <div className="qvad-stat-value">{formatNumber(data.totalQuizzes)}</div>
              <div className="qvad-stat-note">{formatNumber(data.activeQuizzes)} quiz đang mở</div>
            </article>

            <article className="qvad-stat-card orange">
              <div className="qvad-stat-icon">
                <AdminIcon name="chart" />
              </div>
              <div className="qvad-stat-label">Lượt làm bài</div>
              <div className="qvad-stat-value">{formatNumber(data.totalAttempts)}</div>
              <div className="qvad-stat-note">{formatNumber(data.completedAttempts)} đã hoàn thành</div>
            </article>

            <article className="qvad-stat-card cyan">
              <div className="qvad-stat-icon">
                <AdminIcon name="feedback" />
              </div>
              <div className="qvad-stat-label">Feedback</div>
              <div className="qvad-stat-value">{formatNumber(data.totalFeedback)}</div>
              <div className="qvad-stat-note">{formatNumber(data.unreadFeedback)} feedback chưa đọc</div>
            </article>
          </section>

          {statisticsStatus === "pending" ? (
            <div className="qvad-state-card">Đang tải thống kê hệ thống...</div>
          ) : null}

          <section className="qvad-dashboard-grid">
            <article className="qvad-panel">
              <div className="qvad-panel-head">
                <div>
                  <h3>Tổng quan dữ liệu thật</h3>
                  <p>Biểu đồ 3D thể hiện các chỉ số chính từ backend.</p>
                </div>
                <div className="qvad-pill">Realtime</div>
              </div>

              <div className="qvad-chart-3d">
                {barItems.map((item) => {
                  const max = Math.max(...barItems.map((bar) => bar.value), 1);
                  const height = Math.max(18, Math.round((item.value / max) * 88));

                  return (
                    <div className="qvad-bar-wrap" key={item.label}>
                      <div
                        className="qvad-bar"
                        data-value={formatNumber(item.value)}
                        style={{
                          "--bar-height": `${height}%`,
                          "--bar-c1": item.c1,
                          "--bar-c2": item.c2,
                        } as CSSProperties}
                      />
                      <div className="qvad-bar-label">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </article>

            <div className="qvad-side-stack">
              <article className="qvad-panel">
                <div className="qvad-panel-head">
                  <div>
                    <h3>Tỷ lệ quiz</h3>
                    <p>Phân bổ trạng thái quiz trong hệ thống.</p>
                  </div>
                </div>

                <div className="qvad-donut-box">
                  <svg className="qvad-donut" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="qvadDonutGradient" x1="0" x2="1">
                        <stop offset="0%" stopColor="#6c63ff" />
                        <stop offset="55%" stopColor="#ff6584" />
                        <stop offset="100%" stopColor="#ffbd59" />
                      </linearGradient>
                    </defs>
                    <circle className="track" cx="60" cy="60" r="45" />
                    <circle
                      className="progress"
                      cx="60"
                      cy="60"
                      r="45"
                      style={{
                        strokeDashoffset: 282 - (activeQuizPercent / 100) * 282,
                      }}
                    />
                  </svg>

                  <div className="qvad-donut-info">
                    <strong>{activeQuizPercent}%</strong>
                    <span>Quiz đang hoạt động</span>
                  </div>
                </div>

                <div className="qvad-mini-list">
                  <div className="qvad-mini-item"><span>Đang hoạt động</span><strong>{formatNumber(data.activeQuizzes)}</strong></div>
                  <div className="qvad-mini-item"><span>Đã đóng</span><strong>{formatNumber(data.inactiveQuizzes)}</strong></div>
                  <div className="qvad-mini-item"><span>Đã xóa mềm</span><strong>{formatNumber(data.deletedQuizzes)}</strong></div>
                </div>
              </article>

              <article className="qvad-panel">
                <div className="qvad-panel-head">
                  <div>
                    <h3>Trạng thái nhanh</h3>
                    <p>Các chỉ số cần admin chú ý.</p>
                  </div>
                </div>

                <div className="qvad-mini-list">
                  <div className="qvad-mini-item"><span>User đang hoạt động</span><strong>{formatNumber(data.activeUsers)}</strong></div>
                  <div className="qvad-mini-item"><span>User bị khóa</span><strong>{formatNumber(data.lockedUsers)}</strong></div>
                  <div className="qvad-mini-item"><span>Tài khoản admin</span><strong>{formatNumber(data.totalAdmins)}</strong></div>
                  <div className="qvad-mini-item"><span>Feedback chưa đọc</span><strong>{formatNumber(data.unreadFeedback)}</strong></div>
                </div>
              </article>
            </div>

            <article className="qvad-panel qvad-line-card">
              <div className="qvad-panel-head">
                <div>
                  <h3>Sơ đồ hoạt động</h3>
                  <p>Đường biểu diễn các nhóm dữ liệu vận hành thật của hệ thống.</p>
                </div>
                <div className="qvad-pill">Backend data</div>
              </div>

              <div className="qvad-canvas-wrap">
                <canvas ref={canvasRef} />
                <div className="qvad-floating-chip">
                  Completed: {formatNumber(data.completedAttempts)}
                </div>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
