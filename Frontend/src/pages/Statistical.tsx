import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminStatistics,
  resetAdminStatisticsState,
} from "../api/adminStatisticsSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type AdminStatisticsResponse } from "../utils/Types";

// Modular Admin Components
import AdminHeader from "../components/admin/AdminHeader";
import AdminHeroBanner from "../components/admin/AdminHeroBanner";
import AdminStatCards from "../components/admin/AdminStatCards";
import AdminActivityChart from "../components/admin/AdminActivityChart";
import AdminDonutChart from "../components/admin/AdminDonutChart";

const emptyStatistics: AdminStatisticsResponse = {
  totalUsers: 0,
  activeUsers: 0,
  lockedUsers: 0,
  totalAdmins: 0,
  totalQuizzes: 0,
  activeQuizzes: 0,
  inactiveQuizzes: 0,
  deletedQuizzes: 0,
  totalAttempts: 0,
  completedAttempts: 0,
  inProgressAttempts: 0,
  guestAttempts: 0,
  registeredUserAttempts: 0,
  totalFeedback: 0,
  unreadFeedback: 0,
};

export default function Statistical() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { statistics, status: statisticsStatus } = useSelector(
    (state: RootState) => state.adminStatistics,
  );
  const { currentUser, status: userStatus } = useSelector(
    (state: RootState) => state.user,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const data = statistics || emptyStatistics;
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const isRefreshing = statisticsStatus === "pending";

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminStatistics());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected" || statisticsStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminStatisticsState());
      navigate("/login");
    }
  }, [dispatch, navigate, statisticsStatus, userStatus]);

  useEffect(() => {
    if (userStatus === "fulfilled" && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate, userStatus]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Clear local state even if token has expired
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetAdminStatisticsState());
    navigate("/login");
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchCurrentUser()).unwrap(),
        dispatch(fetchAdminStatistics()).unwrap(),
      ]);
      setToastMessage("🔄 Đã đồng bộ dữ liệu mới nhất từ hệ thống Qivora!");
    } catch {
      setToastMessage("⚠️ Làm mới dữ liệu gặp lỗi, vui lòng thử lại!");
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Soft Ambient Glow at Top */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl z-0" />

      {/* TOP HEADER NAVBAR */}
      <AdminHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        {/* HERO BANNER */}
        <AdminHeroBanner onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* 4 SUMMARY METRIC CARDS WITH PROGRESS BARS */}
        <AdminStatCards statistics={data} />

        {/* ULTRA MODERN SMOOTH GRADIENT LINE CHART & DONUT RATIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: SMOOTH AREA LINE CHART */}
          <AdminActivityChart statistics={data} />

          {/* RIGHT: DONUT RATIO CHART */}
          <AdminDonutChart statistics={data} />
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            type="button"
            className="text-slate-400 hover:text-white transition-colors ml-2"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
