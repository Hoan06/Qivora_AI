import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type PageResponse,
  type QuizSummaryResponse,
} from "../utils/Types";

const API_ADMIN_QUIZZES = "/api/v1/admin/quizzes";

interface AdminQuizState {
  listStatus: "idle" | "pending" | "fulfilled" | "rejected";
  deleteStatus: "idle" | "pending" | "fulfilled" | "rejected";
  quizzes: QuizSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AdminQuizState = {
  listStatus: "idle",
  deleteStatus: "idle",
  quizzes: [],
  page: 0,
  size: 6,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  error: null,
};

export const fetchAdminQuizzes = createAsyncThunk(
  "adminQuiz/fetchAdminQuizzes",
  async ({ page = 0, size = 6 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<PageResponse<QuizSummaryResponse>>>(
        API_ADMIN_QUIZZES,
        {
          params: { page, size },
          withCredentials: true,
        },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay danh sach quiz admin that bai");
    }
  },
);

export const softDeleteAdminQuiz = createAsyncThunk(
  "adminQuiz/softDeleteAdminQuiz",
  async ({ quizId, reason }: { quizId: number; reason: string }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${API_ADMIN_QUIZZES}/${quizId}/violation`,
        { reason },
        { withCredentials: true },
      );
      return quizId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Xoa mem quiz that bai");
    }
  },
);

const adminQuizSlice = createSlice({
  name: "adminQuiz",
  initialState,
  reducers: {
    clearAdminQuizError: (state) => {
      state.error = null;
    },
    resetAdminQuizState: (state) => {
      state.listStatus = "idle";
      state.deleteStatus = "idle";
      state.quizzes = [];
      state.page = 0;
      state.size = 6;
      state.totalElements = 0;
      state.totalPages = 0;
      state.first = true;
      state.last = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminQuizzes.pending, (state) => {
        state.listStatus = "pending";
        state.error = null;
      })
      .addCase(fetchAdminQuizzes.fulfilled, (state, action) => {
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
      .addCase(fetchAdminQuizzes.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(softDeleteAdminQuiz.pending, (state) => {
        state.deleteStatus = "pending";
        state.error = null;
      })
      .addCase(softDeleteAdminQuiz.fulfilled, (state, action) => {
        state.deleteStatus = "fulfilled";
        state.quizzes = state.quizzes.map((quiz) =>
          quiz.id === action.payload ? { ...quiz, isActive: false, isDeleted: true } : quiz,
        );
        state.error = null;
      })
      .addCase(softDeleteAdminQuiz.rejected, (state, action) => {
        state.deleteStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearAdminQuizError, resetAdminQuizState } = adminQuizSlice.actions;

export default adminQuizSlice.reducer;
