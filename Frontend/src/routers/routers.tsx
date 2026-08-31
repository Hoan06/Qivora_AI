import { createBrowserRouter } from "react-router-dom";
import AdminFeedbackManager from "../pages/AdminFeedbackManager";
import AdminQuizManager from "../pages/AdminQuizManager";
import AdminUserManager from "../pages/AdminUserManager";
import CreateManualQuiz from "../pages/CreateManualQuiz";
import Home from "../pages/Home";
import HomeConfirmLogin from "../pages/HomeConfirmLogin";
import Profile from "../pages/Profile";
import QuizInventory from "../pages/QuizInventory";
import QuizManagerClient from "../pages/QuizManagerClient";
import Statistical from "../pages/Statistical";
import TakeQuiz from "../pages/TakeQuiz";
import TakeQuizWithAI from "../pages/TakeQuizWithAI";

import { useSelector } from "react-redux";
import { type RootState } from "../store/store";

function HomeRoute() {
  const isAuthenticated =
    useSelector((state: RootState) => state.login.isAuthenticated) ||
    localStorage.getItem("isLoggedIn") === "true";
  const roles = JSON.parse(localStorage.getItem("roles") || "[]") as string[];

  if (isAuthenticated && roles.includes("ADMIN")) {
    return <Statistical />;
  }

  return isAuthenticated ? <HomeConfirmLogin /> : <Home />;
}

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/login",
    element: <Home initialAuthModal="login" />,
  },
  {
    path: "/register",
    element: <Home initialAuthModal="register" />,
  },
  {
    path: "/quiz-inventory",
    element: <QuizInventory />,
  },
  {
    path: "/quiz-create",
    element: <CreateManualQuiz />,
  },
  {
    path: "/take-quiz/:quizKey",
    element: <TakeQuiz />,
  },
  {
    path: "/quiz-ai",
    element: <TakeQuizWithAI />,
  },
  {
    path: "/quiz-manager",
    element: <QuizManagerClient />,
  },
  {
    path: "/quiz-manager/:quizId",
    element: <QuizManagerClient />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/admin/statistical",
    element: <Statistical />,
  },
  {
    path: "/admin/users",
    element: <AdminUserManager />,
  },
  {
    path: "/admin/quizzes",
    element: <AdminQuizManager />,
  },
  {
    path: "/admin/feedback",
    element: <AdminFeedbackManager />,
  },
]);
