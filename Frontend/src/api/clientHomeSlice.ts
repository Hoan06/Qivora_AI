import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type QuizAttemptHistoryResponse,
} from "../utils/Types";

const API_USER = "/api/v1/users";

interface ClientHomeStats {
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  totalScore: number;
  averageScore: number;
}

interface ClientHomeState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  attempts: QuizAttemptHistoryResponse[];
  recentAttempts: QuizAttemptHistoryResponse[];
  stats: ClientHomeStats;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const emptyStats: ClientHomeStats = {
  totalAttempts: 0,
  completedAttempts: 0,
  inProgressAttempts: 0,
  totalScore: 0,
  averageScore: 0,
};

const initialState: ClientHomeState = {
  status: "idle",
  attempts: [],
  recentAttempts: [],
  stats: emptyStats,
  error: null,
};

function buildStats(attempts: QuizAttemptHistoryResponse[]): ClientHomeStats {
  const completedAttempts = attempts.filter((attempt) => attempt.status === "COMPLETED");
  const totalScore = completedAttempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0);

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    inProgressAttempts: attempts.length - completedAttempts.length,
    totalScore,
    averageScore: completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0,
  };
}

export const fetchClientHomeData = createAsyncThunk(
  "clientHome/fetchClientHomeData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<QuizAttemptHistoryResponse[]>>(
        `${API_USER}/me/attempts`,
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay du lieu trang chu that bai");
    }
  },
);

const clientHomeSlice = createSlice({
  name: "clientHome",
  initialState,
  reducers: {
    clearClientHomeError: (state) => {
      state.error = null;
    },
    resetClientHomeState: (state) => {
      state.status = "idle";
      state.attempts = [];
      state.recentAttempts = [];
      state.stats = emptyStats;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientHomeData.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchClientHomeData.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.attempts = action.payload;
        state.recentAttempts = action.payload.slice(0, 3);
        state.stats = buildStats(action.payload);
        state.error = null;
      })
      .addCase(fetchClientHomeData.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearClientHomeError, resetClientHomeState } = clientHomeSlice.actions;

export default clientHomeSlice.reducer;
