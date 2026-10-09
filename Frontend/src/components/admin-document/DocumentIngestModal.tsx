import { useRef, useState } from "react";

interface DocumentIngestModalProps {
  isOpen: boolean;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export default function DocumentIngestModal({
  isOpen,
  isUploading,
  onClose,
  onUpload,
}: DocumentIngestModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col relative text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Nạp Tài Liệu Kiến Thức Mới
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trích xuất văn bản & sinh vector chunks cho RAG AI
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-2.5"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-1">
            <i className="fa-solid fa-file-arrow-up"></i>
          </div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
            Kéo thả tài liệu vào đây hoặc nhấn để chọn file
          </h4>
          <p className="text-xs text-slate-400 font-medium">
            Hỗ trợ định dạng: .PDF, .DOCX, .DOC, .TXT, .MD (Tối đa 15MB)
          </p>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-file-pdf text-rose-500 text-xl"></i>
              <div className="flex flex-col">
                <strong className="text-xs text-slate-800 dark:text-white truncate max-w-[200px]">
                  {selectedFile.name}
                </strong>
                <small className="text-[11px] text-slate-400">
                  {formatBytes(selectedFile.size)}
                </small>
              </div>
            </div>
            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> Sẵn sàng
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Đang nạp...
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i> Bắt đầu nạp dữ liệu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
