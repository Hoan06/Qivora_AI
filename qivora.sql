-- =============================================================================
-- QIVORA - SYSTEM DATABASE SCHEMA (PostgreSQL)
-- Generates full database schema and initial seed data for Qivora platform.
-- =============================================================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Table: roles
-- Vai trò người dùng trong hệ thống (USER, CREATOR, ADMIN)
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

COMMENT ON TABLE roles IS 'Bảng lưu trữ vai trò người dùng (USER, CREATOR, ADMIN)';
COMMENT ON COLUMN roles.name IS 'Tên vai trò (Duy nhất)';

-- -----------------------------------------------------------------------------
-- 2. Table: users
-- Thông tin tài khoản người dùng
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Bảng lưu thông tin tài khoản người dùng';
COMMENT ON COLUMN users.username IS 'Tên đăng nhập';
COMMENT ON COLUMN users.password IS 'Mật khẩu đã mã hóa (BCrypt)';
COMMENT ON COLUMN users.email IS 'Địa chỉ email';
COMMENT ON COLUMN users.full_name IS 'Họ và tên người dùng';
COMMENT ON COLUMN users.avatar IS 'Đường dẫn ảnh đại diện (Cloudinary)';
COMMENT ON COLUMN users.is_active IS 'Trạng thái hoạt động của tài khoản';

-- -----------------------------------------------------------------------------
-- 3. Table: user_roles
-- Bảng trung gian phân quyền giữa users và roles (Many-to-Many)
-- -----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_roles IS 'Bảng trung gian gán vai trò cho người dùng';

-- -----------------------------------------------------------------------------
-- 4. Table: quizzes
-- Quản lý bài trắc nghiệm / quiz
-- -----------------------------------------------------------------------------
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    time_limit INT NOT NULL,
    password VARCHAR(100),
    started_at TIMESTAMP WITHOUT TIME ZONE,
    ended_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_reason TEXT,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    creator_id BIGINT NOT NULL,
    CONSTRAINT fk_quizzes_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE quizzes IS 'Bảng lưu thông tin bài quiz / trắc nghiệm';
COMMENT ON COLUMN quizzes.code IS 'Mã quiz ngẫu nhiên để chia sẻ';
COMMENT ON COLUMN quizzes.time_limit IS 'Thời gian làm bài tính bằng phút';
COMMENT ON COLUMN quizzes.is_deleted IS 'Cờ xóa mềm';

-- -----------------------------------------------------------------------------
-- 5. Table: questions
-- Câu hỏi thuộc các bài quiz
-- -----------------------------------------------------------------------------
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    score INT NOT NULL DEFAULT 10,
    explanation TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quiz_id BIGINT NOT NULL,
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

COMMENT ON TABLE questions IS 'Bảng lưu câu hỏi của bài quiz';
COMMENT ON COLUMN questions.score IS 'Điểm số của câu hỏi';
COMMENT ON COLUMN questions.explanation IS 'Lời giải thích đáp án';

-- -----------------------------------------------------------------------------
-- 6. Table: answers
-- Các đáp án lựa chọn cho từng câu hỏi
-- -----------------------------------------------------------------------------
CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    question_id BIGINT NOT NULL,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

COMMENT ON TABLE answers IS 'Bảng lưu các phương án lựa chọn';
COMMENT ON COLUMN answers.is_correct IS 'Đánh dấu đây có phải đáp án đúng không';

-- -----------------------------------------------------------------------------
-- 7. Table: quiz_attempts
-- Các lượt làm bài quiz (của User hoặc Guest)
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    guest_name VARCHAR(100),
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT,
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE quiz_attempts IS 'Bảng lưu phiên / lượt làm bài quiz';
COMMENT ON COLUMN quiz_attempts.guest_name IS 'Tên khách hàng nếu không đăng nhập';
COMMENT ON COLUMN quiz_attempts.status IS 'Trạng thái lượt làm bài (IN_PROGRESS, COMPLETED)';

-- -----------------------------------------------------------------------------
-- 8. Table: user_answers
-- Lưu chi tiết lựa chọn đáp án của người làm bài trong từng lượt
-- -----------------------------------------------------------------------------
CREATE TABLE user_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_id BIGINT NOT NULL,
    CONSTRAINT fk_user_answers_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_answers_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_answers IS 'Bảng lưu câu trả lời cụ thể của người dùng trong phiên làm bài';

-- -----------------------------------------------------------------------------
-- 9. Table: refresh_tokens
-- Quản lý Refresh Token xác thực người dùng
-- -----------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE refresh_tokens IS 'Bảng lưu vết Refresh Token để duy trì đăng nhập';

-- -----------------------------------------------------------------------------
-- 10. Table: feedbacks
-- Phản hồi của người dùng về hệ thống hoặc bài quiz
-- -----------------------------------------------------------------------------
CREATE TABLE feedbacks (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    quiz_id BIGINT,
    CONSTRAINT fk_feedbacks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedbacks_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
);

COMMENT ON TABLE feedbacks IS 'Bảng lưu ý kiến phản hồi của người dùng';
COMMENT ON COLUMN feedbacks.type IS 'Loại phản hồi (SYSTEM, QUIZ)';

-- -----------------------------------------------------------------------------
-- 11. Table: documents
-- Tài liệu tải lên để xử lý RAG; các đoạn văn bản và embedding được lưu riêng
-- trong bảng vector_store do Spring AI PgVectorStore khởi tạo.
-- -----------------------------------------------------------------------------
CREATE TABLE documents (
    document_id BIGSERIAL PRIMARY KEY,
    document_name VARCHAR(255),
    file_type VARCHAR(255),
    file_size BIGINT,
    file_hash VARCHAR(64) UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    chunk_count INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    link_document TEXT,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE documents IS 'Tài liệu tải lên dùng cho chức năng hỏi đáp RAG';
COMMENT ON COLUMN documents.file_hash IS 'MD5 hash dùng để phát hiện tài liệu trùng lặp';
COMMENT ON COLUMN documents.status IS 'Trạng thái xử lý: PENDING, PROCESSING, COMPLETED, FAILED';
COMMENT ON COLUMN documents.link_document IS 'Đường dẫn tài liệu trên Cloudinary';

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_quizzes_code ON quizzes(code);
CREATE INDEX idx_quizzes_creator ON quizzes(creator_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_user_answers_attempt ON user_answers(attempt_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Spring AI PgVectorStore dùng extension vector và tự khởi tạo bảng vector_store
-- theo cấu hình initialize-schema=true trong application.yml.
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- INITIAL SEED DATA
-- Khởi tạo các Role cơ bản cho hệ thống
-- =============================================================================
INSERT INTO roles (name) VALUES 
('USER'),
('CREATOR'),
('ADMIN')
ON CONFLICT (name) DO NOTHING;






