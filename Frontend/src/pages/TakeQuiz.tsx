import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearTakeQuizError,
  fetchQuizSummary,
  resetTakeQuizState,
  startQuizAttempt,
  submitQuizAttempt,
} from "../api/takeQuizSlice";
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

type SelectedAnswer = {
  answerId: number;
  questionId: number;
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

function getErrorMessage(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Có lỗi xảy ra, kiểm tra lại backend hoặc mã quiz.";
}

function formatTime(secondsValue: number) {
  const safeSeconds = Math.max(secondsValue, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TakeQuiz() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoStartedRef = useRef(false);
  const submitTriggeredRef = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizKey = "" } = useParams();
  const { attemptId, error, quiz, result, startStatus, submitStatus, summary, summaryStatus } = useSelector(
    (state: RootState) => state.takeQuiz,
  );
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [guestName, setGuestName] = useState("");
  const [password, setPassword] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const currentQuestion = quiz?.questions[currentIndex];
  const quizTitle = result?.quizTitle || quiz?.title || summary?.title || "Làm quiz";
  const totalQuestions = quiz?.questions.length || summary?.totalQuestions || 0;
  const needsGate = !quiz && summary && (!isLoggedIn || summary.hasPassword);
  const canStart = isLoggedIn || guestName.trim().length > 0;
  const canPassPassword = !summary?.hasPassword || password.trim().length > 0;
  const selectedForCurrent = currentQuestion
    ? answers.find((answer) => answer.questionId === currentQuestion.id)
    : undefined;

  const scoreText = useMemo(() => {
    if (!result) return "0/0";
    return `${Number(result.score || 0)}/${result.questions.reduce((sum, question) => sum + question.score, 0)}`;
  }, [result]);

  useEffect(() => {
    if (!quizKey.trim()) {
      navigate("/");
      return;
    }

    dispatch(resetTakeQuizState());
    void dispatch(fetchQuizSummary(quizKey));

    return () => {
      dispatch(resetTakeQuizState());
    };
  }, [dispatch, navigate, quizKey]);

  useEffect(() => {
    if (!summary || quiz || result || autoStartedRef.current) return;
    if (!isLoggedIn || summary.hasPassword) return;

    autoStartedRef.current = true;
    void dispatch(startQuizAttempt({ quizKey, data: {} }));
  }, [dispatch, isLoggedIn, quiz, quizKey, result, summary]);

  useEffect(() => {
    if (!quiz) return;
    setRemainingSeconds(Math.max(quiz.timeLimit, 1) * 60);
  }, [quiz]);

  useEffect(() => {
    if (!quiz || result) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(intervalId);
          if (!submitTriggeredRef.current) {
            submitTriggeredRef.current = true;
            void handleSubmitQuiz();
          }
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, result, answers, attemptId]);

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

      particles = Array.from({ length: window.innerWidth < 700 ? 42 : 68 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.7,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        z: Math.random() * 1.4 + 0.5,
        c: colors[index % colors.length],
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        const px = (pointer.x - window.innerWidth / 2) * 0.004 * particle.z;
        const py = (pointer.y - window.innerHeight / 2) * 0.004 * particle.z;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = window.innerWidth + 20;
        if (particle.x > window.innerWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = window.innerHeight + 20;
        if (particle.y > window.innerHeight + 20) particle.y = -20;

        context.beginPath();
        context.arc(particle.x + px, particle.y + py, particle.r * particle.z, 0, Math.PI * 2);
        context.fillStyle = particle.c;
        context.shadowBlur = 16;
        context.shadowColor = particle.c;
        context.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const distance = Math.hypot(particle.x - next.x, particle.y - next.y);

          if (distance < 115) {
            context.beginPath();
            context.moveTo(particle.x + px, particle.y + py);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(255,255,255,${(1 - distance / 115) * 0.1})`;
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

  const handleStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!summary || !canStart || !canPassPassword) return;

    dispatch(clearTakeQuizError());
    await dispatch(
      startQuizAttempt({
        quizKey,
        data: {
          guestName: isLoggedIn ? undefined : guestName.trim(),
          password: summary.hasPassword ? password.trim() : undefined,
        },
      }),
    );
  };

  const handleChooseAnswer = (answerId: number) => {
    if (!currentQuestion || locked || selectedForCurrent) return;

    setLocked(true);
    setAnswers((current) => [
      ...current,
      {
        questionId: currentQuestion.id,
        answerId,
      },
    ]);

    if (currentIndex < (quiz?.questions.length || 0) - 1) {
      window.setTimeout(() => {
        setCurrentIndex((value) => value + 1);
        setLocked(false);
      }, 620);
      return;
    }

    window.setTimeout(() => setLocked(false), 300);
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId || submitStatus === "pending") return;
    submitTriggeredRef.current = true;
    await dispatch(submitQuizAttempt({ attemptId, answers }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`qvh-page qtake-page ${result ? "qtake-result-mode" : ""}`}>
      <canvas ref={canvasRef} className="qvh-particles" />

      <header className="qtake-header">
        <div className="qtake-brand">
          <div className="qvh-brand-mark">Q</div>
          <div>
            <strong>{quizTitle}</strong>
            <span>{result ? "Kết quả bài làm của bạn" : "Không thể quay lại câu trước sau khi đã chọn đáp án"}</span>
          </div>
        </div>

        {!result && quiz ? (
          <div className={remainingSeconds <= 60 ? "qtake-timer danger" : "qtake-timer"}>
            <i />
            <strong>{formatTime(remainingSeconds)}</strong>
          </div>
        ) : null}
      </header>

      <div className={result ? "qvh-app qtake-result-layout" : "qtake-taking-layout"}>
        {result ? (
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
              <button className="active" onClick={() => navigate("/quiz-inventory")} type="button">
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
              <button onClick={() => navigate("/profile")} type="button">
                <span className="qvh-nav-icon"><DashboardIcon name="profile" /></span>
                Hồ sơ
              </button>
            </nav>

            <div className="qvh-side-card">
              <strong>Kết quả đã lưu</strong>
              <p>Bạn có thể xem lại điểm số, đáp án đã chọn và quay về kho quiz sau khi nộp bài.</p>
            </div>
          </aside>
        ) : null}

        <section className={result ? "qvh-main" : "qtake-main"}>
          {summaryStatus === "pending" ? (
            <section className="qtake-center-card">
              <div className="qvh-eyebrow">Đang tải quiz</div>
              <h1>Chờ một chút...</h1>
              <p>Qivora đang lấy dữ liệu quiz thật từ backend.</p>
            </section>
          ) : null}

          {summaryStatus === "rejected" ? (
            <section className="qtake-center-card">
              <div className="qvh-eyebrow">Không tìm thấy quiz</div>
              <h1>Mã quiz chưa đúng</h1>
              <p>{getErrorMessage(error)}</p>
              <button className="qvh-primary-btn" onClick={() => navigate("/")} type="button">Về trang chủ</button>
            </section>
          ) : null}

          {needsGate ? (
            <section className="qtake-center-card">
              <div className="qvh-eyebrow">{summary.hasPassword ? "Quiz có mật khẩu" : "Vào làm với tên khách"}</div>
              <h1>{summary.title}</h1>
              <p>
                {!isLoggedIn ? "Nhập tên khách để hệ thống ghi nhận bài làm." : "Nhập mật khẩu quiz để bắt đầu làm bài."}
              </p>

              <form className="qtake-gate-form" onSubmit={handleStart}>
                {!isLoggedIn ? (
                  <input
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Tên khách của bạn"
                    type="text"
                    value={guestName}
                  />
                ) : null}
                {summary.hasPassword ? (
                  <input
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mật khẩu quiz"
                    type="password"
                    value={password}
                  />
                ) : null}
                {error ? <span className="qtake-error">{getErrorMessage(error)}</span> : null}
                <button className="qvh-primary-btn" disabled={!canStart || !canPassPassword || startStatus === "pending"} type="submit">
                  {startStatus === "pending" ? "Đang vào quiz..." : "Vào làm quiz"}
                </button>
              </form>
            </section>
          ) : null}

          {quiz && currentQuestion && !result ? (
            <section className="qtake-stage">
              <article className="qtake-question-card">
                <div className="qtake-question-inner">
                  <div className="qtake-progress-row">
                    <span>Câu {currentIndex + 1} / {quiz.questions.length}</span>
                    <div>
                      <i style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="qtake-question-content">
                    <div className="qvh-eyebrow">{currentQuestion.score} điểm</div>
                    <h1>{currentQuestion.content}</h1>
                    <div className="qtake-answers">
                      {currentQuestion.answers.map((answer, answerIndex) => (
                        <button
                          className={selectedForCurrent?.answerId === answer.id ? "selected" : ""}
                          disabled={Boolean(selectedForCurrent) || locked}
                          key={answer.id}
                          onClick={() => handleChooseAnswer(answer.id)}
                          type="button"
                        >
                          <span>{String.fromCharCode(65 + answerIndex)}</span>
                          <strong>{answer.content}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="qtake-question-footer">
                    <span>Đã chọn là tự chuyển câu tiếp theo</span>
                    <span>{selectedForCurrent ? "Đã lưu đáp án" : "Sẵn sàng"}</span>
                  </div>
                </div>
              </article>

              <aside className="qtake-side">
                <div className="qtake-mini-panel">
                  <strong>Tiến độ bài làm</strong>
                  <p>Mỗi câu chỉ được chọn một lần. Hệ thống tự lưu đáp án và chuyển sang câu kế tiếp.</p>
                </div>
                <div className="qtake-stat-grid">
                  <div><strong>{answers.length}</strong><span>Đã làm</span></div>
                  <div><strong>{Math.max(totalQuestions - answers.length, 0)}</strong><span>Còn lại</span></div>
                </div>
                <div className="qtake-mini-panel">
                  <strong>Lưu ý</strong>
                  <p>Nút nộp bài chỉ xuất hiện ở câu cuối để tránh nộp nhầm khi chưa hoàn tất.</p>
                </div>
              </aside>

              {currentIndex === quiz.questions.length - 1 ? (
                <button className="qtake-submit" disabled={submitStatus === "pending"} onClick={handleSubmitQuiz} type="button">
                  {submitStatus === "pending" ? "Đang nộp..." : "Nộp bài"}
                </button>
              ) : null}
            </section>
          ) : null}

          {result ? (
            <section className="qtake-result">
              <article className="qtake-result-hero">
                <div>
                  <div className="qvh-eyebrow">Đã nộp bài thành công</div>
                  <h1>Kết quả <span>quiz</span></h1>
                  <p>Bài làm của bạn đã được ghi nhận. Xem tổng quan điểm số và trạng thái từng câu bên dưới.</p>
                  <div className="qtake-result-actions">
                    <button className="qvh-primary-btn" onClick={() => navigate("/quiz-inventory")} type="button">Về kho quiz</button>
                    <button className="qvh-ghost-btn" onClick={() => navigate("/")} type="button">Trang chủ</button>
                  </div>
                </div>

                <div className="qtake-score-orb">
                  <div>
                    <strong>{scoreText}</strong>
                    <span>Điểm số</span>
                  </div>
                </div>
              </article>

              <div className="qtake-result-grid">
                <article><span>Số câu đúng</span><strong>{result.correctQuestions}</strong></article>
                <article><span>Số câu đã làm</span><strong>{result.totalAnswered}</strong></article>
                <article><span>Tổng câu hỏi</span><strong>{result.totalQuestions}</strong></article>
                <article><span>Thời gian còn lại</span><strong>{formatTime(remainingSeconds)}</strong></article>
              </div>

              <section className="qtake-review">
                <div className="qtake-review-head">
                  <h2>Chi tiết bài làm</h2>
                  <span>Danh sách câu đã trả lời</span>
                </div>
                <div className="qtake-review-list">
                  {result.questions.map((question, index) => {
                    const selectedAnswer = question.answers.find((answer) => answer.isSelected);
                    return (
                      <article className="qtake-review-item" key={question.questionId}>
                        <div>{index + 1}</div>
                        <section>
                          <strong>{question.content}</strong>
                          <span>Đáp án của bạn: {selectedAnswer?.content || "Chưa trả lời"}</span>
                        </section>
                        <p className={question.isCorrect ? "correct" : "wrong"}>{question.isCorrect ? "Đúng" : "Sai"}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
