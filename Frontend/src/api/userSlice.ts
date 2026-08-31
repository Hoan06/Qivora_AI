import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type RankingResponse,
  type UserResponse,
} from "../utils/Types";

const API_USER = "/api/v1/users";

interface UserState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  rankStatus: "idle" | "pending" | "fulfilled" | "rejected";
  currentUser: UserResponse | null;
  rankings: RankingResponse[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: UserState = {
  status: "idle",
  rankStatus: "idle",
  currentUser: null,
  rankings: [],
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<UserResponse>>(`${API_USER}/me`, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay thong tin nguoi dung that bai");
    }
  },
);

export const fetchTopRankings = createAsyncThunk(
  "user/fetchTopRankings",
  async (limit: number = 3, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<RankingResponse[]>>(`${API_USER}/rankings/top`, {
        params: { limit },
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay bang xep hang that bai");
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    resetUserState: (state) => {
      state.status = "idle";
      state.rankStatus = "idle";
      state.currentUser = null;
      state.rankings = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(fetchTopRankings.pending, (state) => {
        state.rankStatus = "pending";
      })
      .addCase(fetchTopRankings.fulfilled, (state, action) => {
        state.rankStatus = "fulfilled";
        state.rankings = action.payload;
      })
      .addCase(fetchTopRankings.rejected, (state, action) => {
        state.rankStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearUserError, resetUserState } = userSlice.actions;

export default userSlice.reducer;
