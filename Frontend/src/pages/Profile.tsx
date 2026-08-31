import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import {
  changeProfilePassword,
  clearProfileMessage,
  fetchProfile,
  updateProfileAvatar,
} from "../api/profileSlice";
import { resetUserState } from "../api/userSlice";
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

  return (
    <svg {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
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

function getErrorMessage(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Có lỗi xảy ra khi xử lý hồ sơ.";
}

function formatDate(value?: string) {
  if (!value) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Profile() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { avatarStatus, error, passwordStatus, status, successMessage, user } = useSelector(
    (state: RootState) => state.profile,
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [formError, setFormError] = useState("");

  const displayName = user?.fullName || user?.username || "Bạn";
  const initials = getInitials(user?.fullName, user?.username);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchProfile());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }
  }, [dispatch, navigate, status]);

  useEffect(() => {
    if (passwordStatus !== "fulfilled") return;

    const timer = window.setTimeout(() => {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [dispatch, navigate, passwordStatus]);

  useEffect(() => {
    if (!successMessage && !error && !formError) return;

    const timer = window.setTimeout(() => {
      dispatch(clearProfileMessage());
      setFormError("");
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [dispatch, error, formError, successMessage]);

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

      particles = Array.from({ length: window.innerWidth < 700 ? 42 : 70 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.1 + 0.7,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        z: Math.random() * 1.5 + 0.4,
        c: colors[index % colors.length],
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        const px = (pointer.x - window.innerWidth / 2) * 0.005 * particle.z;
        const py = (pointer.y - window.innerHeight / 2) * 0.005 * particle.z;

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

          if (distance < 118) {
            context.beginPath();
            context.moveTo(particle.x + px, particle.y + py);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(255,255,255,${(1 - distance / 118) * 0.11})`;
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
    navigate("/login");
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await dispatch(updateProfileAvatar(file));
    event.target.value = "";
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setFormError("Bạn cần nhập đầy đủ thông tin đổi mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError("Xác nhận mật khẩu mới chưa khớp.");
      return;
    }

    await dispatch(changeProfilePassword({ oldPassword, newPassword, confirmNewPassword }));
  };

  return (
    <main className="qvh-page">
      <canvas ref={canvasRef} className="qvh-particles" />

      {successMessage || error || formError ? (
        <div className={`qvp-toast ${error || formError ? "error" : ""}`}>
          {formError || getErrorMessage(error) || successMessage}
        </div>
      ) : null}

      <div className="qvh-app">
        <aside className="qvh-sidebar">
          <div className="qvh-brand">
            <div className="qvh-brand-mark">Q</div>
            <span>Qivora</span>
          </div>

          <nav className="qvh-nav">
            <button onClick={() => navigate("/")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="home" /></span>
              Trang chủ
            </button>
            <button onClick={() => navigate("/quiz-inventory")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="book" /></span>
              Kho quiz
            </button>
            <button onClick={() => navigate("/quiz-ai")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="ai" /></span>
              Tạo bằng AI
            </button>
            <button onClick={() => navigate("/quiz-manager")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="manage" /></span>
              Quản lí quiz cá nhân
            </button>
            <button className="active" type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="profile" /></span>
              Hồ sơ
            </button>
          </nav>

          <div className="qvh-side-card">
            <strong>Tài khoản Qivora</strong>
            <p>Quản lí thông tin cá nhân, ảnh đại diện và bảo mật tài khoản của bạn.</p>
          </div>
        </aside>

        <section className="qvh-main">
          <header className="qvh-topbar">
            <div className="qvh-profile-wrap">
              <button className="qvh-profile" onClick={() => setProfileOpen((value) => !value)} type="button">
                {user?.avatar ? (
                  <img alt={displayName} className="qvh-avatar" src={user.avatar} />
                ) : (
                  <div className="qvh-avatar">{initials}</div>
                )}
                <div>
                  <strong>{displayName}</strong>
                  <small>Thành viên Qivora</small>
                </div>
              </button>

              {profileOpen ? (
                <div className="qvh-profile-menu">
                  <strong>{displayName}</strong>
                  <span>{user?.email || user?.username || "Tài khoản Qivora"}</span>
                  <button onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <section className="qvp-page">
            <section className="qvp-hero">
              <div>
                <div className="qvh-eyebrow">User Profile</div>
                <h1>Hồ sơ <span>cá nhân</span></h1>
                <p>Xem thông tin tài khoản đang đăng nhập, đổi ảnh đại diện và cập nhật mật khẩu. Mật khẩu hiện tại không bao giờ hiển thị trên giao diện.</p>
              </div>

              <article className="qvp-avatar-card">
                <input accept="image/*" hidden onChange={handleAvatarChange} ref={avatarInputRef} type="file" />
                <button className="qvp-avatar-btn" onClick={() => avatarInputRef.current?.click()} type="button">
                  {user?.avatar ? <img alt={displayName} src={user.avatar} /> : initials}
                  <span>{avatarStatus === "pending" ? "Đang đổi..." : "Đổi ảnh"}</span>
                </button>
                <strong>{displayName}</strong>
                <small>@{user?.username || "qivora"}</small>
              </article>
            </section>

            <section className="qvp-grid">
              <article className="qvp-panel">
                <div className="qvp-panel-head">
                  <div>
                    <strong>Thông tin tài khoản</strong>
                    <span>Dữ liệu user đang đăng nhập</span>
                  </div>
                </div>

                <div className="qvp-info-grid">
                  <div className="qvp-info-item">
                    <span>Tên đăng nhập</span>
                    <strong>{user?.username || "Chưa có dữ liệu"}</strong>
                  </div>

                  <div className="qvp-info-item">
                    <span>Họ và tên</span>
                    <strong>{user?.fullName || "Chưa cập nhật"}</strong>
                  </div>

                  <div className="qvp-info-item">
                    <span>Email</span>
                    <strong>{user?.email || "Chưa có dữ liệu"}</strong>
                  </div>

                  <div className="qvp-info-item">
                    <span>Trạng thái</span>
                    <strong>{user?.isActive === false ? "Đã khóa" : "Đang hoạt động"}</strong>
                  </div>

                  <div className="qvp-info-item">
                    <span>Ngày tạo tài khoản</span>
                    <strong>{formatDate(user?.createdAt)}</strong>
                  </div>
                </div>

                <div className="qvp-badge-row">
                  {(user?.roles?.length ? user.roles : ["USER"]).map((role) => (
                    <span className="qvp-badge" key={role}>{role}</span>
                  ))}
                  <span className="qvp-badge">Active</span>
                </div>
              </article>

              <aside className="qvp-panel qvp-security-card">
                <div className="qvp-panel-head">
                  <div>
                    <strong>Bảo mật</strong>
                    <span>Đổi mật khẩu tài khoản</span>
                  </div>
                </div>

                <div className="qvp-security-box">
                  <strong>Mật khẩu</strong>
                  <p>Mật khẩu không được hiển thị. Bạn có thể đổi mật khẩu bằng cách xác nhận mật khẩu hiện tại.</p>
                </div>

                <button className="qvp-password-btn" onClick={() => setPasswordFormOpen(true)} type="button">
                  Đổi mật khẩu
                </button>

                {passwordFormOpen ? (
                  <form className="qvp-change-form" onSubmit={handleChangePassword}>
                    <label className="qvp-field">
                      <span>Mật khẩu hiện tại</span>
                      <input onChange={(event) => setOldPassword(event.target.value)} placeholder="Nhập mật khẩu hiện tại" type="password" value={oldPassword} />
                    </label>

                    <label className="qvp-field">
                      <span>Mật khẩu mới</span>
                      <input onChange={(event) => setNewPassword(event.target.value)} placeholder="Nhập mật khẩu mới" type="password" value={newPassword} />
                    </label>

                    <label className="qvp-field">
                      <span>Xác nhận mật khẩu mới</span>
                      <input onChange={(event) => setConfirmNewPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" type="password" value={confirmNewPassword} />
                    </label>

                    <div className="qvp-form-actions">
                      <button
                        className="qvp-ghost-btn"
                        onClick={() => {
                          setPasswordFormOpen(false);
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                          setFormError("");
                        }}
                        type="button"
                      >
                        Hủy
                      </button>
                      <button className="qvp-primary-btn" disabled={passwordStatus === "pending"} type="submit">
                        {passwordStatus === "pending" ? "Đang cập nhật..." : "Cập nhật"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </aside>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}
