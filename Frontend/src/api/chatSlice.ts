import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { type ApiDataResponse, type ChatRequest, type ChatResponse } from "../utils/Types";

const API_CHAT_MESSAGE = "/api/v1/chat/message";

export interface ChatMessageItem {
  id: string;
  sender: "user" | "nanu";
  text: string;
  timestamp: number;
}

interface ChatState {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  messages: ChatMessageItem[];
  conversationId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const getStoredConversationId = (): string => {
  const stored = sessionStorage.getItem("qivora_chat_conversation_id");
  if (stored) return stored;
  const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem("qivora_chat_conversation_id", newId);
  return newId;
};

const initialState: ChatState = {
  status: "idle",
  messages: [
    {
      id: "init",
      sender: "nanu",
      text: "Chào bạn, tôi là Nanu - trợ lý AI thông minh của Qivora! Bạn cần hỏi đáp về kiến thức, tài liệu hay hệ thống cứ nhắn tôi nhé! 😊",
      timestamp: Date.now(),
    },
  ],
  conversationId: getStoredConversationId(),
  error: null,
};

export const sendChatMessage = createAsyncThunk(
  "chat/sendChatMessage",
  async (message: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      const conversationId = state.chat?.conversationId || getStoredConversationId();

      const payload: ChatRequest = {
        message,
        conversationId,
      };

      const res = await axios.post<ApiDataResponse<ChatResponse>>(
        API_CHAT_MESSAGE,
        payload,
        { withCredentials: true }
      );

      return res.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể kết nối đến trợ lý ảo lúc này"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addLocalUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `user_${Date.now()}`,
        sender: "user",
        text: action.payload,
        timestamp: Date.now(),
      });
    },
    resetChatConversation: (state) => {
      const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("qivora_chat_conversation_id", newId);
      state.conversationId = newId;
      state.status = "idle";
      state.error = null;
      state.messages = [
        {
          id: `init_${Date.now()}`,
          sender: "nanu",
          text: "Cuộc hội thoại đã được làm mới. Tôi có thể hỗ trợ gì tiếp theo cho bạn?",
          timestamp: Date.now(),
        },
      ];
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload?.reply) {
          state.messages.push({
            id: `nanu_${Date.now()}`,
            sender: "nanu",
            text: action.payload.reply,
            timestamp: Date.now(),
          });
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
        state.messages.push({
          id: `err_${Date.now()}`,
          sender: "nanu",
          text:
            typeof action.payload === "string"
              ? `⚠️ ${action.payload}`
              : "⚠️ Rất tiếc, đã có lỗi kết nối tới trợ lý ảo. Bạn vui lòng kiểm tra lại đăng nhập hoặc thử lại sau!",
          timestamp: Date.now(),
        });
      });
  },
});

export const { addLocalUserMessage, resetChatConversation, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
