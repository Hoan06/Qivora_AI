import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { loginUser } from "../../api/loginSlice";
import { registerUser } from "../../api/registerSlice";
import { type AppDispatch } from "../../store/store";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

function getPasswordStrength(val: string) {
  if (!val) {
    return { score: 0, label: "Nhập mật khẩu", color: "bg-slate-300 dark:bg-slate-700", width: "0%" };
  }
  let score = 0;
  if (val.length >= 6) score += 1;
  if (val.length >= 8) score += 1;
  if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score += 1;
  if (/[^A-Za-z0-9]/.test(val)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: "Yếu", color: "bg-red-500", width: "25%" };
    case 2:
      return { score: 2, label: "Trung bình", color: "bg-amber-500", width: "50%" };
    case 3:
      return { score: 3, label: "Mạnh", color: "bg-cyan-500", width: "75%" };
    case 4:
    default:
      return { score: 4, label: "Rất mạnh", color: "bg-emerald-500", width: "100%" };
  }
}

export default function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onShowToast,
}: AuthModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Login form state
  const [loginIdentity, setLoginIdentity] = useState("huyhoan13032006");
  const [loginPassword, setLoginPassword] = useState("12345678");

  // Register form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    onShowToast("Đang xác thực tài khoản Google...");
    setTimeout(() => {
      onClose();
      onShowToast("Đăng nhập bằng Google thành công! Đang chuyển hướng...");
    }, 1000);
  };

  const getLoginUsername = (value: string) => {
    const identity = value.trim();
    return identity.includes("@") ? identity.split("@")[0] : identity;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const user = await dispatch(
        loginUser({
          username: getLoginUsername(loginIdentity),
          password: loginPassword,
        })
      ).unwrap();

      onClose();
      onShowToast("Đăng nhập thành công!");
      navigate(user.roles?.includes("ADMIN") ? "/admin/statistical" : "/");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Đăng nhập thất bại.";
      setErrorMessage(msg);
      onShowToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!";
      setErrorMessage(msg);
      onShowToast(msg);
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        registerUser({
          username: email.trim().split("@")[0] || email.trim(),
          password,
          email: email.trim(),
          fullName: fullName.trim(),
        })
      ).unwrap();

      onShowToast("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      setMode("login");
      setLoginIdentity(email.trim().split("@")[0] || email.trim());
      setLoginPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Đăng ký thất bại.";
      setErrorMessage(msg);
      onShowToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative transform transition-all duration-300 scale-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Logo */}
        <img
          src={logo}
          alt="Qivora Logo"
          className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-purple-500/30 mb-6 mx-auto"
        />

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 text-center">
            {errorMessage}
          </div>
        )}

        {/* LOGIN STATE */}
        {mode === "login" ? (
          <div>
            <h3 className="text-2xl font-extrabold text-center mb-1 text-slate-900 dark:text-white">
              Chào Mừng Trở Lại
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Đăng nhập tài khoản Qivora của bạn
            </p>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow mb-4"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                hoặc email
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Email hoặc Tên đăng nhập"
                value={loginIdentity}
                onChange={(e) => setLoginIdentity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-purple-500 transition-colors"
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-purple-500 transition-colors"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-md hover:shadow-purple-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                <span>Đăng nhập</span>
              </button>
            </form>

            <p className="text-xs text-center text-slate-500 mt-6">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        ) : (
          /* REGISTER STATE */
          <div>
            <h3 className="text-2xl font-extrabold text-center mb-1 text-slate-900 dark:text-white">
              Tạo Tài Khoản
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Trải nghiệm tạo đề AI miễn phí
            </p>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow mb-4"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng ký bằng Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                hoặc email
              </span>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <input
                type="text"
                placeholder="Họ và tên đầy đủ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-purple-500 transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-purple-500 transition-colors"
                required
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-purple-500 transition-colors"
                required
              />

              {/* Password Strength Meter */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
                  <span>Độ an toàn mật khẩu:</span>
                  <span
                    className={`font-bold ${
                      strength.score === 1
                        ? "text-red-500"
                        : strength.score === 2
                        ? "text-amber-500"
                        : strength.score === 3
                        ? "text-cyan-500"
                        : strength.score === 4
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  ></div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500 focus:border-red-500"
                      : confirmPassword && confirmPassword === password
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-purple-500"
                  }`}
                  required
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-red-500 mt-1 px-1 font-medium">
                    Mật khẩu xác nhận chưa khớp
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-md hover:shadow-purple-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                <span>Đăng ký tài khoản</span>
              </button>
            </form>

            <p className="text-xs text-center text-slate-500 mt-6">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
