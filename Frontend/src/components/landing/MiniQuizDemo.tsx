import { useMemo, useState } from "react";

export default function MiniQuizDemo() {
  const questions = useMemo(
    () => [
      {
        question: "Thủ đô của Việt Nam là gì?",
        answers: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế"],
        correct: 0,
      },
      {
        question: "1 + 1 = ?",
        answers: ["1", "2", "3", "11"],
        correct: 1,
      },
      {
        question: "Ai là cha đẻ của máy tính?",
        answers: ["Tesla", "Newton", "Alan Turing", "Edison"],
        correct: 2,
      },
      {
        question: "HTML viết tắt của gì?",
        answers: [
          "HyperText Markup Language",
          "High Text Machine Learning",
          "Home Tool Markup",
          "HyperText Machine Link",
        ],
        correct: 0,
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const finished = index >= questions.length;
  const current = questions[index];

  const chooseAnswer = (answerIndex: number) => {
    if (!current) return;

    const isCorrect = answerIndex === current.correct;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((value) => value + 25);
    }

    window.setTimeout(() => {
      setFeedback(null);
      setIndex((value) => value + 1);
    }, 520);
  };

  const resetQuiz = () => {
    setIndex(0);
    setScore(0);
    setFeedback(null);
  };

  return (
    <section className="qv-section" id="demo">
      <div className="qv-container">
        <h2 className="qv-title">Thử Ngay - Không Cần Đăng Ký!</h2>
        <p className="qv-subtitle">
          Mini quiz tương tác nhẹ để mô phỏng trải nghiệm làm bài trong Qivora.
        </p>

        <div className="qv-demo-grid">
          <div
            className={`qv-card qv-demo ${feedback ? `is-${feedback}` : ""}`}
          >
            <div className="qv-demo-top">
              <b>
                {finished
                  ? "Kết quả"
                  : `Câu ${index + 1} / ${questions.length}`}
              </b>
              <span>{score} điểm</span>
            </div>

            <div className="qv-progress">
              <i
                style={{
                  transform: `scaleX(${Math.min(index + 1, questions.length) / questions.length})`,
                }}
              />
            </div>

            {finished ? (
              <>
                <h2>
                  {score >= 75
                    ? "Xuất sắc! Bạn đã hoàn thành quiz 🎉"
                    : "Hoàn thành rồi! Thử lại để nâng điểm nhé."}
                </h2>
                <button
                  className="qv-btn qv-btn-gradient"
                  onClick={resetQuiz}
                  type="button"
                >
                  Làm lại quiz
                </button>
              </>
            ) : (
              <>
                <h2>{current.question}</h2>
                <div className="qv-answer-list">
                  {current.answers.map((answer, answerIndex) => (
                    <button
                      key={answer}
                      onClick={() => chooseAnswer(answerIndex)}
                      type="button"
                    >
                      {String.fromCharCode(65 + answerIndex)}. {answer}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="qv-card qv-score">
            <h3>Điểm realtime</h3>
            <p>Mỗi câu đúng cộng 25 điểm.</p>
            <strong>{score}</strong>
            <button
              className="qv-btn qv-btn-gradient"
              onClick={resetQuiz}
              type="button"
            >
              Reset
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
