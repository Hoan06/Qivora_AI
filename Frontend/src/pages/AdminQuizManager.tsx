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

// Modular Components
import AdminHeader from "../components/admin/AdminHeader";
import QuizManageHeroBanner from "../components/admin-quiz/QuizManageHeroBanner";
import QuizStatsBadges from "../components/admin-quiz/QuizStatsBadges";
import QuizFilterBar from "../components/admin-quiz/QuizFilterBar";
import QuizTable from "../components/admin-quiz/QuizTable";
import SoftDeleteQuizModal from "../components/admin-quiz/SoftDeleteQuizModal";

export default function AdminQuizManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal and toast state
  const [deleteTarget, setDeleteTarget] = useState<QuizSummaryResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redux state
  const {
    quizzes,
    page,
    size,
    totalElements,
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

  const isAdmin = currentUser?.roles?.includes("ADMIN");

  // Authentication guards
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
    void dispatch(fetchAdminQuizzes({ page: 0, size: 8 }));
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

  // Filter quizzes
  const visibleQuizzes = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      // 1. Search filter
      const matchesSearch =
        !normalized ||
        [quiz.title, quiz.code, quiz.description, quiz.creatorFullName, quiz.creatorUsername]
          .filter(Boolean)
          .some((val) => val?.toLowerCase().includes(normalized));

      // 2. Status filter
      const isDeleted = Boolean(quiz.isDeleted);
      const isClosed = quiz.isActive === false && !isDeleted;
      const isOpen = quiz.isActive !== false && !isDeleted;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OPEN" && isOpen) ||
        (statusFilter === "CLOSED" && isClosed) ||
        (statusFilter === "DELETED" && isDeleted);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, quizzes]);

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
      // Clear state regardless
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

  const handleConfirmSoftDelete = async (reason: string) => {
    if (!deleteTarget?.id) return;

    try {
      await dispatch(
        softDeleteAdminQuiz({ quizId: deleteTarget.id, reason }),
      ).unwrap();

      showToast(`🗑️ Đã xóa mềm bài thi "${deleteTarget.title}" (${deleteTarget.code})!`);
      void dispatch(fetchAdminQuizzes({ page, size }));
      void dispatch(fetchAdminStatistics());
    } catch {
      showToast("⚠️ Xóa mềm bài thi thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-pink-500 selection:text-white transition-colors">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent blur-3xl z-0" />

      {/* TOP HEADER NAVBAR */}
      <AdminHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        {/* HERO BANNER */}
        <QuizManageHeroBanner />

        {/* STATS BADGES ROW */}
        <QuizStatsBadges statistics={statistics} totalElements={totalElements} />

        {/* MAIN QUIZ TABLE CARD */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col gap-6 shadow-xl shadow-pink-500/5 transition-all">
          {/* Filters Bar */}
          <QuizFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              <span>Không thể tải hoặc cập nhật danh sách bài thi Quiz.</span>
            </div>
          )}

          {/* Table & Pagination */}
          <QuizTable
            quizzes={visibleQuizzes}
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            first={first}
            last={last}
            listStatus={listStatus}
            deleteStatus={deleteStatus}
            onPageChange={handlePageChange}
            onRequestDelete={(quiz) => setDeleteTarget(quiz)}
          />
        </div>
      </main>

      {/* Soft Delete Confirmation Modal */}
      <SoftDeleteQuizModal
        quiz={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isLoading={deleteStatus === "pending"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmSoftDelete}
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
