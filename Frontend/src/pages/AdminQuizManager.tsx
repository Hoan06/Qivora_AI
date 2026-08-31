import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminQuizzes,
  resetAdminQuizState,
  softDeleteAdminQuiz,
} from "../api/adminQuizSlice";
import {
  fetchAdminStatistics,
  resetAdminStatisticsState,
} from "../api/adminStatisticsSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type QuizSummaryResponse } from "../utils/Types";
import "../styles/dashboard.css";

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

function SearchIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function getInitials(name?: string, username?: string) {
  const displayName = name?.trim() || username?.trim() || "Admin";
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

function getQuizStatus(quiz: QuizSummaryResponse) {
  if (quiz.isDeleted) return { className: "deleted", label: "Đã xóa" };
  if (quiz.isActive === false) return { className: "closed", label: "Đã đóng" };
  return { className: "active", label: "Hoạt động" };
}

export default function AdminQuizManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuizSummaryResponse | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const {
    quizzes,
    page,
    size,
    totalPages,
    first,
    last,
    listStatus,
    deleteStatus,
    error,
  } = useSelector((state: RootState) => state.adminQuiz);
  const { statistics } = useSelector((state: RootState) => state.adminStatistics);
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const displayName = currentUser?.fullName || currentUser?.username || "Administrator";
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const visibleQuizzes = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return quizzes;

    return quizzes.filter((quiz) =>
      [quiz.title, quiz.code, quiz.description, quiz.creatorFullName, quiz.creatorUsername]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [keyword, quizzes]);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
    void dispatch(fetchAdminQuizzes({ page: 0, size: 6 }));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected" || listStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminQuizState());
      dispatch(resetAdminStatisticsState());
      navigate("/login");
    }
  }, [dispatch, listStatus, navigate, userStatus]);

  useEffect(() => {
    if (userStatus === "fulfilled" && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate, userStatus]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Van xoa local state neu token/cookie da het han.
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetAdminQuizState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
    void dispatch(fetchAdminQuizzes({ page: nextPage, size }));
  };

  const openDeleteModal = (quiz: QuizSummaryResponse) => {
    setDeleteTarget(quiz);
    setDeleteReason("");
    setReasonError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteReason("");
    setReasonError("");
  };

  const handleSoftDelete = async () => {
    if (!deleteTarget?.id) return;
    if (!deleteReason.trim()) {
      setReasonError("Vui lòng nhập lý do xóa quiz.");
      return;
    }

    await dispatch(softDeleteAdminQuiz({ quizId: deleteTarget.id, reason: deleteReason.trim() }));
    closeDeleteModal();
    void dispatch(fetchAdminQuizzes({ page, size }));
    void dispatch(fetchAdminStatistics());
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
            <button className="active" type="button">
              <AdminIcon name="quiz" />
              <span>Quản lí quiz</span>
            </button>
            <button onClick={() => navigate("/admin/feedback")} type="button">
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
              <h2>Quản lí quiz</h2>
              <p>Theo dõi toàn bộ quiz trong hệ thống và xử lí xóa mềm quiz vi phạm.</p>
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
            <article className="qvau-summary-card purple">
              <span>Tổng quiz</span>
              <strong>{formatNumber(statistics?.totalQuizzes || 0)}</strong>
              <p>Toàn hệ thống</p>
            </article>
            <article className="qvau-summary-card green">
              <span>Đang hoạt động</span>
              <strong>{formatNumber(statistics?.activeQuizzes || 0)}</strong>
              <p>Quiz có thể làm</p>
            </article>
            <article className="qvau-summary-card orange">
              <span>Đã đóng</span>
              <strong>{formatNumber(statistics?.inactiveQuizzes || 0)}</strong>
              <p>Không còn mở</p>
            </article>
            <article className="qvau-summary-card red">
              <span>Đã xóa mềm</span>
              <strong>{formatNumber(statistics?.deletedQuizzes || 0)}</strong>
              <p>Quiz vi phạm</p>
            </article>
          </section>

          <section className="qvaq-panel">
            <div className="qvau-toolbar">
              <div>
                <h3>Danh sách quiz</h3>
                <p>Hiển thị quiz, người tạo, trạng thái, lượt làm và thao tác xóa mềm.</p>
              </div>

              <label className="qvau-search">
                <SearchIcon />
                <input
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm quiz trong trang hiện tại..."
                  type="text"
                  value={keyword}
                />
              </label>
            </div>

            {listStatus === "pending" ? (
              <div className="qvau-state-card">Đang tải danh sách quiz...</div>
            ) : null}

            {error ? (
              <div className="qvau-state-card error">Không thể tải hoặc cập nhật quiz.</div>
            ) : null}

            <div className="qvaq-grid">
              {visibleQuizzes.map((quiz) => {
                const status = getQuizStatus(quiz);

                return (
                  <article className={`qvaq-card ${quiz.isDeleted ? "deleted" : ""}`} key={quiz.id}>
                    <div className="qvaq-top">
                      <span className="qvaq-code">{quiz.code}</span>
                      <span className={`qvaq-status ${status.className}`}>{status.label}</span>
                    </div>

                    <h3>{quiz.title}</h3>
                    <p>{quiz.description || "Quiz chưa có mô tả."}</p>

                    <div className="qvaq-meta">
                      <div>
                        <strong>{formatNumber(quiz.totalQuestions || 0)}</strong>
                        <span>Câu hỏi</span>
                      </div>
                      <div>
                        <strong>{formatNumber(quiz.timeLimit || 0)}</strong>
                        <span>Phút</span>
                      </div>
                      <div>
                        <strong>{formatNumber(quiz.totalAttempts || 0)}</strong>
                        <span>Lượt làm</span>
                      </div>
                    </div>

                    <div className="qvaq-footer">
                      <div className="qvaq-creator">
                        <span>Người tạo</span>
                        <strong>{quiz.creatorFullName || quiz.creatorUsername || "Không rõ"}</strong>
                      </div>
                      <button
                        className="qvaq-delete-btn"
                        disabled={quiz.isDeleted || deleteStatus === "pending"}
                        onClick={() => openDeleteModal(quiz)}
                        type="button"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleQuizzes.length === 0 && listStatus !== "pending" ? (
              <div className="qvau-state-card">Không có quiz nào phù hợp.</div>
            ) : null}

            <div className="qvau-pagination">
              <button disabled={first} onClick={() => handlePageChange(page - 1)} type="button">
                Trước
              </button>
              {Array.from({ length: totalPages || 1 }, (_, index) => (
                <button
                  className={index === page ? "active" : ""}
                  key={index}
                  onClick={() => handlePageChange(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              )).slice(Math.max(0, page - 2), Math.max(5, page + 3))}
              <button disabled={last} onClick={() => handlePageChange(page + 1)} type="button">
                Sau
              </button>
            </div>
          </section>
        </section>
      </div>

      {deleteTarget ? (
        <div className="qvau-modal-backdrop" onClick={closeDeleteModal}>
          <div className="qvau-modal qvaq-modal" onClick={(event) => event.stopPropagation()}>
            <div className="qvau-modal-mark">
              <DeleteIcon />
            </div>
            <h2>Xóa mềm quiz?</h2>
            <p>
              Bạn đang chuẩn bị xóa mềm quiz <strong>{deleteTarget.title}</strong>.
              Quiz sẽ không hiển thị cho người dùng nữa nhưng dữ liệu vẫn được giữ trong hệ thống.
            </p>

            <label className="qvaq-reason-field">
              <span>Lý do xóa quiz</span>
              <textarea
                onChange={(event) => {
                  setDeleteReason(event.target.value);
                  if (reasonError) setReasonError("");
                }}
                placeholder="Ví dụ: Nội dung không phù hợp, quiz spam, sai dữ liệu..."
                value={deleteReason}
              />
              {reasonError ? <small>{reasonError}</small> : null}
            </label>

            <div className="qvau-modal-actions">
              <button className="qvau-cancel-btn" onClick={closeDeleteModal} type="button">
                Hủy
              </button>
              <button
                className="qvau-confirm-btn"
                disabled={deleteStatus === "pending"}
                onClick={() => void handleSoftDelete()}
                type="button"
              >
                Xác nhận xóa mềm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
