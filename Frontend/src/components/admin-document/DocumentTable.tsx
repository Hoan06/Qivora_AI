import { type DocumentResponse, type DocumentStatus } from "../../utils/Types";

interface DocumentTableProps {
  documents: DocumentResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onPreview: (doc: DocumentResponse) => void;
  onDeleteClick: (doc: DocumentResponse) => void;
}

export default function DocumentTable({
  documents,
  page,
  totalPages,
  totalElements,
  pageSize,
  isLoading = false,
  onPageChange,
  onPreview,
  onDeleteClick,
}: DocumentTableProps) {
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
    if (status === "FAILED") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] inline-flex items-center gap-1.5">
          <i className="fa-solid fa-triangle-exclamation"></i>
          Thất bại
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 border border-slate-500/30 text-slate-500 font-extrabold text-[11px]">
        Chờ xử lý
      </span>
    );
  };

  const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-6">
      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700/70 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-700/70 uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Tên tài liệu</th>
              <th className="p-4">Dung lượng</th>
              <th className="p-4">Chunks Vector</th>
              <th className="p-4">Người tải</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i>
                    <span className="text-xs font-bold text-slate-500">Đang tải danh sách tài liệu từ máy chủ...</span>
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl">
                      <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Không có tài liệu nào trong cơ sở tri thức</span>
                    <span className="text-[11px] text-slate-400">Hãy nhấn "Nạp tài liệu mới" để thêm tài liệu đầu tiên vào hệ thống.</span>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const fileInfo = getFileIcon(doc.fileType, doc.name);
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-4 text-slate-400 font-mono">#{doc.id}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${fileInfo.bg}`}
                        >
                          <i className={fileInfo.icon}></i>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span
                            className="truncate leading-tight text-xs sm:text-sm"
                            title={doc.name}
                          >
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                            {doc.fileType?.split("/")[1]?.toUpperCase() || "DOC"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-extrabold ${
                          doc.chunkCount > 0
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400"
                        }`}
                      >
                        {doc.chunkCount} chunks
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <i className="fa-solid fa-circle-user text-indigo-500"></i>
                        {doc.uploaderUsername || "admin"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="p-4">{renderStatusBadge(doc.status)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onPreview(doc)}
                          className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                          title="Xem trước tài liệu"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>
                        {doc.linkDocument && (
                          <a
                            href={doc.linkDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Mở link Cloudinary gốc"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteClick(doc)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2">
        <span>
          Hiển thị {startRecord} - {endRecord} trong tổng số {totalElements} tài liệu
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Trước
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  page === pageNum
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
