import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/loginSlice";
import { registerUser } from "../api/registerSlice";
import { type AppDispatch } from "../store/store";
import "../styles/auth.css";

type AuthMode = "login" | "register";
type Strength = {
  color: string;
  label: string;
  width: string;
};

type Particle = {
  color: string;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  z: number;
};

type BurstParticle = {
  color: string;
  life: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type AuthPageProps = {
  initialMode: AuthMode;
};

type ApiErrorPayload = {
  errors?: unknown;
  message?: unknown;
};

const particleColors = ["#6c63ff", "#ff6584", "#ffbd59", "#4de2ff"];

function Icon({ name }: { name: "email" | "lock" | "phone" | "user" }) {
  const commonProps = {
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "email") {
    return (
      <svg {...commonProps}>
        <rect height="16" rx="2" width="20" x="2" y="4" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...commonProps}>
        <rect height="11" rx="2" width="18" x="3" y="11" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.79.62 2.64a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.23-1.23a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.64.62A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function getPasswordStrength(value: string): Strength {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const states: Strength[] = [
    { color: "#ff4d6d", label: "Yeu", width: "25%" },
    { color: "#ffbd59", label: "Trung binh", width: "50%" },
    { color: "#4de2ff", label: "Manh", width: "75%" },
    { color: "#39e58c", label: "Rat manh", width: "100%" },
  ];

  return states[Math.max(0, score - 1)] ?? states[0];
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error;

  if (typeof error !== "object" || error === null) return fallback;

  const payload = error as ApiErrorPayload;

  if (
    payload.errors &&
    typeof payload.errors === "object" &&
    !Array.isArray(payload.errors)
  ) {
    const messages = Object.values(
      payload.errors as Record<string, unknown>,
    ).filter(
      (message): message is string =>
        typeof message === "string" && message.trim().length > 0,
    );

    if (messages.length > 0) return messages.join(". ");
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

export default function AuthPage({ initialMode }: AuthPageProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loadingForm, setLoadingForm] = useState<AuthMode | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState<"error" | "success">(
    "error",
  );
  const [loginIdentity, setLoginIdentity] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submittedLogin, setSubmittedLogin] = useState(false);
  const [submittedRegister, setSubmittedRegister] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let animationFrame = 0;
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let particles: Particle[] = [];
    const bursts: BurstParticle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      context.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0,
      );

      const particleCount = window.innerWidth < 700 ? 50 : 78;
      particles = Array.from({ length: particleCount }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 1.8 + 0.4,
        radius: Math.random() * 2.4 + 0.8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: particleColors[index % particleColors.length],
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        const dx = (pointer.x - window.innerWidth / 2) * 0.008 * particle.z;
        const dy = (pointer.y - window.innerHeight / 2) * 0.008 * particle.z;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = window.innerWidth + 20;
        if (particle.x > window.innerWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = window.innerHeight + 20;
        if (particle.y > window.innerHeight + 20) particle.y = -20;

        context.beginPath();
        context.arc(
          particle.x + dx,
          particle.y + dy,
          particle.radius * particle.z,
          0,
          Math.PI * 2,
        );
        context.fillStyle = particle.color;
        context.shadowBlur = 18;
        context.shadowColor = particle.color;
        context.fill();

        for (
          let nextIndex = index + 1;
          nextIndex < particles.length;
          nextIndex += 1
        ) {
          const nextParticle = particles[nextIndex];
          const distance = Math.hypot(
            particle.x - nextParticle.x,
            particle.y - nextParticle.y,
          );

          if (distance < 120) {
            context.beginPath();
            context.moveTo(particle.x + dx, particle.y + dy);
            context.lineTo(nextParticle.x, nextParticle.y);
            context.strokeStyle = `rgba(255,255,255,${(1 - distance / 120) * 0.14})`;
            context.lineWidth = 1;
            context.shadowBlur = 0;
            context.stroke();
          }
        }
      });

      for (let index = bursts.length - 1; index >= 0; index -= 1) {
        const burst = bursts[index];
        burst.life -= 0.025;
        burst.x += burst.vx;
        burst.y += burst.vy;

        context.beginPath();
        context.arc(
          burst.x,
          burst.y,
          burst.radius * burst.life,
          0,
          Math.PI * 2,
        );
        context.fillStyle = `rgba(255,255,255,${burst.life})`;
        context.shadowBlur = 24;
        context.shadowColor = burst.color;
        context.fill();

        if (burst.life <= 0) bursts.splice(index, 1);
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };

      document.querySelectorAll<HTMLElement>(".qv-auth-orb").forEach((orb) => {
        const depth = Number(orb.dataset.depth || 10);
        const x = (event.clientX - window.innerWidth / 2) / depth;
        const y = (event.clientY - window.innerHeight / 2) / depth;
        orb.style.translate = `${x}px ${y}px`;
      });
    };

    const handleClick = (event: MouseEvent) => {
      for (let index = 0; index < 18; index += 1) {
        const angle = (Math.PI * 2 * index) / 18;
        const speed = Math.random() * 4 + 2;
        bursts.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 3,
          life: 1,
          color: particleColors[index % particleColors.length],
        });
      }
    };

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const switchMode = (nextMode: AuthMode) => {
    setAuthMessage("");
    setMode(nextMode);
    navigate(nextMode === "login" ? "/login" : "/register");
  };

  const getLoginUsername = (value: string) => {
    const identity = value.trim();
    return identity.includes("@") ? identity.split("@")[0] : identity;
  };

  const handleLoginSubmit = async () => {
    setLoadingForm("login");
    setAuthMessage("");

    try {
      const user = await dispatch(
        loginUser({
          username: getLoginUsername(loginIdentity),
          password: loginPassword,
        }),
      ).unwrap();

      navigate(user.roles?.includes("ADMIN") ? "/admin/statistical" : "/");
    } catch (error) {
      setAuthMessageType("error");
      setAuthMessage(
        getAuthErrorMessage(
          error,
          "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản hoặc mật khẩu.",
        ),
      );
    } finally {
      setLoadingForm(null);
    }
  };

  const handleRegisterSubmit = async () => {
    setLoadingForm("register");
    setAuthMessage("");

    try {
      await dispatch(
        registerUser({
          username: email.trim().split("@")[0],
          password,
          email: email.trim(),
          fullName: fullName.trim(),
        }),
      ).unwrap();

      setMode("login");
      navigate("/login");
      setAuthMessageType("success");
      setAuthMessage("Đăng ký thành công. Vui lòng đăng nhập.");
      setLoginIdentity(email.trim().split("@")[0]);
      setLoginPassword("");
    } catch (error) {
      setAuthMessageType("error");
      setAuthMessage(getAuthErrorMessage(error, "Đăng ký thất bại."));
    } finally {
      setLoadingForm(null);
    }
  };

  const loginIdentityError = submittedLogin && !loginIdentity.trim();
  const loginPasswordError = submittedLogin && !loginPassword.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = !phone.trim() || /^[0-9+\-\s]{9,15}$/.test(phone);
  const passwordValid = password.length >= 8;
  const confirmValid =
    confirmPassword.length > 0 && confirmPassword === password;
  const strength = getPasswordStrength(password);

  return (
    <main
      className={`qv-auth-page ${mode === "register" ? "is-register" : ""}`}
    >
      <canvas ref={canvasRef} className="qv-auth-particles" />
      <div className="qv-auth-orb qv-auth-orb-1" data-depth="18" />
      <div className="qv-auth-orb qv-auth-orb-2" data-depth="-26" />
      <div className="qv-auth-orb qv-auth-orb-3" data-depth="12" />

      <section className="qv-auth-shell">
        <aside className="qv-auth-scene">
          <div className="qv-auth-brand">
            <div className="qv-auth-logo">Q</div>
            <span>Qivora</span>
          </div>

          <div className="qv-auth-copy">
            <h1>
              Học thông minh cùng <span>AI Quiz</span>
            </h1>
            <p>
              Tạo đề, luyện tập, đăng nhập nhanh và theo dõi tiến độ học tập
              trong một không gian hiện đại.
            </p>
          </div>

          <div className="qv-auth-floating-card">
            <strong>Lịch Sử Việt Nam</strong>
            <p>20 câu · Trung bình · 65%</p>
            <div>
              <i />
            </div>
          </div>
        </aside>

        <section className="qv-auth-form-zone">
          <div className="qv-auth-flip-wrap">
            <div className="qv-auth-flip-card">
              <article className="qv-auth-card qv-login-card">
                <div className="qv-auth-scroll-indicator" />
                <header className="qv-auth-card-head">
                  <div className="qv-auth-avatar">
                    <Icon name="user" />
                  </div>
                  <h2>Đăng nhập</h2>
                  <p>Chào mừng bạn quay lại với Qivora.</p>
                </header>

                <form
                  className="qv-auth-form"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubmittedLogin(true);
                    if (loginIdentity.trim() && loginPassword.trim())
                      void handleLoginSubmit();
                  }}
                >
                  <label
                    className={`qv-auth-field ${
                      loginIdentity.trim()
                        ? "is-success"
                        : loginIdentityError
                          ? "is-error"
                          : ""
                    }`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="user" />
                    </span>
                    <input
                      autoComplete="username"
                      onChange={(event) => setLoginIdentity(event.target.value)}
                      placeholder=" "
                      type="text"
                      value={loginIdentity}
                    />
                    <span className="qv-auth-label">Tên đăng nhập</span>
                    <span className="qv-auth-state">✓</span>
                    <small>Vui lòng nhập email hoặc tên đăng nhập</small>
                  </label>

                  <label
                    className={`qv-auth-field ${
                      loginPassword.trim()
                        ? "is-success"
                        : loginPasswordError
                          ? "is-error"
                          : ""
                    }`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="lock" />
                    </span>
                    <input
                      autoComplete="current-password"
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder=" "
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                    />
                    <span className="qv-auth-label">Mật khẩu</span>
                    <button
                      aria-label={
                        showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      className="qv-auth-toggle"
                      onClick={() => setShowLoginPassword((value) => !value)}
                      type="button"
                    >
                      {showLoginPassword ? "Ẩn" : "Hiện"}
                    </button>
                    <small>Vui lòng nhập mật khẩu</small>
                  </label>

                  <div className="qv-auth-meta">
                    <label>
                      <input type="checkbox" />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                    <a href="#forgot">Quên mật khẩu?</a>
                  </div>

                  <button
                    className={`qv-auth-btn qv-auth-primary ${loadingForm === "login" ? "is-loading" : ""}`}
                    disabled={loadingForm === "login"}
                  >
                    <span>Đăng nhập</span>
                    <i />
                  </button>

                  {authMessage ? (
                    <p className={`qv-auth-message is-${authMessageType}`}>
                      {authMessage}
                    </p>
                  ) : null}

                  <p className="qv-auth-switch">
                    Chưa có tài khoản?
                    <button
                      onClick={() => switchMode("register")}
                      type="button"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </form>
              </article>

              <article className="qv-auth-card qv-register-card">
                <div className="qv-auth-scroll-indicator" />
                <header className="qv-auth-card-head">
                  <div className="qv-auth-avatar qv-auth-avatar-alt">
                    <span>✦</span>
                  </div>
                  <h2>Đăng ký</h2>
                  <p>Tạo tài khoản để bắt đầu học tập cùng Qivora.</p>
                </header>

                <form
                  className="qv-auth-form"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubmittedRegister(true);
                    if (
                      fullName.trim().length >= 2 &&
                      emailValid &&
                      phoneValid &&
                      passwordValid &&
                      confirmValid &&
                      acceptedTerms
                    ) {
                      void handleRegisterSubmit();
                    }
                  }}
                >
                  <label
                    className={`qv-auth-field ${
                      fullName.trim().length >= 2
                        ? "is-success"
                        : submittedRegister
                          ? "is-error"
                          : ""
                    }`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="user" />
                    </span>
                    <input
                      autoComplete="name"
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder=" "
                      type="text"
                      value={fullName}
                    />
                    <span className="qv-auth-label">Họ và tên đầy đủ</span>
                    <span className="qv-auth-state">✓</span>
                    <small>Vui lòng nhập họ tên đầy đủ</small>
                  </label>

                  <label
                    className={`qv-auth-field ${
                      emailValid
                        ? "is-success"
                        : email || submittedRegister
                          ? "is-error"
                          : ""
                    }`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="email" />
                    </span>
                    <input
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder=" "
                      type="email"
                      value={email}
                    />
                    <span className="qv-auth-label">Email</span>
                    <span className="qv-auth-state">✓</span>
                    <small>Email chưa đúng định dạng</small>
                  </label>

                  <label
                    className={`qv-auth-field ${phoneValid && phone ? "is-success" : !phoneValid ? "is-error" : ""}`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="phone" />
                    </span>
                    <input
                      autoComplete="tel"
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder=" "
                      type="tel"
                      value={phone}
                    />
                    <span className="qv-auth-label">
                      Số điện thoại (không bắt buộc)
                    </span>
                    <span className="qv-auth-state">✓</span>
                    <small>Số điện thoại chưa hợp lệ</small>
                  </label>

                  <label
                    className={`qv-auth-field ${passwordValid ? "is-success" : password || submittedRegister ? "is-error" : ""}`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="lock" />
                    </span>
                    <input
                      autoComplete="new-password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder=" "
                      type={showRegisterPassword ? "text" : "password"}
                      value={password}
                    />
                    <span className="qv-auth-label">Mật khẩu</span>
                    <button
                      aria-label={
                        showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      className="qv-auth-toggle"
                      onClick={() => setShowRegisterPassword((value) => !value)}
                      type="button"
                    >
                      {showRegisterPassword ? "Ẩn" : "Hiện"}
                    </button>
                    <small>Mật khẩu cần tối thiểu 8 ký tự</small>
                  </label>

                  <div className="qv-auth-strength">
                    <div>
                      <i
                        style={{
                          background: strength.color,
                          width: password ? strength.width : "0%",
                        }}
                      />
                    </div>
                    <span>
                      {password
                        ? `Độ mạnh: ${strength.label}`
                        : "Nhập mật khẩu để kiểm tra độ mạnh"}
                    </span>
                  </div>

                  <label
                    className={`qv-auth-field ${confirmValid ? "is-success" : confirmPassword || submittedRegister ? "is-error" : ""}`}
                  >
                    <span className="qv-auth-icon">
                      <Icon name="lock" />
                    </span>
                    <input
                      autoComplete="new-password"
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder=" "
                      type="password"
                      value={confirmPassword}
                    />
                    <span className="qv-auth-label">Xác nhận mật khẩu</span>
                    <span className="qv-auth-state">
                      {confirmValid ? "✓" : "×"}
                    </span>
                    <small>Mật khẩu xác nhận chưa khớp</small>
                  </label>

                  <label
                    className={`qv-auth-terms ${submittedRegister && !acceptedTerms ? "is-error" : ""}`}
                  >
                    <input
                      checked={acceptedTerms}
                      onChange={(event) =>
                        setAcceptedTerms(event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>
                      Tôi đồng ý với <a href="#terms">điều khoản sử dụng</a>
                    </span>
                  </label>

                  <button
                    className={`qv-auth-btn qv-auth-primary ${loadingForm === "register" ? "is-loading" : ""}`}
                    disabled={loadingForm === "register"}
                  >
                    <span>Đăng ký ngay</span>
                    <i />
                  </button>

                  {authMessage ? (
                    <p className={`qv-auth-message is-${authMessageType}`}>
                      {authMessage}
                    </p>
                  ) : null}

                  <p className="qv-auth-switch">
                    Đã có tài khoản?
                    <button onClick={() => switchMode("login")} type="button">
                      Quay về đăng nhập
                    </button>
                  </p>
                </form>
              </article>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
