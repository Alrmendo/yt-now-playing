# YouTube Now Playing Widget — Project Plan

## Mục tiêu

Một ứng dụng Electron (Windows) hiển thị thông tin bài nhạc đang nghe trên
YouTube, lấy dữ liệu từ một Chrome extension đọc DOM của tab YouTube đang
phát. App KHÔNG tự phát nhạc — chỉ là widget hiển thị "Now Playing", giống
mô hình Discord Rich Presence nhưng tự build cho YouTube.

## Kiến trúc tổng thể

```
[Chrome Extension]                          [Electron App]
  content script (đọc DOM youtube.com)        WebSocket server (localhost:6969)
  background/service worker (quản lý          UI hiển thị Now Playing card
  nhiều tab, chọn tab đang phát, gửi data)
         │
         └──── kết nối WebSocket như client ────►  app là WebSocket server
```

Quyết định quan trọng: **Electron app là WebSocket server, extension là
client**. Lý do: app không thể chủ động "nhìn vào" Chrome, chỉ extension mới
đọc được DOM trang YouTube — nên hướng kết nối phải đi từ extension sang app.

App có thể mở SAU khi Chrome đã đang phát nhạc. Vì vậy extension PHẢI có cơ
chế tự động reconnect (thử kết nối lại định kỳ khi WebSocket đóng hoặc lỗi),
không giả định app luôn chạy sẵn.

## Schema dữ liệu (WebSocket message, JSON)

Khi có tab đang phát nhạc:

```json
{
  "type": "now_playing",
  "title": "Tên video",
  "channel": "Tên kênh",
  "thumbnail": "https://i.ytimg.com/vi/<videoId>/hqdefault.jpg",
  "isPlaying": true,
  "currentTime": 42.3,
  "duration": 215.0,
  "videoId": "3cqV5BKJHyk",
  "tabId": 123
}
```

Khi không còn tab nào đang phát (tất cả pause hoặc đã đóng hết tab
YouTube):

```json
{ "type": "no_playback" }
```

Hai phía (extension và Electron app) PHẢI dùng đúng schema này để tránh lệch
khi phát triển song song.

## Cấu hình đã chốt

- **Trình duyệt mục tiêu:** Chrome (Manifest V3). Không cần làm tương thích
  Edge/Firefox ở giai đoạn này.
- **WebSocket port:** cố định `6969` (localhost). Nếu port bị chiếm, app nên
  log lỗi rõ ràng, không cần tự động chuyển port ở bản đầu.
- **Multi-tab:** nếu có nhiều tab YouTube mở cùng lúc, chỉ báo cáo tab đang
  PHÁT (không pause). Nếu nhiều tab cùng phát đồng thời (hiếm), dùng tab có
  `currentTime` thay đổi gần nhất làm tiebreaker.
- **Hướng kết nối:** Electron host WebSocket server, extension là client tự
  reconnect.

## Các giai đoạn triển khai

### Giai đoạn 1 — Spike: xác nhận đọc DOM YouTube đúng data

Trước khi xây WebSocket hay Electron, viết một content script tối thiểu chỉ
để log ra console: title, channel, trạng thái play/pause, currentTime,
duration — mỗi khi có thay đổi. Tự kiểm tra bằng tay trên:
- Video thường
- YouTube Shorts
- Video có quảng cáo chạy giữa (kiểm tra không bị nhận nhầm trạng thái)
- Chuyển bài trong playlist

Mục đích: DOM của YouTube đổi cấu trúc khá thường xuyên, cần xác nhận
selector dùng được TRƯỚC khi build phần còn lại, tránh phải sửa lại nhiều
nơi nếu chọn sai selector ban đầu.

Lưu ý kỹ thuật: ưu tiên dùng `document.querySelector('video')` (HTML5 video
element chuẩn của YouTube) để lấy `currentTime`, `duration`, `paused` —
đáng tin cậy hơn là parse các nút UI play/pause vì nút UI có thể đổi class
name giữa các bản YouTube khác nhau.

### Giai đoạn 2 — Electron app: WebSocket server + UI tối thiểu

- Dựng Electron app cơ bản.
- Host WebSocket server (gợi ý dùng package `ws`) lúc app khởi động, lắng
  nghe tại `ws://localhost:6969`.
- UI tối thiểu: hiện text thô (title, channel, isPlaying) mỗi khi nhận được
  message — chưa cần đẹp, mục đích là xác nhận luồng nhận data chạy đúng.

### Giai đoạn 3 — Nối extension thật vào WebSocket

- Extension (dùng kết quả từ Giai đoạn 1) gửi data thật qua WebSocket tới
  app (Giai đoạn 2).
- Thêm cơ chế reconnect tự động phía extension: khi `onclose` hoặc `onerror`,
  thử kết nối lại sau một khoảng thời gian (ví dụ mỗi 3 giây), không dừng
  hẳn.
- Test với app mở trước/sau Chrome ở cả hai thứ tự để xác nhận reconnect
  hoạt động đúng.

### Giai đoạn 4 — Xử lý multi-tab

- Extension cần theo dõi TẤT CẢ tab `*.youtube.com` đang mở, không chỉ tab
  active.
- Áp dụng logic chọn tab đang phát + tiebreaker đã chốt ở trên.
- Khi tất cả tab YouTube đóng hoặc pause hết, gửi `{"type": "no_playback"}`.

### Giai đoạn 5 — UI hoàn chỉnh + theme động

- Card hiển thị đẹp: thumbnail, progress bar (dựa trên `currentTime` /
  `duration`), tên bài, tên kênh, trạng thái play/pause.
- Custom frameless window (`frame: false`) với drag/resize tự vẽ.
- Dynamic dock/taskbar icon đổi theo theme (sáng/tối hoặc theo màu chủ đạo
  của thumbnail — cần quyết định thêm khi tới giai đoạn này).

## Điểm cần tự quyết định thêm khi code (chưa chốt, Claude Code có thể hỏi
lại người dùng hoặc chọn hợp lý nhất khi gặp)

- Tên và icon cụ thể của extension, có cần đăng ký Chrome Web Store hay chỉ
  load dạng "unpacked" để dùng cá nhân.
- Polling interval phía content script để check thay đổi DOM (gợi ý dùng
  `MutationObserver` trên phần tử title thay vì polling liên tục, để tiết
  kiệm tài nguyên — nhưng vẫn cần một interval nhỏ (~1s) để cập nhật
  `currentTime` cho progress bar vì đây không tự bắn event).
- Permission cụ thể cần khai báo trong `manifest.json` (`tabs`, `scripting`,
  `host_permissions` cho `*://*.youtube.com/*`).
- Xử lý khi app bị đóng và mở lại — extension có cần buffer data lúc mất kết
  nối hay chỉ cần gửi state hiện tại ngay khi reconnect thành công (gợi ý:
  chỉ cần gửi state hiện tại ngay khi reconnect, không cần buffer).
- Thiết kế UI cụ thể (màu sắc, font, bố cục) — theo phong cách "đơn giản
  giống Spotify" như ý tưởng gốc của người dùng.

## Việc đã KHÔNG làm trong phạm vi dự án này (đã đổi hướng)

- Không tự phát nhạc trong app qua YouTube IFrame Player API (đã thử ở phase
  trước, gặp vấn đề tốc độ load — quyết định bỏ).
- Không cần parse link YouTube dán tay vào app.
- Không cần YouTube Data API hay OAuth.
- Không cần local MP3 playback (có thể thêm lại sau nếu muốn, nhưng không
  nằm trong scope hiện tại).
