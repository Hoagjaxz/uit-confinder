# UIT ConFinder: làm lại giao diện theo hướng "Thẻ đeo hội nghị" — Kế hoạch triển khai

> **Cách chạy:** mỗi task giao cho một subagent `frontend-developer` (một task một lần). Agent chỉ sửa trong `Đồ án/`, **không commit, không push**. Claude chính duyệt diff và ảnh chụp rồi mới commit, trên nhánh `ui-redesign`.
> **Đọc bắt buộc trước mọi task:** `PRODUCT.md`, hợp đồng hướng thiết kế `.impeccable/surfaces/site-lich-hoi-nghi-html.md`, và `C:\Users\LENOVO\.claude\plugins\cache\impeccable\impeccable\4.5.1\skills\impeccable\reference\craft-floor.md` (các điều cấm). Sau Task 0 thêm `DESIGN.md` nếu đã có.

**Mục tiêu:** thay hẳn thế giới thị giác cũ (tạp chí: serif nghiêng vàng, navy–kem, thẻ nghiêng, đồng hồ trang trí) bằng thế giới **Thẻ đeo hội nghị** (bảng màu Mận) do người dùng chọn (seed 2d35624c, re-roll 1). **Bỏ hẳn AoE:** mọi giờ trên site chỉ là giờ Việt Nam (GMT+7). Giữ chức năng, giữ 29 bài blog nguyên chữ, rút gọn nội dung thừa.

**Kiến trúc:** site tĩnh `site/`. CSS: `site.css` (token, thành phần chung, khung), `conference.css` (thẻ và chi tiết), `pages.css` (trang phụ), `blog.css`, `states.css`. `landing.css` bị xoá. Markup lặp lại sinh từ `tools/conferences.mjs`, không sửa tay: header/footer qua `tools/sync-chrome.mjs`; trang hội nghị qua `tools/build-conferences.mjs`; **các thẻ ở trang lịch, trang chủ, Đã lưu qua `tools/build-lists.mjs` mới**.

**Ngăn xếp:** HTML/CSS/JS thuần, Node chỉ cho công cụ, không dependency. Chữ nạp từ Google Fonts (Be Vietnam Pro, Newsreader, JetBrains Mono) qua một thẻ link duy nhất do `tools/sync-chrome.mjs` quản lý.

---

## Thế giới thị giác đã chốt

**Mode:** Operate (lịch, trang chủ, chi tiết, Đã lưu); Read cho blog, Giới thiệu, Liên hệ, 404 (kế thừa token và thành phần). Code-led.

| Hạng mục | Quyết định |
|---|---|
| Ý tưởng | Mỗi hội nghị là một thẻ tên đeo cổ: tên lớn, ruy-băng đuôi chữ V theo rank, hạn chót in như số bàn. |
| Bảng màu **Mận** (sáng) | nền `#f1eff5`, thẻ `#ffffff`, chữ `#1d1a24`, chữ phụ `#625c70`, viền `#dcd8e4` / `#c8c2d6`, nhấn (liên kết, ★, nav hiện tại) `#5b2d9b`, dây đeo `#d6336c`, nền hover `#f7f5fa`. |
| Bảng màu **Mận** (tối) | nền `#131018`, thẻ `#1c1823`, chữ `#f2eff6`, chữ phụ `#a9a2b8`, viền `#2d2838` / `#3c3649`, nhấn `#b794f6`, dây đeo `#ff5c93`, hover `#241f2d`. |
| Ruy-băng rank | Sáng: CORE A* `#2a1647`, hạng A/CCF `#7a3fc0`, hạng B `#a15bd0`, hạng C `#6e6880`, chữ trắng. Tối: A* nền `#f2eff6` chữ tối, A/CCF `#8a5fd6`, B `#a98be0`, C `#8c849c`. **Không dùng đỏ hay cam cho ruy-băng** (tránh lẫn mức khẩn). |
| Mức khẩn | Giữ cặp token `--c/--s/--u/--o/--x` (fg/bg). Sáng: Gấp `#a8200f`/`#fde6e1`, Trong tuần `#8a5200`/`#fdf0d3`, Trong tháng `#1f4fae`/`#e5edfb`, Còn rộng `#3b6a12`/`#ecf3d6`, Hết hạn `#586070`/`#eceef2`. Tối: Gấp `#ffa89b`/`#3d1a15`, Trong tuần `#ffd28a`/`#382a0c`, Trong tháng `#aac4ff`/`#15284e`, Còn rộng `#cfe79a`/`#26300f`, Hết hạn `#b6bfcc`/`#23262d`. Hiển thị = nhãn (biểu tượng ▲ ● ✓ + chữ), **không** vạch cao dần (đã bỏ). |
| Chữ (người dùng chốt) | **Be Vietnam Pro** (400/500/600/700) cho giao diện và đoạn chữ; **Newsreader** (upright, 500/600, **không nghiêng**) làm chữ có chân để nhấn mạnh: tên hội nghị trên thẻ, tiêu đề trang (`h1`), số lớn ở hero; **JetBrains Mono** (400/500/700) cho ngày giờ và đếm ngược. Nạp từ Google Fonts bằng **một** thẻ `<link>` do `sync-chrome` quản lý (`display=swap`, kèm preconnect), fallback `system-ui` / `Georgia` / `ui-monospace`. Số `font-variant-numeric: tabular-nums`. Không `letter-spacing` rải, **không eyebrow**, không chữ nghiêng, không gạch chân nhấn kiểu vàng. |
| Hình khối | Thẻ bo 6px, ruy-băng/nhãn bo 3px, viền 1px, **không bóng, không hover nhấc lên, không animation xuất hiện lần lượt**. Hover chỉ đổi nền thẻ. Focus ring 2px nhấn, offset 2px. **Cấm** `border-left` màu >1px. |
| Hình dạng đặc trưng | **Chỉ hai**: khe nhỏ (lỗ xỏ dây) ở mép trên mỗi thẻ và đuôi chữ V của ruy-băng. Không thêm hoạ tiết. |

### Thành phần ký hiệu: thẻ (`.badge-card`)
Một thẻ = một hội nghị, cao ≈ 96px, cách nhau 8px. Dùng chung cho trang lịch, trang chủ, Đã lưu.

```
        ╭──╮ (khe)
┌────────────────────────────────────────────────────────┐
│ [★] ICSE 2027                 Nộp toàn văn   ▲ Gấp       │
│     IEEE/ACM Int'l Conf…      11/10/2026     2 ngày 04:12│
│     [CORE A*◣][CCF A◣] Lisbon · Hybrid   18:59           │
└────────────────────────────────────────────────────────┘
```
- **Cột trái:** ★ (`data-save`), tên (liên kết, 19px đậm), tên đầy đủ (mute, cắt 1 dòng), hàng ruy-băng CORE/CCF + nơi/hình thức.
- **Cột giữa:** nhãn mốc kế tiếp (nhỏ), **ngày chót 24px mono đậm** với năm nhỏ, giờ chót 12.5px mono phía dưới. Ngày là phần to nhất (mọi hạn đều 18:59 nên giờ không phải thứ phân biệt). Cùng một cột ở mọi thẻ.
- **Cột phải:** nhãn mức khẩn + đếm ngược mono 17px ("2 ngày 04:12").
- **Hết hạn:** thẻ mờ (opacity ≈ .66), nhãn "Đã hết hạn", không đếm ngược.
- **Dưới 40rem:** xếp dọc trong một thẻ: tên + ★, ruy-băng, ngày chót, rồi nhãn mức + đếm ngược; khe vẫn ở mép trên.
- Dải đầu danh sách (sticky): "Hạn từ 10/10 đến 18/11" tính lại theo các thẻ đang nhìn thấy (JS nhỏ, có fallback tĩnh).

### Dữ liệu giờ
Mọi hạn lưu và hiển thị theo giờ Việt Nam. Migrate `tools/conferences.mjs`: mỗi mốc hiện có `date` (ngày theo múi giờ cũ) → `at: '<ISO>+07:00'` đúng cùng một thời điểm (23:59 ngày D ở múi giờ cũ = 18:59 ngày D+1 giờ VN). **Test bắt buộc** chứng minh các thời điểm không đổi (ICSE "Nộp toàn văn" = 18:59 11/10/2026; `.ics` FSE vẫn `DTSTART:20261014T115900Z`). Không còn từ "AoE" ở bất cứ chữ hiển thị nào của site (trừ bài blog, vốn không có).

### Nội dung bị bỏ (người dùng cho phép)
Mọi chỗ nhắc AoE/UTC−12 và cột quy đổi kép. Trang chủ: ticker, huy hiệu AoE, đồng hồ + thẻ nghiêng, khối số liệu, "Cách hoạt động", "Năm mức khẩn" (đã có ở Giới thiệu). **Dải "Đăng ký nhận tin" ở mọi trang và `newsletter.js`.** Nút Thẻ/Bảng ở trang lịch. Hero navy có vòng tròn mờ ở blog. Ô "ẢNH BÌA" giả nếu không có ảnh thật. Vạch cao dần ở mức khẩn.

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
- [ ] Thay giá trị token trong `:root` và `:root[data-theme="dark"]` theo bảng. Giữ tên token các CSS khác đang dùng; bỏ `--gold*`, `--navy*`, `--on-navy`, `--sh`; thêm `--accent`, `--badge`, `--lanyard`, `--ribbon-a/b/c/d`. Chỉnh giá trị cho qua `check-contrast` (thêm cặp mới: chữ trắng trên từng ruy-băng, nhấn trên nền và trên thẻ, giờ chót trên thẻ, chữ phụ trên thẻ) mà không hạ ngưỡng.
- [ ] Chữ: một thẻ `<link>` Google Fonts duy nhất (3 họ) do `sync-chrome.mjs` ghi idempotent ở mọi trang (thay cho mọi thẻ font cũ); token `--sans`, `--serif`, `--mono` trỏ tới 3 họ với fallback.
- [ ] Viết lại thành phần chung: `body`, `h1–h3`, `.btn` (+ `.pri`, `.ghost`, `.block`), `.badge`, `.chip`, `.ub` (nhãn mức khẩn), `.ribbon` (đuôi chữ V, `clip-path`), `.iconbtn`, `.panel`, `.crumb`, `.mono`, focus, `.skip`, `::selection`, `caret-color`, thanh cuộn theo token. Xoá `.rise` + keyframes, mọi `box-shadow` trang trí, `translateY` khi hover, `.eyebrow`, `.brand-mark` bóng lệch, mọi `border-left` màu >1px.
- [ ] Thêm `.badge-card` (xem trên) vào `conference.css` kèm markup mẫu trong comment đầu khối.
- [ ] `states.css`: token mới, skeleton thành thẻ rỗng, chỉ đổi opacity (tôn trọng `prefers-reduced-motion`).
- [ ] **Chấp nhận:** mở `lich-hoi-nghi.html` và `index.html`: không vỡ, không tràn, không còn vàng/navy/kem hay font tạp chí; `check-contrast` OK ở cả hai giao diện. Bố cục chưa cần đẹp.

> Giữa Task 0 và Task 9 giao diện tạm lệch. Commit từng task trên `ui-redesign`; chỉ merge và push sau Task 11 và khi người dùng đồng ý.

---

## Task 1: Khung trang — header, footer, bỏ bản tin

**Files:** `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/shell.mjs`, `tools/new-page.mjs`, `tools/build-conferences.mjs`, `site/css/site.css`, `site/js/nav.js`; xoá `site/js/newsletter.js`.

- [ ] **Header** cao ≈ 52px, nền `--badge` (trắng/đêm), viền dưới 1px, **dải dây đeo 4px màu `--lanyard`** chạy trên cùng. Trái: wordmark chữ "UIT ConFinder" (một kiểu, không nghiêng, không ô "C" bóng lệch). Phải: tìm kiếm (chỉ trang lịch), "Đã lưu (n)", nav 4 mục, nút sáng/tối. Mục hiện tại: gạch chân 2px `--lanyard` và chữ đậm hơn. Dưới 40rem: wordmark + ☰ + nút giao diện, tìm kiếm xuống dòng riêng. Thử hạ breakpoint nav về 64rem; không vừa một hàng thì giữ 78rem.
- [ ] **Footer** nền `--paper`, một hàng: wordmark nhỏ, liên kết (Trang chủ, Lịch hội nghị, Đã lưu, Bài viết, Giới thiệu, Liên hệ), một câu ghi chú dữ liệu minh hoạ. Bỏ cột "Nguồn bài viết" và mô tả dài.
- [ ] **Bỏ bản tin:** xoá `<section class="news">` khỏi mọi trang (regex idempotent trong `sync-chrome.mjs`), bỏ `newsletter` khỏi danh sách script ở `build-conferences.mjs`, `new-page.mjs`, `shell.mjs`; xoá CSS `.news .field .msg .cta`; xoá `<script src="js/newsletter.js">` ở mọi trang; xoá `js/newsletter.js`.
- [ ] **Chấp nhận:** `grep -rn "newsletter\|class=\"news\"" site tools` rỗng; header một hàng ở 375, 768, 1040, 1280; chữ nav và wordmark đạt AA.

---

## Task 2: Dữ liệu giờ Việt Nam và bộ sinh thẻ

**Files:** sửa `tools/conferences.mjs`, `tools/build-conferences.mjs`; tạo `tools/time-vn.mjs`, `tools/time-vn.test.mjs`, `tools/build-lists.mjs`; thêm marker `<!--badges:...-->` vào `site/lich-hoi-nghi.html`, `site/index.html`, `site/da-luu.html`.

- [ ] **Test trước (`time-vn.test.mjs`), phải FAIL rồi mới viết code:** (a) `formatVN('2026-10-11T18:59:00+07:00')` → `{time:'18:59', date:'11/10/2026'}`; (b) migrate: mỗi mốc cũ `date: D` ↔ `at` mới cho đúng cùng thời điểm UTC (so toàn bộ mốc của 6 hội nghị, thời điểm UTC không đổi); (c) `daysLeft(at, NOW)` khớp các số hiện có ("Còn 43 ngày", "Còn 68 ngày", "Còn 104 ngày" của ICSE); (d) `icsStart('2026-10-14T18:59+07:00')` = `20261014T115900Z`; (e) `urgency(daysLeft)` ra đúng 5 mức (<3, <7, <30, ≥30, đã qua).
- [ ] `time-vn.mjs`: hàm thuần, chỉ UTC, không `Date` cục bộ; `NOW` định nghĩa một chỗ (09/10/2026) dùng chung.
- [ ] Migrate `conferences.mjs` sang `at` (ISO có `+07:00`); sửa `build-conferences.mjs` bỏ `aoeText`/`vnText`, bảng mốc còn **một cột "Hạn (giờ Việt Nam)"**, bỏ "AoE (UTC−12)" ở tiêu đề, `.ics` mô tả "Hạn 18:59 11/10/2026 (giờ Việt Nam)".
- [ ] `build-lists.mjs`: sinh các `.badge-card` từ `CONFERENCES` vào giữa marker: lịch (6 thẻ, đúng thứ tự hiện có), trang chủ ("Sắp đến hạn": theo giờ chót gần nhất, bỏ hội nghị đã đóng), Đã lưu (`<li data-saved-item>`). Idempotent. Thẻ có ★ (`data-save`), liên kết tên tới `hoi-nghi*.html`, đếm ngược dùng `c.next.text` hiện có.
- [ ] **Chấp nhận:** `node --test tools/time-vn.test.mjs` pass; `node tools/build-lists.mjs` chạy hai lần cho cùng kết quả; `check-site` OK; `grep -rn "AoE" tools site --include=*.mjs --include=*.html --exclude-dir=blog` rỗng (trừ trang chưa tới lượt, ghi rõ).

---

## Task 3: Lịch hội nghị `lich-hoi-nghi.html`

**Files:** `site/lich-hoi-nghi.html`, `site/css/conference.css`, `site/css/states.css`; tạo `site/js/range-bar.js`.

- [ ] Bố cục: cột lọc trái 260px (≥64rem) + danh sách thẻ. Thanh công cụ: "37 hội nghị" (bỏ "trên tổng 128" nếu không đếm được) + sắp xếp. **Bỏ nút Thẻ/Bảng.** Chip lọc đang áp dụng thành dòng nhỏ có nút bỏ.
- [ ] Bộ lọc: 6 nhóm, đầu nhóm chữ 12px đậm sentence-case (không hoa, không rải), ô tick/radio rõ ở cả hai giao diện. Dưới 64rem nằm trên danh sách, chỉ mở nhóm đầu (giữ hành vi `nav.js`).
- [ ] **Dải đầu danh sách** sticky "Hạn từ … đến …" tính lại theo các thẻ nhìn thấy (`IntersectionObserver`); không JS thì ghi khoảng của cả trang. Xoá mọi chữ AoE (ví dụ "Giờ chót tính theo…").
- [ ] 4 trạng thái: loading = 6 thẻ xám đúng chiều cao, chỉ đổi opacity; error và empty = hộp phẳng viền 1px, icon 24px, tiêu đề + một câu + nút; `.demo-bar` phẳng, ẩn mặc định, hiện khi `?state=`.
- [ ] Phân trang: ô vuông ≥36px, trang hiện tại đảo màu.
- [ ] **Chấp nhận:** ở 1280×800 thấy ≥ 5 thẻ; ★ lưu được; 3 trạng thái `?state=` đúng và không vỡ ở 375px; không `border-left` màu; không còn chữ AoE.

---

## Task 4: Trang chủ `index.html` — hero sáng tạo

**Files:** `site/index.html`, `site/css/` (dùng `.badge-card`, `.ribbon`), xoá `site/css/landing.css`; có thể thêm `site/css/home.css` và `site/js/home.js` nhỏ nếu cần.

**Tự do sáng tạo (người dùng cho phép): hero phải thật sự có ý tưởng, không phải một hero SaaS.** Khung: vẫn là công cụ tra cứu, vẫn trong thế giới Thẻ đeo hội nghị màu Mận, vẫn **không AoE**, không đồng hồ/ticker/huy hiệu cũ, không số liệu bịa, không eyebrow, không chữ nghiêng, không gradient chữ, không bóng. Màn hình đầu tiên phải cho thấy **các hạn gần nhất bằng chính thẻ hội nghị thật** (dữ liệu từ `tools/conferences.mjs`, sinh bằng `build-lists.mjs`).

Gợi ý hướng (chọn một, hoặc đề xuất hướng riêng và giải thích trong báo cáo): thẻ hội nghị cỡ lớn treo trên dây đeo, tên đặt bằng Newsreader cỡ lớn, hạn sắp tới là thứ to nhất trang; hoặc một "dây thẻ" ngang các hội nghị sắp đến hạn xếp theo thời gian, trượt/cuộn ngang trên mobile. Tiêu đề một câu (không hô hào), ô tìm kiếm, một nút "Xem lịch hội nghị".

Phần dưới hero: (2) **Sắp đến hạn** 6 thẻ; (3) hàng chip sáu lĩnh vực liên kết tới trang lịch; (4) 3 bài viết mới dạng danh sách. Bỏ ticker, stamp, đồng hồ, thẻ nghiêng, khối số liệu, "Cách hoạt động", "Năm mức khẩn".

- [ ] `grep` không còn class `lp-*`, `ticker`, `stamp`, `mini`, `rise`; xoá `landing.css` và thẻ link.
- [ ] **Giới hạn kiểm tra:** một đợt chụp ảnh, một đợt sửa, một vòng xác nhận; Claude chính xem ảnh thật và chỉ nhận khi hero có ý tưởng rõ (kể được bằng một câu) và đọc được trong 3 giây. Nếu chưa, đề xuất lại hướng khác một lần, rồi hỏi người dùng.
- [ ] **Chấp nhận:** ở 1280×800 thấy tiêu đề, tìm kiếm và ≥ 2 thẻ sắp đến hạn không cuộn; 375px không tràn; sáng/tối đều ổn; không còn chữ AoE.

---

## Task 5: Trang chi tiết hội nghị (6 trang sinh tự động)

**Files:** `tools/build-conferences.mjs` (template), `site/css/conference.css`; chạy lại bộ sinh.

- [ ] Đầu trang: breadcrumb, `h1` "ICSE 2027" (không nghiêng, không serif), tên đầy đủ, một dòng meta (nơi · ngày · hình thức), badge rank phẳng.
- [ ] Hộp "Mốc kế tiếp" (cột phải) là **một thẻ lớn**: tên mốc, ngày chót cỡ lớn (mono, đậm), nhãn mức khẩn và đếm ngược **một dòng mono lớn** (bỏ bốn ô số có viền), cùng khe nhỏ ở mép trên. Nút: Google Calendar (chính), Tải .ics, Lưu.
- [ ] Bảng mốc **một cột giờ Việt Nam**; hàng "kế tiếp" nền nhạt `--badge` (không thanh trái màu), hàng đã qua chữ nhạt; dưới 40rem thành khối dọc có nhãn (`data-l`).
- [ ] Chân: nguồn, cập nhật, "Báo dữ liệu sai" (liên kết `lien-he.html`).
- [ ] **Chấp nhận:** 6 trang đúng (FSE mức "Trong tuần", NeurIPS đã đóng, ICLR không có CCF); `.ics` FSE vẫn `DTSTART:20261014T115900Z`; không tràn ở 375px; không còn chữ AoE.

---

## Task 6: Trang Đã lưu `da-luu.html`

- [ ] Dùng chính các `.badge-card` do `build-lists.mjs` sinh; bỏ `.srow`. Hộp rỗng phẳng một câu + nút "Xem lịch hội nghị".
- [ ] **Chấp nhận:** lưu 2 hội nghị ở trang lịch, quay lại thấy đúng 2 thẻ, header ghi "Đã lưu (2)"; bỏ lưu thì thẻ mất ngay; hộp rỗng hiện lại khi hết.

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

- [ ] **Giới thiệu:** một cột đọc, bỏ cột "Xem tiếp". Rút còn: 2–3 câu mục đích; ghi chú **dữ liệu minh hoạ** gọn nhưng rõ; bảng "Cách đọc rank" (CORE A*/A/B/C, CCF A/B/C); bảng "Thang độ khẩn" (nhãn mức · khoảng ngày · ý nghĩa). Giữ `id`: `du-lieu`, `rank`, `do-khan`. Không nhắc AoE.
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

- [ ] Bộ kiểm tra chung đều pass; `grep -rn "landing.css\|newsletter\|--gold\|--navy" site tools` rỗng.
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
| Thẻ thành đồ chơi mô phỏng | Chỉ hai hình dạng đặc trưng (khe, đuôi chữ V), không hoạ tiết thêm; reviewer kiểm. |
| Màu ruy-băng lẫn với màu mức khẩn | Ruy-băng chỉ dùng tông tím/đen/xám, không đỏ/cam; kiểm bằng mắt ở cả hai giao diện. |
| Giao diện tạm lệch giữa các task | Nhánh `ui-redesign`; không đẩy lên GitHub trước Task 11. |
| Hỏng `blog-list.js`, `save.js`, `nav.js` khi đổi class | Task nào đổi class phải `grep` selector trong `site/js` và `tools/*.mjs` trước và sau. |
| Contrast không đạt | `check-contrast` bắt buộc OK; chỉnh giá trị, không hạ ngưỡng. |
| Xoá nhầm chữ bài blog | Task 8 so văn bản thân bài trước/sau trên cả 29 file. |

## Thứ tự và phụ thuộc
0 → 1 → 2 → (3, 4, 5, 6 độc lập sau Task 2) → 7 → 8 → 9 → 10 → 11.
