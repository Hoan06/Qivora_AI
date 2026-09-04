import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import {
  deleteMyQuiz,
  fetchMyQuizManageDetail,
  fetchMyQuizzes,
} from "../api/quizManagerSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardToast from "../components/dashboard/DashboardToast";
import QuizManagerCardGrid from "../components/quiz-manager/QuizManagerCardGrid";
import QuizManagerDeleteModal from "../components/quiz-manager/QuizManagerDeleteModal";
import QuizManagerDetailModal from "../components/quiz-manager/QuizManagerDetailModal";
import QuizManagerHeaderBanner from "../components/quiz-manager/QuizManagerHeaderBanner";
import QuizManagerMetricsGrid from "../components/quiz-manager/QuizManagerMetricsGrid";
import QuizManagerPagination from "../components/quiz-manager/QuizManagerPagination";
import QuizManagerToolbar from "../components/quiz-manager/QuizManagerToolbar";
import { type AppDispatch, type RootState } from "../store/store";
import { type QuizSummaryResponse } from "../utils/Types";

export default function QuizManagerClient() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentUser, status: userStatus } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const {
    deleteStatus,
    detail,
    detailStatus,
    first,
    last,
    listStatus,
    page,
    quizzes,
    totalElements,
    totalPages,
  } = useSelector((state: RootState) => state.quizManager);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortFilter, setSortFilter] = useState("NEWEST");

  const [detailModalQuiz, setDetailModalQuiz] = useState<QuizSummaryResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuizSummaryResponse | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchMyQuizzes({ page: 0, size: 6 }));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }
  }, [dispatch, navigate, userStatus]);

  // Client-side Filtered & Sorted Quizzes
  const processedQuizzes = useMemo(() => {
    let result = [...quizzes];

    // Filter by keyword
    if (keyword.trim()) {
      const search = keyword.trim().toLowerCase();
      result = result.filter(
        (q) => q.title.toLowerCase().includes(search) || q.code.toLowerCase().includes(search),
      );
    }

    // Filter by status
    if (statusFilter === "ACTIVE") {
      result = result.filter((q) => q.isActive);
    } else if (statusFilter === "INACTIVE") {
      result = result.filter((q) => !q.isActive);
    }

    // Sort
    if (sortFilter === "MOST_ATTEMPTS") {
      result.sort((a, b) => (b.totalAttempts || 0) - (a.totalAttempts || 0));
    } else if (sortFilter === "MOST_QUESTIONS") {
      result.sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
    } else {
      // NEWEST by default
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [quizzes, keyword, statusFilter, sortFilter]);

  // Metrics
  const totalQuizzes = totalElements || quizzes.length;
  const totalAttempts = useMemo(
    () => quizzes.reduce((sum, q) => sum + (q.totalAttempts || 0), 0),
    [quizzes],
  );
  const activeQuizzes = useMemo(() => quizzes.filter((q) => q.isActive).length, [quizzes]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Clear local state regardless of BE cookie response error
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    navigate("/login");
  };

  const handleRefresh = () => {
    showToast("Đang làm mới danh sách quiz cá nhân...");
    void dispatch(fetchMyQuizzes({ page: 0, size: 6 }));
  };

  const handleOpenDetailModal = (quiz: QuizSummaryResponse) => {
    setDetailModalQuiz(quiz);
    void dispatch(fetchMyQuizManageDetail(quiz.id));
  };

  const handleCopyCode = (code: string) => {
    void navigator.clipboard?.writeText(code);
    showToast(`Đã sao chép mã quiz [${code}] vào bộ nhớ tạm!`);
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/take-quiz/${code}`;
    void navigator.clipboard?.writeText(link);
    showToast(`Đã sao chép link tham gia thi mã [${code}]!`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const quizName = deleteTarget.title;
    await dispatch(deleteMyQuiz(deleteTarget.id));
    setDeleteTarget(null);
    showToast(`Đã xóa bài thi "${quizName}" thành công!`);
    void dispatch(fetchMyQuizzes({ page, size: 6 }));
  };

  const handlePageChange = (nextPage: number) => {
    void dispatch(fetchMyQuizzes({ page: nextPage, size: 6 }));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Light Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-indigo-500/5 via-slate-500/5 to-transparent blur-3xl dark:from-indigo-600/10 dark:via-slate-800/10 z-0"></div>

      {/* HEADER NAVBAR */}
      <DashboardHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header Banner */}
        <QuizManagerHeaderBanner onRefresh={handleRefresh} />

        {/* Metrics Grid */}
        <QuizManagerMetricsGrid
          totalQuizzes={totalQuizzes}
          totalAttempts={totalAttempts}
          activeQuizzes={activeQuizzes}
          avgScoreText="8.2 / 10"
        />

        {/* Toolbar & Filters */}
        <QuizManagerToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortFilter={sortFilter}
          onSortFilterChange={setSortFilter}
        />

        {/* Loading State Indicator */}
        {listStatus === "pending" ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
            <i className="fa-solid fa-spinner fa-spin text-xl text-indigo-500 mb-2"></i>
            <div>Đang tải danh sách quiz cá nhân...</div>
          </div>
        ) : (
          /* Quiz Card Grid */
          <QuizManagerCardGrid
            quizzes={processedQuizzes}
            onOpenDetail={handleOpenDetailModal}
            onCopyCode={handleCopyCode}
            onCopyLink={handleCopyLink}
            onDeleteQuiz={(quiz) => setDeleteTarget(quiz)}
          />
        )}

        {/* Pagination */}
        <QuizManagerPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          displayedCount={processedQuizzes.length}
          first={first}
          last={last}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Detail / Results Report Modal */}
      <QuizManagerDetailModal
        isOpen={Boolean(detailModalQuiz)}
        quiz={detailModalQuiz}
        detail={detail}
        isPending={detailStatus === "pending"}
        onClose={() => setDetailModalQuiz(null)}
        onExportCSV={() => showToast("Đã xuất báo cáo điểm số thí sinh ra file Excel/CSV!")}
      />

      {/* Delete Confirmation Modal */}
      <QuizManagerDeleteModal
        isOpen={Boolean(deleteTarget)}
        quiz={deleteTarget}
        isPending={deleteStatus === "pending"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Alert */}
      <DashboardToast message={toastMsg} />
    </div>
  );
}
