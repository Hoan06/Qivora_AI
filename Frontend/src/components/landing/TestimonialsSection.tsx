const testimonials = [
  {
    avatar: "👩‍🏫",
    name: "Cô Mai",
    quote: "Qivora giúp mình tạo đề trong vài phút, học sinh cũng hào hứng hơn hẳn.",
  },
  {
    avatar: "🧑‍🎓",
    name: "Minh Anh",
    quote: "Phần làm quiz nhanh, đẹp, có điểm ngay nên ôn thi rất cuốn.",
  },
  {
    avatar: "👨‍💻",
    name: "Hoàng",
    quote: "AI tạo câu hỏi khá sát chủ đề. Rất hợp cho nhóm tự học lập trình.",
  },
  {
    avatar: "🧑‍🏫",
    name: "Thầy Nam",
    quote: "Mã quiz và mật khẩu phòng thi làm lớp học online gọn hơn nhiều.",
  },
  {
    avatar: "👩‍🔬",
    name: "Linh",
    quote: "Bảng xếp hạng làm tụi mình cạnh tranh vui mà không bị áp lực.",
  },
  {
    avatar: "🧑‍🚀",
    name: "Khải",
    quote: "UI đẹp, hiệu ứng mượt, cảm giác học như chơi game nhẹ nhàng.",
  },
];

function TestimonialCard({ avatar, name, quote }: (typeof testimonials)[number]) {
  return (
    <article className="qv-testimonial-card">
      <div className="qv-testimonial-person">
        <span>{avatar}</span>
        <strong>{name}</strong>
      </div>
      <div className="qv-stars">★★★★★</div>
      <p>"{quote}"</p>
    </article>
  );
}

export default function TestimonialsSection() {
  const firstRow = [...testimonials, ...testimonials];
  const secondRow = [...testimonials].reverse().concat([...testimonials].reverse());

  return (
    <section className="qv-section qv-testimonials-section">
      <div className="qv-container">
        <h2 className="qv-title qv-reveal">Mọi Người Nói Gì Về Qivora?</h2>
        <p className="qv-subtitle qv-reveal">Những phản hồi nhỏ nhưng đủ làm Qivora có thêm động lực tiến lên.</p>
      </div>

      <div className="qv-marquee-wrap">
        <div className="qv-marquee">
          {firstRow.map((item, index) => (
            <TestimonialCard key={`${item.name}-top-${index}`} {...item} />
          ))}
        </div>
        <div className="qv-marquee qv-marquee-reverse">
          {secondRow.map((item, index) => (
            <TestimonialCard key={`${item.name}-bottom-${index}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
