import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  type ApiDataResponse,
  type ChangePasswordRequest,
  type UserResponse,
} from "../utils/Types";

const API_USER = "/api/v1/users";
const API_AUTH = "/api/v1/auth";

interface ProfileState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  avatarStatus: "idle" | "pending" | "fulfilled" | "rejected";
  passwordStatus: "idle" | "pending" | "fulfilled" | "rejected";
  user: UserResponse | null;
  successMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const initialState: ProfileState = {
  status: "idle",
  avatarStatus: "idle",
  passwordStatus: "idle",
  user: null,
  successMessage: "",
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ApiDataResponse<UserResponse>>(`${API_USER}/me`, {
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lay thong tin ho so that bai");
    }
  },
);

export const updateProfileAvatar = createAsyncThunk(
  "profile/updateProfileAvatar",
  async (avatar: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatar);

      const res = await axios.patch<ApiDataResponse<UserResponse>>(`${API_USER}/me/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Cap nhat avatar that bai");
    }
  },
);

export const changeProfilePassword = createAsyncThunk(
  "profile/changeProfilePassword",
  async (request: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      await axios.patch<ApiDataResponse<string>>(`${API_AUTH}/change-password`, request, {
        withCredentials: true,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Doi mat khau that bai");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileMessage: (state) => {
      state.successMessage = "";
      state.error = null;
    },
    resetProfileState: (state) => {
      state.status = "idle";
      state.avatarStatus = "idle";
      state.passwordStatus = "idle";
      state.user = null;
      state.successMessage = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(updateProfileAvatar.pending, (state) => {
        state.avatarStatus = "pending";
        state.error = null;
      })
      .addCase(updateProfileAvatar.fulfilled, (state, action) => {
        state.avatarStatus = "fulfilled";
        state.user = action.payload;
        state.successMessage = "Cập nhật avatar thành công.";
        state.error = null;
      })
      .addCase(updateProfileAvatar.rejected, (state, action) => {
        state.avatarStatus = "rejected";
        state.error = action.payload;
      })
      .addCase(changeProfilePassword.pending, (state) => {
        state.passwordStatus = "pending";
        state.error = null;
      })
      .addCase(changeProfilePassword.fulfilled, (state) => {
        state.passwordStatus = "fulfilled";
        state.successMessage = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
        state.error = null;
      })
      .addCase(changeProfilePassword.rejected, (state, action) => {
        state.passwordStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { clearProfileMessage, resetProfileState } = profileSlice.actions;

export default profileSlice.reducer;
