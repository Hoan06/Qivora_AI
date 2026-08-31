import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminFeedbacks,
  markAdminFeedbackAsRead,
  resetAdminFeedbackState,
} from "../api/adminFeedbackSlice";
import {
  fetchAdminStatistics,
  resetAdminStatisticsState,
} from "../api/adminStatisticsSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type FeedbackResponse } from "../utils/Types";
import "../styles/dashboard.css";

type FeedbackFilter = "ALL" | "SYSTEM" | "QUIZ" | "UNREAD";

function AdminIcon({ name }: { name: "chart" | "feedback" | "quiz" | "user" }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.3,
    viewBox: "0 0 24 24",
  };

  if (name === "chart") {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16V9" />
        <path d="M13 16V6" />
        <path d="M18 16v-4" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "quiz") {
    return (
      <svg {...props}>
        <path d="M9 11h6" />
        <path d="M9 15h6" />
        <path d="M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function getInitials(name?: string, fallback?: string) {
  const displayName = name?.trim() || fallback?.trim() || "User";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value?: string) {
  if (!value) return "Không có";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getSenderName(feedback: FeedbackResponse) {
  return feedback.senderName || feedback.username || feedback.userEmail || "Người gửi ẩn danh";
}

export default function AdminFeedbackManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [filter, setFilter] = useState<FeedbackFilter>("ALL");
  const [page, setPage] = useState(0);
  const size = 5;

  const { feedbacks, status, error } = useSelector((state: RootState) => state.adminFeedback);
  const { statistics } = useSelector((state: RootState) => state.adminStatistics);
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const displayName = currentUser?.fullName || currentUser?.username || "Administrator";
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const systemCount = useMemo(
    () => feedbacks.filter((feedback) => feedback.type === "SYSTEM").length,
    [feedbacks],
  );
  const quizCount = useMemo(
    () => feedbacks.filter((feedback) => feedback.type === "QUIZ").length,
    [feedbacks],
  );
  const unreadCount = useMemo(
    () => feedbacks.filter((feedback) => !feedback.isRead).length,
    [feedbacks],
  );

  const filteredFeedbacks = useMemo(() => {
    if (filter === "UNREAD") return feedbacks.filter((feedback) => !feedback.isRead);
    if (filter === "SYSTEM") return feedbacks.filter((feedback) => feedback.type === "SYSTEM");
    if (filter === "QUIZ") return feedbacks.filter((feedback) => feedback.type === "QUIZ");
    return feedbacks;
  }, [feedbacks, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / size));
  const visibleFeedbacks = filteredFeedbacks.slice(page * size, page * size + size);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
    void dispatch(fetchAdminFeedbacks());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected" || status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminFeedbackState());
      dispatch(resetAdminStatisticsState());
      navigate("/login");
    }
  }, [dispatch, navigate, status, userStatus]);

  useEffect(() => {
    if (userStatus === "fulfilled" && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate, userStatus]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Van xoa local state neu token/cookie da het han.
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetAdminFeedbackState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  const handleReadFeedback = async (feedback: FeedbackResponse) => {
    if (feedback.isRead) return;

    try {
      await dispatch(markAdminFeedbackAsRead(feedback.id)).unwrap();
      void dispatch(fetchAdminStatistics());
    } catch {
      // Loi se duoc luu trong slice de hien thi state hien co.
    }
  };

  return (
    <main className="qvad-page">
      <div className="qvad-app">
        <aside className="qvad-sidebar">
          <div className="qvad-brand">
            <div className="qvad-brand-mark">Q</div>
            <div>
              <h1>Qivora</h1>
              <span>Admin System</span>
            </div>
          </div>

          <nav className="qvad-nav">
            <button onClick={() => navigate("/admin/statistical")} type="button">
              <AdminIcon name="chart" />
              <span>Thống kê</span>
            </button>
            <button onClick={() => navigate("/admin/users")} type="button">
              <AdminIcon name="user" />
              <span>Quản lí user</span>
            </button>
            <button onClick={() => navigate("/admin/quizzes")} type="button">
              <AdminIcon name="quiz" />
              <span>Quản lí quiz</span>
            </button>
            <button className="active" type="button">
              <AdminIcon name="feedback" />
              <span>Quản lí feedback</span>
            </button>
          </nav>

          <div className="qvad-admin-card">
            <strong>{displayName}</strong>
            <span>Quản trị hệ thống Qivora</span>
          </div>
        </aside>

        <section className="qvad-main">
          <header className="qvad-topbar">
            <div className="qvad-title">
              <h2>Quản lí feedback</h2>
              <p>Xem góp ý, báo lỗi và phản hồi liên quan tới quiz từ người dùng.</p>
            </div>

            <div className="qvad-profile-wrap">
              <button
                className="qvad-profile"
                onClick={() => setProfileOpen((value) => !value)}
                type="button"
              >
                {currentUser?.avatar ? (
                  <img alt={displayName} className="qvad-avatar" src={currentUser.avatar} />
                ) : (
                  <div className="qvad-avatar">
                    {getInitials(currentUser?.fullName, currentUser?.username)}
                  </div>
                )}
                <div>
                  <strong>{displayName}</strong>
                  <span>{currentUser?.email || "admin@qivora.local"}</span>
                </div>
              </button>

              {profileOpen ? (
                <div className="qvad-profile-menu">
                  <strong>{displayName}</strong>
                  <span>{currentUser?.email || currentUser?.username || "Tài khoản admin"}</span>
                  <button onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <section className="qvau-summary-grid">
            <article className="qvau-summary-card cyan">
              <span>Tổng feedback</span>
              <strong>{formatNumber(statistics?.totalFeedback || feedbacks.length)}</strong>
              <p>Toàn hệ thống</p>
            </article>
            <article className="qvau-summary-card red">
              <span>Chưa đọc</span>
              <strong>{formatNumber(statistics?.unreadFeedback || unreadCount)}</strong>
              <p>Cần admin xem</p>
            </article>
            <article className="qvau-summary-card purple">
              <span>Feedback hệ thống</span>
              <strong>{formatNumber(systemCount)}</strong>
              <p>Góp ý chung</p>
            </article>
            <article className="qvau-summary-card orange">
              <span>Feedback quiz</span>
              <strong>{formatNumber(quizCount)}</strong>
              <p>Liên quan bài quiz</p>
            </article>
          </section>

          <section className="qvaf-panel">
            <div className="qvau-toolbar">
              <div>
                <h3>Danh sách feedback</h3>
                <p>Hiển thị tên người gửi, nội dung feedback và loại feedback.</p>
              </div>

              <div className="qvaf-filter-tabs">
                <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")} type="button">
                  Tất cả
                </button>
                <button className={filter === "SYSTEM" ? "active" : ""} onClick={() => setFilter("SYSTEM")} type="button">
                  Hệ thống
                </button>
                <button className={filter === "QUIZ" ? "active" : ""} onClick={() => setFilter("QUIZ")} type="button">
                  Quiz
                </button>
                <button className={filter === "UNREAD" ? "active" : ""} onClick={() => setFilter("UNREAD")} type="button">
                  Chưa đọc
                </button>
              </div>
            </div>

            {status === "pending" ? (
              <div className="qvau-state-card">Đang tải danh sách feedback...</div>
            ) : null}

            {error ? (
              <div className="qvau-state-card error">Không thể tải danh sách feedback.</div>
            ) : null}

            <div className="qvaf-list">
              {visibleFeedbacks.map((feedback) => {
                const senderName = getSenderName(feedback);

                return (
                  <article
                    className="qvaf-card"
                    key={feedback.id}
                    onClick={() => void handleReadFeedback(feedback)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleReadFeedback(feedback);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="qvaf-avatar">{getInitials(senderName, feedback.username)}</div>

                    <div className="qvaf-content">
                      <div className="qvaf-head">
                        <strong>{senderName}</strong>
                        <span className={`qvaf-type ${feedback.type.toLowerCase()}`}>{feedback.type}</span>
                      </div>
                      <p>{feedback.content}</p>
                    </div>

                    <div className="qvaf-meta">
                      <span className={`qvaf-read ${feedback.isRead ? "read" : "unread"}`}>
                        {feedback.isRead ? "Đã đọc" : "Chưa đọc"}
                      </span>
                      <span className="qvaf-date">{formatDate(feedback.createdAt)}</span>
                      {feedback.quizCode ? <span className="qvaf-quiz">{feedback.quizCode}</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleFeedbacks.length === 0 && status !== "pending" ? (
              <div className="qvau-state-card">Không có feedback nào phù hợp.</div>
            ) : null}

            <div className="qvau-pagination">
              <button disabled={page <= 0} onClick={() => setPage((value) => value - 1)} type="button">
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  className={index === page ? "active" : ""}
                  key={index}
                  onClick={() => setPage(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              )).slice(Math.max(0, page - 2), Math.max(5, page + 3))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage((value) => value + 1)} type="button">
                Sau
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
