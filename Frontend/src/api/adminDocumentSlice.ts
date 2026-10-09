import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type DocumentResponse,
  type PageResponse,
} from "../utils/Types";

const API_ADMIN_DOCUMENTS = "/api/v1/admin/documents";
const API_ADMIN_INGEST = "/api/v1/admin/ingest";

interface AdminDocumentState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  uploadStatus: "idle" | "pending" | "fulfilled" | "rejected";
  documents: DocumentResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AdminDocumentState = {
  status: "idle",
  uploadStatus: "idle",
  documents: [],
  totalElements: 0,
  totalPages: 1,
  currentPage: 0,
  pageSize: 5,
  error: null,
};

export const fetchAdminDocuments = createAsyncThunk(
  "adminDocument/fetchAdminDocuments",
  async (
    { page = 0, size = 5 }: { page?: number; size?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get<ApiDataResponse<PageResponse<DocumentResponse>>>(
        `${API_ADMIN_DOCUMENTS}?page=${page}&size=${size}`,
        { withCredentials: true }
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Lấy danh sách tài liệu thất bại"
      );
    }
  }
);

export const ingestAdminDocument = createAsyncThunk(
  "adminDocument/ingestAdminDocument",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post<ApiDataResponse<string>>(
        API_ADMIN_INGEST,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Nạp tài liệu thất bại"
      );
    }
  }
);

const adminDocumentSlice = createSlice({
  name: "adminDocument",
  initialState,
  reducers: {
    setLocalDocuments: (state, action: PayloadAction<DocumentResponse[]>) => {
      state.documents = action.payload;
      state.totalElements = action.payload.length;
      state.totalPages = Math.max(1, Math.ceil(action.payload.length / state.pageSize));
    },
    deleteLocalDocument: (state, action: PayloadAction<number>) => {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
      state.totalElements = state.documents.length;
      state.totalPages = Math.max(1, Math.ceil(state.documents.length / state.pageSize));
    },
    clearAdminDocumentError: (state) => {
      state.error = null;
    },
    resetAdminDocumentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchAdminDocuments.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAdminDocuments.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload) {
          state.documents = action.payload.content || [];
          state.totalElements = action.payload.totalElements || 0;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.page || 0;
          state.pageSize = action.payload.size || 5;
        }
      })
      .addCase(fetchAdminDocuments.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })

      // Ingest Document
      .addCase(ingestAdminDocument.pending, (state) => {
        state.uploadStatus = "pending";
        state.error = null;
      })
      .addCase(ingestAdminDocument.fulfilled, (state) => {
        state.uploadStatus = "fulfilled";
      })
      .addCase(ingestAdminDocument.rejected, (state, action) => {
        state.uploadStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const {
  setLocalDocuments,
  deleteLocalDocument,
  clearAdminDocumentError,
  resetAdminDocumentState,
} = adminDocumentSlice.actions;

export default adminDocumentSlice.reducer;
