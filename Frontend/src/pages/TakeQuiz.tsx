import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  clearTakeQuizError,
  fetchQuizSummary,
  resetTakeQuizState,
  startQuizAttempt,
  submitQuizAttempt,
} from "../api/takeQuizSlice";
import { type AppDispatch, type RootState } from "../store/store";
import "../styles/takeQuiz.css";

const BUNNY_TAKING_MESSAGES = [
  "🐰 cố lên bạn iu",
  "✨ Bạn làm tốt lắm, tập trung nhé!",
  "🔥 Tự tin lên, sắp hoàn thành rồi!",
  "🎯 Đọc kỹ đề bài trước khi chọn nhé!",
  "💪 Cố lên bạn iu, bạn nhất định làm được!",
];

const BUNNY_RESULT_MESSAGES = [
  "🎉 Bạn đã làm rất tốt! 🐰",
  "🌟 Chúc mừng bạn đã hoàn thành bài thi!",
  "🏆 Xuất sắc quá đi!",
  "✨ Hãy kiểm tra lại bài làm của mình nhé!",
];

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Có lỗi xảy ra, kiểm tra lại backend hoặc mã quiz.";
}

function formatSeconds(secondsValue: number): string {
  const safeSeconds = Math.max(secondsValue, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleString("vi-VN");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${hours}:${mins} ${day}/${month}/${year}`;
}

export default function TakeQuiz() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizKey = "" } = useParams();

  const { attemptId, error, quiz, result, startStatus, submitStatus, summary, summaryStatus } = useSelector(
    (state: RootState) => state.takeQuiz,
  );

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const autoStartedRef = useRef(false);
  const submitTriggeredRef = useRef(false);
  const bunnyLottieRef = useRef<HTMLDivElement | null>(null);

  // Form State for Gate
  const [guestName, setGuestName] = useState("");
  const [password, setPassword] = useState("");

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  // Quiz Taking State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bunnyMsgIndex, setBunnyMsgIndex] = useState(0);

  // Quiz Result Review State
  const [reviewQIndex, setReviewQIndex] = useState(0);

  // Sync Theme with Body class
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch summary on load
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

  // Auto-start attempt if logged in and no password required
  useEffect(() => {
    if (!summary || quiz || result || autoStartedRef.current) return;
    if (!isLoggedIn || summary.hasPassword) return;

    autoStartedRef.current = true;
    void dispatch(startQuizAttempt({ quizKey, data: {} }));
  }, [dispatch, isLoggedIn, quiz, quizKey, result, summary]);

  // Timer Initialization
  useEffect(() => {
    if (!quiz) return;
    setRemainingSeconds(Math.max(quiz.timeLimit, 1) * 60);
  }, [quiz]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!quiz || result) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((val) => {
        if (val <= 1) {
          window.clearInterval(intervalId);
          if (!submitTriggeredRef.current) {
            submitTriggeredRef.current = true;
            void handleProcessSubmit();
          }
          return 0;
        }
        return val - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, result, attemptId, selectedAnswers]);

  // Lottie Mascot Initialization
  useEffect(() => {
    const container = bunnyLottieRef.current;
    if (!container) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowLottie = (window as any).lottie;
    if (!windowLottie) return;

    const anim = windowLottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/bunny.json",
    });

    return () => {
      anim?.destroy?.();
    };
  }, [quiz, result]);

  // Gate Start Handler
  const handleStartGate = async (e: FormEvent) => {
    e.preventDefault();
    if (!summary) return;

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

  // Option selection
  const handleSelectOption = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // Flag toggle
  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Rotate Bunny Speech Message
  const handleRotateBunnyMessage = () => {
    const messagesList = result ? BUNNY_RESULT_MESSAGES : BUNNY_TAKING_MESSAGES;
    setBunnyMsgIndex((prev) => (prev + 1) % messagesList.length);
  };

  // Submit Handler
  const handleProcessSubmit = async () => {
    setShowSubmitModal(false);
    if (!attemptId || submitStatus === "pending") return;

    submitTriggeredRef.current = true;

    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, aId]) => ({
      questionId: Number(qId),
      answerId: Number(aId),
    }));

    await dispatch(submitQuizAttempt({ attemptId, answers: formattedAnswers }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Restart Quiz Attempt
  const handleReattempt = () => {
    autoStartedRef.current = false;
    submitTriggeredRef.current = false;
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setCurrentQIndex(0);
    setReviewQIndex(0);
    dispatch(resetTakeQuizState());
    void dispatch(fetchQuizSummary(quizKey));
  };

  const needsGate = !quiz && summary && (!isLoggedIn || summary.hasPassword);
  const canStartGate = (isLoggedIn || guestName.trim().length > 0) && (!summary?.hasPassword || password.trim().length > 0);

  const totalQCount = quiz?.questions.length || summary?.totalQuestions || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = totalQCount > 0 ? Math.round((answeredCount / totalQCount) * 100) : 0;

  // Active question in taking mode
  const currentQuestion = quiz?.questions[currentQIndex];

  // Active question in result mode
  const currentReviewQuestion = result?.questions[reviewQIndex];

  return (
    <div className={`take-quiz-page-root ${result ? "result-mode" : ""}`}>
      {/* ============================================================== */}
      {/* 1. HEADER BAR                                                 */}
      {/* ============================================================== */}
      <header className="tq-header-bar">
        <Link to="/" className="tq-logo-group">
          <img src="/logo.png" alt="Qivora Logo" className="tq-logo-img" />
          <div className="tq-quiz-title-badge">
            <span className="tq-quiz-head-title">
              {result?.quizTitle || quiz?.title || summary?.title || "Làm bài Quiz"}
            </span>
            <span className="tq-quiz-head-subtitle">
              {result ? "Kết quả làm bài quiz" : `Trắc nghiệm • ${totalQCount} Câu hỏi`}
            </span>
          </div>
        </Link>

        {/* Timer Box (Only visible during active quiz taking) */}
        {quiz && !result ? (
          <div className={`tq-timer-container ${remainingSeconds <= 120 ? "warning" : ""}`}>
            <i className="fa-solid fa-clock tq-timer-icon" />
            <span className="tq-timer-text">{formatSeconds(remainingSeconds)}</span>
          </div>
        ) : null}

        {/* Header Actions */}
        <div className="tq-header-actions">
          <button
            className="tq-btn-theme-toggle"
            onClick={toggleTheme}
            type="button"
            title="Chuyển chế độ Sáng / Tối"
          >
            <i className={`fa-solid ${theme === "light" ? "fa-sun" : "fa-moon"}`} />
          </button>

          {result ? (
            <>
              <Link to="/quiz-manager" className="tq-btn-action-secondary">
                <i className="fa-solid fa-list-check" /> Quản lý quiz
              </Link>
              <Link to="/" className="tq-btn-action-primary">
                <i className="fa-solid fa-house" /> Trang chủ
              </Link>
            </>
          ) : quiz ? (
            <button
              className="tq-btn-submit-quiz"
              onClick={() => setShowSubmitModal(true)}
              type="button"
            >
              <i className="fa-solid fa-paper-plane" /> Nộp bài
            </button>
          ) : null}
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. LOADING / ERROR / GATE STATES                                */}
      {/* ============================================================== */}
      {summaryStatus === "pending" ? (
        <div className="tq-gate-card">
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2.5rem", color: "#3b82f6" }} />
          <h1>Đang tải bài thi...</h1>
          <p>Hệ thống đang lấy thông tin dữ liệu quiz từ máy chủ Qivora.</p>
        </div>
      ) : null}

      {summaryStatus === "rejected" ? (
        <div className="tq-gate-card">
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "2.5rem", color: "#ef4444" }} />
          <h1>Không thể tải quiz</h1>
          <p>{getErrorMessage(error)}</p>
          <button className="tq-btn-action-primary" onClick={() => navigate("/")} type="button">
            Quay về trang chủ
          </button>
        </div>
      ) : null}

      {needsGate ? (
        <div className="tq-gate-card">
          <i className="fa-solid fa-shield-halved" style={{ fontSize: "2.5rem", color: "#60a5fa" }} />
          <h1>{summary?.title}</h1>
          <p>
            {!isLoggedIn
              ? "Vui lòng nhập tên khách của bạn để bắt đầu làm bài thi."
              : "Bài thi này yêu cầu mật khẩu để truy cập."}
          </p>

          <form className="tq-gate-form" onSubmit={handleStartGate}>
            {!isLoggedIn ? (
              <input
                className="tq-gate-input"
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tên khách của bạn..."
                type="text"
                value={guestName}
              />
            ) : null}

            {summary?.hasPassword ? (
              <input
                className="tq-gate-input"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quiz..."
                type="password"
                value={password}
              />
            ) : null}

            {error ? <div className="tq-error-message">{getErrorMessage(error)}</div> : null}

            <button
              className="tq-btn-action-primary"
              disabled={!canStartGate || startStatus === "pending"}
              style={{ justifyContent: "center", width: "100%", marginTop: "0.5rem" }}
              type="submit"
            >
              {startStatus === "pending" ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Đang vào làm bài...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket" /> Bắt đầu làm bài thi
                </>
              )}
            </button>
          </form>
        </div>
      ) : null}

      {/* ============================================================== */}
      {/* 3. ACTIVE QUIZ TAKING LAYOUT                                   */}
      {/* ============================================================== */}
      {quiz && currentQuestion && !result ? (
        <main className="tq-main-layout">
          {/* LEFT: QUESTION CARD */}
          <div className="tq-question-card">
            <div>
              <div className="tq-question-meta">
                <span className="tq-question-number-badge">
                  Câu hỏi {currentQIndex + 1} / {quiz.questions.length}
                </span>
                <div className="tq-question-actions-top">
                  <button
                    className={`tq-btn-flag-review ${flaggedQuestions[currentQuestion.id] ? "active" : ""}`}
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    type="button"
                  >
                    <i className={`fa-${flaggedQuestions[currentQuestion.id] ? "solid" : "regular"} fa-bookmark`} />
                    {flaggedQuestions[currentQuestion.id] ? "Đã đánh dấu" : "Đánh dấu xem lại"}
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <h2 className="tq-question-content">{currentQuestion.content}</h2>

              {/* Answers Grid */}
              <div className="tq-answers-grid">
                {currentQuestion.answers.map((ans, idx) => {
                  const prefixes = ["A", "B", "C", "D", "E", "F"];
                  const isSelected = selectedAnswers[currentQuestion.id] === ans.id;

                  return (
                    <button
                      className={`tq-option-item ${isSelected ? "selected" : ""}`}
                      key={ans.id}
                      onClick={() => handleSelectOption(currentQuestion.id, ans.id)}
                      type="button"
                    >
                      <div className="tq-option-prefix">{prefixes[idx] || idx + 1}</div>
                      <div className="tq-option-text">{ans.content}</div>
                      <i className="fa-solid fa-circle-check tq-option-check" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Nav Footer */}
            <div className="tq-question-footer-nav">
              <button
                className="tq-btn-nav-q"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(prev - 1, 0))}
                type="button"
              >
                <i className="fa-solid fa-chevron-left" /> Câu trước
              </button>

              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {currentQIndex + 1} của {quiz.questions.length} câu
              </span>

              <button
                className="tq-btn-nav-q"
                disabled={currentQIndex === quiz.questions.length - 1}
                onClick={() => setCurrentQIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1))}
                type="button"
              >
                Câu tiếp <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>

          {/* RIGHT: SIDEBAR PALETTE PANEL */}
          <aside className="tq-sidebar-panel">
            <h3 className="tq-sidebar-panel-title">
              <i className="fa-solid fa-list-check" style={{ color: "#3b82f6" }} /> Danh sách câu hỏi
            </h3>

            {/* Progress Bar Stat */}
            <div className="tq-progress-stat-box">
              <div className="tq-progress-stat-header">
                <span>Đã làm</span>
                <span>
                  {answeredCount} / {totalQCount} câu
                </span>
              </div>
              <div className="tq-progress-stat-bar">
                <div className="tq-progress-stat-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Question Palette Buttons */}
            <div className="tq-q-palette-grid">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isFlagged = Boolean(flaggedQuestions[q.id]);

                return (
                  <button
                    className={`tq-q-palette-btn ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""} ${isFlagged ? "flagged" : ""}`}
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    type="button"
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="tq-palette-legend">
              <div className="tq-legend-item">
                <div className="tq-legend-color-dot" style={{ backgroundColor: "var(--bg-sub)", border: "1px solid var(--border-color)" }} />
                <span>Chưa trả lời</span>
              </div>
              <div className="tq-legend-item">
                <div className="tq-legend-color-dot" style={{ backgroundColor: "rgba(59, 130, 246, 0.4)", border: "1px solid #3b82f6" }} />
                <span>Đã chọn đáp án</span>
              </div>
              <div className="tq-legend-item">
                <div className="tq-legend-color-dot" style={{ backgroundColor: "#f59e0b" }} />
                <span>Đánh dấu xem lại</span>
              </div>
            </div>

            {/* Submit Quiz Button */}
            <button
              className="tq-btn-submit-quiz"
              onClick={() => setShowSubmitModal(true)}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
              type="button"
            >
              <i className="fa-solid fa-check-double" /> Hoàn tất & Nộp bài
            </button>
          </aside>
        </main>
      ) : null}

      {/* ============================================================== */}
      {/* 4. QUIZ RESULT SUCCESS LAYOUT                                  */}
      {/* ============================================================== */}
      {result ? (
        <main className="tq-main-wrapper">
          {/* RESULT HERO CARD */}
          <section className="tq-result-hero-card">
            <span className="tq-badge-success">
              <i className="fa-solid fa-circle-check" /> Đã nộp bài thành công
            </span>

            <h1 className="tq-result-hero-title">
              Kết quả <span>bài làm quiz</span>
            </h1>

            <p className="tq-result-hero-desc">
              Bài thi của bạn đã được ghi nhận thành công trên hệ thống. Dưới đây là danh sách câu hỏi và các đáp án bạn đã lựa chọn trong quá trình làm bài.
            </p>

            {/* Metrics Overview Grid */}
            <div className="tq-metrics-grid">
              <div className="tq-metric-card">
                <span className="tq-metric-label">
                  <i className="fa-solid fa-file-circle-question" /> Tổng số câu hỏi
                </span>
                <span className="tq-metric-value">{result.totalQuestions} câu</span>
              </div>

              <div className="tq-metric-card">
                <span className="tq-metric-label">
                  <i className="fa-solid fa-pen-to-square" /> Số câu đã trả lời
                </span>
                <span className="tq-metric-value" style={{ color: "#34d399" }}>
                  {result.totalAnswered} / {result.totalQuestions} câu
                </span>
              </div>

              <div className="tq-metric-card">
                <span className="tq-metric-label">
                  <i className="fa-solid fa-trophy" /> Điểm số bài làm
                </span>
                <span className="tq-metric-value" style={{ color: "#60a5fa" }}>
                  {result.score} điểm ({result.correctQuestions}/{result.totalQuestions} đúng)
                </span>
              </div>

              <div className="tq-metric-card">
                <span className="tq-metric-label">
                  <i className="fa-solid fa-calendar-check" /> Ngày nộp bài
                </span>
                <span className="tq-metric-value" style={{ fontSize: "1.05rem" }}>
                  {formatDate(result.completedAt)}
                </span>
              </div>
            </div>
          </section>

          {/* NOTICE INFO BOX */}
          <div className="tq-notice-info-box">
            <i className="fa-solid fa-shield-halved tq-notice-icon" />
            <div>
              <strong>Lưu ý về quy định hiển thị:</strong> Hệ thống hiển thị chi tiết câu hỏi và các lựa chọn đáp án bạn đã chọn trong quá trình làm bài thi.
            </div>
          </div>

          {/* QUESTIONS REVIEW SECTION */}
          <section>
            <h2 className="tq-review-section-title">
              <i className="fa-solid fa-clipboard-check" style={{ color: "#3b82f6" }} /> Xem lại câu hỏi & Đáp án bạn đã chọn
            </h2>

            {/* QUESTION SELECTOR BAR */}
            <div className="tq-question-selector-bar">
              <div className="tq-select-label-group">
                <label htmlFor="questionSelect" className="tq-select-label">
                  <i className="fa-solid fa-list-ol" style={{ color: "#3b82f6" }} /> Chọn câu hỏi:
                </label>
                <select
                  id="questionSelect"
                  className="tq-question-select-dropdown"
                  onChange={(e) => setReviewQIndex(Number(e.target.value))}
                  value={reviewQIndex}
                >
                  {result.questions.map((q, idx) => (
                    <option key={q.questionId} value={idx}>
                      Câu {idx + 1}: {q.content.length > 50 ? `${q.content.substring(0, 50)}...` : q.content}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tq-select-nav-buttons">
                <button
                  className="tq-btn-select-nav"
                  disabled={reviewQIndex === 0}
                  onClick={() => setReviewQIndex((prev) => Math.max(prev - 1, 0))}
                  type="button"
                >
                  <i className="fa-solid fa-chevron-left" /> Câu trước
                </button>
                <span className="tq-select-counter">
                  {reviewQIndex + 1} / {result.questions.length}
                </span>
                <button
                  className="tq-btn-select-nav"
                  disabled={reviewQIndex === result.questions.length - 1}
                  onClick={() => setReviewQIndex((prev) => Math.min(prev + 1, result.questions.length - 1))}
                  type="button"
                >
                  Câu sau <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>

            {/* DYNAMIC QUESTION REVIEW CARD */}
            {currentReviewQuestion ? (
              <div className="tq-question-review-card">
                <div className="tq-q-review-header">
                  <span className="tq-q-review-num">
                    Câu {reviewQIndex + 1} / {result.questions.length}
                  </span>
                  <h3 className="tq-q-review-title">{currentReviewQuestion.content}</h3>
                </div>

                <div className="tq-answers-review-grid">
                  {currentReviewQuestion.answers.map((ans, idx) => {
                    const prefixes = ["A", "B", "C", "D", "E", "F"];
                    return (
                      <div
                        className={`tq-ans-review-item ${ans.isSelected ? "user-selected" : ""}`}
                        key={ans.answerId}
                      >
                        <div className="tq-ans-left-group">
                          <div className="tq-ans-prefix">{prefixes[idx] || idx + 1}</div>
                          <span className="tq-ans-text">{ans.content}</span>
                        </div>

                        {ans.isSelected ? (
                          <span className="tq-badge-user-choice">
                            <i className="fa-solid fa-circle-check" /> Đã chọn
                          </span>
                        ) : null}
                      </div>
                    );
                  })}

                  {!currentReviewQuestion.answers.some((a) => a.isSelected) ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <span className="tq-unanswered-tag">
                        <i className="fa-solid fa-triangle-exclamation" /> Bạn không chọn đáp án cho câu hỏi này
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          {/* BOTTOM ACTION BAR */}
          <div className="tq-bottom-action-bar">
            <button className="tq-btn-action-secondary" onClick={handleReattempt} type="button">
              <i className="fa-solid fa-rotate-right" /> Làm lại bài thi
            </button>
            <Link to="/quiz-manager" className="tq-btn-action-primary">
              <i className="fa-solid fa-list-check" /> Về trang quản lý Quiz
            </Link>
          </div>
        </main>
      ) : null}

      {/* ============================================================== */}
      {/* 5. FLOATING BUNNY MASCOT WIDGET                                */}
      {/* ============================================================== */}
      <div className="tq-bunny-widget-wrapper">
        <div className="tq-bunny-speech-bubble" onClick={handleRotateBunnyMessage}>
          <span>
            {result
              ? BUNNY_RESULT_MESSAGES[bunnyMsgIndex % BUNNY_RESULT_MESSAGES.length]
              : BUNNY_TAKING_MESSAGES[bunnyMsgIndex % BUNNY_TAKING_MESSAGES.length]}
          </span>
        </div>
        <div
          ref={bunnyLottieRef}
          className="tq-bunny-lottie-container"
          onClick={handleRotateBunnyMessage}
          title="Bấm để Bunny cổ vũ!"
        />
      </div>

      {/* ============================================================== */}
      {/* 6. SUBMIT CONFIRMATION MODAL                                   */}
      {/* ============================================================== */}
      <div className={`tq-modal-overlay ${showSubmitModal ? "active" : ""}`}>
        <div className="tq-modal-box">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              fontSize: "1.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem auto",
            }}
          >
            <i className="fa-solid fa-circle-question" />
          </div>

          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Xác nhận nộp bài?
          </h3>

          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            Bạn đã hoàn thành {answeredCount} / {totalQCount} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button className="tq-btn-nav-q" onClick={() => setShowSubmitModal(false)} type="button">
              Xem lại bài
            </button>
            <button
              className="tq-btn-submit-quiz"
              disabled={submitStatus === "pending"}
              onClick={handleProcessSubmit}
              type="button"
            >
              {submitStatus === "pending" ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Đang nộp...
                </>
              ) : (
                "Xác nhận Nộp"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
