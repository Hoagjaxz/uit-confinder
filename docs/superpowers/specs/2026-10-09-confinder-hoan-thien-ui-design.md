# UIT ConFinder: hoàn thiện giao diện tĩnh

Ngày: 2026-10-09. Phạm vi: thư mục `site/`.

## Mục tiêu

Hoàn thiện website tĩnh UIT ConFinder (tra cứu hội nghị khoa học, deadline-first) để nộp chấm UI môn IE104. Không backend, không framework, JS tối thiểu. Giữ phong cách hiện có: giấy kem, navy, vàng; Newsreader + Be Vietnam Pro + JetBrains Mono.

## Hiện trạng (audit 2026-10-09)

- Trang: `index`, `lich-hoi-nghi`, `hoi-nghi` (ICSE 2027), `blog` + 30 bài `blog/*.html`.
- Tốt: viewport có mọi trang, header/footer nhất quán, token màu sạch (`--ink/--paper/--navy/--gold` + 5 cặp urgency `c/s/u/o/x`).
- Thiếu: dark mode, skip link, breakpoint (mỗi CSS ~2 `@media`), 4 trạng thái danh sách, trang phụ, nhiều trang chi tiết hội nghị.
- Thư mục gốc `css/`, `js/`, `wireframe-tra-cuu-hoi-nghi.html` là bản cũ/tham khảo, không đụng tới.

## Kiến trúc chung

- Không đổi token sáng. Thêm token tối dưới `:root[data-theme="dark"]` và `@media (prefers-color-scheme: dark)` (guard `:root:not([data-theme="light"])`), mỗi cặp urgency có bản tối riêng, kiểm contrast AA.
- CSS mới: `css/states.css` (skeleton, error, empty), `css/pages.css` (trang phụ). Token chỉ khai báo ở `site.css`.
- JS mới, mỗi file một việc: `js/theme.js` (toggle + localStorage), `js/states-demo.js` (`?state=loading|error|empty|ready` và nút demo), `js/save.js` (sao ★ lưu localStorage, đọc ở trang Đã lưu). `newsletter.js` giữ nguyên. Mọi truy cập localStorage bọc try/catch.
- Header/footer copy-paste mỗi trang. Đồng bộ một lần bằng script PowerShell (không thành dependency): thêm skip link, nút theme, link trang mới.
- Trang mới nằm ngang hàng trong `site/`: `gioi-thieu.html`, `lien-he.html`, `faq-aoe.html`, `404.html`, `da-luu.html`, `hoi-nghi-<slug>.html`.

## Pha 1: Nền

- Skip link + `<main id="main">` mọi trang; focus ring rõ trên nền kem và navy.
- Breakpoint 375 / 768 / 1024: nav thu thành menu bấm, grid card 3→2→1, bảng thành dạng card dưới 768.
- Dark mode + nút toggle trong header, nhớ lựa chọn, mặc định theo hệ thống.
- Đồng bộ header/footer ~35 file.
- Xong khi: mọi trang không cuộn ngang ở 375px; Tab theo thứ tự hợp lý; light/dark đều đọc rõ.

## Pha 2: Bốn trạng thái danh sách (`lich-hoi-nghi.html`)

- Loading: 6 skeleton card cùng khung card thật, `role="status"`, "Đang tải lịch hội nghị…".
- Error: hộp lỗi + nút "Thử lại" (demo: quay về ready).
- Empty: nêu nguyên nhân + nút "Xoá bộ lọc" + gợi ý bật "Hiện đã hết hạn"; không dùng màu đỏ danger.
- Ready: như hiện tại.
- Chuyển bằng `?state=…` và dải nút demo (ẩn được bằng một class).
- Xong khi: cả 4 xem được ở mobile và dark.

## Pha 3: Trang phụ

- Giới thiệu (mục tiêu, nguồn dữ liệu, cách đọc rank CORE/CCF), Liên hệ (form tĩnh, validation HTML, không gửi thật), FAQ + hướng dẫn AoE (ví dụ UTC−12 → GMT+7), 404, Đã lưu (đọc ★; rỗng thì empty state).
- Thêm vào nav/footer; breadcrumb ở trang con.
- Xong khi: không còn `href="#"`, mọi link nav/footer dẫn tới trang có thật.

## Pha 4: Thêm hội nghị + polish

- 4-6 trang `hoi-nghi-<slug>.html` (ví dụ FSE, ACL, CVPR) clone khung ICSE: đủ mốc deadline, nút thêm lịch.
- Thêm card tương ứng vào lịch, liên kết từ trang chủ.
- Rà `<title>`, meta description, alt, favicon từng trang.
- Xong khi: mỗi card trong lịch có trang chi tiết; script kiểm link nội bộ không báo gãy.

## Dữ liệu và giới hạn đã chấp nhận

- Hội nghị là hội nghị thật nhưng ngày deadline là **dữ liệu minh hoạ**. Footer/Giới thiệu ghi: "Dữ liệu minh hoạ cho đồ án, kiểm tra lại trên trang chính thức trước khi nộp bài."
- Countdown là chuỗi cố định; ngày mẫu quanh 10/2026 sẽ lỗi thời, không sửa.
- Font Google tải ngoài; offline rơi về font hệ thống.

## Rủi ro

1. Script đồng bộ ~35 file có thể hỏng hàng loạt. Giảm: backup `site/` trước, chạy thử 2 file, so diff, rồi chạy hết. Thư mục chưa có git; khuyến nghị `git init` trước Pha 1 (người dùng quyết).
2. Dark mode vỡ contrast badge/urgency. Giảm: cặp tối định nghĩa riêng, kiểm bằng công cụ contrast.
3. localStorage bị chặn. Giảm: try/catch, vẫn hiện empty state.

## Kiểm chứng

Mở trình duyệt ở 375 / 768 / 1280, light + dark; quét link gãy bằng grep/script. Không có test tự động (site tĩnh).

## Ngoài phạm vi

Backend, gửi form thật, đăng nhập, countdown động, filter/search/phân trang hoạt động thật, framework/bundler, SEO sâu, đa ngôn ngữ, dọn thư mục gốc cũ.

## Thứ tự cắt khi thiếu thời gian

Bỏ Pha 4 trước, rồi dark mode trong Pha 1. Pha 1-3 là lõi.
