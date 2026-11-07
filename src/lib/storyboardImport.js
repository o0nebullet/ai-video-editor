// Nhap storyboard vao Timeline Studio.
//
// Luong du lieu chi chay local trong trinh duyet: doc text/file do AD
// dua vao, tach thanh cac canh, dua vao caption + script. Khong gui
// du lieu ra may chu nao, khong doc du lieu tu web storyboard.
//
// Dinh dang file JSON chap nhan (ca 2 deu lay dialogue theo position):
//   1. Dang xuat day du cua web storyboard:
//      { project: { name }, scenes: [{ position, dialogue, prompt, ... }] }
//   2. Dang gon:
//      { scenes: [{ dialogue }] } | [{ dialogue }] | { script: "dong 1\ndong 2" }

export const STORYBOARD_SCENE_DURATIONS = [5, 10, 20];
export const DEFAULT_STORYBOARD_SCENE_SECONDS = 10;
export const MAX_STORYBOARD_SCENES = 200;
export const MAX_STORYBOARD_LINE_LENGTH = 2000;

function cleanLine(line) {
  return String(line ?? "").trim();
}

function capLines(lines) {
  const cleaned = [];
  for (const line of lines) {
    const text = cleanLine(line);
    if (!text) continue;
    cleaned.push(text.slice(0, MAX_STORYBOARD_LINE_LENGTH));
    if (cleaned.length >= MAX_STORYBOARD_SCENES) break;
  }
  return cleaned;
}

// Tach kich ban dan (1 dong = 1 canh, giong cach nhap cua web storyboard).
export function parseStoryboardText(text) {
  if (typeof text !== "string") return [];
  return capLines(text.split(/\r?\n/));
}

function scenesToLines(scenes) {
  if (!Array.isArray(scenes)) return [];
  const ordered = [...scenes].sort((a, b) => {
    const pa = Number(a?.position) || 0;
    const pb = Number(b?.position) || 0;
    return pa - pb;
  });
  return capLines(ordered.map((scene) => scene?.dialogue));
}

// Doc file JSON storyboard -> danh sach dialogue theo thu tu canh.
export function parseStoryboardJson(text) {
  let data;
  try {
    data = JSON.parse(String(text ?? ""));
  } catch {
    return { lines: [], error: "json" };
  }
  if (Array.isArray(data)) return { lines: scenesToLines(data), error: null };
  if (data && Array.isArray(data.scenes)) return { lines: scenesToLines(data.scenes), error: null };
  if (data && typeof data.script === "string") return { lines: parseStoryboardText(data.script), error: null };
  return { lines: [], error: "shape" };
}

export function storyboardTotalSeconds(lineCount, secondsPerScene) {
  const perScene = STORYBOARD_SCENE_DURATIONS.includes(secondsPerScene)
    ? secondsPerScene
    : DEFAULT_STORYBOARD_SCENE_SECONDS;
  return Math.max(1, lineCount) * perScene;
}
