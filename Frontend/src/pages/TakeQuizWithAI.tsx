import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateQuizDraftByAi, resetAiQuizState } from "../api/aiQuizSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { type AppDispatch, type RootState } from "../store/store";
import "../styles/dashboard.css";

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "AI tạo quiz thất bại. Vui lòng kiểm tra lại kết nối hoặc thử lại!";
}

const LOADING_MESSAGES = [
  "🚀 Đang gửi yêu cầu và thông số tới Gemini AI...",
  "🧠 AI đang đọc và phân tích chủ đề quiz của bạn...",
  "📚 Đang tổng hợp kiến thức & cấu trúc bộ câu hỏi...",
  "✍️ Đang tự động sinh danh sách câu hỏi trắc nghiệm...",
  "🎯 Đang kiểm tra tính chính xác của đáp án & lời giải...",
  "✨ Đang định dạng dữ liệu và hoàn tất bản nháp quiz...",
];

export default function TakeQuizWithAI() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error, status } = useSelector((state: RootState) => state.aiQuiz);
  const { currentUser, status: userStatus } = useSelector(
    (state: RootState) => state.user,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  // Form Fields
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Trung bình");
  const [questionCount, setQuestionCount] = useState(10);
  const [answerCount, setAnswerCount] = useState(4);
  const [timeLimit, setTimeLimit] = useState(15);
  const [formError, setFormError] = useState("");

  // Loading Overlay State
  const [isLoading, setIsLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(5);

  const riveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check Auth & Current user info
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
    return () => {
      dispatch(resetAiQuizState());
    };
  }, [dispatch]);

  // Rive / Canvas Animation Init
  useEffect(() => {
    if (!isLoading) return;

    let riveInstance: any = null;
    const riveGlobal = (window as any).rive;

    if (riveCanvasRef.current && riveGlobal && riveGlobal.Rive) {
      try {
        riveInstance = new riveGlobal.Rive({
          src: "/loading_ai.riv",
          canvas: riveCanvasRef.current,
          autoplay: true,
          onLoad: () => {
            if (riveInstance) riveInstance.resizeDrawingSurfaceToCanvas();
          },
          onError: () => { },
        });
      } catch (e) {
        // Fallback CSS glow will handle visual feedback
      }
    }

    return () => {
      if (riveInstance && riveInstance.cleanup) riveInstance.cleanup();
    };
  }, [isLoading]);

  // Loading Message Rotation & Progress Bar Effect
  useEffect(() => {
    if (!isLoading) {
      setMsgIndex(0);
      setProgressPercent(5);
      return;
    }

    const startTime = Date.now();
    const totalSimulatedTime = 12000;

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / totalSimulatedTime) * 100), 96);
      setProgressPercent(pct);
    }, 150);

    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(msgTimer);
    };
  }, [isLoading]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Ignore BE cookie error
    }
    dispatch(resetLoginState());
    dispatch(resetUserState());
    navigate("/login");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!topic.trim()) {
      setFormError("Vui lòng nhập chủ đề quiz!");
      return;
    }

    setIsLoading(true);

    try {
      const draft = await dispatch(
        generateQuizDraftByAi({
          topic: topic.trim(),
          description: description.trim() || undefined,
          difficulty,
          questionCount: Number(questionCount),
          answerCount: Number(answerCount),
          timeLimit: Number(timeLimit),
        }),
      ).unwrap();

      setProgressPercent(100);

      setTimeout(() => {
        setIsLoading(false);
        navigate("/quiz-create", { state: { aiDraft: draft } });
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen relative font-sans antialiased">
      {/* TOP HEADER NAVBAR */}
      <DashboardHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT WRAPPER */}
      <main className="main-wrapper">
        {/* HERO BANNER AI */}
        <section className="ai-banner">
          <div>
            <span className="badge-ai">GenAI Quiz Builder</span>
            <h1 className="ai-banner-title">
              Tạo quiz bằng <span>AI</span>
            </h1>
            <p className="ai-banner-desc">
              Trò chuyện với AI bằng các yêu cầu rõ ràng. Qivora sẽ tạo bản nháp quiz, sau đó đưa sang trang tạo thủ công để bạn kiểm tra và bấm tạo.
            </p>
          </div>
          <div className="ai-illustration" title="Qivora AI Assistant">
            <i className="fa-solid fa-robot"></i>
          </div>
        </section>

        {/* CONTENT GRID */}
        <div className="content-grid">
          {/* LEFT FORM CARD */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Yêu cầu tạo quiz</span>
              <div className="ai-engine-tag">
                <i className="fa-solid fa-sparkles"></i> Gemini AI
              </div>
            </div>

            <div className="prompt-intro-box">
              <div className="q-avatar">Q</div>
              <div className="prompt-intro-text">
                Hãy mô tả quiz bạn muốn tạo. Chủ đề càng rõ, AI tạo câu hỏi càng sát nhu cầu học tập.
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Chủ đề quiz <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Lịch sử Việt Nam giai đoạn 1945 - 1975"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả thêm</label>
                <textarea
                  className="form-textarea"
                  placeholder="VD: Tập trung vào sự kiện chính, nhân vật lịch sử, mốc thời gian quan trọng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Độ khó</label>
                  <select
                    className="form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số câu hỏi (1-50)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={questionCount}
                    min={1}
                    max={50}
                    onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Số đáp án mỗi câu (2-6)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={answerCount}
                    min={2}
                    max={6}
                    onChange={(e) => setAnswerCount(Math.min(6, Math.max(2, Number(e.target.value))))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời gian làm bài (Phút)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={timeLimit}
                    min={1}
                    onChange={(e) => setTimeLimit(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </div>

              {(formError || error) && (
                <div className="p-3 my-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  {formError || getErrorMessage(error)}
                </div>
              )}

              <div className="form-footer">
                <button
                  type="submit"
                  disabled={status === "pending" || isLoading}
                  className="btn-submit-ai"
                >
                  {status === "pending" || isLoading ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      Gửi yêu cầu cho AI <i className="fa-solid fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDEBAR INFO */}
          <div className="flex flex-col gap-6">
            <div className="card sidebar-widget">
              <h3 className="widget-title">Cách viết prompt tốt</h3>
              <p className="widget-desc">
                Nêu rõ chủ đề, phạm vi kiến thức, cấp học hoặc mục tiêu ôn tập để AI tạo câu hỏi ít bị lan man.
              </p>

              <div className="stat-preview-grid">
                <div className="stat-preview-card">
                  <div className="stat-preview-number">{questionCount}</div>
                  <div className="stat-preview-label">Câu hỏi</div>
                </div>
                <div className="stat-preview-card">
                  <div className="stat-preview-number">{answerCount}</div>
                  <div className="stat-preview-label">Đáp án/câu</div>
                </div>
              </div>
            </div>

            <div className="card sidebar-widget">
              <h3 className="widget-title">Luồng xử lý</h3>
              <p className="workflow-step">
                AI tạo bản nháp, <strong>Qivora</strong> đổ dữ liệu vào form thủ công, bạn xem lại rồi bấm tạo quiz để lưu.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* AI LOADING OVERLAY SCREEN */}
      <div className={`ai-loading-overlay ${isLoading ? "active" : ""}`}>
        <div className="ai-loading-card">
          <span className="loading-title-badge">
            <i className="fa-solid fa-sparkles"></i> Qivora GenAI Engine
          </span>

          <div className="rive-canvas-container">
            <div className="ai-glow-fallback"></div>
            <canvas
              ref={riveCanvasRef}
              width={180}
              height={180}
              style={{ position: "relative", zIndex: 1 }}
            />
          </div>

          <div className="loading-msg-container">
            <p className="loading-msg-text">
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </div>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <p className="text-xs text-slate-400 mt-3.5 font-medium flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-purple-400"></i> Vui lòng giữ trang web mở trong lúc AI sinh đề thi
          </p>
        </div>
      </div>
    </div>
  );
}
