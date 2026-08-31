import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminUsers,
  lockAdminUser,
  resetAdminUserState,
  unlockAdminUser,
} from "../api/adminUserSlice";
import {
  fetchAdminStatistics,
  resetAdminStatisticsState,
} from "../api/adminStatisticsSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type UserResponse } from "../utils/Types";
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

function LockIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value?: string) {
  if (!value) return "Không có";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function getPrimaryRole(user: UserResponse) {
  if (user.roles?.includes("ADMIN")) return "ADMIN";
  if (user.roles?.includes("CREATOR")) return "CREATOR";
  return user.roles?.[0] || "USER";
}

export default function AdminUserManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [lockTarget, setLockTarget] = useState<UserResponse | null>(null);

  const {
    users,
    page,
    size,
    totalElements,
    totalPages,
    first,
    last,
    listStatus,
    actionStatus,
    error,
  } = useSelector((state: RootState) => state.adminUser);
  const { statistics } = useSelector((state: RootState) => state.adminStatistics);
  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const displayName = currentUser?.fullName || currentUser?.username || "Administrator";
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const visibleUsers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter((user) =>
      [user.fullName, user.username, user.email, user.phone]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [keyword, users]);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
    void dispatch(fetchAdminUsers({ page: 0, size: 8 }));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected" || listStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminUserState());
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
    dispatch(resetAdminUserState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
    void dispatch(fetchAdminUsers({ page: nextPage, size }));
  };

  const handleLockUser = async () => {
    if (!lockTarget?.id) return;
    await dispatch(lockAdminUser(lockTarget.id));
    setLockTarget(null);
  };

  const handleUnlockUser = async (user: UserResponse) => {
    if (!user.id) return;
    await dispatch(unlockAdminUser(user.id));
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
            <button className="active" type="button">
              <AdminIcon name="user" />
              <span>Quản lí user</span>
            </button>
            <button onClick={() => navigate("/admin/quizzes")} type="button">
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
              <h2>Quản lí user</h2>
              <p>Theo dõi tài khoản người dùng, trạng thái hoạt động và xử lí khóa tài khoản.</p>
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
              <span>Tổng user</span>
              <strong>{formatNumber(statistics?.totalUsers || totalElements)}</strong>
              <p>{formatNumber(statistics?.activeUsers || 0)} đang hoạt động</p>
            </article>
            <article className="qvau-summary-card green">
              <span>Đang hoạt động</span>
              <strong>{formatNumber(statistics?.activeUsers || 0)}</strong>
              <p>Tài khoản có thể đăng nhập</p>
            </article>
            <article className="qvau-summary-card red">
              <span>Đã bị khóa</span>
              <strong>{formatNumber(statistics?.lockedUsers || 0)}</strong>
              <p>Cần theo dõi</p>
            </article>
            <article className="qvau-summary-card orange">
              <span>Admin</span>
              <strong>{formatNumber(statistics?.totalAdmins || 0)}</strong>
              <p>Tài khoản quản trị</p>
            </article>
          </section>

          <section className="qvau-panel">
            <div className="qvau-toolbar">
              <div>
                <h3>Danh sách người dùng</h3>
                <p>Hiển thị họ tên, username, email, phone, avatar và trạng thái tài khoản.</p>
              </div>

              <label className="qvau-search">
                <SearchIcon />
                <input
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm user trong trang hiện tại..."
                  type="text"
                  value={keyword}
                />
              </label>
            </div>

            {listStatus === "pending" ? (
              <div className="qvau-state-card">Đang tải danh sách user...</div>
            ) : null}

            {error ? (
              <div className="qvau-state-card error">Không thể tải hoặc cập nhật user.</div>
            ) : null}

            <div className="qvau-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => {
                    const isSelf = user.id === currentUser?.id || user.username === currentUser?.username;
                    const active = user.isActive !== false;
                    const primaryRole = getPrimaryRole(user);

                    return (
                      <tr key={user.id || user.username}>
                        <td>
                          <div className="qvau-user-cell">
                            {user.avatar ? (
                              <img alt={user.fullName || user.username} className="qvau-avatar" src={user.avatar} />
                            ) : (
                              <div className="qvau-avatar">{getInitials(user.fullName, user.username)}</div>
                            )}
                            <div>
                              <strong>{user.fullName || "Chưa cập nhật"}</strong>
                              <span>ID: #{user.id || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || "Không có"}</td>
                        <td><span className="qvau-role">{primaryRole}</span></td>
                        <td>
                          <span className={`qvau-status ${active ? "active" : "locked"}`}>
                            {active ? "Hoạt động" : "Đã khóa"}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {active ? (
                            <button
                              className="qvau-action-btn ban"
                              disabled={isSelf || actionStatus === "pending"}
                              onClick={() => setLockTarget(user)}
                              type="button"
                            >
                              {isSelf ? "Admin" : "Khóa acc"}
                            </button>
                          ) : (
                            <button
                              className="qvau-action-btn unlock"
                              disabled={actionStatus === "pending"}
                              onClick={() => void handleUnlockUser(user)}
                              type="button"
                            >
                              Mở khóa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleUsers.length === 0 && listStatus !== "pending" ? (
              <div className="qvau-state-card">Không có user nào phù hợp.</div>
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

      {lockTarget ? (
        <div className="qvau-modal-backdrop" onClick={() => setLockTarget(null)}>
          <div className="qvau-modal" onClick={(event) => event.stopPropagation()}>
            <div className="qvau-modal-mark">
              <LockIcon />
            </div>
            <h2>Khóa tài khoản?</h2>
            <p>
              Bạn chắc chắn muốn khóa tài khoản <strong>{lockTarget.fullName || lockTarget.username}</strong>?
              Sau khi khóa, tài khoản này sẽ không thể đăng nhập vào hệ thống.
            </p>
            <div className="qvau-modal-actions">
              <button className="qvau-cancel-btn" onClick={() => setLockTarget(null)} type="button">
                Hủy
              </button>
              <button
                className="qvau-confirm-btn"
                disabled={actionStatus === "pending"}
                onClick={() => void handleLockUser()}
                type="button"
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
