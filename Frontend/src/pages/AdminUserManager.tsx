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
import { registerUser } from "../api/registerSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type UserResponse } from "../utils/Types";

// Modular Components
import AdminHeader from "../components/admin/AdminHeader";
import UserManageHeroBanner from "../components/admin-user/UserManageHeroBanner";
import UserStatsBadges from "../components/admin-user/UserStatsBadges";
import UserFilterBar from "../components/admin-user/UserFilterBar";
import UserTable from "../components/admin-user/UserTable";
import LockUserModal from "../components/admin-user/LockUserModal";
import DeleteUserModal from "../components/admin-user/DeleteUserModal";
import AddUserModal, { type NewUserData } from "../components/admin-user/AddUserModal";

export default function AdminUserManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [lockTarget, setLockTarget] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redux state
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

  const isAdmin = currentUser?.roles?.includes("ADMIN");

  // Authentication guards
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

  // Filtered users calculation
  const visibleUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      // 1. Search keyword filter
      const matchesSearch =
        !normalized ||
        [user.fullName, user.username, user.email, user.phone]
          .filter(Boolean)
          .some((val) => val?.toLowerCase().includes(normalized));

      // 2. Role filter
      const userRoles = user.roles || ["USER"];
      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && userRoles.includes("ADMIN")) ||
        (roleFilter === "USER" && !userRoles.includes("ADMIN"));

      // 3. Status filter
      const isActive = user.isActive !== false;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "LOCKED" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter, users]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Clear local state regardless
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

  // Lock / Unlock handlers
  const handleConfirmLockToggle = async () => {
    if (!lockTarget?.id) return;
    const isCurrentlyLocked = lockTarget.isActive === false;

    try {
      if (isCurrentlyLocked) {
        await dispatch(unlockAdminUser(lockTarget.id)).unwrap();
        showToast(`🔓 Đã mở khóa tài khoản "${lockTarget.fullName || lockTarget.username}" thành công!`);
      } else {
        await dispatch(lockAdminUser(lockTarget.id)).unwrap();
        showToast(`🔒 Đã khóa tài khoản "${lockTarget.fullName || lockTarget.username}" thành công!`);
      }
      void dispatch(fetchAdminStatistics());
    } catch {
      showToast("⚠️ Thao tác khóa/mở khóa thất bại, vui lòng thử lại!");
    } finally {
      setLockTarget(null);
    }
  };

  // Delete User Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    showToast(`🗑️ Đã xóa tài khoản "${deleteTarget.fullName || deleteTarget.username}" thành công!`);
    setDeleteTarget(null);
    void dispatch(fetchAdminUsers({ page, size }));
    void dispatch(fetchAdminStatistics());
  };

  // Create User Handler
  const handleAddNewUser = async (data: NewUserData) => {
    try {
      const res = await dispatch(
        registerUser({
          fullName: data.fullName,
          username: data.username,
          password: data.password,
          email: data.email,
        }),
      ).unwrap();

      if (data.status === "LOCKED" && res.id) {
        await dispatch(lockAdminUser(res.id)).unwrap();
      }

      showToast(`🎉 Đã tạo thành công tài khoản "${data.fullName}" (${data.username})!`);
      void dispatch(fetchAdminUsers({ page: 0, size }));
      void dispatch(fetchAdminStatistics());
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "string"
          ? err
          : "Khởi tạo tài khoản thất bại, username hoặc email có thể đã tồn tại!";
      throw new Error(errorMsg);
    }
  };

  const handleEditRole = (user: UserResponse) => {
    const role = user.roles?.includes("ADMIN") ? "Quản trị viên (ADMIN)" : "Học viên (USER)";
    showToast(`👤 Tài khoản ${user.username} hiện có vai trò: ${role}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl z-0" />

      {/* TOP HEADER NAVBAR */}
      <AdminHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        {/* HERO BANNER */}
        <UserManageHeroBanner onOpenAddUser={() => setIsAddUserOpen(true)} />

        {/* STATS BADGES ROW */}
        <UserStatsBadges statistics={statistics} totalElements={totalElements} />

        {/* MAIN TABLE CARD WITH FILTER CONTROLS */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col gap-6 shadow-xl shadow-indigo-500/5 transition-all">
          {/* Filters Bar */}
          <UserFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              <span>Không thể tải hoặc cập nhật danh sách người dùng.</span>
            </div>
          )}

          {/* Table & Pagination */}
          <UserTable
            users={visibleUsers}
            currentUserId={currentUser?.id}
            currentUsername={currentUser?.username}
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            first={first}
            last={last}
            listStatus={listStatus}
            actionStatus={actionStatus}
            onPageChange={handlePageChange}
            onRequestLockToggle={(user) => setLockTarget(user)}
            onRequestDelete={(user) => setDeleteTarget(user)}
            onEditRole={handleEditRole}
          />
        </div>
      </main>

      {/* Lock / Unlock Modal */}
      <LockUserModal
        user={lockTarget}
        isOpen={Boolean(lockTarget)}
        isLoading={actionStatus === "pending"}
        onClose={() => setLockTarget(null)}
        onConfirm={handleConfirmLockToggle}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        user={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isLoading={actionStatus === "pending"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Add New User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        isLoading={actionStatus === "pending"}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddNewUser}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            type="button"
            className="text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
