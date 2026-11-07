// Tu rieng cho phu de tu dong (Whisper).
//
// AD ghi cac tu Whisper hay nghe sai (ten san pham, ten rieng...),
// moi dong 1 quy tac:  sai -> dung
// Vi du:  in van chi -> INVANNCHY
//         mu so -> Mousse
// Quy tac chi ap dung cho phu de tu dong tao ra, khong sua phu de
// AD tu nhap tay. Luu local trong trinh duyet, khong gui ra ngoai.

const CUSTOM_VOCAB_STORAGE_KEY = "timeline-studio-custom-vocab";
export const MAX_CUSTOM_VOCAB_RULES = 200;
export const MAX_CUSTOM_VOCAB_TERM_LENGTH = 100;

export function loadCustomVocabularyText() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(CUSTOM_VOCAB_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCustomVocabularyText(text) {
  try {
    window.localStorage.setItem(CUSTOM_VOCAB_STORAGE_KEY, String(text ?? ""));
  } catch {
    // Bo qua khi trinh duyet chan localStorage.
  }
}

export function parseCustomVocabulary(text) {
  const rules = [];
  for (const rawLine of String(text ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const arrow = line.includes("->") ? "->" : line.includes("=") ? "=" : null;
    if (!arrow) continue;
    const [from, to] = line.split(arrow).map((part) => part.trim());
    if (!from || !to) continue;
    rules.push({
      from: from.slice(0, MAX_CUSTOM_VOCAB_TERM_LENGTH),
      to: to.slice(0, MAX_CUSTOM_VOCAB_TERM_LENGTH),
    });
    if (rules.length >= MAX_CUSTOM_VOCAB_RULES) break;
  }
  // Thay tu dai truoc de tranh tu ngan an mat tu dai (vi du "mu so" truoc "mu").
  return rules.sort((a, b) => b.from.length - a.from.length);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function applyCustomVocabulary(text, rules) {
  let result = String(text ?? "");
  const list = Array.isArray(rules) ? rules : parseCustomVocabulary(loadCustomVocabularyText());
  for (const rule of list) {
    if (!rule.from) continue;
    result = result.replace(new RegExp(escapeRegExp(rule.from), "gi"), rule.to);
  }
  return result;
}
