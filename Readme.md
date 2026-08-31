# Qivora - Quiz Master With AI

Qivora là hệ thống quản lý và làm bài trắc nghiệm trực tuyến tích hợp GenAI. Hệ thống hỗ trợ người dùng tạo quiz thủ công, tạo quiz tự động bằng AI, tham gia làm bài bằng mã/link, chấm điểm tự động, xem lịch sử làm bài, gửi feedback và quản trị người dùng/quiz/feedback.

## Tính năng chính

### Người dùng
- Đăng ký, đăng nhập, đăng xuất
- Làm quiz bằng ID hoặc mã quiz
- Xem danh sách quiz công khai
- Xem kết quả sau khi nộp bài
- Xem lịch sử làm bài
- Xem bảng xếp hạng
- Cập nhật avatar cá nhân
- Gửi feedback về hệ thống hoặc quiz cụ thể

### Người tạo Quiz
- Tạo quiz thủ công
- Tạo quiz tự động bằng AI
- Sinh bản nháp quiz bằng AI
- Quản lý quiz cá nhân
- Cập nhật hoặc xóa quiz đã tạo

### Admin
- Xem thống kê hệ thống
- Quản lý người dùng
- Khóa / mở khóa tài khoản
- Quản lý danh sách quiz
- Xem chi tiết quiz
- Xóa mềm quiz vi phạm
- Xem và xử lý feedback

## Công nghệ sử dụng

### Frontend
- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- BCrypt
- Spring AI
- Google GenAI
- Cloudinary
- Redis
- PostgreSQL

### Công cụ kiểm thử
- Postman
- JUnit / Spring Boot Test

## Cấu trúc thư mục

```txt
Qivora/
├── Backend/
│   ├── src/main/java/project_backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── security/
│   │   ├── config/
│   │   ├── exception/
│   │   └── mapper/
│   ├── src/main/resources/
│   ├── build.gradle
│   ├── Dockerfile
│   └── Qivora.postman_collection.json
│
└── Frontend/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── routers/
    │   ├── store/
    │   └── styles/
    ├── package.json
    └── vite.config.ts
Cơ sở dữ liệu chính
Hệ thống sử dụng PostgreSQL với các bảng chính:
users: lưu thông tin người dùng
roles: lưu vai trò người dùng
user_roles: bảng trung gian phân quyền
quizzes: lưu thông tin quiz
questions: lưu câu hỏi
answers: lưu đáp án
quiz_attempts: lưu phiên làm bài
user_answers: lưu đáp án người dùng đã chọn
refresh_tokens: lưu refresh token
feedbacks: lưu phản hồi người dùng
Cài đặt và chạy dự án
1. Clone repository
git clone <repository-url>
cd Qivora
Chạy Backend
1. Di chuyển vào thư mục Backend
cd Backend
2. Cấu hình biến môi trường
Tạo file .env hoặc cấu hình trực tiếp trong môi trường chạy với các biến sau:
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/qivora

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_RESET_SECRET=your_jwt_reset_secret

GOOGLE_GENAI_API_KEY=your_google_genai_api_key

CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

REDIS_HOST=localhost
REDIS_PORT=6379

APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
APP_COOKIE_SECURE=false
APP_COOKIE_SAME_SITE=Lax
Lưu ý: Không commit file chứa secret thật lên GitHub.
3. Chạy PostgreSQL và Redis
Đảm bảo PostgreSQL và Redis đang chạy trước khi start backend.
Database mặc định:
qivora
4. Chạy backend
Trên Windows:
gradlew.bat bootRun
Trên Linux/macOS:
./gradlew bootRun
Backend mặc định chạy tại:
http://localhost:8080
Chạy Frontend
1. Di chuyển vào thư mục Frontend
cd Frontend
2. Cài dependencies
npm install
3. Chạy frontend
npm run dev
Frontend mặc định chạy tại:
http://localhost:5173
Build Frontend
npm run build
Kiểm thử API bằng Postman
File Postman collection nằm tại:
Backend/Qivora.postman_collection.json
Các nhóm API chính:
Auth
Quiz
Quiz Attempt
User
Feedback
Admin
Admin Quiz
Có thể import file này vào Postman để kiểm thử các endpoint của hệ thống.
Một số API tiêu biểu
Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
PATCH /api/v1/auth/change-password
Quiz
GET /api/v1/quizzes/public
GET /api/v1/quizzes/my
GET /api/v1/quizzes/{id}
GET /api/v1/quizzes/code/{code}
GET /api/v1/quizzes/{id}/take
POST /api/v1/quizzes
POST /api/v1/quizzes/ai
POST /api/v1/quizzes/ai/draft
PUT /api/v1/quizzes/{id}
DELETE /api/v1/quizzes/{id}
Làm bài
POST /api/v1/quizzes/{quizId}/start
POST /api/v1/quizzes/code/{quizCode}/start
POST /api/v1/attempts/{attemptId}/submit
User
GET /api/v1/users/me
PATCH /api/v1/users/me/avatar
GET /api/v1/users/me/attempts
GET /api/v1/users/me/attempts/{attemptId}
GET /api/v1/users/rankings/top
Feedback
POST /api/v1/feedback
Admin
GET /api/v1/admin/statistics
GET /api/v1/admin/users
PATCH /api/v1/admin/users/{userId}/lock
PATCH /api/v1/admin/users/{userId}/unlock
PATCH /api/v1/admin/quizzes/{quizId}/violation
GET /api/v1/admin/feedback
GET /api/v1/admin/feedback/{id}
PATCH /api/v1/admin/feedback/{id}/read
GET /api/v1/admin/quizzes
GET /api/v1/admin/quizzes/{id}
Luồng hoạt động chính
Luồng tạo quiz bằng AI
Người dùng nhập chủ đề, mô tả, độ khó, số lượng câu hỏi và số đáp án.
Frontend gửi request tới backend.
Backend gọi Google GenAI thông qua Spring AI.
AI sinh nội dung quiz gồm câu hỏi, đáp án và giải thích.
Backend lưu quiz vào PostgreSQL.
Hệ thống trả về quiz đã tạo cho người dùng.
Luồng làm bài quiz
Người dùng mở quiz bằng ID, link hoặc mã quiz.
Hệ thống kiểm tra quiz có tồn tại và còn hiệu lực hay không.
Người dùng bắt đầu làm bài.
Backend tạo một QuizAttempt.
Người dùng chọn đáp án và nộp bài.
Backend chấm điểm tự động.
Hệ thống trả kết quả, điểm số và đáp án đúng.
Bảo mật
Mật khẩu được mã hóa bằng BCrypt.
Xác thực bằng JWT.
Access token và refresh token được lưu qua cookie HttpOnly.
Redis được dùng để hỗ trợ blacklist token khi logout.
Phân quyền theo role: User, Creator, Admin.
Admin có quyền khóa tài khoản và xử lý quiz vi phạm.
Ghi chú khi deploy
Cần cấu hình các biến môi trường sau trên môi trường deploy:
SPRING_DATASOURCE_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_REFRESH_SECRET
JWT_RESET_SECRET
GOOGLE_GENAI_API_KEY
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
REDIS_HOST
REDIS_PORT
APP_CORS_ALLOWED_ORIGINS
APP_COOKIE_SECURE
APP_COOKIE_SAME_SITE
Nếu frontend và backend deploy khác domain, cần cấu hình CORS và cookie SameSite/Secure phù hợp.
Tác giả
Nguyễn Huy Hoàn
License
Dự án được xây dựng phục vụ mục đích học tập và nghiên cứu.