interface DashboardToastProps {
  message: string | null;
  type?: "success" | "error";
}

export default function DashboardToast({ message, type }: DashboardToastProps) {
  if (!message) return null;

  const lowerMsg = message.toLowerCase();
  const isError =
    type === "error" ||
    lowerMsg.includes("thất bại") ||
    lowerMsg.includes("không chính xác") ||
    lowerMsg.includes("lỗi") ||
    lowerMsg.includes("sai") ||
    lowerMsg.includes("từ chối") ||
    lowerMsg.includes("error") ||
    lowerMsg.includes("fail") ||
    lowerMsg.includes("không khớp") ||
    lowerMsg.includes("khóa");

  return (
    <div
      className={`fixed bottom-5 left-5 z-50 px-5 py-3 rounded-2xl bg-slate-800 text-white border shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce ${
        isError ? "border-rose-500/60" : "border-slate-700"
      }`}
    >
      <i
        className={`fa-solid ${
          isError ? "fa-circle-xmark text-rose-500" : "fa-circle-check text-emerald-400"
        } text-base`}
      ></i>
      <span>{message}</span>
    </div>
  );
}
