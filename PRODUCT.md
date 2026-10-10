# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Sinh viên, học viên cao học, nghiên cứu sinh CNTT ở Việt Nam** đang cần chọn nơi nộp bài. Họ mở site khi tra cứu (laptop) hoặc kiểm tra nhanh một hạn (điện thoại). Việc cần làm: biết hội nghị nào còn nhận bài, còn bao lâu, hạn đó là mấy giờ ở Việt Nam. Họ đã quen CORE, CCF, AoE, camera-ready, rebuttal. Họ lo bỏ lỡ hạn hơn là cần được truyền cảm hứng.
- **Giảng viên, nhà nghiên cứu** tra nhanh hạn và rank để chọn nơi gửi.
- Người chấm đồ án IE104 cũng mở site này để đánh giá (bối cảnh đánh giá, không phải đối tượng sản phẩm).

## Product Purpose

Tra cứu hạn nộp bài hội nghị khoa học. Mỗi hội nghị có các mốc quan trọng, hạn theo AoE kèm giờ Việt Nam (GMT+7) và đếm ngược. Thành công là người dùng biết đúng hạn trong vài giây và không nhầm múi giờ. Site là sản phẩm của đồ án môn IE104 (Internet và Công nghệ Web), Trường Đại học Công nghệ Thông tin (UIT), ĐHQG-HCM.

## Positioning

Điểm khác, theo người sở hữu sản phẩm:
- Thang 5 mức khẩn (Gấp, Trong tuần, Trong tháng, Còn rộng, Đã hết hạn) kèm đếm ngược.
- Lọc theo lĩnh vực, rank CORE/CCF và hình thức tham dự (online, offline, hybrid).
- Thêm mốc kế tiếp vào lịch (Google Calendar hoặc tệp .ics).

## Operating Context

- Người dùng so sánh nhiều hội nghị cạnh nhau, thường khi đang gấp.
- Hạn gốc ghi theo AoE (UTC−12): 23:59 AoE ngày D là 18:59 ngày D+1 theo giờ Việt Nam.
- Dữ liệu hội nghị trong site là dữ liệu **minh hoạ** và được ghi rõ như vậy trên site.
- Site chạy tĩnh, không backend; trạng thái lưu hội nghị và giao diện sáng/tối nằm trong trình duyệt.

## Capabilities and Constraints

- Site tĩnh trong `site/`: HTML, CSS, JS thuần, không framework, không bundler, không thêm dependency.
- Có sẵn và đang chạy: danh sách hội nghị có bộ lọc và 4 trạng thái (đang tải, lỗi, trống, có dữ liệu) xem thử bằng `?state=`; 6 trang chi tiết hội nghị do `tools/build-conferences.mjs` sinh từ `tools/conferences.mjs`; nút lưu (★) và trang Đã lưu; đổi sáng/tối; blog 29 bài; Giới thiệu, Liên hệ, 404.
- Header, footer và tiêu đề trang do `tools/sync-chrome.mjs` đồng bộ; mọi sửa khung trang phải qua công cụ, không sửa tay từng file.
- Kiểm tra bắt buộc: `node tools/check-site.mjs`, `node tools/check-contrast.mjs`, `node --test tools/*.test.mjs`.
- Chưa quyết định: có giữ tính năng lưu hội nghị và đổi sáng/tối sau khi làm lại giao diện hay không (chủ sở hữu không đặt chúng là bắt buộc).

## Brand Commitments

- Tên **UIT ConFinder** và toàn bộ chữ trên giao diện bằng tiếng Việt.
- **29 bài blog và nội dung bài viết giữ nguyên chữ**; chỉ được đổi cách trình bày.

## Evidence on Hand

- 6 hội nghị minh hoạ trong `tools/conferences.mjs` (ICSE, FSE, ACL, ASE, ICLR, NeurIPS) và 29 bài trong `site/blog/`.
- Không có người dùng thật, số liệu truy cập, lời chứng thực hay logo của đối tác: đừng bịa. Số hội nghị chỉ nêu khi đếm được từ dữ liệu có trong site.

## Product Principles

1. Hạn nộp bài là thông tin quan trọng nhất ở mọi nơi nó xuất hiện, luôn đi kèm giờ Việt Nam.
2. Không bao giờ để người dùng phải đoán múi giờ.
3. Dữ liệu minh hoạ phải luôn được gọi đúng tên, không giả làm dữ liệu thật.
4. Mỗi khối trên trang phải giúp người dùng làm được một việc; không có việc thì bỏ.

## Accessibility & Inclusion

- WCAG AA (tương phản chữ ≥ 4.5:1) ở cả giao diện sáng và tối, kiểm bằng `tools/check-contrast.mjs`.
- Dùng được hoàn toàn bằng bàn phím, có skip link, focus nhìn thấy, vùng bấm ≥ 44px.
- Tôn trọng `prefers-reduced-motion` và `prefers-color-scheme`.
- Dùng được từ 320px trở lên; màu không là tín hiệu duy nhất (luôn kèm chữ hoặc icon).
