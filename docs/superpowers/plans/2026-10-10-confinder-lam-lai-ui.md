# UIT ConFinder: làm lại giao diện theo hướng "Vé tàu Thống Nhất" — Kế hoạch triển khai

> **Cách chạy:** mỗi task giao cho một subagent `frontend-developer` (một task một lần). Agent chỉ sửa trong `Đồ án/`, **không commit, không push**. Claude chính duyệt diff và ảnh chụp rồi mới commit, trên nhánh `ui-redesign`.
> **Đọc bắt buộc trước mọi task:** `PRODUCT.md`, hợp đồng hướng thiết kế `.impeccable/surfaces/site-lich-hoi-nghi-html.md`, và `C:\Users\LENOVO\.claude\plugins\cache\impeccable\impeccable\4.5.1\skills\impeccable\reference\craft-floor.md` (các điều cấm). Sau Task 0 thêm `DESIGN.md` nếu đã có.

**Mục tiêu:** thay hẳn thế giới thị giác cũ (tạp chí: serif nghiêng vàng, navy–kem, thẻ nghiêng, đồng hồ trang trí) bằng thế giới **Vé tàu Thống Nhất** do người dùng chọn (seed 2d35624c, re-roll 1). **Bỏ hẳn AoE:** mọi giờ trên site chỉ là giờ Việt Nam (GMT+7). Giữ chức năng, giữ 29 bài blog nguyên chữ, rút gọn nội dung thừa.

**Kiến trúc:** site tĩnh `site/`. CSS: `site.css` (token, thành phần chung, khung), `conference.css` (vé và chi tiết), `pages.css` (trang phụ), `blog.css`, `states.css`. `landing.css` bị xoá. Markup lặp lại sinh từ `tools/conferences.mjs`, không sửa tay: header/footer qua `tools/sync-chrome.mjs`; trang hội nghị qua `tools/build-conferences.mjs`; **các vé ở trang lịch, trang chủ, Đã lưu qua `tools/build-lists.mjs` mới**.

**Ngăn xếp:** HTML/CSS/JS thuần, Node chỉ cho công cụ, không dependency. Bỏ Google Fonts (bộ chữ hệ thống).

---

## Thế giới thị giác đã chốt

**Mode:** Operate (lịch, trang chủ, chi tiết, Đã lưu); Read cho blog, Giới thiệu, Liên hệ, 404 (kế thừa token và thành phần). Code-led.

| Hạng mục | Quyết định |
|---|---|
| Ý tưởng | Mỗi hội nghị là một tấm vé: giờ chót Việt Nam in lớn ở nửa trái, một đường răng cưa duy nhất, cuống vé ghi còn bao lâu. |
| Vỏ | Thanh đầu trang xanh rêu đậm (khởi điểm `#0b7a5f` hoặc đậm hơn cho chữ trắng đạt AA), nền "giấy" trắng xanh nhạt `#f3f6f2`, vé nền trắng, mực xanh đen `#12332b`. Màu nhấn = xanh rêu cho liên kết, mục chọn, focus. Đỏ cam `#e5483a` **chỉ** cho dấu "Gấp". |
| Tối | Nền `#0c1613`, vé `#122420`, chữ `#e8f1ec`, nhấn xanh rêu sáng hơn. Ngang hàng với sáng; cả hai qua `check-contrast`. |
| Chữ | Bộ chữ **hệ thống** sans (`system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`), không serif trang trí, không chữ nghiêng nhấn. Số `font-variant-numeric: tabular-nums`. Giờ chót và đếm ngược dùng mono hệ thống (`ui-monospace, "Cascadia Mono", Consolas, monospace`). Không `letter-spacing` rải, **không eyebrow**. |
| Hình khối | Bo 4px, viền 1px, **không bóng, không hover nhấc lên, không animation xuất hiện lần lượt**. Hover chỉ đổi nền vé. Focus ring 2px nhấn, offset 2px. |
| Năm mức khẩn | Giữ cặp token `--c/--s/--u/--o/--x` (fg/bg). Hiển thị = pill (icon + chữ) + dải 5 ô, số ô đặc = mức khẩn (Gấp 5, Trong tuần 4, Trong tháng 3, Còn rộng 2, Đã hết hạn 0–1), nên không phụ thuộc màu. **Cấm** `border-left` màu >1px ở hàng/vé. "Còn rộng" (xanh lá) phải phân biệt rõ với xanh rêu của vỏ: nền nhạt riêng, icon và chữ riêng. |

### Thành phần ký hiệu: vé (`.ticket`)
Một vé = một hội nghị, cao ≈ 76px, cách nhau 8px. Dùng chung cho trang lịch, trang chủ, Đã lưu.

```
┌───────────────────────────────┬ ┬─────────────────────┐
│ [★] ICSE 2027   Nộp toàn văn  ┊   18:59        2 ngày 04:12 │
│     IEEE/ACM Int'l Conf… · CORE A*  11/10/2026  [Gấp ▮▮▮▮▮] │
└───────────────────────────────┴ ┴─────────────────────┘
```
- **Nửa trái:** ★ (`data-save`), tên (liên kết) + tên đầy đủ (mute, cắt 1 dòng), mốc kế tiếp, nơi/hình thức, badge rank phẳng, rồi **giờ chót** (mono, 28px, "18:59") với ngày nhỏ bên dưới ("11/10/2026"). Giờ chót cùng một cột ở mọi vé.
- **Đường răng cưa (signature, chỉ một):** nét đứt đứng 1px, hai khuyết bán nguyệt ở mép trên và mép dưới (CSS mask hoặc `radial-gradient`, không ảnh).
- **Cuống vé:** pill khẩn + dải 5 ô; đếm ngược mono ("2 ngày 04:12").
- **Hết hạn:** vé hạ nhạt, hiện "Đã hết hạn", không đếm ngược, lưới vẫn thẳng.
- **Dưới 40rem:** xếp dọc trong cùng một vé: tên + ★, giờ chót, rồi pill + đếm ngược; vẫn giữ đường răng cưa nằm ngang giữa hai nửa.
- Dải đầu danh sách (sticky): "Hạn từ 10/10 đến 18/11" tính lại theo các vé đang nhìn thấy (JS nhỏ, có fallback tĩnh).

### Dữ liệu giờ
Mọi hạn lưu và hiển thị theo giờ Việt Nam. Migrate `tools/conferences.mjs`: mỗi mốc hiện có `date` (ngày theo múi giờ cũ) → `at: '<ISO>+07:00'` đúng cùng một thời điểm (23:59 ngày D ở múi giờ cũ = 18:59 ngày D+1 giờ VN). **Test bắt buộc** chứng minh các thời điểm không đổi (ICSE "Nộp toàn văn" = 18:59 11/10/2026; `.ics` FSE vẫn `DTSTART:20261014T115900Z`). Không còn từ "AoE" ở bất cứ chữ hiển thị nào của site (trừ bài blog, vốn không có).

### Nội dung bị bỏ (người dùng cho phép)
Mọi chỗ nhắc AoE/UTC−12 và cột quy đổi kép. Trang chủ: ticker, huy hiệu AoE, đồng hồ + thẻ nghiêng, khối số liệu, "Cách hoạt động", "Năm mức khẩn" (đã có ở Giới thiệu). **Dải "Đăng ký nhận tin" ở mọi trang và `newsletter.js`.** Nút Thẻ/Bảng ở trang lịch. Hero navy có vòng tròn mờ ở blog. Ô "ẢNH BÌA" giả nếu không có ảnh thật.

### Giữ nguyên bắt buộc
Tên **UIT ConFinder**, toàn bộ chữ tiếng Việt, **chữ trong 29 bài blog**. Giữ ★ lưu + Đã lưu, `?state=`, đổi sáng/tối, bộ sinh trang hội nghị và `.ics`.

### Văn phong chữ giao diện
Tiếng Việt tự nhiên, ngắn, đúng việc. Cấm khẩu hiệu, "không chỉ X mà còn Y", bộ ba ý đối xứng, "tối ưu/thông minh/liền mạch/toàn diện/mạnh mẽ". Không bịa số liệu.

---

## Bộ kiểm tra chung (cuối mỗi task)

```bash
node tools/sync-chrome.mjs && node tools/sync-chrome.mjs   # lần hai không in "updated"
node tools/check-site.mjs         # OK
node tools/check-contrast.mjs     # OK, cả sáng và tối
node --test tools/*.test.mjs
```
Với trang đã sửa: dò tràn ngang bằng `tools/probe-overflow.js` trong iframe 320/375/768/1280 (sáng + tối); `Tab` đi từ skip link. Preview `node tools/serve.mjs` (chạy nền) tại `http://localhost:5173`. `resize_window` không đổi viewport trên máy này: dùng iframe cùng origin (dùng 1040 thay 1024, DPR 1.35).

---

## Task 0: Nền tảng — token, chữ, thành phần chung

**Files:** `site/css/site.css`, `site/css/states.css`, `tools/check-contrast.mjs`, `tools/chrome.mjs`, `tools/shell.mjs`; liên kết Google Fonts ở mọi trang (qua `sync-chrome`).

- [ ] Đọc `site.css`; liệt kê token và chỗ dùng (`grep -rn "var(--" site/css`).
- [ ] Thay giá trị token trong `:root` và `:root[data-theme="dark"]` theo bảng. Giữ tên token các CSS khác đang dùng; bỏ `--gold*`, `--navy*`, `--on-navy`, `--sh`; thêm `--shell`, `--on-shell`, `--accent`, `--ticket`. Chỉnh giá trị cho qua `check-contrast` (thêm cặp mới: chữ trên `--shell`, nhấn trên nền, giờ chót trên vé) mà không hạ ngưỡng.
- [ ] Bộ chữ hệ thống, bỏ Google Fonts ở mọi nơi bằng bước idempotent trong `sync-chrome.mjs`.
- [ ] Viết lại thành phần chung: `body`, `h1–h3`, `.btn` (+ `.pri`, `.ghost`, `.block`), `.badge`, `.chip`, `.ub` (pill khẩn), `.meter` (5 ô), `.iconbtn`, `.panel`, `.crumb`, `.mono`, focus, `.skip`, `::selection`, `caret-color`, thanh cuộn theo token. Xoá `.rise` + keyframes, mọi `box-shadow` trang trí, `translateY` khi hover, `.eyebrow`, `.brand-mark` bóng lệch, mọi `border-left` màu >1px.
- [ ] Thêm `.ticket` (xem trên) vào `conference.css` kèm markup mẫu trong comment đầu khối.
- [ ] `states.css`: token mới, skeleton thành vé rỗng, chỉ đổi opacity (tôn trọng `prefers-reduced-motion`).
- [ ] **Chấp nhận:** mở `lich-hoi-nghi.html` và `index.html`: không vỡ, không tràn, không còn vàng/navy/kem hay font tạp chí; `check-contrast` OK ở cả hai giao diện. Bố cục chưa cần đẹp.

> Giữa Task 0 và Task 9 giao diện tạm lệch. Commit từng task trên `ui-redesign`; chỉ merge và push sau Task 11 và khi người dùng đồng ý.

---

## Task 1: Khung trang — header, footer, bỏ bản tin

**Files:** `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/shell.mjs`, `tools/new-page.mjs`, `tools/build-conferences.mjs`, `site/css/site.css`, `site/js/nav.js`; xoá `site/js/newsletter.js`.

- [ ] **Header** cao 56px, nền `--shell`, chữ sáng. Trái: wordmark chữ "UIT ConFinder" (một kiểu, không nghiêng, không ô "C" bóng lệch). Phải: tìm kiếm (chỉ trang lịch), "Đã lưu (n)", nav 4 mục, nút sáng/tối. Mục hiện tại: gạch chân 2px sáng. Dưới 40rem: wordmark + ☰ + nút giao diện, tìm kiếm xuống dòng riêng. Thử hạ breakpoint nav về 64rem; không vừa một hàng thì giữ 78rem.
- [ ] **Footer** nền `--paper`, một hàng: wordmark nhỏ, liên kết (Trang chủ, Lịch hội nghị, Đã lưu, Bài viết, Giới thiệu, Liên hệ), một câu ghi chú dữ liệu minh hoạ. Bỏ cột "Nguồn bài viết" và mô tả dài.
- [ ] **Bỏ bản tin:** xoá `<section class="news">` khỏi mọi trang (regex idempotent trong `sync-chrome.mjs`), bỏ `newsletter` khỏi danh sách script ở `build-conferences.mjs`, `new-page.mjs`, `shell.mjs`; xoá CSS `.news .field .msg .cta`; xoá `<script src="js/newsletter.js">` ở mọi trang; xoá `js/newsletter.js`.
- [ ] **Chấp nhận:** `grep -rn "newsletter\|class=\"news\"" site tools` rỗng; header một hàng ở 375, 768, 1040, 1280; chữ trên `--shell` đạt AA.

---

## Task 2: Dữ liệu giờ Việt Nam và bộ sinh vé

**Files:** sửa `tools/conferences.mjs`, `tools/build-conferences.mjs`; tạo `tools/time-vn.mjs`, `tools/time-vn.test.mjs`, `tools/build-lists.mjs`; thêm marker `<!--tickets:...-->` vào `site/lich-hoi-nghi.html`, `site/index.html`, `site/da-luu.html`.

- [ ] **Test trước (`time-vn.test.mjs`), phải FAIL rồi mới viết code:** (a) `formatVN('2026-10-11T18:59:00+07:00')` → `{time:'18:59', date:'11/10/2026'}`; (b) migrate: mỗi mốc cũ `date: D` ↔ `at` mới cho đúng cùng thời điểm UTC (so toàn bộ mốc của 6 hội nghị, thời điểm UTC không đổi); (c) `daysLeft(at, NOW)` khớp các số hiện có ("Còn 43 ngày", "Còn 68 ngày", "Còn 104 ngày" của ICSE); (d) `icsStart('2026-10-14T18:59+07:00')` = `20261014T115900Z`; (e) `urgency(daysLeft)` ra đúng 5 mức (<3, <7, <30, ≥30, đã qua).
- [ ] `time-vn.mjs`: hàm thuần, chỉ UTC, không `Date` cục bộ; `NOW` định nghĩa một chỗ (09/10/2026) dùng chung.
- [ ] Migrate `conferences.mjs` sang `at` (ISO có `+07:00`); sửa `build-conferences.mjs` bỏ `aoeText`/`vnText`, bảng mốc còn **một cột "Hạn (giờ Việt Nam)"**, bỏ "AoE (UTC−12)" ở tiêu đề, `.ics` mô tả "Hạn 18:59 11/10/2026 (giờ Việt Nam)".
- [ ] `build-lists.mjs`: sinh các `.ticket` từ `CONFERENCES` vào giữa marker: lịch (6 vé, đúng thứ tự hiện có), trang chủ ("Sắp đến hạn": theo giờ chót gần nhất, bỏ hội nghị đã đóng), Đã lưu (`<li data-saved-item>`). Idempotent. Vé có ★ (`data-save`), liên kết tên tới `hoi-nghi*.html`, đếm ngược dùng `c.next.text` hiện có.
- [ ] **Chấp nhận:** `node --test tools/time-vn.test.mjs` pass; `node tools/build-lists.mjs` chạy hai lần cho cùng kết quả; `check-site` OK; `grep -rn "AoE" tools site --include=*.mjs --include=*.html --exclude-dir=blog` rỗng (trừ trang chưa tới lượt, ghi rõ).

---

## Task 3: Lịch hội nghị `lich-hoi-nghi.html`

**Files:** `site/lich-hoi-nghi.html`, `site/css/conference.css`, `site/css/states.css`; tạo `site/js/range-bar.js`.

- [ ] Bố cục: cột lọc trái 260px (≥64rem) + danh sách vé. Thanh công cụ: "37 hội nghị" (bỏ "trên tổng 128" nếu không đếm được) + sắp xếp. **Bỏ nút Thẻ/Bảng.** Chip lọc đang áp dụng thành dòng nhỏ có nút bỏ.
- [ ] Bộ lọc: 6 nhóm, đầu nhóm chữ 12px đậm sentence-case (không hoa, không rải), ô tick/radio rõ ở cả hai giao diện. Dưới 64rem nằm trên danh sách, chỉ mở nhóm đầu (giữ hành vi `nav.js`).
- [ ] **Dải đầu danh sách** sticky "Hạn từ … đến …" tính lại theo các vé nhìn thấy (`IntersectionObserver`); không JS thì ghi khoảng của cả trang. Xoá mọi chữ AoE (ví dụ "Giờ chót tính theo…").
- [ ] 4 trạng thái: loading = 6 vé xám đúng chiều cao, chỉ đổi opacity; error và empty = hộp phẳng viền 1px, icon 24px, tiêu đề + một câu + nút; `.demo-bar` phẳng, ẩn mặc định, hiện khi `?state=`.
- [ ] Phân trang: ô vuông ≥36px, trang hiện tại đảo màu.
- [ ] **Chấp nhận:** ở 1280×800 thấy ≥ 6 vé; ★ lưu được; 3 trạng thái `?state=` đúng và không vỡ ở 375px; không `border-left` màu; không còn chữ AoE.

---

## Task 4: Trang chủ `index.html`

**Files:** `site/index.html`, `site/css/` (dùng `.ticket`), xoá `site/css/landing.css`.

Bố cục (một cột ≈1100px): (1) tiêu đề một dòng nêu việc ("Hạn nộp bài hội nghị khoa học") + một câu ≤ 18 từ (không nhắc AoE) + ô tìm kiếm và nút "Xem lịch hội nghị"; (2) **Sắp đến hạn**: 6 vé, liên kết "Xem tất cả"; (3) hàng chip sáu lĩnh vực liên kết tới trang lịch; (4) 3 bài viết mới dạng danh sách (tiêu đề, ngày, một dòng). Bỏ: ticker, stamp, đồng hồ + thẻ nghiêng, số liệu, "Cách hoạt động", "Năm mức khẩn".

- [ ] `grep` không còn class `lp-*`, `ticker`, `stamp`, `mini`, `rise`; xoá `landing.css` và thẻ link.
- [ ] **Chấp nhận:** ở 1280×800 thấy tiêu đề, tìm kiếm và ≥ 3 vé không cuộn; 375px không tràn; sáng/tối ổn; không còn chữ AoE.

---

## Task 5: Trang chi tiết hội nghị (6 trang sinh tự động)

**Files:** `tools/build-conferences.mjs` (template), `site/css/conference.css`; chạy lại bộ sinh.

- [ ] Đầu trang: breadcrumb, `h1` "ICSE 2027" (không nghiêng, không serif), tên đầy đủ, một dòng meta (nơi · ngày · hình thức), badge rank phẳng.
- [ ] Hộp "Mốc kế tiếp" (cột phải) là **một vé lớn**: tên mốc, giờ chót cỡ lớn, đường răng cưa, cuống ghi pill khẩn + dải 5 ô + đếm ngược **một dòng mono lớn** (bỏ bốn ô số có viền). Nút: Google Calendar (chính), Tải .ics, Lưu.
- [ ] Bảng mốc **một cột giờ Việt Nam**; hàng "kế tiếp" nền nhạt `--ticket` (không thanh trái màu), hàng đã qua chữ nhạt; dưới 40rem thành khối dọc có nhãn (`data-l`).
- [ ] Chân: nguồn, cập nhật, "Báo dữ liệu sai" (liên kết `lien-he.html`).
- [ ] **Chấp nhận:** 6 trang đúng (FSE mức "Trong tuần", NeurIPS đã đóng, ICLR không có CCF); `.ics` FSE vẫn `DTSTART:20261014T115900Z`; không tràn ở 375px; không còn chữ AoE.

---

## Task 6: Trang Đã lưu `da-luu.html`

- [ ] Dùng chính các `.ticket` do `build-lists.mjs` sinh; bỏ `.srow`. Hộp rỗng phẳng một câu + nút "Xem lịch hội nghị".
- [ ] **Chấp nhận:** lưu 2 hội nghị ở trang lịch, quay lại thấy đúng 2 vé, header ghi "Đã lưu (2)"; bỏ lưu thì vé mất ngay; hộp rỗng hiện lại khi hết.

---

## Task 7: Blog danh sách `blog.html`

**Files:** `site/blog.html`, `site/css/blog.css`, `site/js/blog-list.js` (đọc trước; JS sinh markup, đừng làm gãy selector).

- [ ] Bỏ hero navy, vòng tròn mờ, lưới nền; đầu trang như các trang khác (tiêu đề + một câu).
- [ ] Thanh tìm kiếm + sắp xếp + chip chủ đề một hàng phẳng.
- [ ] Bỏ ô ảnh bìa giả; danh sách bài dạng hàng (tiêu đề, mô tả 1–2 dòng, chủ đề, ngày, thời gian đọc). "Bài nổi bật" chỉ giữ nếu có nội dung khác danh sách.
- [ ] **Chấp nhận:** tìm kiếm, lọc chủ đề, sắp xếp vẫn chạy; 375px không tràn; sáng/tối ổn.

---

## Task 8: Bài blog (29 trang), chỉ CSS và khối ảnh giả

**Files:** `site/css/blog.css`, `site/js/blog-post.js` (chỉ nếu đổi class).

- [ ] Thân bài: cột đọc 66–72ch, chữ 17px/1.7, tiêu đề phụ 600, liên kết gạch chân màu nhấn, trích dẫn bằng viền 1px (không viền trái màu dày), bảng và mã viền 1px.
- [ ] Mục lục: cột phải sticky ≥64rem, phẳng; dưới đó là `<details>` đầu bài (giữ `blog-post.js`).
- [ ] Nếu bài chỉ có ô "ẢNH BÌA" sọc giả, xoá khối đó bằng một thay thế regex có kiểm tra trên cả 29 file.
- [ ] **Không sửa chữ trong thân bài:** so văn bản thân bài trước/sau trên cả 29 file phải bằng nhau.
- [ ] **Chấp nhận:** 3 bài (ngắn, dài, nhiều bảng/danh sách) ở 375/768/1280, sáng + tối, không tràn; mục lục chạy.

---

## Task 9: Giới thiệu, Liên hệ, 404

**Files:** `site/gioi-thieu.html`, `site/lien-he.html`, `site/404.html`, `site/css/pages.css`, `site/js/contact.js` (nếu đổi id).

- [ ] **Giới thiệu:** một cột đọc, bỏ cột "Xem tiếp". Rút còn: 2–3 câu mục đích; ghi chú **dữ liệu minh hoạ** gọn nhưng rõ; bảng "Cách đọc rank" (CORE A*/A/B/C, CCF A/B/C); bảng "Thang độ khẩn" (pill + dải 5 ô · khoảng ngày · ý nghĩa). Giữ `id`: `du-lieu`, `rank`, `do-khan`. Không nhắc AoE.
- [ ] **Liên hệ:** một cột; form phẳng (nhãn trên, ô `--field`, viền 1px, `min-height: 44px`); hai dòng thông tin. Giữ `contact.js`.
- [ ] **404:** căn trái, "404" mono cỡ 48px nhạt, một câu, hai liên kết; không hộp bóng to.
- [ ] Xoá khối CSS còn nhắc AoE trong `pages.css` nếu có.
- [ ] **Chấp nhận:** form trống bị trình duyệt chặn, hợp lệ thì hiện lời cảm ơn và reset; 3 trang đọc tốt ở 375px và chế độ tối.

---

## Task 10: Rà văn phong toàn bộ chữ giao diện

**Files:** mọi trang HTML (chữ hiển thị, `<title>`, `meta description`), `tools/conferences.mjs`, `tools/build-conferences.mjs`, `tools/chrome.mjs`.

- [ ] Đọc toàn bộ chữ hiển thị (không phải thân bài blog). Áp quy tắc "Văn phong"; dùng skill `humanizer` cho câu dài.
- [ ] `grep -rniE "AoE|UTC.?12|tối ưu|thông minh|liền mạch|toàn diện|mạnh mẽ|đột phá" site tools --include=*.html --include=*.mjs --include=*.css --exclude-dir=blog` phải rỗng.
- [ ] Giữ thuật ngữ (CORE, CCF, camera-ready, rebuttal) và mọi dữ kiện. `<title>` mỗi trang khác nhau.
- [ ] **Chấp nhận:** `check-site` OK; báo cáo tóm tắt các đổi chữ chính cho người dùng xem.

---

## Task 11: Rà cuối, đánh giá độc lập, tài liệu

Theo `new-work.md` mục 7: kiểm tra, rồi giao cho agent độc lập.

- [ ] Bộ kiểm tra chung đều pass; `grep -rn "landing.css\|newsletter\|--gold\|--navy\|Newsreader\|Be Vietnam\|JetBrains\|fonts.googleapis" site tools` rỗng.
- [ ] **Một đợt chụp ảnh** (không lặp): `index`, `lich-hoi-nghi` (+ `?state=` error/empty), `hoi-nghi-fse`, `hoi-nghi-neurips`, `da-luu`, `blog`, một bài blog, `gioi-thieu`, `lien-he`, `404`; mỗi trang 1280 sáng, 1280 tối, 375 sáng. Lưu vào `.impeccable/review/`, mở từng file kiểm hợp lệ, sửa **một đợt**, xác nhận bằng **một** vòng nữa, rồi dừng.
- [ ] Chạy một lần: `impeccable.cmd detect --json site/css site/index.html site/lich-hoi-nghi.html site/hoi-nghi-fse.html`, sửa mục máy móc.
- [ ] Giao `impeccable-finish-reviewer` (tươi, không kế thừa hội thoại) với: yêu cầu gốc, hợp đồng, ảnh chụp, `craft-floor.md`, kết quả detect. Làm theo disposition (`ship`/`fix`/`rebuild`/`recapture`).
- [ ] Giao `impeccable-documenter` viết `DESIGN.md` và `.impeccable/design.json` từ bản đã dựng.
- [ ] Hỏi người dùng trước khi merge `ui-redesign` vào `main` và `git push`.

---

## Rủi ro và cách giữ an toàn

| Rủi ro | Cách xử lý |
|---|---|
| Đổi dữ liệu sang giờ VN làm lệch giờ | Test (b)(c)(d) ở Task 2 so thời điểm UTC trước/sau và `.ics`; chạy trước khi sửa giao diện. |
| Sửa tay hàng loạt làm lệch ~40 file | Chỉ qua `sync-chrome.mjs`, `build-conferences.mjs`, `build-lists.mjs`; chạy hai lần kiểm idempotent. |
| Vé thành đồ chơi mô phỏng | Chỉ một đường răng cưa, không hoạ tiết thêm; reviewer kiểm. |
| Xanh rêu của vỏ lẫn với xanh "Còn rộng" | Pill có icon + chữ + dải 5 ô; kiểm bằng mắt ở cả hai giao diện. |
| Giao diện tạm lệch giữa các task | Nhánh `ui-redesign`; không đẩy lên GitHub trước Task 11. |
| Hỏng `blog-list.js`, `save.js`, `nav.js` khi đổi class | Task nào đổi class phải `grep` selector trong `site/js` và `tools/*.mjs` trước và sau. |
| Contrast không đạt | `check-contrast` bắt buộc OK; chỉnh giá trị, không hạ ngưỡng. |
| Xoá nhầm chữ bài blog | Task 8 so văn bản thân bài trước/sau trên cả 29 file. |

## Thứ tự và phụ thuộc
0 → 1 → 2 → (3, 4, 5, 6 độc lập sau Task 2) → 7 → 8 → 9 → 10 → 11.
