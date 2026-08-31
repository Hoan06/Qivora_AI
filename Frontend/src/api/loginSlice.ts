import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type LoginRequest,
  type UserResponse,
} from "../utils/Types";

const API_AUTH = "/api/v1/auth";

interface LoginState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  isAuthenticated: boolean;
  user: UserResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: LoginState = {
  status: "idle",
  isAuthenticated: localStorage.getItem("isLoggedIn") === "true",
  user: null,
  error: null,
};

const markLoggedIn = (roles?: string[]) => {
  localStorage.setItem("isLoggedIn", "true");
  if (roles) {
    localStorage.setItem("roles", JSON.stringify(roles));
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("roles");
};

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async (loginData: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post<ApiDataResponse<UserResponse>>(`${API_AUTH}/login`, loginData, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Dang nhap that bai");
    }
  },
);

export const refreshToken = createAsyncThunk(
  "login/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post<ApiDataResponse<void>>(`${API_AUTH}/refresh-token`, {}, {
        withCredentials: true,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lam moi token that bai");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "login/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_AUTH}/logout`, {}, {
        withCredentials: true,
      });

      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Dang xuat that bai");
    }
  },
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    clearLoginError: (state) => {
      state.error = null;
    },
    resetLoginState: (state) => {
      state.status = "idle";
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      clearAuthStorage();
    },
    loadTokenFromStorage: (state) => {
      state.isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        markLoggedIn(action.payload.roles);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(refreshToken.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.isAuthenticated = action.payload;
        state.error = null;
        markLoggedIn();
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "fulfilled";
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        clearAuthStorage();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearLoginError, loadTokenFromStorage, resetLoginState } = loginSlice.actions;

export default loginSlice.reducer;
