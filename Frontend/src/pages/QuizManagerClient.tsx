import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import {
  deleteMyQuiz,
  fetchMyQuizManageDetail,
  fetchMyQuizzes,
  resetQuizManagerDetail,
} from "../api/quizManagerSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type QuizSummaryResponse } from "../utils/Types";
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

function DeleteIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
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
  return "Không tải được dữ liệu quản lí quiz.";
}

function formatDate(value?: string) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isQuizOpen(quiz: QuizSummaryResponse) {
  const now = Date.now();
  const started = quiz.startedAt ? new Date(quiz.startedAt).getTime() : null;
  const ended = quiz.endedAt ? new Date(quiz.endedAt).getTime() : null;
  return Boolean(quiz.isActive) && (started === null || started <= now) && (ended === null || ended >= now);
}

export default function QuizManagerClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { quizId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const {
    deleteStatus,
    detail,
    detailStatus,
    error,
    first,
    last,
    listStatus,
    page,
    quizzes,
    totalElements,
    totalPages,
  } = useSelector((state: RootState) => state.quizManager);
  const [profileOpen, setProfileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuizSummaryResponse | null>(null);

  const displayName = currentUser?.fullName || currentUser?.username || "Bạn";
  const selectedQuizId = quizId ? Number(quizId) : null;
  const filteredQuizzes = quizzes.filter((quiz) => {
    const search = keyword.trim().toLowerCase();
    if (!search) return true;
    return quiz.title.toLowerCase().includes(search) || quiz.code.toLowerCase().includes(search);
  });

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
    if (selectedQuizId) {
      void dispatch(fetchMyQuizManageDetail(selectedQuizId));
      return;
    }

    dispatch(resetQuizManagerDetail());
    void dispatch(fetchMyQuizzes({ page: 0, size: 6 }));
  }, [dispatch, selectedQuizId]);

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

  const openDeletePopup = (event: ReactMouseEvent<HTMLButtonElement>, quiz: QuizSummaryResponse) => {
    event.stopPropagation();
    setDeleteTarget(quiz);
  };

  const handleConfirmDeleteQuiz = async () => {
    if (!deleteTarget) return;

    await dispatch(deleteMyQuiz(deleteTarget.id));
    setDeleteTarget(null);
    void dispatch(fetchMyQuizzes({ page, size: 6 }));
  };

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 0 || (totalPages > 0 && nextPage >= totalPages)) return;
    void dispatch(fetchMyQuizzes({ page: nextPage, size: 6 }));
  };

  return (
    <main className="qvh-page">
      <canvas ref={canvasRef} className="qvh-particles" />

      {deleteTarget ? (
        <div className="qmgr-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <section className="qmgr-delete-modal" onClick={(event) => event.stopPropagation()}>
            <div className="qmgr-delete-mark">
              <DeleteIcon />
            </div>
            <div>
              <span>Xác nhận xoá quiz</span>
              <h2>{deleteTarget.title}</h2>
              <p>Quiz này sẽ bị xoá khỏi danh sách quản lí của bạn. Hành động này không thể hoàn tác.</p>
            </div>

            <div className="qmgr-delete-actions">
              <button className="qmgr-cancel-btn" onClick={() => setDeleteTarget(null)} type="button">
                Hủy
              </button>
              <button
                className="qmgr-confirm-delete-btn"
                disabled={deleteStatus === "pending"}
                onClick={handleConfirmDeleteQuiz}
                type="button"
              >
                {deleteStatus === "pending" ? "Đang xoá..." : "Xoá quiz"}
              </button>
            </div>
          </section>
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
            <button className="active" onClick={() => navigate("/quiz-manager")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="manage" /></span>
              Quản lí quiz cá nhân
            </button>
            <button onClick={() => navigate("/profile")} type="button">
              <span className="qvh-nav-icon"><DashboardIcon name="profile" /></span>
              Hồ sơ
            </button>
          </nav>

          <div className="qvh-side-card">
            <strong>Quiz của bạn</strong>
            <p>Chỉ hiển thị các quiz do tài khoản hiện tại tạo ra để quản lí, chia sẻ và xem điểm người làm.</p>
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

          {!selectedQuizId ? (
            <section className="qmgr-page">
              <section className="qmgr-hero">
                <div>
                  <div className="qvh-eyebrow">My Quiz Library</div>
                  <h1>Quản lí quiz <span>cá nhân</span></h1>
                  <p>Danh sách các quiz bạn đã tạo trong Qivora. Bấm vào quiz để xem những người đã làm và điểm số.</p>
                </div>
                <button className="qmgr-primary-btn" onClick={() => navigate("/quiz-create")} type="button">
                  Tạo quiz mới
                </button>
              </section>

              <section className="qmgr-toolbar">
                <input
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm quiz theo tên hoặc ID..."
                  type="text"
                  value={keyword}
                />
              </section>

              {listStatus === "pending" ? <div className="qmgr-state-card">Đang tải quiz cá nhân...</div> : null}
              {error && listStatus === "rejected" ? <div className="qmgr-state-card error">{getErrorMessage(error)}</div> : null}
              {listStatus !== "pending" && filteredQuizzes.length === 0 ? (
                <div className="qmgr-state-card">Chưa có quiz nào khớp với danh sách hiện tại.</div>
              ) : null}

              {filteredQuizzes.length > 0 ? (
                <section className="qmgr-grid">
                  {filteredQuizzes.map((quiz) => {
                    const open = isQuizOpen(quiz);

                    return (
                      <article className="qmgr-card" key={quiz.id} onClick={() => navigate(`/quiz-manager/${quiz.id}`)}>
                        <div className="qmgr-card-top">
                          <span className="qmgr-code">ID: {quiz.code}</span>
                          <span className={`qmgr-status ${open ? "active" : "closed"}`}>
                            <i />
                            {open ? "Đang mở" : "Đã đóng"}
                          </span>
                        </div>

                        <h3>{quiz.title}</h3>
                        <p>{quiz.description || "Quiz luyện tập được tạo trên Qivora."}</p>

                        <div className="qmgr-meta">
                          <div>
                            <strong>{quiz.totalQuestions}</strong>
                            <span>Câu hỏi</span>
                          </div>
                          <div>
                            <strong>{quiz.timeLimit}</strong>
                            <span>Phút</span>
                          </div>
                          <div>
                            <strong>{quiz.totalAttempts || 0}</strong>
                            <span>Lượt làm</span>
                          </div>
                        </div>

                        <div className="qmgr-card-footer">
                          <small>Tạo bởi {quiz.creatorFullName || quiz.creatorUsername || "Bạn"}</small>
                          <button
                            aria-label="Xóa quiz"
                            className="qmgr-delete-btn"
                            disabled={deleteStatus === "pending"}
                            onClick={(event) => openDeletePopup(event, quiz)}
                            type="button"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </section>
              ) : null}

              {totalPages > 0 ? (
                <div className="qmgr-pagination">
                  <span>{totalElements} quiz</span>
                  <button disabled={first || listStatus === "pending"} onClick={() => handleChangePage(page - 1)} type="button">
                    Trước
                  </button>
                  <strong>{page + 1} / {totalPages}</strong>
                  <button disabled={last || listStatus === "pending"} onClick={() => handleChangePage(page + 1)} type="button">
                    Sau
                  </button>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="qmgr-page">
              <section className="qmc-manage">
                <div className="qmc-manage-hero">
                  <div>
                    <div className="qvh-eyebrow">Quản lý quiz</div>
                    <h1>{detail?.quiz.title || "Đang tải quiz"}</h1>
                    <p>Xem danh sách người đã hoàn thành quiz này và điểm số tương ứng.</p>
                  </div>
                  <button className="qmc-secondary" onClick={() => navigate("/quiz-manager")} type="button">
                    Về quản lí quiz
                  </button>
                </div>

                {detailStatus === "pending" ? <div className="qmgr-state-card">Đang tải kết quả quiz...</div> : null}
                {error && detailStatus === "rejected" ? <div className="qmgr-state-card error">{getErrorMessage(error)}</div> : null}

                {detail ? (
                  <>
                    <div className="qmc-share-card">
                      <span>ID quiz</span>
                      <strong>{detail.quiz.code}</strong>
                      <button
                        onClick={() => {
                          void navigator.clipboard?.writeText(detail.quiz.code);
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
                          <span>Danh sách tài khoản hoặc khách đã hoàn thành quiz này</span>
                        </div>
                        <span>{detail.quiz.totalQuestions} câu • {detail.quiz.timeLimit} phút</span>
                      </div>

                      {detail.results.length > 0 ? (
                        <div className="qmgr-result-list">
                          {detail.results.map((result) => (
                            <div className="qmgr-result-row" key={result.attemptId}>
                              <div>
                                <strong>{result.participantName}</strong>
                                <span>{result.guest ? "Khách" : result.participantEmail || "Tài khoản Qivora"}</span>
                              </div>
                              <span>{formatDate(result.completedAt)}</span>
                              <strong>{Number(result.score).toFixed(2)} điểm</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="qmc-empty-result">
                          <strong>Chưa có lượt làm nào</strong>
                          <p>Khi có người hoàn thành quiz, tên và điểm số sẽ hiển thị tại đây.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </section>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
