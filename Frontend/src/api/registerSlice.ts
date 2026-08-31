import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type RegisterRequest,
  type UserResponse,
} from "../utils/Types";

const API_AUTH = "/api/v1/auth";

interface RegisterState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  user: UserResponse | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: RegisterState = {
  status: "idle",
  user: null,
  error: null,
};

export const registerUser = createAsyncThunk(
  "register/registerUser",
  async (newUser: RegisterRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post<ApiDataResponse<UserResponse>>(`${API_AUTH}/register`, newUser);
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Dang ky that bai");
    }
  },
);

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    clearRegisterError: (state) => {
      state.error = null;
    },
    resetRegisterState: (state) => {
      state.status = "idle";
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearRegisterError, resetRegisterState } = registerSlice.actions;

export default registerSlice.reducer;
