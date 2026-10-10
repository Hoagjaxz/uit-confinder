---
version: 1
slug: "site-lich-hoi-nghi-html"
primary_target: "site/lich-hoi-nghi.html"
related_targets: ["site/index.html","site/hoi-nghi.html","site/da-luu.html"]
---

# Surface brief: UIT ConFinder (cả site, mode Operate; blog và trang tĩnh là Read, thừa hưởng thế giới này)

Scope: danh sách hội nghị (`lich-hoi-nghi.html`), trang chủ, trang chi tiết hội nghị, Đã lưu. Blog/Giới thiệu/Liên hệ/404 kế thừa token và thành phần, chỉ khác bố cục đọc.
Visitor: SV/NCS và giảng viên tra hạn; người chấm đồ án. Task: biết hội nghị nào còn nhận bài, hạn chót là mấy giờ ngày nào ở Việt Nam. Build path: code-led (không có công cụ sinh ảnh). Seed: 2d35624c, re-roll 1. Người dùng chốt hướng được giao ("Vé tàu Thống Nhất"), không steer. **Người dùng yêu cầu bỏ hẳn AoE khỏi site: mọi giờ chỉ là giờ Việt Nam (GMT+7).**

## Direction contract

THESIS: Mỗi hội nghị là một tấm vé mỏng: giờ chót Việt Nam in thật lớn ở nửa trái, một đường răng cưa duy nhất chia vé, cuống vé ghi còn bao lâu. Từ chối: lưới thẻ đều, hero giới thiệu, serif nghiêng vàng, eyebrow, thước hay biểu đồ.

OWN-WORLD: Giấy in nhiệt của quầy vé ga. Ground trắng xanh nhạt `#f3f6f2`, mực xanh đen `#12332b`, xanh rêu đường sắt `#0b7a5f` cho vỏ (thanh đầu trang), liên kết, mục chọn, focus; đỏ cam `#e5483a` chỉ cho dấu "Gấp". Bản tối: nền `#0c1613`, vé `#122420`, chữ `#e8f1ec`. Chữ hệ thống sans (không tải font ngoài); giờ chót cỡ lớn và đếm ngược bằng chữ số tabular (mono hệ thống). Không bóng, không hover nhấc lên, bo 4px, viền 1px. Năm mức khẩn giữ màu ngữ nghĩa + icon + chữ + dải 5 ô đặc; xanh "Còn rộng" phải phân biệt rõ với xanh rêu của vỏ (nền nhạt, icon và chữ riêng, không dùng chính màu vỏ).

STORY: Người xem quét một cột vé, thấy ngay giờ chót lớn của từng hội nghị, tin vào con số, lọc, so sánh, lưu ★, thêm vào lịch.

FIRST VIEWPORT: Thanh đầu trang xanh rêu đậm (wordmark, tìm kiếm, nav, Đã lưu, sáng/tối). Cột lọc trái 260px. Danh sách vé cao ~76px một hàng, khoảng cách 8px: nửa trái = ★ + tên + tên đầy đủ (cắt 1 dòng) + rank/hình thức; mốc kế tiếp và **giờ chót lớn** ("18:59" cỡ 28px, ngày nhỏ bên dưới); **đường răng cưa duy nhất** (nét đứt đứng, hai khuyết bán nguyệt ở mép trên và dưới); nửa phải = cuống vé: pill khẩn + dải 5 ô + đếm ngược ("2 ngày 04:12"). Dải đầu bảng ghi "Hạn từ 10/10 đến 18/11" tính lại khi cuộn. Đường kẻ mảnh hiện sẵn làm lưới cột; hàng đã đóng hạ nhạt, không phá lưới. Cột thẳng hàng: giờ chót cùng một cột ở mọi hàng.

FORM: Vé tàu Thống Nhất (hạng 3 trong 7 ứng viên vòng 2: thời khoá biểu, bảng tỷ giá điện tử, vé tàu, bản vẽ kỹ thuật, lịch xé tờ, bảng tin dán cột, fixtures). Seed 2d35624c re-roll 1. Hai nâng cấp mượn: cột cố định, sắp theo giờ chót, hàng đã đóng hạ nhạt (bảng tàu ga); lưới kẻ mảnh hiện sẵn, giờ căn theo ô (Crouwel). Rủi ro: thành đồ chơi mô phỏng vật thật; chỉ một đường răng cưa, không thêm hoạ tiết.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
