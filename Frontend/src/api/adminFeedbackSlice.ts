import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type FeedbackResponse,
} from "../utils/Types";

const API_ADMIN_FEEDBACK = "/api/v1/admin/feedback";

interface AdminFeedbackState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  feedbacks: FeedbackResponse[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AdminFeedbackState = {
  status: "idle",
  feedbacks: [],
  error: null,
};

export const fetchAdminFeedbacks = createAsyncThunk(
  "adminFeedback/fetchAdminFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<FeedbackResponse[]>>(
        API_ADMIN_FEEDBACK,
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay danh sach feedback that bai");
    }
  },
);

export const markAdminFeedbackAsRead = createAsyncThunk(
  "adminFeedback/markAdminFeedbackAsRead",
  async (feedbackId: number, { rejectWithValue }) => {
    try {
      const res = await axios.patch<ApiDataResponse<FeedbackResponse>>(
        `${API_ADMIN_FEEDBACK}/${feedbackId}/read`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Danh dau feedback da doc that bai");
    }
  },
);

const adminFeedbackSlice = createSlice({
  name: "adminFeedback",
  initialState,
  reducers: {
    clearAdminFeedbackError: (state) => {
      state.error = null;
    },
    resetAdminFeedbackState: (state) => {
      state.status = "idle";
      state.feedbacks = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFeedbacks.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAdminFeedbacks.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.feedbacks = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminFeedbacks.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(markAdminFeedbackAsRead.fulfilled, (state, action) => {
        const index = state.feedbacks.findIndex(
          (feedback) => feedback.id === action.payload.id,
        );
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(markAdminFeedbackAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAdminFeedbackError, resetAdminFeedbackState } =
  adminFeedbackSlice.actions;

export default adminFeedbackSlice.reducer;
