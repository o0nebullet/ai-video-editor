// Mau dung san cho Timeline Studio.
//
// Moi mau la kich ban tieng Viet co san (script + ti le khung + thoi luong
// moi canh). AD bam Ap dung roi thay [..] bang noi dung that cua minh.
// Mau khong tu bia so lieu, danh gia hay uu dai: cho nao can so that
// thi de [..] de AD dien. Chi chay local, khong gui du lieu ra ngoai.

export const PROJECT_TEMPLATES = [
  {
    id: "short-hook",
    name: "Short 9:16 — Hook → Vấn đề → Giải pháp → CTA",
    hint: "Video ngắn bán hàng / chia sẻ nhanh, 4 cảnh x 10 giây.",
    ratioId: "9:16",
    secondsPerScene: 10,
    script: [
      "Bạn có đang gặp [vấn đề của khách hàng]?",
      "[Vấn đề] khiến bạn mất thời gian, tốn tiền mà vẫn không xong?",
      "[Tên sản phẩm] giúp [giải pháp cụ thể] chỉ trong [thời gian].",
      "Bấm vào link bên dưới để xem chi tiết và đặt hàng ngay!",
    ].join("\n"),
  },
  {
    id: "long-form",
    name: "Video dài 16:9 — Mở đầu → Nội dung → Ví dụ → Kết luận",
    hint: "Video chia sẻ / hướng dẫn, 4 cảnh x 20 giây.",
    ratioId: "16:9",
    secondsPerScene: 20,
    script: [
      "Xin chào, hôm nay mình chia sẻ về [chủ đề].",
      "Vấn đề là: [mô tả vấn đề]. Có 3 điều cần biết: [điều 1], [điều 2], [điều 3].",
      "Ví dụ thực tế: [kể ví dụ ngắn, có số liệu thật nếu có].",
      "Tóm lại: [kết luận]. Nếu thấy hay, hãy đăng ký kênh để xem video tiếp theo.",
    ].join("\n"),
  },
  {
    id: "sales",
    name: "Video bán hàng 9:16 — Vấn đề → Sản phẩm → Bằng chứng → Ưu đãi → CTA",
    hint: "Video bán hàng, 5 cảnh x 10 giây. Chỉ ghi ưu đãi và phản hồi thật.",
    ratioId: "9:16",
    secondsPerScene: 10,
    script: [
      "Bạn có đang khó chịu vì [vấn đề]?",
      "[Tên sản phẩm] được làm để giải quyết đúng việc đó: [tính năng chính].",
      "Đã có [số] khách hàng dùng và phản hồi: [trích phản hồi thật].",
      "Hôm nay đặt hàng được [ưu đãi thật, ghi rõ điều kiện].",
      "Bấm link bên dưới để đặt hàng. Số lượng có hạn!",
    ].join("\n"),
  },
];
