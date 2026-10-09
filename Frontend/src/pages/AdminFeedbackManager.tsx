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

// Modular Components
import AdminHeader from "../components/admin/AdminHeader";
import FeedbackManageHeroBanner from "../components/admin-feedback/FeedbackManageHeroBanner";
import FeedbackStatsBadges from "../components/admin-feedback/FeedbackStatsBadges";
import FeedbackFilterBar from "../components/admin-feedback/FeedbackFilterBar";
import FeedbackTable from "../components/admin-feedback/FeedbackTable";
import FeedbackDetailModal from "../components/admin-feedback/FeedbackDetailModal";
import DeleteFeedbackModal from "../components/admin-feedback/DeleteFeedbackModal";

export default function AdminFeedbackManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const size = 8;

  // Modals state
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redux state
  const { feedbacks, status, error } = useSelector((state: RootState) => state.adminFeedback);
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

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Filter calculations
  const filteredFeedbacks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return feedbacks.filter((fb) => {
      // 1. Search filter
      const matchesSearch =
        !normalized ||
        [fb.senderName, fb.username, fb.userEmail, fb.content, fb.quizTitle, fb.quizCode]
          .filter(Boolean)
          .some((val) => val?.toLowerCase().includes(normalized));

      // 2. Status / type filter
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "READ" && fb.isRead) ||
        (statusFilter === "UNREAD" && !fb.isRead) ||
        (statusFilter === "SYSTEM" && fb.type === "SYSTEM") ||
        (statusFilter === "QUIZ" && fb.type === "QUIZ");

      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / size));
  const visibleFeedbacks = filteredFeedbacks.slice(page * size, (page + 1) * size);
  const unreadCount = useMemo(() => feedbacks.filter((fb) => !fb.isRead).length, [feedbacks]);

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
    dispatch(resetAdminFeedbackState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  const handleViewDetail = async (feedback: FeedbackResponse) => {
    setViewingFeedback(feedback);

    if (!feedback.isRead) {
      try {
        await dispatch(markAdminFeedbackAsRead(feedback.id)).unwrap();
        void dispatch(fetchAdminStatistics());
      } catch {
        // Silently handled
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    showToast("🗑️ Đã xóa phản hồi feedback thành công!");
    setDeleteTarget(null);
    void dispatch(fetchAdminFeedbacks());
    void dispatch(fetchAdminStatistics());
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-cyan-500 selection:text-white transition-colors">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-cyan-500/10 via-teal-500/5 to-transparent blur-3xl z-0" />

      {/* TOP HEADER NAVBAR */}
      <AdminHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        {/* HERO BANNER */}
        <FeedbackManageHeroBanner />

        {/* STATS BADGES ROW */}
        <FeedbackStatsBadges
          statistics={statistics}
          totalFeedbacks={feedbacks.length}
          unreadCount={unreadCount}
        />

        {/* MAIN FEEDBACK TABLE CARD */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col gap-6 shadow-xl shadow-cyan-500/5 transition-all">
          {/* Filters Bar */}
          <FeedbackFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              <span>Không thể tải hoặc cập nhật danh sách phản hồi feedback.</span>
            </div>
          )}

          {/* Table & Pagination */}
          <FeedbackTable
            feedbacks={visibleFeedbacks}
            page={page}
            size={size}
            totalElements={filteredFeedbacks.length}
            totalPages={totalPages}
            status={status}
            onPageChange={setPage}
            onViewDetail={handleViewDetail}
            onRequestDelete={(fb) => setDeleteTarget(fb)}
          />
        </div>
      </main>

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        feedback={viewingFeedback}
        isOpen={Boolean(viewingFeedback)}
        onClose={() => setViewingFeedback(null)}
      />

      {/* Delete Feedback Confirmation Modal */}
      <DeleteFeedbackModal
        feedback={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isLoading={false}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
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
