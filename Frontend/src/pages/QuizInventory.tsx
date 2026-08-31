import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchSystemQuizzes } from "../api/systemQuizSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
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

type QuizView = "join" | "library";

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

function getSystemQuizIcon(title: string) {
  return title
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
  return "Không lấy được danh sách quiz trong hệ thống.";
}

function QuizLockIcon({ locked }: { locked: boolean }) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24">
      {locked ? (
        <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      ) : (
        <path d="M8 10V8a4 4 0 0 1 7.5-2" />
      )}
      <rect height="10" rx="2.5" width="14" x="5" y="10" />
      <path d="M12 14v2" />
    </svg>
  );
}

export default function QuizInventory() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser, status } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const {
    error: systemQuizError,
    first,
    last,
    page,
    quizzes,
    status: systemQuizStatus,
    totalElements,
    totalPages,
  } = useSelector((state: RootState) => state.systemQuiz);
  const [profileOpen, setProfileOpen] = useState(false);
  const [view, setView] = useState<QuizView>("join");
  const [quizId, setQuizId] = useState("");

  const displayName = currentUser?.fullName || currentUser?.username || "Bạn";

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }
  }, [dispatch, navigate, status]);

  useEffect(() => {
    if (view === "library") {
      void dispatch(fetchSystemQuizzes({ page: 0, size: 6 }));
    }
  }, [dispatch, view]);

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

      particles = Array.from({ length: window.innerWidth < 700 ? 44 : 72 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
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
            context.strokeStyle = `rgba(255,255,255,${(1 - distance / 120) * 0.12})`;
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

  const handleJoinQuiz = (code: string) => {
    if (!code.trim()) return;
    navigate(`/take-quiz/${encodeURIComponent(code.trim())}`);
  };

  const handleChangeSystemQuizPage = (nextPage: number) => {
    if (nextPage < 0 || (totalPages > 0 && nextPage >= totalPages)) return;
    void dispatch(fetchSystemQuizzes({ page: nextPage, size: 6 }));
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
            <button onClick={() => navigate("/")} type="button">
              <span className="qvh-nav-icon">
                <DashboardIcon name="home" />
              </span>
              Trang chủ
            </button>
            <button className="active" type="button">
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
            <p>Nhập ID quiz ở giữa màn hình để vào làm nhanh, hoặc mở kho hệ thống để chọn bài.</p>
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

          <section className="qi-page">
            <header className="qi-header">
              <div className="qi-title">
                <strong>Kho quiz</strong>
                <span>Vào bài nhanh hoặc chọn quiz trong hệ thống</span>
              </div>

              <div className="qi-tabs">
                <button className={view === "join" ? "active" : ""} onClick={() => setView("join")} type="button">
                  Vào bằng ID
                </button>
                <button className={view === "library" ? "active" : ""} onClick={() => setView("library")} type="button">
                  Kho hệ thống
                </button>
              </div>

              <div className="qi-action">
                <button className="qi-ghost-pill" onClick={() => navigate("/quiz-create")} type="button">
                  Tạo quiz mới
                </button>
              </div>
            </header>

            {view === "join" ? (
              <section className="qi-view qi-join-view">
                <div className="qi-orb qi-orb-1" />
                <div className="qi-orb qi-orb-2" />

                <div className="qi-join-center">
                  <article className="qi-join-card">
                    <div className="qi-join-content">
                      <div className="qvh-eyebrow">Nhập mã để vào phòng quiz</div>
                      <h1>Vào quiz bằng <span>ID</span></h1>
                      <p>Nhập mã quiz được chia sẻ để bắt đầu làm bài ngay. Giao diện này chỉ tập trung vào một thao tác duy nhất.</p>

                      <form
                        className="qi-id-box"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleJoinQuiz(quizId);
                        }}
                      >
                        <input
                          autoComplete="off"
                          onChange={(event) => setQuizId(event.target.value)}
                          placeholder="VD: QV-2048"
                          type="text"
                          value={quizId}
                        />
                        <button aria-label="Vào quiz" type="submit">→</button>
                      </form>
                    </div>
                  </article>
                </div>
              </section>
            ) : (
              <section className="qi-view">
                <div className="qi-library-head">
                  <div>
                    <div className="qvh-eyebrow">Danh sách quiz trong hệ thống</div>
                    <h1>Kho quiz Qivora</h1>
                    <p>Chọn nhanh một bài quiz có sẵn trong hệ thống, xem trạng thái khóa, số câu và mã bài trước khi bắt đầu.</p>
                  </div>
                </div>

                {systemQuizStatus === "pending" ? (
                  <div className="qi-state-card">Đang tải kho quiz hệ thống...</div>
                ) : null}

                {systemQuizError ? (
                  <div className="qi-state-card error">{getErrorMessage(systemQuizError)}</div>
                ) : null}

                {systemQuizStatus !== "pending" && !systemQuizError && quizzes.length === 0 ? (
                  <div className="qi-state-card">Chưa có quiz nào trong hệ thống.</div>
                ) : null}

                {quizzes.length > 0 ? (
                  <div className="qi-grid">
                    {quizzes.map((quiz) => (
                    <article className="qi-card" key={quiz.code}>
                      <div className="qi-meta">
                        <div className="qi-subject-icon">{getSystemQuizIcon(quiz.title)}</div>
                        <span className={`qi-lock-badge ${quiz.hasPassword ? "locked" : "open"}`}>
                          <QuizLockIcon locked={quiz.hasPassword} />
                        </span>
                      </div>
                      <h3>{quiz.title}</h3>
                      <p>{quiz.description || "Quiz luyện tập được chia sẻ trong hệ thống Qivora."}</p>
                      <div className="qi-info">
                        <span>{quiz.totalQuestions} câu</span>
                        <span>{quiz.timeLimit} phút</span>
                        <span>{quiz.creatorFullName || quiz.creatorUsername || "Qivora"}</span>
                      </div>
                      <div className="qi-footer">
                        <span className="qi-code">ID: {quiz.code}</span>
                        <button className="qi-join-btn" onClick={() => handleJoinQuiz(quiz.code)} type="button">
                          Vào làm
                        </button>
                      </div>
                    </article>
                    ))}
                  </div>
                ) : null}

                {totalPages > 0 ? (
                  <div className="qi-pagination">
                    <span>{totalElements} quiz</span>
                    <button
                      disabled={first || systemQuizStatus === "pending"}
                      onClick={() => handleChangeSystemQuizPage(page - 1)}
                      type="button"
                    >
                      Trước
                    </button>
                    <strong>{page + 1} / {totalPages}</strong>
                    <button
                      disabled={last || systemQuizStatus === "pending"}
                      onClick={() => handleChangeSystemQuizPage(page + 1)}
                      type="button"
                    >
                      Sau
                    </button>
                  </div>
                ) : null}
              </section>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
