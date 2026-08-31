export interface ApiDataResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateFeedbackRequest {
  type: "SYSTEM" | "QUIZ";
  senderName: string;
  content: string;
  quizId?: number;
}

export interface FeedbackResponse {
  id: number;
  type: "SYSTEM" | "QUIZ";
  content: string;
  senderName: string;
  isRead: boolean;
  createdAt?: string;
  userId?: number;
  username?: string;
  userEmail?: string;
  quizId?: number;
  quizTitle?: string;
  quizCode?: string;
}

export interface AdminStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalAdmins: number;
  totalQuizzes: number;
  activeQuizzes: number;
  inactiveQuizzes: number;
  deletedQuizzes: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  guestAttempts: number;
  registeredUserAttempts: number;
  totalFeedback: number;
  unreadFeedback: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserResponse {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  roles?: string[];
}

export interface RankingResponse {
  rank: number;
  userId: number;
  username: string;
  fullName?: string;
  avatar?: string;
  totalScore: number;
  totalAttempts: number;
}

export interface QuizAttemptHistoryResponse {
  attemptId: number;
  quizId: number;
  quizCode: string;
  quizTitle: string;
  startedAt?: string;
  completedAt?: string;
  score: number;
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface CreateAnswerRequest {
  content: string;
  isCorrect: boolean;
}

export interface CreateQuestionRequest {
  content: string;
  score: number;
  explanation?: string;
  answers: CreateAnswerRequest[];
}

export interface CreateManualQuizRequest {
  title: string;
  description?: string;
  timeLimit: number;
  password?: string;
  startedAt?: string;
  endedAt?: string;
  questions: CreateQuestionRequest[];
}

export interface GenerateQuizRequest {
  topic: string;
  description?: string;
  difficulty?: string;
  questionCount?: number;
  answerCount?: number;
  timeLimit?: number;
}

export interface AnswerResponse {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface QuestionResponse {
  id: number;
  content: string;
  score: number;
  explanation?: string;
  createdAt?: string;
  answers: AnswerResponse[];
}

export interface QuizResponse {
  id: number;
  code: string;
  title: string;
  description?: string;
  timeLimit: number;
  startedAt?: string;
  endedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedReason?: string;
  deletedAt?: string;
  createdAt?: string;
  creatorId?: number;
  creatorUsername?: string;
  questions: QuestionResponse[];
}

export interface QuizSummaryResponse {
  id: number;
  code: string;
  title: string;
  description?: string;
  timeLimit: number;
  startedAt?: string;
  endedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  hasPassword: boolean;
  creatorUsername?: string;
  creatorFullName?: string;
  totalQuestions: number;
  totalAttempts?: number;
}

export interface QuizParticipantResultResponse {
  attemptId: number;
  participantName: string;
  participantEmail?: string;
  guest: boolean;
  score: number;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt?: string;
  completedAt?: string;
}

export interface QuizManageDetailResponse {
  quiz: QuizSummaryResponse;
  results: QuizParticipantResultResponse[];
}

export interface AnswerTakeResponse {
  id: number;
  content: string;
}

export interface QuestionTakeResponse {
  id: number;
  content: string;
  score: number;
  answers: AnswerTakeResponse[];
}

export interface QuizTakeResponse {
  id: number;
  code: string;
  title: string;
  description?: string;
  timeLimit: number;
  startedAt?: string;
  endedAt?: string;
  hasPassword: boolean;
  questions: QuestionTakeResponse[];
}

export interface StartQuizAttemptRequest {
  password?: string;
  guestName?: string;
}

export interface StartQuizAttemptResponse {
  attemptId: number;
  quiz: QuizTakeResponse;
}

export interface SubmitQuizAnswerRequest {
  questionId: number;
  answerId: number;
}

export interface SubmitQuizRequest {
  answers: SubmitQuizAnswerRequest[];
}

export interface QuizAttemptAnswerResultResponse {
  answerId: number;
  content: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export interface QuizAttemptQuestionResultResponse {
  questionId: number;
  content: string;
  score: number;
  explanation?: string;
  isCorrect: boolean;
  answers: QuizAttemptAnswerResultResponse[];
}

export interface QuizAttemptDetailResponse {
  attemptId: number;
  quizId: number;
  quizCode: string;
  quizTitle: string;
  startedAt?: string;
  completedAt?: string;
  score: number;
  status: "IN_PROGRESS" | "COMPLETED";
  totalQuestions: number;
  totalAnswered: number;
  correctQuestions: number;
  questions: QuizAttemptQuestionResultResponse[];
}
