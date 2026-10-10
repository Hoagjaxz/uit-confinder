# UIT ConFinder: làm lại giao diện theo hướng "Thước 24 giờ" — Kế hoạch triển khai

> **Cách chạy:** mỗi task giao cho một subagent `frontend-developer` (một task một lần). Agent chỉ sửa trong `Đồ án/`, **không commit, không push**. Claude chính duyệt diff và ảnh chụp rồi mới commit, trên nhánh `ui-redesign`.
> **Đọc bắt buộc trước mọi task:** `PRODUCT.md`, hợp đồng hướng thiết kế `.impeccable/surfaces/site-lich-hoi-nghi-html.md`, và `C:\Users\LENOVO\.claude\plugins\cache\impeccable\impeccable\4.5.1\skills\impeccable\reference\craft-floor.md` (các điều cấm). Sau Task 0 thêm `DESIGN.md`.

**Mục tiêu:** thay hẳn thế giới thị giác cũ (tạp chí: serif nghiêng vàng, navy–kem, thẻ nghiêng, đồng hồ trang trí) bằng thế giới **Thước 24 giờ**, người dùng đã chọn (seed 2d35624c). Giữ chức năng, giữ 29 bài blog nguyên chữ, rút gọn nội dung thừa.

**Kiến trúc:** site tĩnh `site/`. CSS: `site.css` (token, thành phần dùng chung, khung), `conference.css` (danh sách/chi tiết), `pages.css` (trang phụ), `blog.css`, `states.css`. `landing.css` bị xoá. Markup lặp lại (header/footer qua `tools/sync-chrome.mjs`; trang hội nghị qua `tools/build-conferences.mjs`; **các hàng hội nghị và thước ở trang lịch, trang chủ, Đã lưu qua `tools/build-lists.mjs` mới**) đều sinh từ `tools/conferences.mjs`, không sửa tay.

**Ngăn xếp:** HTML/CSS/JS thuần, Node chỉ cho công cụ, không dependency. Bỏ Google Fonts (dùng bộ chữ hệ thống).

---

## Thế giới thị giác đã chốt (cố định cho mọi task)

**Mode:** Operate (lịch, trang chủ, chi tiết, Đã lưu). Read cho blog, Giới thiệu, Liên hệ, 404 (kế thừa token và thành phần). Code-led.

| Hạng mục | Quyết định |
|---|---|
| Ý tưởng | Hạn AoE và giờ Việt Nam nhìn thấy trên cùng một thước 24 giờ, không phải tự tính. |
| Vỏ | Thanh đầu trang màu mực xanh đen `#10222b` (màu cam kết, không phải nền xám), nền "ngày" xanh xám nhạt `#eaf0f2`, bề mặt trắng, một màu nhấn xanh ngọc `#0e7490` cho liên kết, mục đang chọn, focus. |
| Tối = "đêm" | Nền `#0b161c`, bề mặt `#12222b`, chữ sáng, nhấn xanh ngọc sáng hơn. Không phải bản phụ: cả hai đều phải qua `check-contrast`. |
| Chữ | Bộ chữ **hệ thống** sans (`system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`), không serif trang trí, không chữ nghiêng nhấn. Số `font-variant-numeric: tabular-nums`. Chữ **mono** (`ui-monospace, "Cascadia Mono", Consolas, monospace`) chỉ cho ngày giờ và đếm ngược. Không `letter-spacing` rải, không nhãn hoa nhỏ (cấm eyebrow). |
| Hình khối | Bo 4px; viền 1px; **không bóng, không hover nhấc lên, không animation xuất hiện lần lượt**. Hover chỉ đổi nền hàng. Focus ring 2px nhấn, offset 2px. |
| Năm mức khẩn | Giữ cặp token `--c/--s/--u/--o/--x` (fg/bg) và ngữ nghĩa. Hiển thị = pill (icon + chữ) + **mã hoá thứ hai không dựa màu**: dải 5 ô nhỏ, số ô đặc = mức khẩn (Gấp 5, Trong tuần 4, Trong tháng 3, Còn rộng 2, Đã hết hạn 1 hoặc 0). **Cấm** `border-left` màu >1px ở hàng/thẻ. |
| Chữ số đếm ngược | Mono, cỡ lớn ở cột đếm ngược, đơn vị ("ngày", "giờ") nhỏ hơn đặt sau số, một thông điệp mỗi hàng. |

### Thành phần ký hiệu: thước 24 giờ (`.ruler`)

Một SVG nội tuyến (`role="img"`, `aria-label` đọc được, ví dụ "Hạn 23:59 ngày 10/10 theo AoE, bằng 18:59 ngày 11/10 giờ Việt Nam") **sinh bằng script** từ `conferences.mjs`, không vẽ tay.

- Trục thời gian tuyệt đối dùng chung, rộng đúng 36 giờ: từ **T−24h** đến **T+12h**, T = thời điểm hạn.
- Hai tầng: **AoE (UTC−12)** trên, **GMT+7** dưới. Mỗi tầng tô đêm (giờ địa phương 21:00–06:00) bằng tông tối hơn và ngày bằng tông sáng, nên hai tầng lệch nhau 19 giờ, thấy được vì sao hạn cuối ngày AoE rơi vào chiều hôm sau ở Việt Nam.
- **Một vạch đứng** tại T cắt qua cả hai tầng. Nhãn "23:59 AoE" phía trên vạch, "18:59 GMT+7" phía dưới vạch (mono, nhỏ).
- Tầng AoE ghi các mốc giờ 00, 06, 12, 18; tầng GMT+7 cũng vậy theo giờ của nó. Chữ nhãn ≥ 11px và đạt AA.
- Cùng chiều rộng ở mọi hàng và căn thẳng cột, để quét dọc so sánh được. Dưới 40rem: thước xuống dòng riêng, rộng đủ, không bị cắt.
- Hội nghị đã hết hạn: thước hiện mờ, vạch nằm trước vùng "hiện tại".
- Màu thước dùng token, ngày/đêm đảo theo giao diện.

### Thành phần hàng hội nghị (`.row`)
Một hàng = một hội nghị, dùng chung cho trang lịch, trang chủ, Đã lưu. Bốn vùng: (1) tên + tên đầy đủ (cắt 1 dòng) + ★; (2) mốc kế tiếp + nơi/hình thức + rank; (3) hạn AoE trên, GMT+7 dưới (mono); (4) pill khẩn + dải 5 ô + đếm ngược lớn. **Thước 24 giờ** nằm dưới cùng của hàng, rộng hết hàng. Dưới 40rem xếp dọc: tên + ★, pill + đếm ngược, hạn, thước. Dải đầu bảng sticky ghi "Hạn từ 10/10 đến 26/10" tính lại theo các hàng đang nhìn thấy (JS nhỏ, có fallback tĩnh).

### Nội dung bị bỏ (đã được người dùng cho phép)
Trang chủ: ticker, huy hiệu AoE, đồng hồ + thẻ nghiêng, khối số liệu, "Cách hoạt động", "Năm mức khẩn" (đã có ở Giới thiệu). **Dải bản tin ở mọi trang và `newsletter.js`.** Nút Thẻ/Bảng ở trang lịch. Hero navy có vòng tròn mờ ở blog. Ô "ẢNH BÁO BÌA" giả nếu không có ảnh thật.

### Giữ nguyên bắt buộc
Tên **UIT ConFinder**, toàn bộ chữ tiếng Việt, **chữ trong 29 bài blog**; ★ lưu + trang Đã lưu, `?state=`, đổi sáng/tối, bộ sinh trang hội nghị và `.ics` (người dùng không bắt buộc nhưng không có lý do bỏ).

### Văn phong chữ giao diện
Tiếng Việt tự nhiên, ngắn, đúng việc. Cấm khẩu hiệu, "không chỉ X mà còn Y", bộ ba ý đối xứng, "tối ưu/thông minh/liền mạch/toàn diện/mạnh mẽ". Không bịa số liệu; số hội nghị chỉ ghi khi đếm được.

---

## Bộ kiểm tra chung (cuối mỗi task)

```bash
node tools/sync-chrome.mjs && node tools/sync-chrome.mjs   # lần hai không in "updated"
node tools/check-site.mjs         # OK
node tools/check-contrast.mjs     # OK, cả sáng và tối
node --test tools/theme.test.mjs tools/save.test.mjs
```
Với trang đã sửa: dò tràn ngang bằng `tools/probe-overflow.js` trong iframe 320/375/768/1280, sáng + tối; `Tab` đi từ skip link. Preview `node tools/serve.mjs` (chạy nền) tại `http://localhost:5173`. `resize_window` không đổi viewport trên máy này: dùng iframe cùng origin (dùng 1040 thay 1024, vì DPR 1.35).

---

## Task 0: Nền tảng — token, chữ, thành phần chung

**Files:** `site/css/site.css`, `site/css/states.css`, `tools/check-contrast.mjs`, `tools/chrome.mjs`, `tools/shell.mjs`; xoá liên kết Google Fonts khỏi mọi trang (qua `sync-chrome`).

- [ ] Đọc `site.css`; liệt kê token và chỗ dùng (`grep -rn "var(--" site/css`).
- [ ] Thay giá trị token trong `:root` và `:root[data-theme="dark"]` theo bảng (sáng = "ngày", tối = "đêm"). Giữ tên token các CSS khác đang dùng; bỏ `--gold*`, `--navy*`, `--on-navy`, `--sh`; thêm `--shell` (đầu trang), `--accent`, `--ruler-day`, `--ruler-night`, `--ruler-mark`. Chỉnh giá trị cho qua `check-contrast` (thêm các cặp mới: chữ trên `--shell`, nhãn thước, nhấn trên nền) mà không hạ ngưỡng.
- [ ] Bộ chữ hệ thống, bỏ Google Fonts ở mọi nơi. Làm bằng hằng/regex idempotent trong `sync-chrome.mjs`, không sửa tay từng file.
- [ ] Viết lại thành phần chung: `body`, `h1–h3` (600, hệ thống, không nghiêng), `.btn` (+ `.pri`, `.ghost`, `.block`), `.badge`, `.chip`, `.ub` (pill khẩn), `.meter` (5 ô), `.iconbtn`, `.panel`, `.crumb`, `.mono`, focus, `.skip`, `::selection`, `caret-color`, thanh cuộn theo token. Xoá `.rise` + keyframes, mọi `box-shadow` trang trí, `translateY` khi hover, `.eyebrow`, `.brand-mark` bóng lệch, mọi `border-left` màu >1px.
- [ ] Thêm khối `.ruler` và `.row` (xem trên) vào `conference.css`, comment đầu khối chứa markup mẫu để các task sau dùng cùng một cấu trúc.
- [ ] `states.css`: token mới, skeleton thành hàng `.row` rỗng, chỉ đổi opacity (tôn trọng `prefers-reduced-motion`).
- [ ] Viết `DESIGN.md` bằng subagent `impeccable-documenter` ở **Task 11**, không viết tay ở đây.
- [ ] **Chấp nhận:** mở `lich-hoi-nghi.html` và `index.html`: không vỡ, không tràn, không còn vàng/navy/kem hay font tạp chí; `check-contrast` OK ở cả hai giao diện. Bố cục chưa cần đẹp.

> Giữa Task 0 và Task 9 giao diện tạm lệch. Commit từng task trên `ui-redesign`; chỉ merge và push sau Task 11 và khi người dùng đồng ý.

---

## Task 1: Khung trang — header, footer, bỏ bản tin

**Files:** `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/shell.mjs`, `tools/new-page.mjs`, `tools/build-conferences.mjs`, `tools/check-site.mjs` (nếu cần), `site/css/site.css`, `site/js/nav.js`; xoá `site/js/newsletter.js`.

- [ ] **Header** cao 56px, nền `--shell`, chữ sáng. Trái: wordmark "UIT ConFinder" bằng chữ (một kiểu chữ, không nghiêng, không ô "C" bóng lệch). Phải: ô tìm kiếm (chỉ trang lịch), "Đã lưu (n)", nav 4 mục, nút sáng/tối. Mục hiện tại: gạch chân 2px màu nhấn sáng. Dưới 40rem: wordmark + ☰ + nút giao diện, tìm kiếm xuống dòng riêng. Thử hạ breakpoint nav về 64rem; nếu không vừa một hàng thì giữ 78rem.
- [ ] **Footer** nền `--paper`, một hàng: wordmark nhỏ, liên kết (Trang chủ, Lịch hội nghị, Đã lưu, Bài viết, Giới thiệu, Liên hệ), một câu ghi chú dữ liệu minh hoạ. Bỏ cột "Nguồn bài viết" và mô tả dài.
- [ ] **Bỏ bản tin:** xoá `<section class="news">` khỏi mọi trang (regex idempotent trong `sync-chrome.mjs`), bỏ `newsletter` khỏi danh sách script ở `build-conferences.mjs`, `new-page.mjs`, `shell.mjs`; xoá CSS `.news .field .msg .cta`; xoá thẻ `<script src="js/newsletter.js">` ở mọi trang; xoá `js/newsletter.js`.
- [ ] **Chấp nhận:** `grep -rn "newsletter\|class=\"news\"" site tools` rỗng; header một hàng ở 375, 768, 1040, 1280; chữ trên `--shell` đạt AA.

---

## Task 2: Bộ sinh hàng hội nghị và thước 24 giờ

**Files:** tạo `tools/ruler.mjs`, `tools/build-lists.mjs`, `tools/ruler.test.mjs`; sửa `tools/conferences.mjs` (thêm `deadline` ISO đầy đủ nếu cần), `site/lich-hoi-nghi.html`, `site/index.html`, `site/da-luu.html` (thêm marker `<!--rows:...-->`).

- [ ] **Test trước (`ruler.test.mjs`), phải FAIL rồi mới viết code:** với hạn `2026-10-10` (23:59 AoE), `ruler(deadline)` trả SVG có: một vạch tại đúng tâm 24/36 chiều rộng; nhãn chứa "23:59 AoE" và "18:59 GMT+7"; vùng đêm của tầng GMT+7 lệch 19 giờ so với tầng AoE; `aria-label` chứa cả hai giờ; hội nghị đã hết hạn có lớp `.past`. Kiểm thêm một hạn qua nửa năm sau để chắc không lệch ngày.
- [ ] `ruler.mjs`: hàm thuần, không dùng `Date` cục bộ (chỉ UTC), cùng hằng `NOW = 2026-10-09` như `build-conferences.mjs` (đưa vào `conferences.mjs` dùng chung, không nhân đôi).
- [ ] `build-lists.mjs`: sinh các `.row` từ `CONFERENCES` và ghi vào giữa marker trong `lich-hoi-nghi.html` (6 hàng, đúng thứ tự hiện có), `index.html` (mục "Sắp đến hạn", sắp theo hạn gần nhất, loại hội nghị đã đóng), `da-luu.html` (`<li data-saved-item>`). Idempotent: chạy hai lần cho cùng kết quả.
- [ ] Hàng có ★ (`data-save`), liên kết tên tới `hoi-nghi*.html`, đếm ngược dùng đúng `c.next.text` hiện có. Giữ đủ `data-saved-item` để `save.js` hoạt động.
- [ ] **Chấp nhận:** `node --test tools/ruler.test.mjs` pass; `node tools/build-lists.mjs && node tools/build-lists.mjs` lần hai không đổi file; `check-site` OK.

---

## Task 3: Lịch hội nghị `lich-hoi-nghi.html`

**Files:** `site/lich-hoi-nghi.html`, `site/css/conference.css`, `site/css/states.css`, `site/js/` (JS dải hạn sticky: tạo `range-bar.js` nhỏ, có fallback tĩnh).

- [ ] Bố cục: cột lọc trái 260px (≥64rem) và bảng hội nghị giữa. Thanh công cụ trên bảng: "37 hội nghị" (bỏ "trên tổng 128" nếu không đếm được) + sắp xếp. **Bỏ nút Thẻ/Bảng.** Chip lọc đang áp dụng thành dòng nhỏ có nút bỏ.
- [ ] Bộ lọc: giữ 6 nhóm, đầu nhóm là chữ 12px đậm sentence-case (không hoa, không rải), ô tick/radio rõ ở cả hai giao diện. Dưới 64rem nằm trên danh sách, chỉ mở nhóm đầu (giữ hành vi `nav.js`).
- [ ] **Dải đầu bảng** sticky: "Hạn từ 10/10 đến 26/10", tính lại theo các hàng đang nhìn thấy khi cuộn (IntersectionObserver); không có JS thì ghi khoảng của cả trang.
- [ ] 4 trạng thái: loading = 6 hàng `.row` xám đúng chiều cao, chỉ đổi opacity; error và empty = hộp phẳng viền 1px, icon 24px, tiêu đề + một câu + nút; `.demo-bar` phẳng, ẩn mặc định, hiện khi có `?state=`.
- [ ] Phân trang: ô vuông ≥36px, trang hiện tại đảo màu.
- [ ] **Chấp nhận:** ở 1280×800 thấy ≥ 5 hàng kèm thước; ★ lưu được; cả 3 trạng thái `?state=` đúng và không vỡ ở 375px; không `border-left` màu.

---

## Task 4: Trang chủ `index.html`

**Files:** `site/index.html`, `site/css/` (dùng `.row`), xoá `site/css/landing.css`.

Bố cục (trên xuống, một cột rộng ≈1100px): (1) tiêu đề một dòng nêu việc ("Hạn nộp bài hội nghị khoa học") + một câu ≤ 18 từ + ô tìm kiếm và nút "Xem lịch hội nghị"; (2) **Sắp đến hạn**: 6 hàng `.row` kèm thước, liên kết "Xem tất cả"; (3) hàng chip liên kết sáu lĩnh vực tới trang lịch; (4) 3 bài viết mới dạng danh sách (tiêu đề, ngày, một dòng). Bỏ: ticker, stamp, đồng hồ + thẻ nghiêng, số liệu, "Cách hoạt động", "Năm mức khẩn".

- [ ] `grep` đảm bảo không còn class `lp-*`, `ticker`, `stamp`, `mini`, `rise`; xoá `landing.css` và thẻ link.
- [ ] **Chấp nhận:** ở 1280×800 thấy tiêu đề, tìm kiếm và ≥ 3 hàng hạn không cuộn; 375px không tràn; sáng/tối đều ổn.

---

## Task 5: Trang chi tiết hội nghị (6 trang sinh tự động)

**Files:** `tools/build-conferences.mjs` (template), `site/css/conference.css`; chạy lại bộ sinh.

- [ ] Đầu trang: breadcrumb, `h1` "ICSE 2027" (không nghiêng, không serif), tên đầy đủ, một dòng meta (nơi · ngày · hình thức), badge rank phẳng.
- [ ] Hộp "Mốc kế tiếp" ở cột phải: tên mốc, pill khẩn + dải 5 ô, đếm ngược **một dòng mono lớn** (bỏ bốn ô số có viền), **thước 24 giờ cỡ lớn** của mốc đó, hạn AoE và GMT+7. Nút: Google Calendar (chính), Tải .ics, Lưu.
- [ ] Bảng mốc: mỗi mốc có thước nhỏ cùng trục; hàng "kế tiếp" nền `--tint` (không thanh trái màu), hàng đã qua chữ nhạt; dưới 40rem thành khối dọc có nhãn (`data-l`).
- [ ] Chân: nguồn, cập nhật, liên kết "Báo dữ liệu sai".
- [ ] **Chấp nhận:** 6 trang đúng (FSE `lv-s`, NeurIPS đã đóng, ICLR không có CCF); `.ics` FSE vẫn `DTSTART:20261014T115900Z`; không tràn ở 375px.

---

## Task 6: Trang Đã lưu `da-luu.html`

- [ ] Dùng chính các `.row` do `build-lists.mjs` sinh (Task 2); nút bỏ lưu là ★ đang bật; hộp rỗng phẳng một câu + nút "Xem lịch hội nghị". Bỏ `.srow` riêng.
- [ ] **Chấp nhận:** lưu 2 hội nghị ở trang lịch, quay lại thấy đúng 2 hàng, header ghi "Đã lưu (2)"; bỏ lưu thì hàng mất ngay; hộp rỗng hiện lại khi hết.

---

## Task 7: Blog danh sách `blog.html`

**Files:** `site/blog.html`, `site/css/blog.css`, `site/js/blog-list.js` (đọc trước; JS sinh markup, đừng làm gãy selector).

- [ ] Bỏ hero navy, vòng tròn mờ, lưới nền; đầu trang như các trang khác (tiêu đề + một câu).
- [ ] Thanh tìm kiếm + sắp xếp + chip chủ đề một hàng phẳng.
- [ ] Bỏ ô ảnh bìa giả; danh sách bài dạng hàng (tiêu đề, mô tả 1–2 dòng, chủ đề, ngày, thời gian đọc). "Bài nổi bật" chỉ giữ nếu có nội dung khác danh sách, ngược lại bỏ.
- [ ] **Chấp nhận:** tìm kiếm, lọc chủ đề, sắp xếp vẫn chạy; 375px không tràn; sáng/tối ổn.

---

## Task 8: Bài blog (29 trang), chỉ CSS và khối ảnh giả

**Files:** `site/css/blog.css`, `site/js/blog-post.js` (chỉ nếu đổi class).

- [ ] Thân bài: cột đọc 66–72ch, chữ 17px/1.7, tiêu đề phụ 600, liên kết gạch chân màu nhấn, trích dẫn bằng viền 1px (không viền trái màu dày), bảng và mã viền 1px.
- [ ] Mục lục: cột phải sticky ≥64rem, phẳng; dưới đó là `<details>` đầu bài (giữ `blog-post.js`).
- [ ] Nếu bài chỉ có ô "ẢNH BÌA" sọc giả, xoá khối đó bằng một thay thế regex có kiểm tra trên cả 29 file.
- [ ] **Không sửa chữ trong thân bài:** `git diff --stat` + so sánh văn bản thân bài trước/sau phải bằng nhau.
- [ ] **Chấp nhận:** mở 3 bài (ngắn, dài, nhiều bảng/danh sách) ở 375/768/1280, sáng + tối, không tràn; mục lục chạy.

---

## Task 9: Giới thiệu, Liên hệ, 404

**Files:** `site/gioi-thieu.html`, `site/lien-he.html`, `site/404.html`, `site/css/pages.css`, `site/js/contact.js` (nếu đổi id).

- [ ] **Giới thiệu:** một cột đọc, bỏ cột "Xem tiếp". Nội dung rút còn: 2–3 câu mục đích; ghi chú **dữ liệu minh hoạ** gọn nhưng rõ; bảng "Cách đọc rank" (CORE A*/A/B/C, CCF A/B/C); bảng "Thang độ khẩn" 3 cột (pill + dải 5 ô · khoảng ngày · ý nghĩa) và **một thước 24 giờ minh hoạ** giải thích AoE → GMT+7. Giữ `id`: `du-lieu`, `rank`, `do-khan`.
- [ ] **Liên hệ:** một cột; form phẳng (nhãn trên, ô `--field`, viền 1px, `min-height: 44px`); hai dòng thông tin. Giữ `contact.js`.
- [ ] **404:** căn trái, "404" mono cỡ 48px nhạt, một câu, hai liên kết; không hộp bóng to.
- [ ] **Chấp nhận:** form trống bị trình duyệt chặn, hợp lệ thì hiện lời cảm ơn và reset; 3 trang đọc tốt ở 375px và chế độ đêm.

---

## Task 10: Rà văn phong toàn bộ chữ giao diện

**Files:** mọi trang HTML (chữ hiển thị, `<title>`, `meta description`), `tools/conferences.mjs`, `tools/build-conferences.mjs`, `tools/chrome.mjs`.

- [ ] Đọc toàn bộ chữ hiển thị (không phải thân bài blog). Áp quy tắc "Văn phong"; dùng skill `humanizer` cho các câu dài.
- [ ] Loại khẩu hiệu, câu đối xứng ba vế, "không chỉ… mà còn…", từ thổi phồng: `grep -rniE "tối ưu|thông minh|liền mạch|toàn diện|mạnh mẽ|đột phá" site tools --include=*.html --include=*.mjs`.
- [ ] Giữ nguyên thuật ngữ (AoE, CORE, CCF, camera-ready, rebuttal) và mọi dữ kiện.
- [ ] `<title>` mỗi trang khác nhau (`check-site`).
- [ ] **Chấp nhận:** `check-site` OK; báo cáo tóm tắt các đổi chữ chính cho người dùng xem.

---

## Task 11: Rà cuối, đánh giá độc lập, tài liệu

Theo `new-work.md` mục 7: kiểm tra, rồi giao cho agent độc lập.

- [ ] Bộ kiểm tra chung đều pass; `grep -rn "landing.css\|newsletter\|--gold\|--navy\|Newsreader\|Be Vietnam\|JetBrains\|fonts.googleapis" site tools` rỗng.
- [ ] **Một đợt chụp ảnh** (không lặp): `index`, `lich-hoi-nghi` (+ `?state=` error/empty), `hoi-nghi-fse`, `hoi-nghi-neurips`, `da-luu`, `blog`, một bài blog, `gioi-thieu`, `lien-he`, `404`; mỗi trang 1280 sáng, 1280 đêm, 375 sáng. Lưu vào `.impeccable/review/`, mở từng file kiểm hợp lệ (không trống, không nửa tải), rồi sửa **một đợt** và xác nhận bằng **một** vòng nữa. Sau đó dừng chỉnh.
- [ ] Chạy một lần: `impeccable.cmd detect --json site/css site/index.html site/lich-hoi-nghi.html site/hoi-nghi-fse.html` và sửa mục máy móc.
- [ ] Giao `impeccable-finish-reviewer` (tươi, không kế thừa hội thoại) với: yêu cầu gốc, hợp đồng hướng thiết kế, ảnh chụp, đường dẫn `craft-floor.md`, kết quả detect. Làm theo disposition (`ship`/`fix`/`rebuild`/`recapture`).
- [ ] Giao `impeccable-documenter` viết `DESIGN.md` và `.impeccable/design.json` từ bản đã dựng.
- [ ] Hỏi người dùng trước khi merge `ui-redesign` vào `main` và `git push`.

---

## Rủi ro và cách giữ an toàn

| Rủi ro | Cách xử lý |
|---|---|
| Sửa tay hàng loạt làm lệch 40 file | Chỉ qua `sync-chrome.mjs`, `build-conferences.mjs`, `build-lists.mjs`; chạy hai lần kiểm idempotent. |
| Thước 24 giờ tính sai múi giờ | Test trước (`ruler.test.mjs`) cho hạn cuối ngày và hạn nửa năm sau; hàm thuần UTC. |
| Thước thành trang trí | Căn thẳng cột, cùng độ dài mọi hàng, `aria-label` đọc được; reviewer kiểm. |
| Giao diện tạm lệch giữa các task | Nhánh `ui-redesign`, không đẩy lên GitHub trước Task 11. |
| Hỏng `blog-list.js`, `save.js`, `nav.js` khi đổi class | Task nào đổi class phải `grep` selector trong `site/js` và `tools/*.mjs` trước và sau. |
| Contrast không đạt | `check-contrast` bắt buộc OK; chỉnh giá trị, không hạ ngưỡng. |
| Xoá nhầm chữ bài blog | Task 8 so văn bản thân bài trước/sau trên cả 29 file. |

## Thứ tự và phụ thuộc
0 → 1 → 2 → (3, 4, 5, 6 độc lập sau Task 2) → 7 → 8 → 9 → 10 → 11.
