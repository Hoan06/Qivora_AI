import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type PageResponse,
  type UserResponse,
} from "../utils/Types";

const API_ADMIN_USERS = "/api/v1/admin/users";

interface AdminUserState {
  listStatus: "idle" | "pending" | "fulfilled" | "rejected";
  actionStatus: "idle" | "pending" | "fulfilled" | "rejected";
  users: UserResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: AdminUserState = {
  listStatus: "idle",
  actionStatus: "idle",
  users: [],
  page: 0,
  size: 8,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  error: null,
};

export const fetchAdminUsers = createAsyncThunk(
  "adminUser/fetchAdminUsers",
  async ({ page = 0, size = 8 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<PageResponse<UserResponse>>>(API_ADMIN_USERS, {
        params: { page, size },
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay danh sach user that bai");
    }
  },
);

export const lockAdminUser = createAsyncThunk(
  "adminUser/lockAdminUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await axios.patch<ApiDataResponse<UserResponse>>(
        `${API_ADMIN_USERS}/${userId}/lock`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Khoa tai khoan that bai");
    }
  },
);

export const unlockAdminUser = createAsyncThunk(
  "adminUser/unlockAdminUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await axios.patch<ApiDataResponse<UserResponse>>(
        `${API_ADMIN_USERS}/${userId}/unlock`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Mo khoa tai khoan that bai");
    }
  },
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {
    clearAdminUserError: (state) => {
      state.error = null;
    },
    resetAdminUserState: (state) => {
      state.listStatus = "idle";
      state.actionStatus = "idle";
      state.users = [];
      state.page = 0;
      state.size = 8;
      state.totalElements = 0;
      state.totalPages = 0;
      state.first = true;
      state.last = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.listStatus = "pending";
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.listStatus = "fulfilled";
        state.users = action.payload.content;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.first = action.payload.first;
        state.last = action.payload.last;
        state.error = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(lockAdminUser.pending, (state) => {
        state.actionStatus = "pending";
        state.error = null;
      })
      .addCase(lockAdminUser.fulfilled, (state, action) => {
        state.actionStatus = "fulfilled";
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
        state.error = null;
      })
      .addCase(lockAdminUser.rejected, (state, action) => {
        state.actionStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(unlockAdminUser.pending, (state) => {
        state.actionStatus = "pending";
        state.error = null;
      })
      .addCase(unlockAdminUser.fulfilled, (state, action) => {
        state.actionStatus = "fulfilled";
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
        state.error = null;
      })
      .addCase(unlockAdminUser.rejected, (state, action) => {
        state.actionStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearAdminUserError, resetAdminUserState } = adminUserSlice.actions;

export default adminUserSlice.reducer;
