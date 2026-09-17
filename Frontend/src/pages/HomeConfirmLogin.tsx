import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchClientHomeData, resetClientHomeState } from "../api/clientHomeSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, fetchTopRankings, resetUserState } from "../api/userSlice";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardHeroBanner from "../components/dashboard/DashboardHeroBanner";
import DashboardLeaderboard from "../components/dashboard/DashboardLeaderboard";
import DashboardNanuAssistant from "../components/dashboard/DashboardNanuAssistant";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";
import DashboardRecentQuizList from "../components/dashboard/DashboardRecentQuizList";
import DashboardStatsGrid from "../components/dashboard/DashboardStatsGrid";
import DashboardSuggestionBox from "../components/dashboard/DashboardSuggestionBox";
import DashboardToast from "../components/dashboard/DashboardToast";
import DashboardUserRankCard from "../components/dashboard/DashboardUserRankCard";
import { type AppDispatch, type RootState } from "../store/store";

export default function HomeConfirmLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentUser, rankings, status } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { recentAttempts, stats } = useSelector((state: RootState) => state.clientHome);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const myRank = useMemo(() => {
    const currentId = currentUser?.id;
    const currentUsername = currentUser?.username;
    return rankings.find(
      (item) => item.userId === currentId || item.username === currentUsername,
    )?.rank;
  }, [currentUser, rankings]);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchClientHomeData());
    void dispatch(fetchTopRankings(100));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetClientHomeState());
      navigate("/login");
    }
  }, [dispatch, navigate, status]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Clear local state regardless of BE cookie response error
    }

    dispatch(resetLoginState());
    dispatch(resetUserState());
    dispatch(resetClientHomeState());
    navigate("/login");
  };

  const handleJoinRoom = (pin: string) => {
    showToast(`Đang kết nối vào phòng thi [${pin.toUpperCase()}]...`);
    setTimeout(() => {
      navigate(`/take-quiz/${pin}`);
    }, 1000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Light Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-indigo-500/5 via-slate-500/5 to-transparent blur-3xl dark:from-indigo-600/10 dark:via-slate-800/10 z-0"></div>

      {/* HEADER NAVBAR */}
      <DashboardHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* MAIN DASHBOARD CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Suggestion Box */}
        <DashboardSuggestionBox
          onActionClick={() => {
            showToast("Bắt đầu thực hiện quiz gợi ý...");
            const firstRecent = recentAttempts[0];
            if (firstRecent) {
              navigate(`/take-quiz/${firstRecent.quizCode || firstRecent.quizId}`);
            } else {
              navigate("/quiz-manager");
            }
          }}
        />

        {/* Hero Banner with Quiz Room PIN entry */}
        <DashboardHeroBanner
          currentUser={currentUser}
          recentAttempt={recentAttempts[0]}
          onJoinRoom={handleJoinRoom}
        />

        {/* 4 Stats Cards Grid */}
        <DashboardStatsGrid
          totalAttempts={stats.totalAttempts}
          completedAttempts={stats.completedAttempts}
          inProgressAttempts={stats.inProgressAttempts}
          averageScore={stats.averageScore}
          totalScore={stats.totalScore}
          myRank={myRank}
        />

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardRecentQuizList
              recentAttempts={recentAttempts}
              onShowToast={showToast}
            />
            <DashboardQuickActions onShowToast={showToast} />
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="space-y-6">
            <DashboardLeaderboard rankings={rankings} />
            <DashboardUserRankCard
              myRank={myRank}
              totalAttempts={stats.totalAttempts}
              totalScore={stats.totalScore}
            />
            <DashboardRecentActivity recentAttempts={recentAttempts} />
          </div>
        </div>
      </main>

      {/* AI ASSISTANT NANU WIDGET */}
      <DashboardNanuAssistant />

      {/* TOAST ALERT */}
      <DashboardToast message={toastMsg} />
    </div>
  );
}
