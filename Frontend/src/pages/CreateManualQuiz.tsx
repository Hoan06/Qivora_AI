import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createManualQuiz, resetManualQuizState } from "../api/manualQuizSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type CreateManualQuizRequest } from "../utils/Types";
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

type DraftAnswer = {
  id: string;
  content: string;
  isCorrect: boolean;
};

type DraftQuestion = {
  id: string;
  content: string;
  score: number;
  explanation: string;
  answers: DraftAnswer[];
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

function createQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    content: "",
    score: 1,
    explanation: "",
    answers: [
      { id: crypto.randomUUID(), content: "", isCorrect: true },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
    ],
  };
}

function getErrorMessage(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Tạo quiz thất bại. Kiểm tra lại dữ liệu và backend.";
}

export default function CreateManualQuiz() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const aiDraft = (location.state as { aiDraft?: CreateManualQuizRequest } | null)?.aiDraft;
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { error, quiz, status } = useSelector((state: RootState) => state.manualQuiz);
  const [profileOpen, setProfileOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([createQuestion()]);
  const [formError, setFormError] = useState("");

  const displayName = currentUser?.fullName || currentUser?.username || "Bạn";
  const totalScore = useMemo(() => questions.reduce((sum, question) => sum + Number(question.score || 0), 0), [questions]);

  useEffect(() => {
    dispatch(resetManualQuizState());

    if (!aiDraft) return;

    setTitle(aiDraft.title || "");
    setDescription(aiDraft.description || "");
    setTimeLimit(aiDraft.timeLimit || 15);
    setHasPassword(Boolean(aiDraft.password));
    setPassword(aiDraft.password || "");
    setStartedAt(aiDraft.startedAt || "");
    setEndedAt(aiDraft.endedAt || "");
    setQuestions(
      aiDraft.questions?.length
        ? aiDraft.questions.map((question) => ({
            id: crypto.randomUUID(),
            content: question.content,
            score: question.score,
            explanation: question.explanation || "",
            answers: question.answers.map((answer) => ({
              id: crypto.randomUUID(),
              content: answer.content,
              isCorrect: answer.isCorrect,
            })),
          }))
        : [createQuestion()],
    );
  }, [aiDraft, dispatch]);

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
    dispatch(resetManualQuizState());
    navigate("/login");
  };

  const updateQuestion = (questionId: string, patch: Partial<DraftQuestion>) => {
    setQuestions((current) => current.map((question) => (question.id === questionId ? { ...question, ...patch } : question)));
  };

  const updateAnswer = (questionId: string, answerId: string, patch: Partial<DraftAnswer>) => {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question;

        return {
          ...question,
          answers: question.answers.map((answer) => (answer.id === answerId ? { ...answer, ...patch } : answer)),
        };
      }),
    );
  };

  const selectCorrectAnswer = (questionId: string, answerId: string) => {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question;

        return {
          ...question,
          answers: question.answers.map((answer) => ({
            ...answer,
            isCorrect: answer.id === answerId,
          })),
        };
      }),
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => (current.length === 1 ? current : current.filter((question) => question.id !== questionId)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Bạn cần nhập tên quiz.");
      return;
    }

    const hasInvalidQuestion = questions.some(
      (question) =>
        !question.content.trim() ||
        Number(question.score) < 1 ||
        question.answers.length < 2 ||
        question.answers.some((answer) => !answer.content.trim()) ||
        !question.answers.some((answer) => answer.isCorrect),
    );

    if (hasInvalidQuestion) {
      setFormError("Mỗi câu hỏi cần có nội dung, điểm, ít nhất 2 đáp án và 1 đáp án đúng.");
      return;
    }

    await dispatch(
      createManualQuiz({
        title: title.trim(),
        description: description.trim() || undefined,
        timeLimit: Number(timeLimit),
        password: hasPassword && password.trim() ? password.trim() : undefined,
        startedAt: startedAt || undefined,
        endedAt: endedAt || undefined,
        questions: questions.map((question) => ({
          content: question.content.trim(),
          score: Number(question.score),
          explanation: question.explanation.trim() || undefined,
          answers: question.answers.map((answer) => ({
            content: answer.content.trim(),
            isCorrect: answer.isCorrect,
          })),
        })),
      }),
    );
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
            <button className="active" onClick={() => navigate("/quiz-inventory")} type="button">
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
            <strong>Tạo thủ công</strong>
            <p>Soạn câu hỏi, chọn đáp án đúng và chia sẻ ID quiz cho lớp hoặc nhóm học.</p>
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

          <section className="qmc-page">
            {!quiz ? (
              <form className="qmc-layout" onSubmit={handleSubmit}>
                <section className="qmc-builder">
                  <div className="qmc-hero">
                    <div>
                      <div className="qvh-eyebrow">Tạo quiz thủ công</div>
                      <h1>Soạn quiz mới</h1>
                      <p>Nhập thông tin bài quiz, thêm câu hỏi và chọn đáp án đúng. Mật khẩu quiz có thể bật hoặc bỏ qua.</p>
                    </div>
                    <div className="qmc-mini-card">
                      <span>Tổng quan</span>
                      <strong>{questions.length} câu</strong>
                      <small>{totalScore} điểm • {timeLimit} phút</small>
                    </div>
                  </div>

                  <div className="qmc-panel">
                    <div className="qmc-field-grid">
                      <label className="qmc-field qmc-field-wide">
                        <span>Tên quiz</span>
                        <input onChange={(event) => setTitle(event.target.value)} placeholder="VD: Ôn tập Lịch Sử Việt Nam" type="text" value={title} />
                      </label>
                      <label className="qmc-field">
                        <span>Thời gian làm bài</span>
                        <input min={1} onChange={(event) => setTimeLimit(Number(event.target.value))} type="number" value={timeLimit} />
                      </label>
                      <label className="qmc-field">
                        <span>Mở quiz từ</span>
                        <input onChange={(event) => setStartedAt(event.target.value)} type="datetime-local" value={startedAt} />
                      </label>
                      <label className="qmc-field">
                        <span>Đóng quiz lúc</span>
                        <input onChange={(event) => setEndedAt(event.target.value)} type="datetime-local" value={endedAt} />
                      </label>
                      <label className="qmc-field qmc-field-wide">
                        <span>Mô tả</span>
                        <textarea onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả ngắn để người làm hiểu nội dung quiz" value={description} />
                      </label>
                    </div>

                    <div className="qmc-password-row">
                      <button className={hasPassword ? "active" : ""} onClick={() => setHasPassword((value) => !value)} type="button">
                        {hasPassword ? "Đang bật mật khẩu" : "Không dùng mật khẩu"}
                      </button>
                      {hasPassword ? (
                        <input onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu quiz" type="text" value={password} />
                      ) : (
                        <span>Người có ID quiz có thể vào làm nếu quiz đang mở.</span>
                      )}
                    </div>
                  </div>

                  <div className="qmc-question-list">
                    {questions.map((question, questionIndex) => (
                      <article className="qmc-question-card" key={question.id}>
                        <div className="qmc-question-head">
                          <div>
                            <span>Câu {questionIndex + 1}</span>
                            <strong>{question.content.trim() || "Câu hỏi mới"}</strong>
                          </div>
                          <button disabled={questions.length === 1} onClick={() => removeQuestion(question.id)} type="button">
                            Xóa
                          </button>
                        </div>

                        <label className="qmc-field">
                          <span>Nội dung câu hỏi</span>
                          <textarea onChange={(event) => updateQuestion(question.id, { content: event.target.value })} placeholder="Nhập câu hỏi..." value={question.content} />
                        </label>

                        <div className="qmc-question-meta">
                          <label className="qmc-field">
                            <span>Điểm</span>
                            <input min={1} onChange={(event) => updateQuestion(question.id, { score: Number(event.target.value) })} type="number" value={question.score} />
                          </label>
                          <label className="qmc-field">
                            <span>Giải thích sau khi làm</span>
                            <input onChange={(event) => updateQuestion(question.id, { explanation: event.target.value })} placeholder="Không bắt buộc" type="text" value={question.explanation} />
                          </label>
                        </div>

                        <div className="qmc-answer-grid">
                          {question.answers.map((answer, answerIndex) => (
                            <label className={answer.isCorrect ? "qmc-answer active" : "qmc-answer"} key={answer.id}>
                              <input checked={answer.isCorrect} onChange={() => selectCorrectAnswer(question.id, answer.id)} type="radio" />
                              <span>{String.fromCharCode(65 + answerIndex)}</span>
                              <input
                                onChange={(event) => updateAnswer(question.id, answer.id, { content: event.target.value })}
                                placeholder={`Đáp án ${String.fromCharCode(65 + answerIndex)}`}
                                type="text"
                                value={answer.content}
                              />
                            </label>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="qmc-control">
                  <div className="qmc-control-card">
                    <strong>Bảng điều khiển</strong>
                    <p>Tạo xong quiz sẽ chuyển sang màn hình quản lý để xem ID chia sẻ và kết quả người làm.</p>
                    <div className="qmc-control-stats">
                      <span>{questions.length}<small>Câu hỏi</small></span>
                      <span>{totalScore}<small>Điểm</small></span>
                      <span>{timeLimit}<small>Phút</small></span>
                    </div>
                    {(formError || error) ? <div className="qmc-error">{formError || getErrorMessage(error)}</div> : null}
                    <button className="qmc-add-btn" onClick={() => setQuestions((current) => [...current, createQuestion()])} type="button">
                      + Thêm câu hỏi
                    </button>
                    <div className="qmc-submit-row">
                      <button className="qmc-secondary" onClick={() => navigate("/quiz-inventory")} type="button">
                        Hủy
                      </button>
                      <button className="qmc-primary" disabled={status === "pending"} type="submit">
                        {status === "pending" ? "Đang tạo..." : "Tạo quiz"}
                      </button>
                    </div>
                  </div>
                </aside>
              </form>
            ) : (
              <section className="qmc-manage">
                <div className="qmc-manage-hero">
                  <div>
                    <div className="qvh-eyebrow">Quản lý quiz</div>
                    <h1>{quiz.title}</h1>
                    <p>Quiz đã được tạo. Bạn có thể gửi ID bên dưới cho người khác vào làm.</p>
                  </div>
                  <button className="qmc-secondary" onClick={() => navigate("/quiz-inventory")} type="button">
                    Về kho quiz
                  </button>
                </div>

                <div className="qmc-share-card">
                  <span>ID quiz</span>
                  <strong>{quiz.code || quiz.id}</strong>
                  <button
                    onClick={() => {
                      void navigator.clipboard?.writeText(quiz.code || String(quiz.id));
                    }}
                    type="button"
                  >
                    Sao chép ID
                  </button>
                </div>

                <div className="qmc-result-panel">
                  <div className="qmc-result-head">
                    <div>
                      <strong>Kết quả người làm</strong>
                      <span>Danh sách tài khoản đã hoàn thành quiz này</span>
                    </div>
                    <span>{quiz.questions.length} câu • {quiz.timeLimit} phút</span>
                  </div>

                  <div className="qmc-empty-result">
                    <strong>Chưa có lượt làm nào</strong>
                    <p>Khi backend có API trả kết quả theo quiz này, danh sách tên tài khoản và điểm sẽ hiển thị ở đây.</p>
                  </div>
                </div>
              </section>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
