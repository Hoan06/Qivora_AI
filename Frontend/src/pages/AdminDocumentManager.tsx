import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteLocalDocument,
  fetchAdminDocuments,
  ingestAdminDocument,
  resetAdminDocumentState,
} from "../api/adminDocumentSlice";
import { logoutUser, resetLoginState } from "../api/loginSlice";
import { fetchCurrentUser, resetUserState } from "../api/userSlice";
import { type AppDispatch, type RootState } from "../store/store";
import { type DocumentResponse } from "../utils/Types";

// Modular Components
import AdminHeader from "../components/admin/AdminHeader";
import DocumentManageHeroBanner from "../components/admin-document/DocumentManageHeroBanner";
import DocumentStatsBadges from "../components/admin-document/DocumentStatsBadges";
import DocumentFilterBar from "../components/admin-document/DocumentFilterBar";
import DocumentTable from "../components/admin-document/DocumentTable";
import DocumentPreviewModal from "../components/admin-document/DocumentPreviewModal";
import DocumentIngestModal from "../components/admin-document/DocumentIngestModal";
import DeleteDocumentModal from "../components/admin-document/DeleteDocumentModal";

export default function AdminDocumentManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redux state
  const { documents, status, uploadStatus } = useSelector(
    (state: RootState) => state.adminDocument
  );
  const { currentUser, status: userStatus } = useSelector(
    (state: RootState) => state.user
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const isAdmin = currentUser?.roles?.includes("ADMIN");

  // Authentication guards & fetch real data
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }

    void dispatch(fetchCurrentUser());
    void dispatch(fetchAdminDocuments({ page: 0, size: 50 }));
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userStatus === "rejected") {
      dispatch(resetLoginState());
      dispatch(resetUserState());
      dispatch(resetAdminDocumentState());
      navigate("/login");
    }
  }, [dispatch, navigate, userStatus]);

  useEffect(() => {
    if (userStatus === "fulfilled" && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate, userStatus]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Filtered documents from real API data
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.uploaderUsername || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || doc.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  // Pagination slice
  const totalElements = filteredDocuments.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const pagedDocuments = useMemo(() => {
    const start = page * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, page, pageSize]);

  // Calculate stats from real API documents
  const totalDocs = documents.length;
  const completedDocs = documents.filter((d) => d.status === "COMPLETED").length;
  const processingDocs = documents.filter((d) => d.status === "PROCESSING").length;
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

  // Ingest upload
  const handleUploadFile = async (file: File) => {
    try {
      const resultAction = await dispatch(ingestAdminDocument(file));
      if (ingestAdminDocument.fulfilled.match(resultAction)) {
        setToastMessage(
          "🎉 Nạp tài liệu lên thành công! Hệ thống đang xử lý băm nhỏ và tạo vector."
        );
        // Refresh real list from backend
        void dispatch(fetchAdminDocuments({ page: 0, size: 50 }));
      } else {
        setToastMessage(
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Nạp tài liệu thất bại!"
        );
      }
    } catch {
      setToastMessage("Có lỗi xảy ra khi nạp tài liệu!");
    } finally {
      setIsIngestModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Delete document
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteLocalDocument(deleteTarget.id));
    setToastMessage(`Đã xóa tài liệu #${deleteTarget.id}`);
    setDeleteTarget(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    void dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen relative font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl z-0"></div>

      {/* Admin Header */}
      <AdminHeader currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 font-extrabold text-xs shadow-2xl backdrop-blur-md border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2.5">
            <i className="fa-solid fa-circle-check text-emerald-400 dark:text-emerald-600 text-sm"></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Banner */}
        <DocumentManageHeroBanner
          onOpenIngestModal={() => setIsIngestModalOpen(true)}
        />

        {/* Stats Badges */}
        <DocumentStatsBadges
          totalDocs={totalDocs}
          completedDocs={completedDocs}
          processingDocs={processingDocs}
          totalChunks={totalChunks}
        />

        {/* Main Panel */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col gap-6 shadow-xl shadow-indigo-500/5 transition-colors">
          <DocumentFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <DocumentTable
            documents={pagedDocuments}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            isLoading={status === "pending"}
            onPageChange={setPage}
            onPreview={setPreviewDoc}
            onDeleteClick={setDeleteTarget}
          />
        </div>
      </main>

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        isUploading={uploadStatus === "pending"}
        onClose={() => setIsIngestModalOpen(false)}
        onUpload={handleUploadFile}
      />

      <DeleteDocumentModal
        document={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
