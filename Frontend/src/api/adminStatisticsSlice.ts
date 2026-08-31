import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type AdminStatisticsResponse,
  type ApiDataResponse,
} from "../utils/Types";

const API_ADMIN = "/api/v1/admin";

interface AdminStatisticsState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  statistics: AdminStatisticsResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AdminStatisticsState = {
  status: "idle",
  statistics: null,
  error: null,
};

export const fetchAdminStatistics = createAsyncThunk(
  "adminStatistics/fetchAdminStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<AdminStatisticsResponse>>(
        `${API_ADMIN}/statistics`,
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay thong ke admin that bai");
    }
  },
);

const adminStatisticsSlice = createSlice({
  name: "adminStatistics",
  initialState,
  reducers: {
    clearAdminStatisticsError: (state) => {
      state.error = null;
    },
    resetAdminStatisticsState: (state) => {
      state.status = "idle";
      state.statistics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStatistics.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAdminStatistics.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminStatistics.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearAdminStatisticsError, resetAdminStatisticsState } =
  adminStatisticsSlice.actions;

export default adminStatisticsSlice.reducer;
