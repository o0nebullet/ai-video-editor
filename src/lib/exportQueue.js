// Hang doi xuat video.
//
// AD xep nhieu lenh xuat cho TIMELINE HIEN TAI (vi du: MP4 1080p + WebM
// 720p), bam "Xuat tat ca", app xuat lan luot tung video, khong can
// ngoi cho tung video. Moi lenh chi doi cai dat xuat, khong doi timeline.
//
// Gioi han co y: hang doi chi xuat timeline hien tai. Khong tu dong doi
// project giua chung vi viec doi project dang xuat co nguy co lam mat
// timeline AD dang lam. Muon xuat project khac: mo project do roi xuat.
// Hang doi chi giu trong phien lam viec (khong luu localStorage) de
// tranh xuat nham project cu sau khi AD da doi timeline.

import { makeId } from "./timeline.js";

export const EXPORT_QUEUE_PRESETS = [
  {
    id: "mp4-1080",
    name: "MP4 1080p",
    settings: { mediaType: "video", codec: "h264", resolution: "1080", fileName: "video-1080p" },
  },
  {
    id: "mp4-720",
    name: "MP4 720p",
    settings: { mediaType: "video", codec: "h264", resolution: "720", fileName: "video-720p" },
  },
  {
    id: "webm-720",
    name: "WebM 720p",
    settings: { mediaType: "video", codec: "vp9", resolution: "720", fileName: "video-720p" },
  },
  {
    id: "audio-wav",
    name: "Audio WAV",
    settings: { mediaType: "audio", audioFormat: "wav", fileName: "audio" },
  },
];

export function createExportQueueItem(presetId) {
  const preset = EXPORT_QUEUE_PRESETS.find((item) => item.id === presetId) ?? EXPORT_QUEUE_PRESETS[0];
  return {
    id: makeId("export-queue"),
    name: preset.name,
    settings: { ...preset.settings },
    status: "queued",
  };
}
