import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetFeedbackState, sendFeedback } from "../../api/feedbackSlice";
import { type AppDispatch, type RootState } from "../../store/store";

const feedbackTypes = [
  { label: "Góp ý", value: "GENERAL", type: "SYSTEM" },
  { label: "Báo lỗi", value: "BUG", type: "SYSTEM" },
  { label: "Quiz", value: "QUIZ", type: "QUIZ" },
] as const;

export default function FeedbackFloatingButton() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, status } = useSelector((state: RootState) => state.feedback);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState<(typeof feedbackTypes)[number]["value"]>(feedbackTypes[0].value);
  const [senderName, setSenderName] = useState("");
  const [content, setContent] = useState("");
  const [quizId, setQuizId] = useState("");
  const [formError, setFormError] = useState("");

  const selectedType = feedbackTypes.find((type) => type.value === feedbackType) || feedbackTypes[0];

  const getErrorMessage = () => {
    if (formError) return formError;
    if (!error) return "";
    if (typeof error === "string") return error;
    if (typeof error === "object" && "message" in error && typeof error.message === "string") {
      return error.message;
    }
    return "Gửi feedback thất bại. Kiểm tra lại dữ liệu.";
  };

  const resetForm = () => {
    setSenderName("");
    setContent("");
    setQuizId("");
    setFormError("");
    dispatch(resetFeedbackState());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!senderName.trim()) {
      setFormError("Bạn cần nhập họ tên người gửi.");
      return;
    }

    if (!content.trim()) {
      setFormError("Bạn cần nhập nội dung feedback.");
      return;
    }

    if (selectedType.type === "QUIZ" && !quizId.trim()) {
      setFormError("Feedback về quiz cần nhập ID quiz.");
      return;
    }

    try {
      await dispatch(
        sendFeedback({
          type: selectedType.type,
          senderName: senderName.trim(),
          content: content.trim(),
          quizId: selectedType.type === "QUIZ" ? Number(quizId) : undefined,
        }),
      ).unwrap();

      setSent(true);
      setSenderName("");
      setContent("");
      setQuizId("");
    } catch {
      // Redux state giữ lỗi để hiển thị dưới form.
    }
  };

  return (
    <aside className={`qv-feedback-float ${open ? "is-open" : ""}`}>
      <form className="qv-feedback-panel" onSubmit={handleSubmit}>
        <div className="qv-feedback-head">
          <div>
            <span>Message</span>
            <strong>{sent ? "Đã gửi" : "Gửi feedback"}</strong>
          </div>
          <button
            aria-label="Đóng feedback"
            onClick={() => {
              setOpen(false);
              setSent(false);
              resetForm();
            }}
            type="button"
          >
            ×
          </button>
        </div>

        {sent ? (
          <p className="qv-feedback-success">
            Cảm ơn bạn. Qivora đã ghi nhận phản hồi này.
          </p>
        ) : (
          <>
            <div className="qv-feedback-types" aria-label="Loại phản hồi">
              {feedbackTypes.map((type) => (
                <button
                  className={feedbackType === type.value ? "is-active" : ""}
                  key={type.value}
                  onClick={() => {
                    setFeedbackType(type.value);
                    setFormError("");
                    dispatch(resetFeedbackState());
                  }}
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>

            <input name="feedbackType" type="hidden" value={feedbackType} />

            <label>
              Họ tên người gửi
              <input
                onChange={(event) => setSenderName(event.target.value)}
                placeholder="Nhập họ tên của bạn"
                required
                type="text"
                value={senderName}
              />
            </label>

            {selectedType.type === "QUIZ" ? (
              <label>
                ID quiz
                <input
                  min={1}
                  onChange={(event) => setQuizId(event.target.value)}
                  placeholder="Nhập ID quiz cần phản hồi"
                  required
                  type="number"
                  value={quizId}
                />
              </label>
            ) : null}

            <label>
              Nội dung
              <textarea
                onChange={(event) => setContent(event.target.value)}
                placeholder="Bạn muốn Qivora cải thiện điều gì?"
                required
                value={content}
              />
            </label>

            {getErrorMessage() ? <p className="qv-feedback-error">{getErrorMessage()}</p> : null}

            <button className="qv-btn qv-btn-gradient" disabled={status === "pending"} type="submit">
              {status === "pending" ? "Đang gửi..." : "Gửi feedback"}
            </button>
          </>
        )}
      </form>

      <button
        aria-expanded={open}
        aria-label="Gửi feedback"
        className="qv-feedback-trigger"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) {
            setSent(false);
            resetForm();
          }
        }}
        type="button"
      >
        <span className="qv-feedback-icon" />
        <span className="qv-feedback-pulse" />
      </button>
    </aside>
  );
}
