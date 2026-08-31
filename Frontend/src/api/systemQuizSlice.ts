import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type PageResponse,
  type QuizSummaryResponse,
} from "../utils/Types";

const API_PUBLIC_QUIZZES = "/api/v1/quizzes/public";

interface SystemQuizState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
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

const initialState: SystemQuizState = {
  status: "idle",
  quizzes: [],
  page: 0,
  size: 6,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  error: null,
};

export const fetchSystemQuizzes = createAsyncThunk(
  "systemQuiz/fetchSystemQuizzes",
  async ({ page = 0, size = 6 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<PageResponse<QuizSummaryResponse>>>(API_PUBLIC_QUIZZES, {
        params: { page, size },
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay danh sach quiz that bai");
    }
  },
);

const systemQuizSlice = createSlice({
  name: "systemQuiz",
  initialState,
  reducers: {
    clearSystemQuizError: (state) => {
      state.error = null;
    },
    resetSystemQuizState: (state) => {
      state.status = "idle";
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
      .addCase(fetchSystemQuizzes.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchSystemQuizzes.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.quizzes = action.payload.content;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.first = action.payload.first;
        state.last = action.payload.last;
        state.error = null;
      })
      .addCase(fetchSystemQuizzes.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearSystemQuizError, resetSystemQuizState } = systemQuizSlice.actions;

export default systemQuizSlice.reducer;
