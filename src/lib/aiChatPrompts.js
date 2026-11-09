// Chat AI (free-tier) — chi chay local trong trinh duyet.
//
// Nguyen tac rieng tu: Timeline Studio KHONG gui bat ky du lieu nao
// cho dich vu AI, khong dung API key, khong goi mang den AI.
// Luong dung: AD copy prompt mau o day -> dan sang chat AI cua AD
// (tai khoan cua AD, tren tab cua AD) -> chat tra ket qua -> AD dan
// ket qua lai day -> ap dung lam kich ban + phu de.
// File nay chi chua mau prompt, khong chua khoa hay token.

export const AI_CHAT_PROMPT_TYPES = [
  {
    id: "hook",
    name: "Hook",
    template: "Viết 5 câu hook ngắn (mỗi câu đọc dưới 3 giây) cho video về [CHỦ ĐỀ]. Hook theo 5 nhóm: tò mò, bất ngờ, nỗi đau, câu hỏi, tuyên bố mạnh. Chỉ trả lời bằng 5 câu hook, không giải thích dài.",
  },
  {
    id: "script",
    name: "Kịch bản",
    template: "Viết kịch bản video ngắn về [CHỦ ĐỀ], theo cấu trúc Hook → Vấn đề → Giải pháp → Ví dụ → Kết quả → CTA. Mỗi đoạn 1-2 câu ngắn, giọng nói tự nhiên như trải nghiệm thật. Không bịa số liệu, đánh giá hay ưu đãi.",
  },
  {
    id: "caption",
    name: "Caption",
    template: "Viết 3 caption ngắn + hashtag cho video về [CHỦ ĐỀ]. Caption tự nhiên, không bịa số liệu. Mỗi caption 1-2 câu.",
  },
  {
    id: "title",
    name: "Tiêu đề",
    template: "Viết 5 tiêu đề video ngắn, dưới 60 ký tự, về [CHỦ ĐỀ]. Không dùng từ ngữ phóng đại, không bịa số liệu.",
  },
];

export function buildAiChatPrompt(typeId, topic) {
  const type = AI_CHAT_PROMPT_TYPES.find((item) => item.id === typeId) ?? AI_CHAT_PROMPT_TYPES[0];
  const safeTopic = String(topic ?? "").trim() || "[CHỦ ĐỀ]";
  return type.template.replaceAll("[CHỦ ĐỀ]", safeTopic);
}
