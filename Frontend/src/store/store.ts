import { configureStore } from "@reduxjs/toolkit";
import adminFeedbackReducer from "../api/adminFeedbackSlice";
import adminQuizReducer from "../api/adminQuizSlice";
import adminStatisticsReducer from "../api/adminStatisticsSlice";
import adminUserReducer from "../api/adminUserSlice";
import aiQuizReducer from "../api/aiQuizSlice";
import clientHomeReducer from "../api/clientHomeSlice";
import feedbackReducer from "../api/feedbackSlice";
import loginReducer from "../api/loginSlice";
import manualQuizReducer from "../api/manualQuizSlice";
import profileReducer from "../api/profileSlice";
import quizManagerReducer from "../api/quizManagerSlice";
import registerReducer from "../api/registerSlice";
import systemQuizReducer from "../api/systemQuizSlice";
import takeQuizReducer from "../api/takeQuizSlice";
import userReducer from "../api/userSlice";

export const store = configureStore({
  reducer: {
    adminFeedback: adminFeedbackReducer,
    adminQuiz: adminQuizReducer,
    adminStatistics: adminStatisticsReducer,
    adminUser: adminUserReducer,
    aiQuiz: aiQuizReducer,
    clientHome: clientHomeReducer,
    feedback: feedbackReducer,
    login: loginReducer,
    manualQuiz: manualQuizReducer,
    profile: profileReducer,
    quizManager: quizManagerReducer,
    register: registerReducer,
    systemQuiz: systemQuizReducer,
    takeQuiz: takeQuizReducer,
    user: userReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
