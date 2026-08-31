import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type CreateFeedbackRequest,
  type FeedbackResponse,
} from "../utils/Types";

const API_FEEDBACK = "/api/v1/feedback";

interface FeedbackState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  feedback: FeedbackResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: FeedbackState = {
  status: "idle",
  feedback: null,
  error: null,
};

export const sendFeedback = createAsyncThunk(
  "feedback/sendFeedback",
  async (feedbackData: CreateFeedbackRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post<ApiDataResponse<FeedbackResponse>>(API_FEEDBACK, feedbackData, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Gui feedback that bai");
    }
  },
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    resetFeedbackState: (state) => {
      state.status = "idle";
      state.feedback = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendFeedback.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(sendFeedback.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.feedback = action.payload;
        state.error = null;
      })
      .addCase(sendFeedback.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackError, resetFeedbackState } = feedbackSlice.actions;

export default feedbackSlice.reducer;
