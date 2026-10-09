import { useState } from "react";
import { type DocumentResponse, type DocumentStatus } from "../../utils/Types";

interface DocumentPreviewModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({
  document: doc,
  onClose,
}: DocumentPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"text" | "chunks">("text");

  if (!doc) return null;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getFileIcon = (fileType: string = "", name: string = "") => {
    const lowerType = fileType.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) {
      return {
        bg: "bg-rose-500/15 text-rose-500 border border-rose-500/30",
        icon: "fa-solid fa-file-pdf",
      };
    }
    if (
      lowerType.includes("word") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc")
    ) {
      return {
        bg: "bg-blue-500/15 text-blue-500 border border-blue-500/30",
        icon: "fa-solid fa-file-word",
      };
    }
    if (lowerType.includes("markdown") || lowerName.endsWith(".md")) {
      return {
        bg: "bg-indigo-500/15 text-indigo-500 border border-indigo-500/30",
        icon: "fa-brands fa-markdown",
      };
    }
    return {
      bg: "bg-purple-500/15 text-purple-500 border border-purple-500/30",
      icon: "fa-solid fa-file-lines",
    };
  };

  const renderStatusBadge = (status: DocumentStatus) => {
    if (status === "COMPLETED") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Hoàn tất
        </span>
      );
    }
    if (status === "PROCESSING") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] inline-flex items-center gap-1.5">
          <i className="fa-solid fa-rotate fa-spin text-[10px]"></i>
          Đang nạp...
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] inline-flex items-center gap-1.5">
        <i className="fa-solid fa-triangle-exclamation"></i>
        Thất bại
      </span>
    );
  };

  const fileInfo = getFileIcon(doc.fileType, doc.name);
  const sampleText =
    doc.sampleContent ||
    `Tài liệu "${doc.name}" đang được lưu trữ trên hệ thống. 
(Chưa có nội dung văn bản xem trước hoặc nội dung đang được cập nhật).`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:px-7 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md ${fileInfo.bg}`}
            >
              <i className={fileInfo.icon}></i>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white max-w-md truncate">
                {doc.name}
              </h3>
              <div className="mt-0.5">{renderStatusBadge(doc.status)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doc.linkDocument && (
              <a
                href={doc.linkDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:border-indigo-500 flex items-center justify-center transition-all"
                title="Mở link tài liệu gốc"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-400 flex items-center justify-center transition-all"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Meta Bar */}
        <div className="px-5 sm:px-7 py-3 bg-slate-100/60 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-database text-indigo-500"></i> Dung lượng:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {formatBytes(doc.fileSize)}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-purple-500"></i> Chunks:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {doc.chunkCount} chunks
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-user text-cyan-500"></i> Người nạp:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {doc.uploaderUsername || "admin"}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fa-regular fa-clock text-amber-500"></i> Ngày tạo:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {formatDate(doc.createdAt)}
            </strong>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-7 border-b border-slate-200 dark:border-slate-700/80 flex gap-6 text-xs font-bold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("text")}
            className={`py-3 flex items-center gap-2 transition-all ${
              activeTab === "text"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-slate-500 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            <i className="fa-solid fa-align-left"></i> Nội dung trích xuất
          </button>
          <button
            onClick={() => setActiveTab("chunks")}
            className={`py-3 flex items-center gap-2 transition-all ${
              activeTab === "chunks"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-slate-500 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            <i className="fa-solid fa-cubes"></i> Vector Chunks ({doc.chunkCount})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto max-h-[55vh]">
          {activeTab === "text" ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 select-text">
              {sampleText}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {doc.chunkCount > 0 ? (
                Array.from(
                  { length: Math.min(doc.chunkCount, 5) },
                  (_, i) => i + 1
                ).map((chunkNum) => (
                  <div
                    key={chunkNum}
                    className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/50 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-cube"></i> CHUNK #{chunkNum} &bull; 800 tokens
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                        SIMILARITY: 0.89
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                      "{sampleText.substring(0, 180)}..."
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                  Tài liệu này chưa có chunks hoặc đang trong hàng đợi xử lý vector.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
