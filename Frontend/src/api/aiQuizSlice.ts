import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type CreateManualQuizRequest,
  type GenerateQuizRequest,
} from "../utils/Types";

const API_AI_QUIZ = "/api/v1/quizzes/ai/draft";

interface AiQuizState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  draft: CreateManualQuizRequest | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AiQuizState = {
  status: "idle",
  draft: null,
  error: null,
};

export const generateQuizDraftByAi = createAsyncThunk(
  "aiQuiz/generateQuizDraftByAi",
  async (request: GenerateQuizRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post<ApiDataResponse<CreateManualQuizRequest>>(API_AI_QUIZ, request, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "AI tao quiz that bai");
    }
  },
);

const aiQuizSlice = createSlice({
  name: "aiQuiz",
  initialState,
  reducers: {
    clearAiQuizError: (state) => {
      state.error = null;
    },
    resetAiQuizState: (state) => {
      state.status = "idle";
      state.draft = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuizDraftByAi.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(generateQuizDraftByAi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.draft = action.payload;
        state.error = null;
      })
      .addCase(generateQuizDraftByAi.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearAiQuizError, resetAiQuizState } = aiQuizSlice.actions;

export default aiQuizSlice.reducer;
