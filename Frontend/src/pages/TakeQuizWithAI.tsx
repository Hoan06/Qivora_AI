import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateQuizDraftByAi, resetAiQuizState } from "../api/aiQuizSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
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

function DashboardIcon({
  name,
}: {
  name: "ai" | "book" | "home" | "manage" | "profile";
}) {
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
  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "AI tạo quiz thất bại. Kiểm tra backend hoặc API key.";
}

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export default function TakeQuizWithAI() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const limitNoticeTimerRef = useRef<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error, status } = useSelector((state: RootState) => state.aiQuiz);
  const { currentUser, status: userStatus } = useSelector(
    (state: RootState) => state.user,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const [profileOpen, setProfileOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Trung bình");
  const [questionCount, setQuestionCount] = useState(10);
  const [answerCount, setAnswerCount] = useState(4);
  const [timeLimit, setTimeLimit] = useState(15);
  const [loadingText, setLoadingText] = useState("AI đang chuẩn bị dữ liệu...");
  const [loadingStep, setLoadingStep] = useState<"idle" | "3" | "5" | "10">(
    "idle",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [limitNotice, setLimitNotice] = useState("");

  const displayName = currentUser?.fullName || currentUser?.username || "Bạn";

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }
  }, [dispatch, navigate, userStatus]);

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
      context.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0,
      );

      particles = Array.from(
        { length: window.innerWidth < 700 ? 44 : 72 },
        (_, index) => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2.2 + 0.8,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          z: Math.random() * 1.5 + 0.4,
          c: colors[index % colors.length],
        }),
      );
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
        context.arc(
          particle.x + px,
          particle.y + py,
          particle.r * particle.z,
          0,
          Math.PI * 2,
        );
        context.fillStyle = particle.c;
        context.shadowBlur = 18;
        context.shadowColor = particle.c;
        context.fill();

        for (
          let nextIndex = index + 1;
          nextIndex < particles.length;
          nextIndex += 1
        ) {
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

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (limitNoticeTimerRef.current) {
        window.clearTimeout(limitNoticeTimerRef.current);
      }
      dispatch(resetAiQuizState());
    };
  }, [dispatch]);

  const showLimitNotice = (message: string) => {
    setLimitNotice(message);

    if (limitNoticeTimerRef.current) {
      window.clearTimeout(limitNoticeTimerRef.current);
    }

    limitNoticeTimerRef.current = window.setTimeout(() => {
      setLimitNotice("");
      limitNoticeTimerRef.current = null;
    }, 2400);
  };

  const startLoadingMessages = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    setLoadingStep("idle");
    setLoadingText("AI đang chuẩn bị dữ liệu...");

    timersRef.current = [
      window.setTimeout(() => {
        setLoadingStep("3");
        setLoadingText("Load dữ liệu yêu cầu...");
      }, 3000),
      window.setTimeout(() => {
        setLoadingStep("5");
        setLoadingText("Phân tích dữ liệu...");
      }, 5000),
      window.setTimeout(() => {
        setLoadingStep("10");
        setLoadingText("Tạo quiz theo yêu cầu...");
      }, 10000),
    ];
  };

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    startLoadingMessages();

    try {
      const [draft] = await Promise.all([
        dispatch(
          generateQuizDraftByAi({
            topic: topic.trim(),
            description: description.trim() || undefined,
            difficulty,
            questionCount: Number(questionCount),
            answerCount: Number(answerCount),
            timeLimit: Number(timeLimit),
          }),
        ).unwrap(),
        wait(10500),
      ]);

      navigate("/quiz-create", { state: { aiDraft: draft } });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <main className="qvh-page">
      <canvas ref={canvasRef} className="qvh-particles" />

      {limitNotice ? (
        <div className="qvai-limit-toast">{limitNotice}</div>
      ) : null}

      {isLoading ? (
        <div className="qvai-loading-overlay">
          <div className="qvai-loading-card">
            <div className="qvai-loading-scene">
              <div className="qvai-ring" />
              <div className="qvai-ring two" />
              <div className="qvai-loader-core">AI</div>
            </div>
            <h2>Đang tạo quiz</h2>
            <p>{loadingText}</p>
            <div className="qvai-loading-steps">
              <div
                className={
                  loadingStep === "3"
                    ? "active"
                    : loadingStep === "5" || loadingStep === "10"
                      ? "done"
                      : ""
                }
              >
                <i /> Load dữ liệu yêu cầu...
              </div>
              <div
                className={
                  loadingStep === "5"
                    ? "active"
                    : loadingStep === "10"
                      ? "done"
                      : ""
                }
              >
                <i /> Phân tích dữ liệu...
              </div>
              <div className={loadingStep === "10" ? "active" : ""}>
                <i /> Tạo quiz theo yêu cầu...
              </div>
            </div>
          </div>
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
            <button className="active" type="button">
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
            <strong>Tạo quiz bằng AI</strong>
            <p>
              Nhập chủ đề, độ khó và số câu. AI sẽ tạo bản nháp để bạn kiểm tra
              trước khi lưu.
            </p>
          </div>
        </aside>

        <section className="qvh-main">
          <header className="qvh-topbar">
            <div className="qvh-profile-wrap">
              <button
                className="qvh-profile"
                onClick={() => setProfileOpen((value) => !value)}
                type="button"
              >
                {currentUser?.avatar ? (
                  <img
                    alt={displayName}
                    className="qvh-avatar"
                    src={currentUser.avatar}
                  />
                ) : (
                  <div className="qvh-avatar">
                    {getInitials(currentUser?.fullName, currentUser?.username)}
                  </div>
                )}
                <div>
                  <strong>{displayName}</strong>
                  <small>Thành viên Qivora</small>
                </div>
              </button>

              {profileOpen ? (
                <div className="qvh-profile-menu">
                  <strong>{displayName}</strong>
                  <span>
                    {currentUser?.email ||
                      currentUser?.username ||
                      "Tài khoản Qivora"}
                  </span>
                  <button onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <section className="qvai-page">
            <div className="qvai-hero">
              <div>
                <div className="qvh-eyebrow">GenAI Quiz Builder</div>
                <h1>
                  Tạo quiz bằng <span>AI</span>
                </h1>
                <p>
                  Trò chuyện với AI bằng các yêu cầu rõ ràng. Qivora sẽ tạo bản
                  nháp quiz, sau đó đưa sang trang tạo thủ công để bạn kiểm tra
                  và bấm tạo.
                </p>
              </div>

              <div className="qvai-orb-card">
                <div>AI</div>
              </div>
            </div>

            <div className="qvai-content-grid">
              <article className="qvai-chat-card">
                <div className="qvai-chat-head">
                  <div>
                    <strong>Yêu cầu tạo quiz</strong>
                    <span>
                      Dữ liệu request: topic, description, difficulty,
                      questionCount, answerCount, timeLimit
                    </span>
                  </div>
                  <div>Germini</div>
                </div>

                <form className="qvai-form" onSubmit={handleSubmit}>
                  <div className="qvai-prompt-bubble">
                    <i>Q</i>
                    <p>
                      Hãy mô tả quiz bạn muốn tạo. Chủ đề càng rõ, AI tạo câu
                      hỏi càng sát nhu cầu học tập.
                    </p>
                  </div>

                  <div className="qvai-field-grid">
                    <label className="qvai-field wide">
                      <span>Chủ đề quiz *</span>
                      <input
                        onChange={(event) => setTopic(event.target.value)}
                        placeholder="VD: Lịch sử Việt Nam giai đoạn 1945 - 1975"
                        required
                        value={topic}
                      />
                    </label>

                    <label className="qvai-field wide">
                      <span>Mô tả thêm</span>
                      <textarea
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="VD: Tập trung vào sự kiện chính, nhân vật lịch sử, mốc thời gian quan trọng..."
                        value={description}
                      />
                    </label>

                    <label className="qvai-field">
                      <span>Độ khó</span>
                      <select
                        onChange={(event) => setDifficulty(event.target.value)}
                        value={difficulty}
                      >
                        <option>Dễ</option>
                        <option>Trung bình</option>
                        <option>Khó</option>
                      </select>
                    </label>

                    <label className="qvai-field">
                      <span>Số câu hỏi</span>
                      <input
                        max={50}
                        min={1}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (value > 50) {
                            showLimitNotice("Số câu hỏi tối đa là 50 câu.");
                          }
                          if (value < 1) {
                            showLimitNotice("Số câu hỏi tối thiểu là 1 câu.");
                          }
                          setQuestionCount(Math.min(50, Math.max(1, value)));
                        }}
                        type="number"
                        value={questionCount}
                      />
                    </label>

                    <label className="qvai-field">
                      <span>Số đáp án mỗi câu</span>
                      <input
                        max={6}
                        min={2}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (value > 6) {
                            showLimitNotice("Mỗi câu tối đa 6 đáp án.");
                          }
                          if (value < 2) {
                            showLimitNotice("Mỗi câu cần ít nhất 2 đáp án.");
                          }
                          setAnswerCount(Math.min(6, Math.max(2, value)));
                        }}
                        type="number"
                        value={answerCount}
                      />
                    </label>

                    <label className="qvai-field">
                      <span>Thời gian làm bài phút</span>
                      <input
                        min={1}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (value < 1) {
                            showLimitNotice("Thời gian làm bài tối thiểu là 1 phút.");
                          }
                          setTimeLimit(Math.max(1, value));
                        }}
                        type="number"
                        value={timeLimit}
                      />
                    </label>
                  </div>

                  {error ? (
                    <div className="qmc-error">{getErrorMessage(error)}</div>
                  ) : null}

                  <div className="qvai-submit-row">
                    <span>
                      Sau khi AI tạo xong, bạn sẽ kiểm tra lại ở trang tạo quiz
                      thủ công.
                    </span>
                    <button
                      disabled={status === "pending" || isLoading}
                      type="submit"
                    >
                      {status === "pending" || isLoading
                        ? "Đang gửi..."
                        : "Gửi yêu cầu cho AI"}
                    </button>
                  </div>
                </form>
              </article>

              <aside className="qvai-side-panel">
                <div className="qvai-mini-panel">
                  <strong>Cách viết prompt tốt</strong>
                  <p>
                    Nêu rõ chủ đề, phạm vi kiến thức, cấp học hoặc mục tiêu ôn
                    tập để AI tạo câu hỏi ít bị lan man.
                  </p>
                </div>

                <div className="qvai-stat-grid">
                  <div>
                    <strong>{questionCount}</strong>
                    <span>Câu hỏi</span>
                  </div>
                  <div>
                    <strong>{answerCount}</strong>
                    <span>Đáp án/câu</span>
                  </div>
                </div>

                <div className="qvai-mini-panel">
                  <strong>Luồng xử lý</strong>
                  <p>
                    AI tạo bản nháp, Qivora đổ dữ liệu vào form thủ công, bạn
                    xem lại rồi bấm tạo quiz để lưu.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
