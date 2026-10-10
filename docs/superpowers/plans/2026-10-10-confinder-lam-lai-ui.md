# UIT ConFinder: làm lại giao diện, bỏ vẻ "AI sinh" — Kế hoạch triển khai

> **Cách chạy:** mỗi task giao cho một subagent `frontend-developer` (một task một lần, không gộp). Agent chỉ sửa trong `Đồ án/`, **không commit, không push**. Người chạy (Claude chính) duyệt diff + ảnh chụp rồi mới commit. Context bắt buộc đọc trước mọi task: `PRODUCT.md` (và `DESIGN.md` sau Task 0).

**Mục tiêu:** thay thế hoàn toàn thế giới thị giác hiện tại (tạp chí: serif nghiêng vàng + navy + thẻ nghiêng + đồng hồ trang trí) bằng một công cụ tra cứu gọn, đặc, tiết chế. Giữ nguyên chức năng, rút gọn nội dung thừa.

**Kiến trúc:** site tĩnh `site/`. CSS tách theo vai trò: `site.css` (token + thành phần dùng chung + khung trang), `conference.css` (danh sách/chi tiết hội nghị), `pages.css` (trang phụ), `blog.css`, `states.css`. `landing.css` bị xoá (trang chủ chuyển sang dùng thành phần chung). HTML của header/footer do `tools/sync-chrome.mjs` ghi; trang hội nghị do `tools/build-conferences.mjs` sinh; trang mới dựng từ `tools/shell.mjs`. **Mọi chỉnh sửa khung trang phải làm trong tool rồi chạy lại, không sửa tay 40 file.**

**Ngăn xếp:** HTML/CSS/JS thuần, Node chỉ cho công cụ. Không thêm dependency.

---

## Quyết định thiết kế (cố định cho mọi task)

### Thế giới thị giác: "bảng tin kỹ thuật"
Giống một công cụ tra cứu của dân kỹ thuật (GitHub/Linear/arXiv listing): phẳng, đặc, nhiều thông tin, ít trang trí. Sáng là mặc định, tối là phiên bản ngang hàng.

| Hạng mục | Hiện tại (bỏ) | Mới |
|---|---|---|
| Chữ giao diện | Be Vietnam Pro | **IBM Plex Sans** 400/500/600 (có subset tiếng Việt) |
| Chữ tiêu đề | Newsreader serif, nghiêng vàng làm điểm nhấn | Cùng IBM Plex Sans, đậm 600, không nghiêng, không serif |
| Chữ số liệu | JetBrains Mono rải khoảng | **IBM Plex Mono** 400/500 chỉ cho ngày giờ và đếm ngược; không `letter-spacing` |
| Nền sáng | kem `#f6f1e7` | trung tính lạnh: nền `#f6f7f8`, bề mặt `#ffffff`, viền `#dfe2e6`, chữ `#15181d`, chữ phụ `#596170` |
| Nền tối | navy `#0e1424` | trung tính: nền `#0f1115`, bề mặt `#16191f`, viền `#262b34`, chữ `#e7e9ed`, chữ phụ `#9aa2b0` |
| Màu nhấn | vàng đồng + navy | **một** màu nhấn xanh (khởi điểm `#1f5fbf` sáng / `#7fb0ff` tối) chỉ cho liên kết, focus, mục đang chọn |
| Nút chính | navy + bóng vàng lệch | nền = màu chữ (đen/trắng đảo theo giao diện), không bóng |
| Bo góc | 8px + 999px khắp nơi | **4px** cho thành phần; pill chỉ cho nhãn khẩn |
| Bóng/hover | bóng mềm, thẻ nhấc lên khi hover | **không bóng**; hover chỉ đổi nền hàng; không `translateY` |
| Chuyển động | xuất hiện lần lượt (`.rise`), shimmer | bỏ `.rise`; giữ `prefers-reduced-motion`; skeleton chỉ đổi opacity |
| Eyebrow | chữ mono hoa nhỏ rải khoảng trên mỗi tiêu đề | **bỏ hẳn** |
| Gạch chân nhấn, dấu chấm vàng, vòng tròn mờ, lưới nền | có | **bỏ hẳn** |

Giá trị hex ở trên là khởi điểm; Task 0 chỉnh cho qua `node tools/check-contrast.mjs` (WCAG AA, 4.5:1) ở cả hai giao diện và ghi vào `DESIGN.md`.

### Năm mức khẩn
Giữ ngữ nghĩa và cặp token `--c/--s/--u/--o/--x` (fg/bg), đây là **màu rực duy nhất** của trang. Hiển thị = pill 24px (icon + chữ) và thanh trái 3px ở hàng danh sách. Màu luôn đi kèm chữ và icon.

### Thành phần cốt lõi mới: hàng hội nghị (`.row`)
Thay lưới thẻ `.cd`. Một hàng = một hội nghị, quét được 8–10 hàng một màn hình laptop.

```
[★] ICSE 2027                 Nộp toàn văn          23:59 10/10 AoE   [Gấp · còn 2 ngày]
    IEEE/ACM Int'l Conf. on…   Lisbon · Hybrid       = 18:59 11/10 GMT+7   CORE A* · CCF A
```
- Cột 1: tên (liên kết, đậm) + tên đầy đủ (mute, cắt 1 dòng) + nút ★.
- Cột 2: mốc kế tiếp + nơi tổ chức/hình thức.
- Cột 3: hạn AoE và quy đổi GMT+7 (mono).
- Cột 4: pill khẩn + rank (badge phẳng).
- Dưới 40rem xếp dọc: dòng 1 tên + ★, dòng 2 pill khẩn, dòng 3 hạn.
- Dùng chung cho: danh sách lịch, "Sắp đến hạn" ở trang chủ, trang Đã lưu.

### Nội dung bị bỏ hoặc rút gọn (đã được người dùng cho phép)
- Trang chủ: bỏ dải chạy chữ (ticker), huy hiệu "AoE UTC−12", đồng hồ + thẻ nghiêng, khối số liệu, "Cách hoạt động" 3 bước, "Năm mức khẩn" (đã có ở Giới thiệu), "Sáu nhóm lĩnh vực" dạng thẻ lớn (thành dãy liên kết).
- **Dải "Đăng ký nhận tin" bị xoá trên mọi trang**, cùng `js/newsletter.js`: form không gửi đi đâu, là nội dung lấp chỗ. Footer rút còn một dòng liên kết + ghi chú dữ liệu minh hoạ.
- Trang lịch: bỏ nút chuyển Thẻ/Bảng (không có tác dụng thật).
- Blog: bỏ hero navy có vòng tròn mờ; trang bài viết giữ nguyên nội dung bài.
- Giới thiệu/Liên hệ: viết ngắn lại (xem Task 8 và Task 9).

### Văn phong chữ trên giao diện
Tiếng Việt tự nhiên, ngắn, đúng việc. Cấm: khẩu hiệu hô hào, câu cấu trúc "không chỉ X mà còn Y", bộ ba ý đối xứng, "tối ưu/thông minh/liền mạch/toàn diện", dấu gạch ngang dài làm nhịp. Không bịa số liệu. Số hội nghị chỉ ghi khi đếm được từ dữ liệu.

---

## Bộ kiểm tra chung (chạy cuối mỗi task, trừ khi ghi khác)

```bash
node tools/sync-chrome.mjs        # nếu task đụng header/footer/tool
node tools/check-site.mjs         # phải OK
node tools/check-contrast.mjs     # phải OK
node --test tools/theme.test.mjs tools/save.test.mjs
```
Và với trang đã sửa: dò tràn ngang (`tools/probe-overflow.js` trong iframe 320/375/768/1280, sáng + tối), `Tab` đi từ skip link, không có `href="#"`.

Preview: `node tools/serve.mjs` (chạy nền) rồi mở `http://localhost:5173/<trang>`; ảnh chụp bằng trình duyệt. `resize_window` không đổi viewport trên máy này: dùng iframe cùng origin (dùng 1040 thay 1024 vì DPR 1.35).

---

## Task 0: Nền tảng — token, chữ, thành phần dùng chung, DESIGN.md

**Files:** sửa `site/css/site.css`, `site/css/states.css`, `tools/check-contrast.mjs` (nếu đổi tên token), `tools/shell.mjs` + `tools/chrome.mjs` (liên kết font); tạo `DESIGN.md`.

- [ ] **Bước 1: Đọc** `PRODUCT.md`, bảng quyết định ở trên, và toàn bộ `site.css`. Liệt kê token hiện có và nơi dùng (`grep -rn "var(--" site/css`).
- [ ] **Bước 2: Thay token** trong `:root` và `:root[data-theme="dark"]` theo bảng. Giữ tên token đang được các CSS khác dùng (`--ink --mute --paper --card --rule --link --focus --field --tint --tint-2 --closed --past --dim --c-* --s-* --u-* --o-* --x-*`); đổi **giá trị**, bỏ token chỉ phục vụ vàng/navy (`--gold`, `--gold-soft`, `--gold-text`, `--navy`, `--navy-2`, `--on-navy`) và thay chỗ dùng bằng token mới (`--accent`, `--accent-soft`, `--inverse`, `--on-inverse`). Bỏ `--sh` (không còn bóng).
- [ ] **Bước 3: Font.** Thay link Google Fonts ở **mọi** nơi chứa nó: `tools/shell.mjs` lấy từ `lich-hoi-nghi.html`, các trang HTML hiện có. Cách làm gọn: sửa đúng một dòng `<link ... fonts.googleapis ...>` trong từng file bằng `sed` an toàn rồi đưa vào `tools/chrome.mjs` một hằng `FONT_LINK` + bước thay thế idempotent trong `sync-chrome.mjs`, để lần sau chỉ sửa một chỗ. Xin tối đa 2 họ (Plex Sans, Plex Mono), `display=swap`, kèm `subset=vietnamese` (nạp qua `family=...&display=swap` tự có vietnamese).
- [ ] **Bước 4: Viết lại thành phần dùng chung trong `site.css`:** `body` (nền, chữ, `font-feature-settings: "tnum"` cho số), `h1–h3` (600, không serif, cỡ 28/20/16), `.btn` (+ `.pri`, `.ghost`, `.block`), `.badge`, `.chip`/`.fchip`, `.ub` (pill khẩn), `.iconbtn`, `.panel`, `.crumb`, `.mono`, focus ring (2px `--focus`, offset 2px), `.vh`, `.skip`. Xoá: `.rise` và keyframes, mọi `box-shadow` trang trí, `transform: translateY` khi hover, `.eyebrow`, `.brand-mark` bóng lệch.
- [ ] **Bước 5: Thêm thành phần hàng `.row`** (xem quyết định) vào `site.css`: cấu trúc HTML mẫu đặt trong comment đầu khối để các task sau dùng cùng markup. Hàng hover đổi nền `--tint`; thanh trái 3px theo `.lv-c/.lv-s/.lv-u/.lv-o/.lv-x`.
- [ ] **Bước 6: `states.css`:** đổi sang token mới, skeleton thành hàng `.row` rỗng (không còn `.cd.sk`).
- [ ] **Bước 7: `DESIGN.md`** (theo `/impeccable document`): màu, chữ, khoảng cách, thành phần, và các điều **không làm** (copy từ bảng "bỏ").
- [ ] **Bước 8: Kiểm** bộ kiểm tra chung. `check-contrast` phải OK ở cả hai giao diện; nếu một cặp không đạt thì chỉnh giá trị, không hạ ngưỡng.
- [ ] **Chấp nhận:** mở `lich-hoi-nghi.html` và `index.html`, trang **chưa đẹp** (các task sau mới dựng lại bố cục) nhưng không vỡ, không còn vàng/navy, font đã là Plex, không tràn ngang.

> Giao diện sẽ tạm xấu/lệch giữa Task 0 và Task 8; chỉ commit từng task, không đẩy lên GitHub trước Task 10.

---

## Task 1: Khung trang — header, footer, bỏ bản tin

**Files:** `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/shell.mjs`, `tools/new-page.mjs`, `tools/build-conferences.mjs`, `tools/check-site.mjs` (nếu tham chiếu bản tin), `site/css/site.css`, `site/js/nav.js`; xoá `site/js/newsletter.js`; sửa toàn bộ HTML qua `sync-chrome`.

- [ ] **Header:** một hàng 56px, nền `--paper`, viền dưới 1px. Trái: wordmark chữ "UIT ConFinder" (Plex Sans 600; "ConFinder" cùng kiểu, không nghiêng, không màu khác; không ô vuông "C" + bóng). Giữa/phải theo thứ tự: ô tìm kiếm (chỉ trang lịch), "Đã lưu (n)", nav 4 mục, nút giao diện. Nav hiện ngang từ 64rem nếu vừa (sau khi bỏ chữ phụ và thu nhỏ khoảng cách thì thử hạ breakpoint về 64rem; nếu không vừa, giữ 78rem). Mục hiện tại: gạch chân 2px màu nhấn hoặc chữ đậm, không thanh vàng trượt. Dưới 40rem: wordmark + ☰ + trăng; tìm kiếm xuống dòng riêng.
- [ ] **Footer:** nền `--card` (không navy), một hàng: wordmark nhỏ · liên kết (Trang chủ, Lịch hội nghị, Đã lưu, Bài viết, Giới thiệu, Liên hệ) · dòng ghi chú dữ liệu minh hoạ. Bỏ cột "Nguồn bài viết" và mô tả dài. Mobile: xếp dọc.
- [ ] **Bỏ bản tin:** xoá khối `<section class="news">` khỏi mọi trang (qua regex trong `sync-chrome.mjs`, idempotent), bỏ `newsletter` khỏi danh sách script ở `build-conferences.mjs`/`new-page.mjs`/`shell.mjs`, xoá `js/newsletter.js`, xoá CSS `.news .field .msg .cta`, xoá thẻ `<script src="js/newsletter.js">` khỏi mọi trang.
- [ ] **Chấp nhận:** `check-site` OK, không còn chuỗi `newsletter` hay `class="news"` trong `site/` và `tools/` (`grep -rn "newsletter\|class=\"news\"" site tools`). Header một hàng ở 375, 768, 1040, 1280.

---

## Task 2: Trang chủ `index.html` — trở thành công cụ, không phải trang quảng cáo

**Files:** `site/index.html`, `site/css/site.css`/`conference.css` (dùng `.row`), xoá `site/css/landing.css` và liên kết tới nó.

**Bố cục mới (từ trên xuống, tất cả trong một cột rộng 1100px):**
1. **Đầu trang (≈160px):** `h1` ngắn một dòng ("Hạn nộp bài hội nghị khoa học"), một câu phụ (≤ 18 từ, nói thẳng giá trị: hạn theo AoE kèm giờ Việt Nam), ô tìm kiếm rộng + nút "Xem lịch" (liên kết `lich-hoi-nghi.html`).
2. **Sắp đến hạn:** tiêu đề phần + 6 hàng `.row` (dữ liệu từ `tools/conferences.mjs`, xếp theo hạn gần nhất, NeurIPS đã hết hạn nằm cuối hoặc bị loại), liên kết "Xem tất cả" cuối danh sách. Đây là thứ nằm trong màn hình đầu tiên ở laptop.
3. **Lĩnh vực:** một dãy liên kết dạng chip phẳng tới `lich-hoi-nghi.html` (6 lĩnh vực như hiện có), không mô tả, không thẻ lớn.
4. **Bài viết mới:** 3 bài dạng danh sách (tiêu đề + ngày + 1 dòng), không ảnh bìa giả.

**Bỏ:** ticker, stamp "AoE UTC−12", vòng đồng hồ + thẻ nghiêng, khối số liệu, "Cách hoạt động", "Năm mức khẩn", bản tin (đã ở Task 1).

- [ ] Dựng lại `index.html` theo bố cục; `grep` đảm bảo không còn class `lp-*`, `ticker`, `stamp`, `mini`, `rise`.
- [ ] Hàng "Sắp đến hạn" dùng đúng markup `.row` và phải có ★ (`data-save`) hoạt động.
- [ ] Xoá `landing.css` và thẻ `<link>` tới nó; chạy `check-site`.
- [ ] **Chấp nhận:** ở 1280×800 thấy `h1`, ô tìm kiếm và ≥ 4 hàng hạn không cuộn; ở 375px không tràn; sáng/tối đều đọc tốt.

---

## Task 3: Lịch hội nghị `lich-hoi-nghi.html`

**Files:** `site/lich-hoi-nghi.html`, `site/css/conference.css`, `site/css/states.css`, `site/js/states-demo.js` (chỉ nếu đổi class).

- [ ] **Danh sách:** 6 thẻ `.cd` → 6 hàng `.row` (markup ở Task 0). Thanh công cụ trên danh sách: số kết quả ("37 hội nghị"; bỏ "trên tổng 128" nếu không đếm được) + sắp xếp. **Bỏ nút chuyển Thẻ/Bảng.** Chip bộ lọc đang áp dụng chuyển thành dòng chữ nhỏ có nút bỏ lọc, phẳng.
- [ ] **Bộ lọc trái:** giữ 6 nhóm; phẳng, không viền từng nhóm, đầu nhóm là chữ 12px 600 (không hoa, không rải khoảng); ô tick/radio rõ ở cả hai giao diện; cột 260px ở ≥64rem, dưới đó nằm trên danh sách và chỉ mở nhóm đầu (giữ hành vi `nav.js`).
- [ ] **Phân trang:** nút vuông 36–44px, trang hiện tại nền chữ đảo.
- [ ] **4 trạng thái:** loading = 6 hàng skeleton cùng chiều cao hàng thật (chỉ đổi opacity); error và empty = hộp phẳng viền 1px, icon 24px (không vòng tròn to), tiêu đề + 1 câu + nút; `.demo-bar` phẳng, ẩn mặc định (giữ cơ chế `?state=`).
- [ ] **Chấp nhận:** ở 1280 thấy ≥ 6 hàng cùng header + thanh công cụ; ★ lưu được; `?state=loading|error|empty` đều đúng và không vỡ ở 375px.

---

## Task 4: Trang chi tiết hội nghị (6 trang sinh tự động)

**Files:** `tools/build-conferences.mjs` (template), `site/css/conference.css`; chạy lại `node tools/build-conferences.mjs && node tools/sync-chrome.mjs`.

- [ ] **Đầu trang:** breadcrumb nhỏ, `h1` "ICSE 2027" (600, không serif nghiêng cho năm), tên đầy đủ, một dòng meta (nơi · ngày · hình thức), badge rank phẳng.
- [ ] **Cột phải:** hộp "Mốc kế tiếp" phẳng: tên mốc, pill khẩn, **đếm ngược là một dòng chữ mono** ("2 ngày 04:12:09"), hạn AoE và GMT+7. **Bỏ bốn ô số to có viền** (`.digits`). Nút: Google Calendar (chính), Tải .ics, Lưu.
- [ ] **Bảng mốc:** bảng 4 cột phẳng, hàng "Mốc kế tiếp" có thanh trái 3px màu khẩn + nền `--tint`, hàng đã qua gạch chữ nhạt hơn; dưới 40rem thành khối dọc có nhãn (giữ `data-l`).
- [ ] **Chân trang nội dung:** nguồn + cập nhật + "Báo dữ liệu sai" (liên kết `lien-he.html`).
- [ ] **Chấp nhận:** cả 6 trang (nhất là FSE `lv-s` và NeurIPS đã đóng) đúng màu khẩn, đúng ở 375px, `.ics` vẫn có `DTSTART:20261014T115900Z` cho FSE.

---

## Task 5: Trang Đã lưu `da-luu.html`

**Files:** `site/da-luu.html`, `site/css/pages.css`.

- [ ] Danh sách `.saved-list` dùng **cùng markup `.row`** với trang lịch (bỏ `.srow` riêng); nút "Bỏ lưu" là ★ đang bật. Hộp rỗng phẳng, một câu + nút "Xem lịch hội nghị".
- [ ] **Chấp nhận:** lưu 2 hội nghị ở trang lịch, quay lại thấy đúng 2 hàng, header ghi "Đã lưu (2)"; bỏ lưu thì hàng mất ngay; trạng thái rỗng hiện lại khi hết.

---

## Task 6: Blog — danh sách `blog.html`

**Files:** `site/blog.html`, `site/css/blog.css`, `site/js/blog-list.js` (đọc trước khi sửa: JS sinh markup, đừng làm gãy selector).

- [ ] **Bỏ hero navy** với vòng tròn mờ và lưới nền; thay bằng đầu trang như các trang khác (`h1` + một câu).
- [ ] **Thanh tìm kiếm + sắp xếp + chip chủ đề:** một hàng phẳng.
- [ ] **Bài nổi bật:** một khối ngang đơn giản (không ảnh giả: nếu hiện là ô sọc "ẢNH BÌA" thì bỏ ảnh, chỉ giữ chữ), hoặc bỏ hẳn mục "nổi bật" nếu không có ảnh thật; quyết định theo dữ liệu thực tế.
- [ ] **Danh sách bài:** dạng hàng (tiêu đề, mô tả 1–2 dòng, chủ đề, ngày, thời gian đọc), không lưới thẻ có ảnh bìa giả. 29 bài, phân trang/lọc giữ hành vi của `blog-list.js`.
- [ ] **Chấp nhận:** tìm kiếm, lọc chủ đề, sắp xếp vẫn chạy; 375px không tràn; sáng/tối ổn.

---

## Task 7: Bài viết blog (29 trang) — chỉ CSS

**Files:** `site/css/blog.css`, `site/js/blog-post.js` (chỉ nếu đổi class).

- [ ] Thân bài: cột đọc 680–720px, chữ 17px/1.7, tiêu đề phụ 600 không serif, liên kết gạch chân màu nhấn, trích dẫn bằng vạch trái 2px, bảng/mã dùng viền 1px. Bỏ ô "ẢNH BÌA" sọc nếu là ảnh giả (xác nhận bằng cách đọc HTML bài: nếu không có ảnh thật thì xoá khối đó bằng một thay thế regex có kiểm tra trên cả 29 file).
- [ ] Mục lục: cột phải sticky ≥64rem, phẳng; dưới đó là `<details>` đầu bài (giữ `blog-post.js`).
- [ ] **Không sửa nội dung bài viết** (chữ trong thân bài).
- [ ] **Chấp nhận:** mở 3 bài (ngắn, dài, nhiều bảng/danh sách) ở 375/768/1280, sáng + tối, không tràn; mục lục hoạt động.

---

## Task 8: Giới thiệu, Liên hệ, 404

**Files:** `site/gioi-thieu.html`, `site/lien-he.html`, `site/404.html`, `site/css/pages.css`, `site/js/contact.js` (nếu đổi id).

- [ ] **Giới thiệu:** một cột đọc 720px, bỏ cột "Xem tiếp". Nội dung rút còn: (1) 2–3 câu về mục đích, (2) ghi chú **dữ liệu minh hoạ** nổi rõ nhưng gọn, (3) bảng "Cách đọc rank" (CORE A*/A/B/C, CCF A/B/C) dạng bảng 2 cột, (4) bảng "Thang độ khẩn" dạng bảng 3 cột (nhãn pill · khoảng ngày · ý nghĩa). Mỗi phần có `id` như hiện tại (`du-lieu`, `rank`, `do-khan`).
- [ ] **Liên hệ:** một cột; form phẳng (nhãn trên, ô `--field`, viền 1px, `min-height: 44px`), bên cạnh hoặc dưới là 2 dòng thông tin (email minh hoạ, trường). Giữ `contact.js` và thông báo kết quả.
- [ ] **404:** căn trái, "404" cỡ 48px mono nhạt + một câu + hai liên kết; bỏ hộp bóng to và số khổng lồ.
- [ ] **Chấp nhận:** form trống bị chặn bởi trình duyệt, hợp lệ thì hiện lời cảm ơn và reset; 3 trang đọc tốt ở 375px và tối.

---

## Task 9: Rà văn phong toàn bộ chữ trên giao diện

**Files:** mọi trang HTML (chữ hiển thị, `<title>`, `meta description`), `tools/conferences.mjs`, `tools/build-conferences.mjs`, `tools/chrome.mjs`.

- [ ] Đọc toàn bộ chữ hiển thị (không phải thân bài blog). Danh sách cần xử lý: tiêu đề trang, câu phụ đầu trang, mô tả trạng thái rỗng/lỗi, nhãn nút, chú thích. Áp dụng quy tắc "Văn phong" ở đầu file; dùng skill `humanizer` để rà các câu dài.
- [ ] Tìm và loại: cụm khẩu hiệu, câu đối xứng ba vế, "không chỉ… mà còn…", từ thổi phồng (`grep -rniE "tối ưu|thông minh|liền mạch|toàn diện|mạnh mẽ|đột phá" site tools --include=*.html --include=*.mjs`).
- [ ] Giữ nguyên mọi thuật ngữ kỹ thuật (AoE, CORE, CCF, camera-ready, rebuttal) và mọi dữ kiện.
- [ ] `<title>` mỗi trang vẫn khác nhau (`check-site`).
- [ ] **Chấp nhận:** `check-site` OK; diff chữ được người dùng xem một lượt (tóm tắt các thay đổi chính trong báo cáo).

---

## Task 10: Rà cuối và dọn

- [ ] `node tools/sync-chrome.mjs && node tools/build-conferences.mjs && node tools/sync-chrome.mjs` (idempotent, lần hai không in `updated`).
- [ ] Bộ kiểm tra chung đều pass; `grep -rn "landing.css\|newsletter\|--gold\|--navy\|Newsreader\|Be Vietnam\|JetBrains" site tools` không còn kết quả (trừ docs).
- [ ] Dò tràn ngang 14 trang tiêu biểu × 320/375/768/1280 × sáng/tối (dùng `tools/probe-overflow.js` trong iframe).
- [ ] Chụp màn hình: `index`, `lich-hoi-nghi` (+ 3 trạng thái), `hoi-nghi-fse`, `da-luu`, `blog`, một bài blog, `gioi-thieu`, `lien-he`, `404` — mỗi trang một ảnh sáng và một ảnh tối ở 1280 và một ảnh 375. Lưu vào scratchpad (không commit) và duyệt từng ảnh; ghi lại lỗi còn sót, sửa **một đợt** rồi dừng.
- [ ] `impeccable detect --json site/css site/index.html site/lich-hoi-nghi.html` một lần, xử lý mục thật sự đáng sửa.
- [ ] Cập nhật `docs/` (đánh dấu plan này hoàn tất), hỏi người dùng trước khi `git push`.

---

## Rủi ro và cách giữ an toàn

| Rủi ro | Cách xử lý |
|---|---|
| Sửa tay hàng loạt làm lệch 40 file | Chỉ qua `sync-chrome.mjs`/`build-conferences.mjs`; chạy hai lần để kiểm idempotent. |
| Giữa các task giao diện tạm xấu | Commit từng task trên nhánh `ui-redesign`, chỉ merge vào `main` sau Task 10. |
| Hỏng `blog-list.js`, `save.js`, `nav.js` do đổi class | Task nào đổi class phải grep selector trong `site/js` và `tools/*.mjs` trước và sau. |
| Contrast không đạt khi đổi màu | `check-contrast` bắt buộc OK; chỉnh giá trị, không hạ ngưỡng. |
| Xoá nhầm nội dung bài blog | Task 7 chỉ đụng CSS và khối ảnh bìa giả; so `git diff --stat` đảm bảo thân bài không đổi. |
| Font Plex không tải được | Có fallback `system-ui`; kiểm bằng cách chặn mạng một lần. |

## Thứ tự và phụ thuộc
Task 0 → 1 → (2, 3, 4, 5 độc lập sau khi có `.row`) → 6 → 7 → 8 → 9 → 10. Task 2–5 cùng phụ thuộc thành phần `.row` ở Task 0; Task 9 chạy sau cùng vì chạm mọi trang.
