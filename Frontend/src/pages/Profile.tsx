import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import {
  changeProfilePassword,
  clearProfileMessage,
  fetchProfile,
  updateProfileAvatar,
} from "../api/profileSlice";
import { resetUserState } from "../api/userSlice";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardToast from "../components/dashboard/DashboardToast";
import ProfileAccountInfoCard from "../components/profile/ProfileAccountInfoCard";
import ProfileBannerCard from "../components/profile/ProfileBannerCard";
import ProfileChangePasswordModal from "../components/profile/ProfileChangePasswordModal";
import { type AppDispatch, type RootState } from "../store/store";

function getErrorMessage(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Có lỗi xảy ra khi xử lý hồ sơ.";
}

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state: RootState) => state.login);
  const { avatarStatus, error, passwordStatus, status, successMessage, user } = useSelector(
    (state: RootState) => state.profile,
  );

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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

    void dispatch(fetchProfile());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }
  }, [dispatch, navigate, status]);

  useEffect(() => {
    if (passwordStatus !== "fulfilled") return;

    showToast("Đã cập nhật mật khẩu thành công! Đang chuyển hướng...");
    setIsPasswordModalOpen(false);

    const timer = window.setTimeout(() => {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      navigate("/login");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [dispatch, navigate, passwordStatus]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage);
      dispatch(clearProfileMessage());
    } else if (error) {
      showToast(getErrorMessage(error));
      dispatch(clearProfileMessage());
    }
  }, [dispatch, error, successMessage]);

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

  const handleAvatarChange = async (file: File) => {
    showToast("Đang tải ảnh đại diện lên...");
    await dispatch(updateProfileAvatar(file));
  };

  const handleChangePasswordSubmit = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    await dispatch(changeProfilePassword(data));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Light Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-indigo-500/5 via-slate-500/5 to-transparent blur-3xl dark:from-indigo-600/10 dark:via-slate-800/10 z-0"></div>

      {/* HEADER NAVBAR */}
      <DashboardHeader currentUser={user} onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Banner Card */}
        <ProfileBannerCard
          user={user}
          avatarStatus={avatarStatus}
          onAvatarChange={handleAvatarChange}
        />

        {/* Account Info Card */}
        <ProfileAccountInfoCard
          user={user}
          onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        />
      </main>

      {/* Change Password Modal */}
      <ProfileChangePasswordModal
        isOpen={isPasswordModalOpen}
        isPending={passwordStatus === "pending"}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePasswordSubmit}
      />

      {/* Toast Alert */}
      <DashboardToast message={toastMsg} />
    </div>
  );
}
