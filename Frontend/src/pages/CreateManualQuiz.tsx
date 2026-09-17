import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createManualQuiz, resetManualQuizState } from "../api/manualQuizSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { type AppDispatch, type RootState } from "../store/store";
import { type CreateManualQuizRequest } from "../utils/Types";
import "../styles/dashboard.css";

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
  isCollapsed?: boolean;
  answers: DraftAnswer[];
};

function createQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    content: "",
    score: 10,
    explanation: "",
    isCollapsed: false,
    answers: [
      { id: crypto.randomUUID(), content: "", isCorrect: true },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
    ],
  };
}

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Tạo quiz thất bại. Vui lòng kiểm tra lại thông tin!";
}

const PREFIXES = ["A", "B", "C", "D"];

export default function CreateManualQuiz() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  const aiDraft = (location.state as { aiDraft?: CreateManualQuizRequest } | null)?.aiDraft;
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { error, quiz, status } = useSelector((state: RootState) => state.manualQuiz);

  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [password, setPassword] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([createQuestion()]);
  const [formError, setFormError] = useState("");

  // Success modal state
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdQuizCode, setCreatedQuizCode] = useState("");
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copyUrlSuccess, setCopyUrlSuccess] = useState(false);

  // Mascot Lottie Ref
  const bunnyLottieRef = useRef<HTMLDivElement | null>(null);

  // Compute total questions
  const totalQuestions = useMemo(() => questions.length, [questions]);

  // Load AI draft if available
  useEffect(() => {
    dispatch(resetManualQuizState());

    if (!aiDraft) return;

    setTitle(aiDraft.title || "");
    setDescription(aiDraft.description || "");
    setTimeLimit(aiDraft.timeLimit || 15);
    setPassword(aiDraft.password || "");
    setStartedAt(aiDraft.startedAt || "");
    setEndedAt(aiDraft.endedAt || "");
    setQuestions(
      aiDraft.questions?.length
        ? aiDraft.questions.map((q) => ({
            id: crypto.randomUUID(),
            content: q.content,
            score: q.score || 10,
            explanation: q.explanation || "",
            isCollapsed: false,
            answers: q.answers.map((a) => ({
              id: crypto.randomUUID(),
              content: a.content,
              isCorrect: a.isCorrect,
            })),
          }))
        : [createQuestion()],
    );
  }, [aiDraft, dispatch]);

  // Check Auth & Fetch user info
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

  // Handle Redux creation success
  useEffect(() => {
    if (quiz) {
      const code = quiz.code || ("QIV-" + Math.floor(100000 + Math.random() * 900000));
      setCreatedQuizCode(code);
      setShowCreatedModal(true);
    }
  }, [quiz]);

  // Init Bunny Lottie Animation
  useEffect(() => {
    let anim: any = null;
    const lottieGlobal = (window as any).lottie;

    if (bunnyLottieRef.current && lottieGlobal) {
      try {
        anim = lottieGlobal.loadAnimation({
          container: bunnyLottieRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/bunny.json",
        });
      } catch (err) {
        console.error("Lottie load error:", err);
      }
    }

    return () => {
      if (anim && anim.destroy) anim.destroy();
    };
  }, []);

  // Handlers
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Ignore BE cookie rejection
    }
    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetManualQuizState());
    navigate("/login");
  };

  const toggleQuestionCollapse = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, isCollapsed: !q.isCollapsed } : q)),
    );
  };

  const updateQuestionContent = (qIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, content: val } : q)),
    );
  };

  const updateQuestionExplanation = (qIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, explanation: val } : q)),
    );
  };

  const updateAnswerContent = (qIdx: number, aIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIdx) return q;
        const newAnswers = q.answers.map((ans, i) =>
          i === aIdx ? { ...ans, content: val } : ans,
        );
        return { ...q, answers: newAnswers };
      }),
    );
  };

  const setCorrectAnswer = (qIdx: number, selectedAIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIdx) return q;
        const newAnswers = q.answers.map((ans, i) => ({
          ...ans,
          isCorrect: i === selectedAIdx,
        }));
        return { ...q, answers: newAnswers };
      }),
    );
  };

  const addNewQuestionBlock = () => {
    setQuestions((prev) => [
      ...prev.map((q) => ({ ...q, isCollapsed: true })),
      createQuestion(),
    ]);
  };

  const removeQuestionBlock = (qIdx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Vui lòng nhập tiêu đề bài thi!");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        setFormError(`Vui lòng nhập nội dung cho Câu hỏi #${i + 1}!`);
        return;
      }
      const hasCorrect = q.answers.some((a) => a.isCorrect);
      if (!hasCorrect) {
        setFormError(`Câu hỏi #${i + 1} phải chọn ít nhất 1 đáp án đúng!`);
        return;
      }
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].content.trim()) {
          setFormError(`Vui lòng nhập nội dung cho đáp án ${PREFIXES[j] || j + 1} ở Câu hỏi #${i + 1}!`);
          return;
        }
      }
    }

    const payload: CreateManualQuizRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      timeLimit: Number(timeLimit) || 15,
      password: password.trim() || undefined,
      startedAt: startedAt ? startedAt + ":00" : undefined,
      endedAt: endedAt ? endedAt + ":00" : undefined,
      questions: questions.map((q) => ({
        content: q.content.trim(),
        score: Number(q.score) || 10,
        explanation: q.explanation.trim() || undefined,
        answers: q.answers.map((a) => ({
          content: a.content.trim(),
          isCorrect: a.isCorrect,
        })),
      })),
    };

    const result = await dispatch(createManualQuiz(payload));
    if (createManualQuiz.fulfilled.match(result)) {
      const generatedCode = result.payload.code || ("QIV-" + Math.floor(100000 + Math.random() * 900000));
      setCreatedQuizCode(generatedCode);
      setShowCreatedModal(true);
    }
  };

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/take_quiz.html?code=${createdQuizCode || "QIV-892401"}`;
  }, [createdQuizCode]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;
  }, [shareUrl]);

  const copyQuizCode = () => {
    if (createdQuizCode) {
      void navigator.clipboard.writeText(createdQuizCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      void navigator.clipboard.writeText(shareUrl);
      setCopyUrlSuccess(true);
      setTimeout(() => setCopyUrlSuccess(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen relative font-sans antialiased">
      {/* HEADER NAVBAR */}
      <DashboardHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="main-wrapper">
        {/* HERO BANNER */}
        <section className="hero-banner">
          <div>
            <span className="badge-manual">Manual Quiz Builder</span>
            <h1 className="banner-title">
              Tạo quiz <span>thủ công</span>
            </h1>
            <p className="banner-desc">
              Tự nhập nội dung câu hỏi, tùy chỉnh số lượng đáp án, đánh dấu đáp án đúng và bổ sung lời giải chi tiết cho từng câu.
            </p>
          </div>
          <div className="banner-icon-box">
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
        </section>

        {/* CONTENT GRID FORM */}
        <form className="content-grid" onSubmit={handleSubmit}>
          {/* LEFT FORM BUILDER */}
          <div className="flex flex-col gap-8">
            {/* SECTION 1: QUIZ METADATA */}
            <div className="form-card">
              <h2 className="card-header-title">
                <i className="fa-solid fa-gear" style={{ color: "#3b82f6" }}></i> Cấu hình chung bài thi
              </h2>

              <div className="form-group">
                <label className="form-label">
                  Tiêu đề Quiz <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Đề thi thử TOEIC Reading Part 5..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả bài thi</label>
                <textarea
                  className="form-textarea"
                  placeholder="Mô tả ngắn gọn về nội dung hoặc mục tiêu bài thi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Thời gian làm bài (Phút) <span>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={timeLimit}
                    min={1}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu bài thi (Tùy chọn)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Để trống nếu công khai..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* DATETIME CONSTRAINTS */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-regular fa-calendar-check" style={{ color: "#34d399" }}></i> Thời gian mở quiz (Bắt đầu)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-regular fa-calendar-xmark" style={{ color: "#f87171" }}></i> Thời gian đóng quiz (Kết thúc)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={endedAt}
                    onChange={(e) => setEndedAt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DYNAMIC QUESTIONS BUILDER LIST */}
            <div className="form-card">
              <h2 className="card-header-title">
                <i className="fa-solid fa-list-ol" style={{ color: "#a855f7" }}></i> Danh sách câu hỏi
              </h2>

              <div className="flex flex-col gap-5">
                {questions.map((q, qIdx) => {
                  const isCollapsed = q.isCollapsed === true;
                  const previewText = q.content.trim() ? q.content.trim() : "(Chưa nhập nội dung câu hỏi...)";

                  if (isCollapsed) {
                    return (
                      <div key={q.id} className="question-builder-block">
                        <div className="q-block-header" style={{ marginBottom: 0 }}>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="q-block-num">
                              <i className="fa-solid fa-circle-question"></i> Câu #{qIdx + 1}
                            </span>
                            <span className="q-preview-title" title={previewText}>
                              {previewText}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              className="btn-toggle-q"
                              onClick={() => toggleQuestionCollapse(qIdx)}
                            >
                              <i className="fa-solid fa-chevron-down"></i> Mở rộng
                            </button>
                            {questions.length > 1 && (
                              <button
                                type="button"
                                className="btn-delete-q"
                                onClick={() => removeQuestionBlock(qIdx)}
                              >
                                <i className="fa-solid fa-trash-can"></i> Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="question-builder-block">
                      <div className="q-block-header">
                        <span className="q-block-num">
                          <i className="fa-solid fa-circle-question"></i> Câu hỏi #{qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn-toggle-q"
                            onClick={() => toggleQuestionCollapse(qIdx)}
                          >
                            <i className="fa-solid fa-chevron-up"></i> Thu gọn
                          </button>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-q"
                              onClick={() => removeQuestionBlock(qIdx)}
                            >
                              <i className="fa-solid fa-trash-can"></i> Xóa câu hỏi
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Nội dung câu hỏi <span>*</span>
                        </label>
                        <textarea
                          className="form-textarea"
                          placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                          value={q.content}
                          onChange={(e) => updateQuestionContent(qIdx, e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Lời giải chi tiết (Tùy chọn)</label>
                        <textarea
                          className="form-textarea"
                          style={{ minHeight: "60px" }}
                          placeholder="Nhập giải thích đáp án đúng để người học tham khảo..."
                          value={q.explanation}
                          onChange={(e) => updateQuestionExplanation(qIdx, e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Danh sách đáp án A, B, C, D (Tích chọn nút tròn cho đáp án đúng) <span>*</span>
                        </label>
                        <div className="options-editor-list">
                          {q.answers.map((ans, aIdx) => (
                            <div key={ans.id} className="option-editor-row">
                              <input
                                type="radio"
                                name={`correct_${q.id}`}
                                className="option-radio-custom"
                                checked={ans.isCorrect}
                                onChange={() => setCorrectAnswer(qIdx, aIdx)}
                                title="Đánh dấu đây là đáp án đúng"
                              />
                              <span className="font-extrabold text-sm text-blue-400 w-5">
                                {PREFIXES[aIdx] || aIdx + 1}
                              </span>
                              <input
                                type="text"
                                className="option-input"
                                value={ans.content}
                                placeholder={`Nhập nội dung đáp án ${PREFIXES[aIdx] || aIdx + 1}...`}
                                onChange={(e) => updateAnswerContent(qIdx, aIdx, e.target.value)}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button type="button" className="btn-add-question" onClick={addNewQuestionBlock}>
                <i className="fa-solid fa-plus"></i> Thêm câu hỏi mới
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR STATS & SAVE */}
          <aside className="sidebar-card">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-pie" style={{ color: "#3b82f6" }}></i> Thống kê khởi tạo
            </h3>

            <div className="stat-box-row">
              <span className="stat-box-label">Tổng số câu hỏi</span>
              <span className="stat-box-value">{totalQuestions} câu</span>
            </div>

            <div className="stat-box-row">
              <span className="stat-box-label">Thời gian bài làm</span>
              <span className="stat-box-value">{timeLimit || 15} phút</span>
            </div>

            {(formError || error) && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {formError || getErrorMessage(error)}
              </div>
            )}

            <button type="submit" disabled={status === "pending"} className="btn-save-quiz">
              <i className="fa-solid fa-floppy-disk"></i> {status === "pending" ? "Đang khởi tạo..." : "Tạo bài thi ngay"}
            </button>
          </aside>
        </form>
      </main>

      {/* FLOATING BUNNY MASCOT WIDGET */}
      <div className="bunny-widget-wrapper">
        <div className="bunny-speech-bubble">
          <span>✍️ Hãy soạn câu hỏi thật hay nhé! 🐰</span>
        </div>
        <div className="bunny-lottie-container" ref={bunnyLottieRef}></div>
      </div>

      {/* QUIZ CREATION SUCCESS MODAL */}
      {showCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col relative text-slate-100">
            {/* Header Badge & Title */}
            <div className="flex flex-col items-center text-center gap-1.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 mb-1">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="text-xl font-black text-white">Tạo Bài Thi Thành Công!</h3>
              <p className="text-xs text-slate-400">
                Bài thi đã được khởi tạo thành công. Bạn có thể sao chép liên kết hoặc quét mã QR bên dưới để làm bài.
              </p>
            </div>

            {/* Quiz Details Card */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 flex flex-col gap-3.5 mb-5">
              {/* Quiz Code Box */}
              <div className="flex items-center justify-between bg-slate-900/90 border border-indigo-500/30 rounded-xl p-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Mã Bài Thi (Quiz Code)</span>
                  <span className="text-lg font-black font-mono text-white tracking-widest">{createdQuizCode}</span>
                </div>
                <button
                  type="button"
                  onClick={copyQuizCode}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
                >
                  <i className="fa-regular fa-copy"></i>
                  <span>{copyCodeSuccess ? "Đã chép!" : "Sao chép mã"}</span>
                </button>
              </div>

              {/* Share Link Box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-link text-indigo-400"></i> Link chia sẻ bài thi:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none select-all"
                    value={shareUrl}
                  />
                  <button
                    type="button"
                    onClick={copyShareUrl}
                    className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <i className="fa-solid fa-share-nodes"></i>
                    <span>{copyUrlSuccess ? "Đã chép!" : "Sao chép link"}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Box */}
              <div className="flex flex-col items-center justify-center pt-2 border-t border-slate-700/50 gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-qrcode text-indigo-400"></i> Quét mã QR để làm bài luôn:
                </span>
                <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-slate-300">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Quiz"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/take-quiz/${createdQuizCode}`)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs text-center transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-play"></i> Làm thử ngay
              </button>
              <button
                type="button"
                onClick={() => navigate("/quiz-manager")}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs text-center transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-list-check"></i> Quản lý Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
