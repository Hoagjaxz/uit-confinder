---
version: 1
slug: "site-lich-hoi-nghi-html"
primary_target: "site/lich-hoi-nghi.html"
related_targets: ["site/index.html","site/hoi-nghi.html","site/da-luu.html"]
---

# Surface brief: UIT ConFinder (cả site, mode Operate; blog và trang tĩnh là Read, thừa hưởng thế giới này)

Scope: danh sách hội nghị (`lich-hoi-nghi.html`), trang chủ, trang chi tiết hội nghị, Đã lưu. Blog/Giới thiệu/Liên hệ/404 kế thừa token và thành phần, chỉ khác bố cục đọc.
Visitor: SV/NCS và giảng viên tra hạn; người chấm đồ án. Task: biết hội nghị nào còn nhận bài, hạn mấy giờ ở Việt Nam. Build path: code-led (không có công cụ sinh ảnh). Seed key: 2d35624c. Người dùng chốt: hướng được giao ("Thước 24 giờ"), không steer.

## Direction contract

THESIS: Hạn AoE và giờ Việt Nam được nhìn thấy trên cùng một thước 24 giờ, không phải tự tính. Từ chối: lưới thẻ đều nhau, hero giới thiệu sản phẩm, serif nghiêng vàng, eyebrow.

OWN-WORLD: Công cụ hẹn giờ đa múi giờ. Vỏ có màu cam kết: thanh đầu trang mực xanh đen `#10222b`, nền ngày xanh xám nhạt `#eaf0f2`, bề mặt trắng, một màu nhấn xanh ngọc `#0e7490` cho liên kết, chọn lọc, focus. Bản tối là "đêm": nền `#0b161c`, bề mặt `#12222b`. Chữ: bộ chữ hệ thống sans (không tải font ngoài), số tabular, chữ mono chỉ cho ngày giờ và đếm ngược. Không bóng, không hover nhấc lên; bo góc 4px; năm mức khẩn giữ màu ngữ nghĩa kèm icon và chữ.

STORY: Người xem hiểu ngay "hạn này kết thúc lúc nào ở Việt Nam" nhờ thước, tin vào con số vì AoE và GMT+7 nằm cạnh nhau, rồi lọc, so sánh, lưu ★ hoặc thêm vào lịch.

FIRST VIEWPORT: Thanh đầu trang (wordmark, tìm kiếm, nav, Đã lưu, sáng/tối). Cột lọc trái 260px. Bảng hội nghị giữa: mỗi hàng gồm tên + ★, mốc kế tiếp, cột hạn (AoE trên, GMT+7 dưới, mono), pill khẩn + đếm ngược, và **thước 24 giờ hai tầng**: trục thời gian tuyệt đối dùng chung, hai tầng AoE và GMT+7 tô đêm/ngày lệch nhau 19 giờ, một vạch giờ chót cắt qua cả hai, nhãn "23:59 AoE" phía trên và "18:59 GMT+7" phía dưới vạch. Thước căn thẳng cột, cùng độ dài ở mọi hàng.

FORM: Thước 24 giờ (hạng 4 trong danh sách 7 ứng viên: lịch thi, arXiv, biểu đồ giờ tàu, **thước múi giờ**, bảng chuyến bay, Gantt đồ án, CFP). Seed 2d35624c. Ba nâng cấp mượn từ ứng viên thua: số đếm ngược lớn, một thông điệp mỗi hàng (biển sân bay); mức khẩn mã hoá thêm bằng số vạch đậm 1–5 ngoài màu (hồ sơ phơi sáng); dải đầu bảng ghi hạn đầu và cuối đang thấy, tính lại khi cuộn (từ điển).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
