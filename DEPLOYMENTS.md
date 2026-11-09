# Timeline Studio — Version & Nền tảng deploy

> Luật: **1 version = 1 commit.** Version ghi trong `package.json`, commit ghi trong
> `public/version.json` (sinh ra lúc build bằng `scripts/write-version.mjs`).
> Muốn biết hang nào đang chạy bản nào: mở `<domain>/version.json`, đối chiếu bảng dưới.
> Nâng cấp hang phụ: lấy đúng commit của hang chính, build lại, deploy — không xem xét
> lại tính năng.

## Version

| Version | Commit | Nội dung | Ngày |
| --- | --- | --- | --- |
| `1.0.9-ad.0` | `c713b27a` | Merge 5 tính năng AD lên fork mới nhất `c8dbe02` (gốc v1.0.9 + 52 commit) | 2026-11-07 |
| `1.0.9-ad.1` | xem `version.json` | ad.0 + dịch vi Smart Frame/Lab (64 key) + hệ thống version + config 3 hang (vercel.json, Pages workflow, tách ffmpeg wasm sang R2, COOP/COEP trong model-cache SW) — code phát hành ở commit `f398429` (10 commit lẻ trên GitHub, chưa gồm `.github/workflows/pages.yml`); commit trong `version.json` là commit lúc build, nên sau mỗi lần đẩy file tài liệu nó đổi theo mà version vẫn là ad.1 | 2026-11-07 |

## Nền tảng

| Nền tảng | Vai trò | URL | Version đang chạy | Commit | Ngày deploy | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| Netlify | Đối chứng (bản cũ) | https://papaya-axolotl-9490bc.netlify.app/ | `1.0.9-ad.0` | `c713b27a` | 2026-11-07 10:27 | Live — chưa có ad.1 (chờ reset credit 17/11, phương án A) |
| Cloudflare Pages | **Chính** | [CHƯA CÓ] | — | — | — | Chưa deploy — kẹt 1 file `ffmpeg-core` 31 MB > giới hạn 25 MiB/file; đường vòng: file này lên R2 public, code đã hỗ trợ `VITE_FFMPEG_WASM_URL` / `VITE_FFMPEG_CORE_URL`, lúc deploy thật cần kiểm header CORP/CORS trên R2 |
| Vercel Hobby | Dự phòng 1 | https://ai-video-editor-olive.vercel.app/ | `1.0.9-ad.1` | `f398429` | 2026-11-07 13:43 | Live — Ready, Production Branch `ad-merge-2026-11-07`, GitHub integration chỉ cho repo này |
| GitHub Pages | Dự phòng 2 | [CHƯA CÓ] | — | — | — | Chưa deploy — workflow `.github/workflows/pages.yml` đã có; cần bật Pages source = GitHub Actions trong Settings repo; COOP/COEP không do server cấp mà do `model-cache-sw.js` tự chèn (không thêm service worker thứ 2, vì sẽ cướp quyền điều khiển khỏi model-cache SW và làm hỏng `waitForHostMediaController`) |

## Việc AD cần làm (để MiA deploy được)

- **Vercel:** XONG 2026-11-07 — project `ai-video-editor`, live `https://ai-video-editor-olive.vercel.app/`, GitHub integration đã cài chỉ cho repo này.
- **Cloudflare:** cần tài khoản Cloudflare + API token quyền Pages (Edit) và R2 (Edit), hoặc AD đăng nhập Cloudflare trên trình duyệt rồi để MiA tạo project qua đó. MiA chưa có token nào.
- **GitHub Pages:** bật Settings → Pages → Build and deployment → Source = GitHub Actions (repo `o0nebullet/ai-video-editor`).

## Kiểm sau mỗi lần deploy (giống nhau cả 3 hang + Netlify)

- Mở `<domain>/version.json` — version + commit đúng bảng trên.
- Mở app, giao diện tiếng Việt, project “Dự án lồng tiếng AI”.
- Console: `crossOriginIsolated === true` (GitHub Pages: tải lần đầu sẽ tự reload 1 lần để bật isolation, lần sau không reload nữa).
- Thử xuất video ngắn (ffmpeg) — kiểm `ffmpeg-core` tải được (Cloudflare: từ R2).
