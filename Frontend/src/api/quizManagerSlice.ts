import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type PageResponse,
  type QuizManageDetailResponse,
  type QuizSummaryResponse,
} from "../utils/Types";

const API_MY_QUIZZES = "/api/v1/quizzes/my";
const API_QUIZZES = "/api/v1/quizzes";

interface QuizManagerState {
  listStatus: "idle" | "pending" | "fulfilled" | "rejected";
  detailStatus: "idle" | "pending" | "fulfilled" | "rejected";
  deleteStatus: "idle" | "pending" | "fulfilled" | "rejected";
  quizzes: QuizSummaryResponse[];
  detail: QuizManageDetailResponse | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: QuizManagerState = {
  listStatus: "idle",
  detailStatus: "idle",
  deleteStatus: "idle",
  quizzes: [],
  detail: null,
  page: 0,
  size: 6,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  error: null,
};

export const fetchMyQuizzes = createAsyncThunk(
  "quizManager/fetchMyQuizzes",
  async ({ page = 0, size = 6 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<PageResponse<QuizSummaryResponse>>>(API_MY_QUIZZES, {
        params: { page, size },
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay danh sach quiz ca nhan that bai");
    }
  },
);

export const fetchMyQuizManageDetail = createAsyncThunk(
  "quizManager/fetchMyQuizManageDetail",
  async (quizId: number, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<QuizManageDetailResponse>>(`${API_MY_QUIZZES}/${quizId}/manage`, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay ket qua quiz that bai");
    }
  },
);

export const deleteMyQuiz = createAsyncThunk(
  "quizManager/deleteMyQuiz",
  async (quizId: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_QUIZZES}/${quizId}`, {
        withCredentials: true,
      });
      return quizId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Xoa quiz that bai");
    }
  },
);

const quizManagerSlice = createSlice({
  name: "quizManager",
  initialState,
  reducers: {
    clearQuizManagerError: (state) => {
      state.error = null;
    },
    resetQuizManagerDetail: (state) => {
      state.detailStatus = "idle";
      state.detail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyQuizzes.pending, (state) => {
        state.listStatus = "pending";
        state.error = null;
      })
      .addCase(fetchMyQuizzes.fulfilled, (state, action) => {
        state.listStatus = "fulfilled";
        state.quizzes = action.payload.content;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.first = action.payload.first;
        state.last = action.payload.last;
        state.error = null;
      })
      .addCase(fetchMyQuizzes.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(fetchMyQuizManageDetail.pending, (state) => {
        state.detailStatus = "pending";
        state.detail = null;
        state.error = null;
      })
      .addCase(fetchMyQuizManageDetail.fulfilled, (state, action) => {
        state.detailStatus = "fulfilled";
        state.detail = action.payload;
        state.error = null;
      })
      .addCase(fetchMyQuizManageDetail.rejected, (state, action) => {
        state.detailStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(deleteMyQuiz.pending, (state) => {
        state.deleteStatus = "pending";
        state.error = null;
      })
      .addCase(deleteMyQuiz.fulfilled, (state, action) => {
        state.deleteStatus = "fulfilled";
        state.quizzes = state.quizzes.filter((quiz) => quiz.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteMyQuiz.rejected, (state, action) => {
        state.deleteStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearQuizManagerError, resetQuizManagerDetail } = quizManagerSlice.actions;

export default quizManagerSlice.reducer;
