---
version: 1
slug: "site-lich-hoi-nghi-html"
primary_target: "site/lich-hoi-nghi.html"
related_targets: ["site/index.html","site/hoi-nghi.html","site/da-luu.html"]
---

# Surface brief: UIT ConFinder (cả site, mode Operate; blog và trang tĩnh là Read, thừa hưởng thế giới này)

Scope: danh sách hội nghị (`lich-hoi-nghi.html`), trang chủ, trang chi tiết hội nghị, Đã lưu. Blog/Giới thiệu/Liên hệ/404 kế thừa token và thành phần, chỉ khác bố cục đọc.
Visitor: SV/NCS và giảng viên tra hạn; người chấm đồ án. Task: biết hội nghị nào còn nhận bài, hạn chót là ngày giờ nào ở Việt Nam. Build path: code-led. Seed: 2d35624c, re-roll 4. Người dùng chốt hướng được giao ("Thẻ đeo hội nghị") và bảng màu **Mận**. **Bỏ hẳn AoE: mọi giờ là giờ Việt Nam (GMT+7).** Người dùng cho phép hero trang chủ sáng tạo tự do trong thế giới này. Người dùng đã bỏ 5 vạch cao dần; mức khẩn chỉ là nhãn chữ + biểu tượng.

## Direction contract

THESIS: Mỗi hội nghị là một thẻ tên đeo cổ: tên lớn, ruy-băng đuôi chữ V theo rank, hạn chót in như số bàn. Từ chối: lưới thẻ đều chằng chịt, hero giới thiệu, serif nghiêng vàng, eyebrow, thước hay biểu đồ trang trí.

OWN-WORLD: Thẻ tên hội nghị. Nền "bàn" xám ánh tím nhạt `#f1eff5`, thẻ trắng, mực tím đen `#1d1a24`, liên kết và ★ tím mận `#5b2d9b`, dải dây đeo hồng cánh sen `#d6336c` ở đỉnh trang (4px) và gạch chân mục nav hiện tại. Ruy-băng rank: CORE A* tím đen `#2a1647`, hạng A/CCF tím `#7a3fc0`, hạng B `#a15bd0`, hạng C xám `#6e6880`, chữ trắng, **không dùng đỏ hay cam**. Bản tối: nền `#131018`, thẻ `#1c1823`, chữ `#f2eff6`, nhấn `#b794f6`, dây đeo `#ff5c93`, ruy-băng A* nền sáng chữ tối. Bộ chữ (người dùng chốt, Google Fonts): Be Vietnam Pro cho giao diện; Newsreader upright, không nghiêng, để nhấn mạnh tên hội nghị, tiêu đề và hero; JetBrains Mono cho ngày giờ và đếm ngược. Tên thẻ 19px đậm, ngày chót 24px mono đậm. Không bóng, hover chỉ đổi nền, bo 6px ở thẻ và 3px ở ruy-băng/nhãn. Năm mức khẩn giữ màu ngữ nghĩa (đỏ, vàng, lam, lục) kèm biểu tượng ▲ ● ✓ — và chữ.

STORY: Người xem quét một cột thẻ, nhận hạng bằng ruy-băng, thấy ngay ngày chót to, tin con số, lọc, so sánh, lưu ★, thêm vào lịch.

FIRST VIEWPORT: Đầu trang trắng với dải dây đeo hồng 4px phía trên: wordmark chữ "UIT ConFinder", tìm kiếm, nav, "Đã lưu (n)", sáng/tối. Cột lọc trái 220px phẳng. Danh sách thẻ ngang cao ~96px, cách nhau 8px, mỗi thẻ có một khe nhỏ ở mép trên (lỗ xỏ dây): trái = ★ + tên + tên đầy đủ (cắt 1 dòng) + ruy-băng CORE/CCF (đuôi chữ V) + nơi/hình thức; giữa = mốc kế tiếp + **ngày chót** (24px) + giờ nhỏ; phải = nhãn mức khẩn + đếm ngược. Thẻ đã hết hạn mờ đi. Đường kẻ mảnh và khoảng thở nhất quán; cột ngày thẳng hàng ở mọi thẻ.

FORM: Thẻ đeo hội nghị (hạng 7 trong danh sách ứng viên của lần quay 4: chương trình tổng quan, mục lục kỷ yếu, email CFP văn bản thuần, bảng poster, BibTeX, thẻ tên, ...). Hai nâng cấp mượn: thứ bậc đến từ độ đậm/cỡ/đảo màu/đường kẻ, ít màu (bảng giờ bỏ túi); (vạch cao dần của đường phổ phát xạ đã được người dùng bỏ).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
