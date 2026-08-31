import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type QuizAttemptDetailResponse,
  type QuizSummaryResponse,
  type StartQuizAttemptRequest,
  type StartQuizAttemptResponse,
  type SubmitQuizRequest,
} from "../utils/Types";

const API_QUIZ = "/api/v1/quizzes";
const API_ATTEMPT = "/api/v1/attempts";

const isNumericKey = (quizKey: string) => /^\d+$/.test(quizKey.trim());

const buildQuizPath = (quizKey: string) => {
  const normalizedKey = quizKey.trim();
  return isNumericKey(normalizedKey)
    ? `${API_QUIZ}/${normalizedKey}`
    : `${API_QUIZ}/code/${encodeURIComponent(normalizedKey)}`;
};

interface TakeQuizState {
  summaryStatus: "idle" | "pending" | "fulfilled" | "rejected";
  startStatus: "idle" | "pending" | "fulfilled" | "rejected";
  submitStatus: "idle" | "pending" | "fulfilled" | "rejected";
  summary: QuizSummaryResponse | null;
  attemptId: number | null;
  quiz: StartQuizAttemptResponse["quiz"] | null;
  result: QuizAttemptDetailResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: TakeQuizState = {
  summaryStatus: "idle",
  startStatus: "idle",
  submitStatus: "idle",
  summary: null,
  attemptId: null,
  quiz: null,
  result: null,
  error: null,
};

export const fetchQuizSummary = createAsyncThunk(
  "takeQuiz/fetchQuizSummary",
  async (quizKey: string, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<QuizSummaryResponse>>(buildQuizPath(quizKey), {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Khong tim thay quiz");
    }
  },
);

export const startQuizAttempt = createAsyncThunk(
  "takeQuiz/startQuizAttempt",
  async (
    { quizKey, data }: { quizKey: string; data: StartQuizAttemptRequest },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post<ApiDataResponse<StartQuizAttemptResponse>>(
        `${buildQuizPath(quizKey)}/start`,
        data,
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Bat dau lam quiz that bai");
    }
  },
);

export const submitQuizAttempt = createAsyncThunk(
  "takeQuiz/submitQuizAttempt",
  async (
    { attemptId, answers }: { attemptId: number; answers: SubmitQuizRequest["answers"] },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post<ApiDataResponse<QuizAttemptDetailResponse>>(
        `${API_ATTEMPT}/${attemptId}/submit`,
        { answers },
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Nop bai that bai");
    }
  },
);

const takeQuizSlice = createSlice({
  name: "takeQuiz",
  initialState,
  reducers: {
    clearTakeQuizError: (state) => {
      state.error = null;
    },
    resetTakeQuizState: (state) => {
      state.summaryStatus = "idle";
      state.startStatus = "idle";
      state.submitStatus = "idle";
      state.summary = null;
      state.attemptId = null;
      state.quiz = null;
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizSummary.pending, (state) => {
        state.summaryStatus = "pending";
        state.error = null;
      })
      .addCase(fetchQuizSummary.fulfilled, (state, action) => {
        state.summaryStatus = "fulfilled";
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizSummary.rejected, (state, action) => {
        state.summaryStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(startQuizAttempt.pending, (state) => {
        state.startStatus = "pending";
        state.error = null;
      })
      .addCase(startQuizAttempt.fulfilled, (state, action) => {
        state.startStatus = "fulfilled";
        state.attemptId = action.payload.attemptId;
        state.quiz = action.payload.quiz;
        state.error = null;
      })
      .addCase(startQuizAttempt.rejected, (state, action) => {
        state.startStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(submitQuizAttempt.pending, (state) => {
        state.submitStatus = "pending";
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.submitStatus = "fulfilled";
        state.result = action.payload;
        state.error = null;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.submitStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearTakeQuizError, resetTakeQuizState } = takeQuizSlice.actions;

export default takeQuizSlice.reducer;
