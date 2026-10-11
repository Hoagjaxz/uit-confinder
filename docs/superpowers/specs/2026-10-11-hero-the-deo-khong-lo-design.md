# Hero trang chủ: "Thẻ đeo khổng lồ"

Ngày: 2026-10-11 · Nhánh: `ui-the-hoi-nghi-man` · Trạng thái: đã duyệt thiết kế, chờ duyệt spec.

## Vấn đề

Hero hiện tại ("Dây thẻ", commit 6d1d6f0) không tạo ấn tượng: ba thẻ ngang hàng nhau, màn hình đầu chủ yếu là chữ và thẻ nhỏ, không có một điểm nhấn duy nhất. Người dùng muốn hero "thật nổi bật".

## Hướng đã chọn

**A. Thẻ đeo khổng lồ.** Một thẻ cực lớn cho hạn gần nhất, treo trên dây hồng rủ từ mép trên; đồng hồ đếm ngược chạy từng giây là nhân vật chính. Hai thẻ còn lại nhỏ, xếp lệch bên cạnh. (Đã loại: B poster chữ số khổng lồ, C dây thời gian ngang.)

## Phạm vi

Chỉ phần hero của `site/index.html` (từ `<section class="hero">` đến hết cụm thẻ hero), `site/css/home.css`, một file JS mới `site/js/hero-clock.js`, và `tools/build-lists.mjs`. Không đổi các phần "Các hạn tiếp theo", "Sáu nhóm lĩnh vực", "Bài viết mới nhất". Không đổi token, `badge-card`, `ribbon` dùng chung.

## Thiết kế

### Bố cục desktop (≥ 64rem)

- Hero cao khoảng 88% chiều cao màn hình đầu (`min-height: min(88vh, 760px)`), nền Mận liền theo giao diện đang dùng (sáng hoặc tối), không thêm gradient, bóng, hay họa tiết.
- Một sợi dây hồng `--lanyard` (`#d6336c`) dày 10px rủ chéo từ mép trên hero xuống, xuyên qua **khe xỏ dây** của thẻ lớn. Hai thẻ nhỏ treo trên hai sợi dây mảnh hơn (4px), dài ngắn khác nhau để thẻ xếp lệch.
- **Thẻ lớn** (hạn gần nhất, ICSE 2027 theo dữ liệu hiện tại), rộng ~560px, treo hơi lệch trái:
  - Tên: Newsreader ~56px.
  - Ruy-băng CORE và CCF (dùng lại `.ribbon`).
  - Tên đầy đủ hội nghị, nơi và hình thức (một dòng).
  - **Đồng hồ** `NN : HH : MM : SS` bằng JetBrains Mono ~96px, nhãn nhỏ "ngày · giờ · phút · giây" bên dưới từng cụm.
  - Dòng hạn: "Nộp toàn văn · 18:59 11/10/2026 · giờ Việt Nam" và nhãn mức khẩn (`.ub`).
  - Nút ★ lưu như các thẻ khác (`data-save`).
- **Hai thẻ nhỏ** (FSE, ACL): dùng lại `.badge-card` hiện có, xếp dọc bên phải thẻ lớn, lệch nhau ~48px.
- Dưới thẻ lớn: `h1` "Hội nghị nào sắp hết hạn nộp bài?" (giữ nguyên chữ), dòng phụ, ô tìm và nút "Xem lịch hội nghị" (giữ như hiện tại).

### Điện thoại (< 64rem)

Dây rủ thẳng đứng giữa, thẻ lớn chiếm cả chiều rộng khung chứa, đồng hồ thu còn ~56px (ngày : giờ : phút : giây vẫn một hàng, không bẻ). `h1`, ô tìm, nút nằm dưới thẻ lớn. Hai thẻ nhỏ thành hàng cuộn ngang có scroll-snap như hiện tại. Không tràn ngang từ 320px.

### Chuyển động (duy nhất, có chức năng)

- Chỉ chữ số giây đổi mỗi giây. Dây và thẻ đứng yên: không lắc, không bóng, không animation trang trí.
- `site/js/hero-clock.js` (khoảng 30 dòng, không phụ thuộc thư viện): đọc thời gian còn lại ban đầu từ thuộc tính `data-d`, `data-h`, `data-m`, `data-s` của phần tử đồng hồ (lấy từ `c.next` trong `tools/conferences.mjs`, ICSE là 02 · 04 · 12 · 09), rồi đếm ngược bằng `setInterval` 1 giây, tính theo chênh lệch `performance.now()` để không trôi. Cách này giữ đồng hồ khớp với "2 ngày 04:12" ở các nơi khác trên site và không về 0 khi mở lại vào ngày khác (dữ liệu là minh hoạ, "hôm nay" cố định 09/10/2026).
- Khi về 0: dừng ở `00 : 00 : 00 : 00` và nhãn mức khẩn hiện "Đã hết hạn" (không âm).
- `prefers-reduced-motion: reduce`: không chạy `setInterval`, chỉ hiện ngày : giờ : phút tĩnh (bỏ giây).
- Không JS: đồng hồ hiện giá trị ban đầu tĩnh từ HTML (vẫn đúng, chỉ không chạy).

### Truy cập

- Chữ số đồng hồ có `aria-hidden="true"` ở lớp đếm từng giây, kèm một phần tử `.vh` chứa cụm tĩnh "Còn 2 ngày 4 giờ 12 phút" (không thông báo mỗi giây; không dùng `aria-live`).
- Heading liền cấp: `h1`, rồi `h2.vh` "Ba hạn chót gần nhất" như hiện có, `h3` tên hội nghị.
- Tương phản chữ đạt AA ở cả hai giao diện (`tools/check-contrast.mjs`). Nút ★ giữ `aria-pressed`, `aria-label`.

### Dữ liệu và bộ sinh

- `tools/build-lists.mjs`: thêm marker `tickets:hero-big` (một thẻ lớn, phần tử đầu của `open`) và đổi marker `tickets:hero` còn hai thẻ nhỏ (phần tử thứ 2 và 3). Hằng `HERO_N` giữ là 3 (tổng thẻ trong hero); "Các hạn tiếp theo" vẫn là phần còn lại. Chạy lặp lại cho cùng kết quả (idempotent).
- Thẻ lớn dùng lại markup `.badge-card` thêm lớp biến thể `.badge-card--hero`, đồng hồ xuất ra từ `c.next.d/h/m/s`.
- Không đổi `tools/conferences.mjs`.

## Ràng buộc kế thừa

- Hướng "Thẻ đeo hội nghị màu Mận", chỉ giờ Việt Nam, không AoE; bộ chữ Be Vietnam Pro, Newsreader, JetBrains Mono; không eyebrow, không `border-left` màu, không gradient chữ, không bóng.
- Không thêm `fill="none"` vào symbol `i-star`.
- Header, footer do `tools/sync-chrome.mjs` quản, không sửa tay trong marker `<!--c:...-->`.
- Các ngoại lệ detector đã ghi cho `index.html` (palette Mận, nhãn nhỏ) vẫn áp dụng.

## Kiểm tra (chấp nhận)

- `node tools/sync-chrome.mjs` hai lần (lần hai không in "updated"), `node tools/build-lists.mjs` hai lần cho cùng kết quả, `check-site` OK, `check-contrast` OK ở cả hai giao diện, `node --test tools/*.test.mjs` pass.
- Một test nhỏ cho logic đếm ngược: hàm thuần `tick(remainingSeconds, elapsedSeconds)` trả về `{d,h,m,s}` đúng, không âm, và quy đổi đúng khi qua mốc giờ/ngày (đặt trong `site/js/hero-clock.js` dạng module thuần hoặc tách `tools/hero-clock.test.mjs` import được).
- Ảnh chụp Playwright: `index.html` ở 1280×800, 768×1000, 375×800, sáng và tối. Ở 1280×800 thấy trọn thẻ lớn cùng đồng hồ trong màn hình đầu, không cuộn. Không tràn ngang ở 320, 375, 768, 1280 (đo `scrollWidth`).
- Đồng hồ thật sự chạy (chụp hai ảnh cách nhau ≥ 2 giây, giây khác nhau); bật `prefers-reduced-motion` thì đứng yên, không có giây.
- `Tab` từ skip link đi qua nút ★ của các thẻ trong hero theo thứ tự hợp lý.

## Ngoài phạm vi

Lọc thật ở trang lịch, ô tìm và chip lĩnh vực chuyển được tham số, CSS chết `.cd`, mục lục bài blog mở sẵn: các nợ cũ, làm riêng.

## Rủi ro

- Thẻ lớn ở 320px có thể chật: đo bằng `probe-overflow` và ảnh trước khi chốt cỡ số đồng hồ.
- Dây chéo bằng CSS (`clip-path` hoặc phần tử xoay) có thể lệch khe xỏ dây khi đổi cỡ màn hình: neo dây vào chính thẻ (phần tử con của thẻ) để luôn đi qua khe.
- `setInterval` ở tab ẩn có thể trôi: tính theo `performance.now()` nên tự sửa khi quay lại.
