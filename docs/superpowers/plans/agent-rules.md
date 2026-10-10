# Quy tắc chung cho mọi agent làm task UI (bắt buộc đọc)

Thư mục: `D:\UIT\Cơ sở ngành\IE104 - Internet & Web\Đồ án`, nhánh `ui-the-hoi-nghi-man`.

## Việc không được làm
Không commit, không push, không đổi nhánh, không `git checkout/reset/clean`, không xoá file (trừ file task nêu đích danh), không cài gói, không `curl`/`wget`, không đụng `.env*`. Thiếu Read/Edit/Write/Bash thì dừng và báo công cụ bạn có; không viết giả.

## Đọc trước
1. `PRODUCT.md`
2. `docs/superpowers/plans/2026-10-10-confinder-lam-lai-ui.md`: mục "Thế giới thị giác đã chốt" và đúng **Task của bạn**.
3. `.impeccable/surfaces/site-lich-hoi-nghi-html.md` (hợp đồng thiết kế).
4. Các file task nêu trong "Files".

## Thế giới thị giác (tóm tắt)
Thẻ đeo hội nghị, bảng màu **Mận** (xem token trong `site/css/site.css`, đã có sẵn). Bộ chữ: **Be Vietnam Pro** (giao diện), **Newsreader** upright (chữ có chân nhấn mạnh tên hội nghị, tiêu đề, hero), **JetBrains Mono** (ngày giờ). Mọi giờ là giờ Việt Nam; **không** nhắc AoE/UTC−12 ở chữ hiển thị. Ruy-băng rank chỉ dùng tông tím/đen/xám.

## Cấm tuyệt đối (craft floor)
- Không eyebrow (nhãn nhỏ hoa, rải khoảng trên tiêu đề). Không chữ nghiêng. Không gạch chân nhấn kiểu vàng. Không số thứ tự mục (01/02/03).
- Không bóng, không hover nhấc lên, không animation vào trang lần lượt, không gradient chữ, không glass/blur trang trí.
- Không `border-left`/`border-right` màu dày >1px ở thẻ/hàng/ô/callout.
- Không lưới thẻ cùng cỡ gồm icon + tiêu đề + đoạn làm cấu trúc trang; không thẻ lồng thẻ; không khối "số liệu to + nhãn nhỏ".
- Không icon bằng ký tự/emoji thay hệ icon; icon dùng sprite SVG sẵn có trong trang.
- Nút/liên kết: mọi vùng bấm ≥ 44px trên mobile; focus nhìn thấy; tôn trọng `prefers-reduced-motion`.
- Chữ ≥ 4.5:1, chữ lớn ≥ 3:1 (kiểm bằng `tools/check-contrast.mjs`; thêm cặp mới khi thêm màu). Thiếu thì chỉnh màu, không hạ ngưỡng.
- Chữ trong **thân 29 bài blog không được đổi**. Không bịa số liệu. Không thêm dependency.
- Header/footer/khung trang chỉ sửa qua `tools/chrome.mjs` + `tools/sync-chrome.mjs` (idempotent), trang hội nghị qua `tools/build-conferences.mjs`, danh sách thẻ qua `tools/build-lists.mjs`. Không sửa tay hàng loạt.
- Giữ nguyên mã hoá UTF-8 và kiểu xuống dòng hiện có của từng file.

## Kiểm tra trước khi báo xong (chạy thật, báo kết quả)
```bash
node tools/sync-chrome.mjs && node tools/sync-chrome.mjs   # lần hai không in "updated"
node tools/check-site.mjs
node tools/check-contrast.mjs
node --test tools/*.test.mjs
```
Trình duyệt (nếu có công cụ): `node tools/serve.mjs` chạy nền (cổng 5173, dùng luôn nếu đã chạy). `resize_window` không đổi viewport thật trên máy này; dùng iframe cùng origin 375/768/1280 (dùng 1040 thay 1024). Dò tràn ngang bằng `tools/probe-overflow.js`. Nhiều nhất **một đợt ảnh, một đợt sửa**, không lặp vô hạn. Mở trang sáng và tối (`localStorage['confinder-theme']='dark'`), xong thì xoá khoá đó.

## Báo cáo cuối (ngắn, tiếng Việt)
File đã sửa/tạo; kết quả từng lệnh kiểm tra; việc còn lệch thuộc task sau; chỗ không chắc hoặc phải đoán; điều gì chưa kiểm bằng mắt. Không nói "xong" nếu một lệnh còn lỗi.
