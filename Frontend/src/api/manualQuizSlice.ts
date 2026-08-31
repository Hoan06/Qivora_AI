import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type CreateManualQuizRequest,
  type QuizResponse,
} from "../utils/Types";

const API_QUIZ = "/api/v1/quizzes";

interface ManualQuizState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  quiz: QuizResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: ManualQuizState = {
  status: "idle",
  quiz: null,
  error: null,
};

export const createManualQuiz = createAsyncThunk(
  "manualQuiz/createManualQuiz",
  async (quizData: CreateManualQuizRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post<ApiDataResponse<QuizResponse>>(API_QUIZ, quizData, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Tao quiz thu cong that bai");
    }
  },
);

const manualQuizSlice = createSlice({
  name: "manualQuiz",
  initialState,
  reducers: {
    clearManualQuizError: (state) => {
      state.error = null;
    },
    resetManualQuizState: (state) => {
      state.status = "idle";
      state.quiz = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createManualQuiz.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createManualQuiz.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.quiz = action.payload;
        state.error = null;
      })
      .addCase(createManualQuiz.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearManualQuizError, resetManualQuizState } = manualQuizSlice.actions;

export default manualQuizSlice.reducer;
