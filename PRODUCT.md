# PRODUCT.md — UIT ConFinder

## Sản phẩm là gì
Website tra cứu hạn nộp bài hội nghị khoa học. Người dùng mở trang để trả lời một câu: "hội nghị nào còn nhận bài, còn bao lâu, hạn đó là mấy giờ ở Việt Nam?". Hạn nộp (kèm đếm ngược và giờ GMT+7 quy đổi từ AoE) là thông tin quan trọng nhất ở mọi nơi nó xuất hiện.

Site tĩnh (HTML/CSS/JS thuần, không framework, không backend). Là đồ án môn IE104 (Internet và Công nghệ Web), UIT, ĐHQG-HCM. Dữ liệu hội nghị là dữ liệu minh hoạ, hiển thị rõ ràng như vậy trên site.

## Register
`product` (công cụ tra cứu), không phải `brand`. Giao diện phục vụ việc quét, lọc, so sánh. Trang chủ cũng là công cụ: người dùng vào là thấy ngay hạn sắp tới, không phải trang quảng cáo.

## Người dùng
- Sinh viên và nghiên cứu sinh Việt Nam (chủ yếu CNTT, AI, kỹ thuật phần mềm) đang tìm nơi nộp bài.
- Dùng trên laptop khi tra cứu, trên điện thoại khi kiểm tra nhanh hạn.
- Đọc tiếng Việt, đã quen các thuật ngữ: CORE, CCF, AoE, camera-ready, rebuttal. Không cần giải thích từng từ ở mọi nơi.
- Căng thẳng về thời gian: sợ bỏ lỡ hạn hơn là cần được truyền cảm hứng.

## Mục tiêu
1. Thấy hạn gần nhất trong vài giây, không cuộn.
2. Lọc theo lĩnh vực, rank, hình thức mà không phải học giao diện.
3. Tin được con số: mỗi hạn ghi cả giờ AoE lẫn giờ Việt Nam, không mơ hồ.
4. Lưu hội nghị quan tâm và quay lại.

## Giọng và tính cách
Điềm tĩnh, chính xác, thực dụng. Như một bảng tin của khoa hoặc một công cụ dành cho dân kỹ thuật: ít lời, nhiều thông tin. Không rao giảng, không khoa trương, không khẩu hiệu.

Chữ trên giao diện: tiếng Việt tự nhiên, ngắn, đúng việc. Không câu hô hào ("Mọi hạn nộp bài trong một trang."), không cấu trúc "không chỉ X mà còn Y", không ba ý đối xứng đều tăm tắp.

## Anti-reference (đừng trông giống)
- Landing page SaaS do AI sinh: hero khổng lồ, chữ serif nghiêng màu vàng, gạch chân nhấn, thẻ nghiêng nổi, huy hiệu tròn xoay, đồng hồ trang trí.
- Bộ ba "navy + vàng đồng + kem" kiểu tạp chí giả.
- Nhãn nhỏ viết hoa, rải khoảng chữ, font mono ở trên mỗi tiêu đề (eyebrow).
- Lưới thẻ đều nhau với bóng đổ lệch, hover nhấc lên, hiệu ứng xuất hiện lần lượt.
- Khối "Cách hoạt động ba bước", dải chạy chữ, số liệu "37+ hội nghị" để lấp chỗ.
- Mọi thứ bo tròn như nhau, mọi thứ đều có viền và bóng.

## Tham chiếu tích cực
Mật độ thông tin và sự kiềm chế của GitHub, Linear, arXiv listing, các trang "Call for Papers" đã được dùng thật (wikicfp, trang hội nghị ACM/IEEE). Bảng và danh sách rõ ràng trước, trang trí sau.

## Nguyên tắc thiết kế
1. **Hạn nộp là nhân vật chính.** Mọi thẻ/hàng đặt ngày giờ và đếm ngược lên trước tên phụ, rank và nơi tổ chức.
2. **Màu để báo mức khẩn, không để trang trí.** Năm mức khẩn là màu duy nhất rực trên trang; phần còn lại trung tính với một màu nhấn tiết chế. Màu luôn đi kèm chữ và biểu tượng.
3. **Mật độ thay vì khoảng trắng phô trương.** Danh sách hội nghị cho phép quét nhiều hàng một lúc; thẻ chỉ dùng khi cần.
4. **Một họ chữ sans cho giao diện, mono cho số liệu.** Không chữ trang trí, không chữ nghiêng làm điểm nhấn.
5. **Bớt thay vì thêm.** Mỗi khối phải trả lời được "người dùng làm gì với cái này?". Không có thì bỏ.
6. **Sáng và tối ngang hàng.** Cả hai đều phải đọc tốt; không phải bản này là phụ của bản kia.
7. **Dùng được trên 320px và bằng bàn phím.** Vùng bấm ≥44px, focus nhìn thấy, tôn trọng giảm chuyển động.

## Ràng buộc kỹ thuật
- Site tĩnh trong `site/`, không thêm dependency, không bundler.
- Giữ chức năng: nút lưu (localStorage), đổi sáng/tối, `?state=` xem thử trạng thái, bộ sinh trang hội nghị (`tools/build-conferences.mjs`) và đồng bộ header/footer (`tools/sync-chrome.mjs`). Template và công cụ phải được sửa cùng với HTML sinh ra.
- Font có hỗ trợ tiếng Việt đầy đủ.
- Phải qua `node tools/check-site.mjs`, `node tools/check-contrast.mjs` (WCAG AA ở cả hai giao diện) và `node --test tools/*.test.mjs`.

## Khẳng định cần tránh
Không bịa số liệu hay thành tích ("hơn 10.000 người dùng"). Số hội nghị chỉ nêu khi đếm được từ dữ liệu có trong site. Dữ liệu minh hoạ luôn được ghi rõ.
