# Đặt deadline lên đầu: thiết kế web tra cứu hội nghị

Trong 7 website tra cứu hội nghị/CFP được phân tích, **chỉ hai site hiện đại là ccfddl và Hugging Face AI Deadlines mã hoá độ khẩn của deadline bằng màu, có empty state rõ ràng và xử lý AoE (UTC−12) đúng**. Các site "kỳ cựu" như WikiCFP, ConferenceIndex, Conference Alerts và ICORE vẫn chạy layout Bootstrap hoặc layout bảng cố định. Nhóm này **không có countdown, không có loading state, và empty state thì im lặng hoặc chỉ có một dòng chữ**. Ba site còn không có meta viewport hoặc chặn zoom. Khoảng trống này chính là cơ hội cho đồ án môn Internet và Công nghệ Web. Một trang tra cứu thuần HTML/CSS/TypeScript, đặt **deadline (AoE) và countdown làm thông tin số 1**, có bộ lọc rank CORE/CCF + hình thức online/offline/hybrid lưu trên URL, và đủ 4 trạng thái loading / error / empty / ready, sẽ vượt hầu hết các site đang hoạt động về UX. Bằng chứng cũng cho thấy **không cần thư viện nào** cho các tính năng khó nhất. `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `URLSearchParams`, `<template>` và một `setTimeout` dùng chung đã đủ để thay moment.js, jQuery và React mà các site gốc dùng. Phần 3 đưa ra một hệ thiết kế hoàn chỉnh (token màu đã kiểm tra WCAG AA, font có subset tiếng Việt và chữ số không "nhảy", component, wireframe, mã TS mẫu). Mọi đề xuất trong đó đều làm được bằng HTML/CSS/TS thuần.

> **Quy ước trong báo cáo.** Nhận xét về site đều kèm URL nguồn. **[chưa xác minh]** nghĩa là ghi chú nghiên cứu chưa kiểm chứng được giá trị đó. **[Đề xuất]** đánh dấu khuyến nghị thiết kế của người viết, không phải điều quan sát được trên site. Với WikiCFP, ConferenceIndex, Conference Alerts và ICORE, các giá trị đo bằng trình duyệt thật (`getComputedStyle`, ngày 2026-10-08) được ưu tiên hơn các ghi chú cũ đánh dấu [chưa xác minh]. Với ccfddl, HF, sec-deadlines và aideadlin.es, giá trị lấy từ mã nguồn (CSS/TSX/Rust/JS) trong repo.

---

## 1. Tóm tắt

- **Deadline-first là điểm phân hoá lớn nhất.** Ba site tổng hợp truyền thống không đưa deadline lên listing hoặc chỉ ghi ngày tĩnh: ConferenceIndex và Conference Alerts không hiện deadline ở trang danh sách, WikiCFP chỉ có cột Deadline dạng text. Ngược lại, ccfddl đặt *loại deadline kế tiếp + countdown tương đối có màu + giờ tuyệt đối kèm "(UTC-12)"* ngay trong card ([screenshot ccfddl](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png)).
- **Độ khẩn được mã hoá theo ngưỡng ngày.** ccfddl dùng các mốc <3 / <7 / <30 ngày, màu đỏ #f56c6c / cam #e6a23c / xanh lá #67c23a ([countdown.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/countdown.rs), [styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)). HF dùng ≤7 / ≤30 ngày ([ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)). WCAG 1.4.1 yêu cầu luôn kèm chữ, không dùng màu đơn thuần ([Understanding 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Empty state là chỗ hầu hết các site làm kém.** Ba site gần như bỏ trống khi không có kết quả: WikiCFP chỉ còn heading, sec-deadlines trang trắng, ICORE chỉ có "0 Results found.". HF giải thích nguyên nhân và cách sửa ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx)), nhưng không site nào có nút "Xoá bộ lọc". Đồ án nên làm tốt hơn cả HF ở điểm này.
- **Filter state trên URL là chuẩn chung của các tracker**: aideadlin.es `?sub=`, sec-deadlines `?domain=&type=&rank=`, HF `?tags=&countries=`. Các site truyền thống thì dùng form GET (WikiCFP `q`, ConferenceIndex `query`, Conference Alerts `q`, ICORE `search/by/source/sort/page`). **Chưa site nào có filter online/offline/hybrid kết hợp rank.** Conference Alerts có Mode nhưng không có rank, ccfddl có rank nhưng không có Mode.
- **Hướng thiết kế đề xuất [Đề xuất]:**
  - Giao diện sáng, xanh dương học thuật (primary #1d4ed8, 6.70:1 trên trắng) với 5 mức urgency có nhãn chữ.
  - Font Be Vietnam Pro cho UI, JetBrains Mono cho chữ số countdown. Be Vietnam Pro không có `tnum` nên chữ số sẽ "nhảy" khi đếm ngược ([ghi chú fontTools trên google/fonts](https://github.com/google/fonts/tree/main/ofl)).
  - Layout sidebar filter (≥64rem), card grid với nút chuyển sang dạng bảng, pagination 12–24 item.
- **Kỹ thuật [Đề xuất]:** Dùng Vite `vanilla-ts` kèm `tsc --noEmit`, hoặc chỉ dùng tsc nếu muốn câu chuyện "thuần" nhất ([Vite Features](https://vite.dev/guide/features.html)). Dữ liệu là JSON tĩnh, deadline lưu dạng ISO có offset (`2026-11-15T23:59:59-12:00`). Toàn trang chỉ dùng một ticker chung, tạm dừng khi tab ẩn.

---

## 2. Bảng so sánh tổng hợp

Bảy site được chọn vì có nhiều bằng chứng đã xác minh nhất: mã nguồn đọc được, hoặc style đo bằng trình duyệt thật. Ô ghi "—" nghĩa là site không có tính năng đó. Chi tiết và URL nguồn của từng ô nằm ở mục 3.

| Site | (1) Layout | (2) Màu (HEX) | (3) Font | (4) Search | (5) Filter/sort | (6) Card/table, ưu tiên | (7) Countdown & AoE | (8) Badge/tag | (9) Pagination | (10) Loading | (11) Error | (12) Empty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **ccfddl** | max 1200px, grid card 4→3→2→1 | nền #faf9f7, card #fffefa, primary #409eff, urgency #f56c6c/#e6a23c/#67c23a | Roboto Mono toàn UI; 3xl 29px | Live, id+title, không autocomplete | Chip 10 lĩnh vực CCF, dropdown CCF/CORE/THCPL, past, timezone, "base time"; sort theo thời gian còn lại | Card (có list và bảng): tên → loại deadline + countdown → giờ tuyệt đối → ngày/nơi → rank → lĩnh vực | Adaptive "in 39d 2h"; AoE→UTC−12; có bộ chọn timezone | Rank pill trung tính #f8f6f3/#655f58, không màu theo hạng | 12/trang, reset về trang 1 | Shell "Loading conference deadlines…" `role=status` | Thông báo + nút Retry, watchdog 30s | "No data available.", không có nút reset |
| **HF AI Deadlines** | max-w-7xl, grid 1/2/3 cột | primary #0284C7, neutral #6B7280; urgency red/orange/green-600 | Tailwind default sans [ước lượng] | Search ở header, title+full_name | Nút category, Country, "top tier", toggle past; URL `?tags=&countries=` | Card: tên → ngày → nơi → deadline kế tiếp → countdown màu → tag | Tương đối "in about 2 months"; AoE→−12:00 | Tag pill bấm được (toggle filter) | — (một trang) | Text "Loading conferences..." | Chỉ `console.error` | Hộp amber giải thích cách sửa |
| **sec-deadlines** | 980px, một cột, các dòng ngăn bằng `<hr>` | chữ #333, selection #e74c3c, gạch chân link #ccc; còn lại mặc định BS3 | Mặc định BS3 [ước lượng]; tên 16px, timer 24px | — (fuse.js nạp nhưng không dùng) | 3 nhóm checkbox (Domain/Type/CORE), OR trong nhóm, AND giữa nhóm; URL dễ đọc | List 2 cột: tên + countdown; mỗi deadline một dòng "(1 / 2)" | `%D days %Hh…`; mặc định AoE `Etc/GMT+12`; 00:00→23:59:59 | — (tag chỉ là class CSS) | — (208 mục) | — (thấy chuỗi YAML thô trước khi JS chạy) | — | Trắng trơn |
| **WikiCFP** | Bảng cố định, không viewport, 0 @media | chữ #111111, heading #966C52, link #664444, hover #FF5D08, dòng xen kẽ #F6F6F6/#E6E6E6, header #BBBBBB | Verdana 13px | GET `q` + `year` | Lọc năm; danh sách sắp theo deadline | Bảng Event / When / Where / Deadline, 2 dòng mỗi event | — (chỉ có ngày, kèm deadline cũ trong ngoặc) | Category là link text | 20/trang, "first / previous / Page 1 / next / last" | — (render phía server) | [chưa xác minh] | Chỉ heading, không có câu thông báo |
| **ConferenceIndex** | Bootstrap 4, container 1140px, `col-md-3` + `col-md-9` | chữ #212529, link #007BFF, nút #28A745, badge #17A2B8 | System stack 16px/24px | GET `query`, render phía server | Faceting qua URL `/conferences/{tag}/{country}`, không có UI filter | List `<li>` nhóm theo tháng: ngày → tên (ACRONYM) → thành phố | — (detail: "Submission deadline: Not listed") | Badge đếm `badge-info`; detail có "This event is expired!" | Bootstrap "‹ 1 2 … ›", `?page=` | — | [chưa xác minh] | Alert đỏ #F8D7DA + alert gợi ý #D1ECF1 |
| **Conference Alerts** | 2 template: BS5.3.8 (home/search) và BS3.4.1 (listing quốc gia) | primary #0D6EFD và link #337AB7; badge mode #198754/#0DCAF0/#FFC107 (BS5) và #008000/#43ADCA/#D4A15C (BS3) | system-ui 16px (mới); Helvetica Neue 14px (cũ) | GET `q`; advanced: when/mode/country/city/type/date | When (30/90 ngày/12 tháng), Mode, Country, Event type | List nhóm theo tháng: ngày → tên → thành phố → badge mode | — (detail: "Deadline for abstracts/proposals: 20th July 2026") | Pill ONLINE / IN-PERSON / ONLINE AND IN-PERSON | Search: không thấy pagination; listing: "1 / All" | — | [chưa xác minh] | "0 events found" + "No events matched…Try changing…" |
| **ICORE portal** | Lưới 960 cố định, không viewport, 0 @media | nền #E6E6E6, link #0464AD, th #003399, dòng #F5DEB3/#FFF, hover #ADD8E6 | Helvetica Neue 13px; h2 Goudy Old Style | GET `search` + "Search by" (All/Title/Acronym/Rank/FoR) | Source (vòng xếp hạng); sort bằng click header (submit form) | Bảng 9 cột: Title / Acronym / Source / Rank / … | — (không có ngày) | Rank là chữ thường, không badge | 50/trang, "Showing results 1 - 50 of 65" | — (reload toàn trang) | [chưa xác minh] | "0 Results found." |

**Các site đã xem nhưng loại khỏi phân tích chính:**

| Site | Lý do loại | Nguồn |
|---|---|---|
| aideadlin.es | Là tổ tiên của sec-deadlines và HF, dữ liệu dừng ở 2025 dù trang vẫn chạy. Repo commit cuối 2024-09-15, README của HF xác nhận bản gốc "no longer maintained". Một số pattern của nó vẫn được trích ở mục 3 và 4. | [aideadlin.es](https://aideadlin.es/), [HF README](https://github.com/huggingface/ai-deadlines/blob/main/README.md) |
| conf.researchr.org | Là CMS cho từng hội nghị, không phải trang tra cứu, và màu/breakpoint không xác minh được. Box "Important Dates AoE (UTC-12h)" vẫn được dùng làm pattern. | [conf.researchr.org](https://conf.researchr.org/), [ICSE 2027 Research Track](https://conf.researchr.org/track/icse-2027/icse-2027-research-track) |
| Research.com | Chỉ xác minh được một màu (#007397 theme-color), không có font, dữ liệu cũ từ 2023. Micro-copy pagination "items 1-100" vẫn được trích. | [Research.com CS](https://research.com/conference-rankings/computer-science) |
| call4paper, allconferencealert | Chỉ đọc được text, không có màu hay font. Câu lỗi "Something went wrong. Please try again." của allconferencealert vẫn được trích. | [call4paper](https://www.call4paper.com/), [allconferencealert](https://www.allconferencealert.com/) |
| 10times, conferencealerts.co.in | Không đọc được (trả binary hoặc 403). | — |
| Danh mục CCF | Chỉ là bảng tĩnh A/B/C, không có search hay sort. Chỉ dùng làm nguồn định nghĩa rank. | [CCF TCS](https://www.ccf.org.cn/Academic_Evaluation/TCS/) |

---

## 3. Phân tích chi tiết từng site

### 3.1 ccfddl: chuẩn mực về mật độ thông tin và độ bền trạng thái

ccfddl là site giàu tính năng và được bảo trì tích cực nhất trong nhóm. Đây là ứng dụng **Rust/Leptos chạy WASM cùng thư viện UI thaw**, không phải JavaScript ([Cargo.toml](https://github.com/ccfddl/ccf-deadlines/blob/main/Cargo.toml)). Vì cần JS/WASM mới render được, nếu tải không chạy JS thì chỉ thấy dòng "Loading conference deadlines..." ([ccfddl.com](https://ccfddl.com/)). Bằng chứng giao diện vì vậy lấy từ mã nguồn và ảnh README.

**Layout.** Container `.home` rộng tối đa **1200px**, padding 20px (12px khi ≤600px). Grid card có 4 cột, chuyển xuống 3 cột ở 851–1100px, 2 cột ở 601–850px và 1 cột ở ≤600px, gap 18px ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)). Header theo thứ tự từ trên xuống:
- tiêu đề "CCFDDL Open *Deadlines*", nút GitHub Star, ticker hồng "Latest", nút "Sign in with GitHub";
- subtitle, rồi hai switch 中文/English và "Show past conferences";
- hàng chip lĩnh vực;
- toolbar gồm đồng hồ thực, ô "search conference", "Most starred", "switch UI", "Wall", "Subscribe" và ba dropdown CCF/CORE/THCPL.

Nguồn: ảnh [screenshot_website.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png).

**Màu.** Token `:root` gồm:
- primary **#409eff**;
- nền phụ #f5f7fa;
- chữ chính **#2c3e50**, chữ phụ #666666;
- success **#67c23a**, warning **#e6a23c**, danger **#f56c6c**.

Nền trang **#faf9f7**. Card nền **#fffefa**, viền #e6e0d8, bo góc 10px. Chữ "Deadlines" ở tiêu đề màu **#d9554f** in nghiêng. Ngày ước lượng ("Est.") màu #b87519. Nguồn: [styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css). Ghi chú nghiên cứu nhận định bộ token này trùng với theme mặc định của Element UI, nhưng repo không tuyên bố điều đó.

**Typography.** `.home` ép toàn bộ UI sang **"Roboto Mono", "SF Mono", Monaco, monospace**. Thang cỡ chữ gồm 12 / 14 / 16 / 18 / 20 / 24 / 29px. Tên hội nghị 20px weight 400, countdown 20px có letter-spacing 0.5px ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)).

**Search và filter.**
- Search: ô `placeholder="search conference"`, so khớp chuỗi con không phân biệt hoa thường trên `id` hoặc `title`, lọc ngay khi gõ, không có autocomplete. Query được lưu vào localStorage.
- Filter:
  - 10 chip lĩnh vực CCF (DS, NW, SC, SE, DB, CT, CG, AI, HI, MX);
  - dropdown đa chọn cho CCF (A/B/C/Non-CCF), CORE và THCPL;
  - switch "Show past" và "Show submission only";
  - bộ chọn timezone;
  - ô **"Set countdown base time"** để tính lại toàn bộ countdown so với một thời điểm tự chọn.
- Sort: hội nghị còn hạn (RUN) xếp theo thời gian còn lại, rồi đến TBD, rồi FIN. Có tuỳ chọn "Most starred".

Nguồn: [showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs), [conference_controls.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/conference_controls.rs).

**Card và thứ tự ưu tiên thông tin.** Card hiển thị lần lượt:
1. tên + năm, số ★, icon link ngoài;
2. **loại deadline** ("Abstract Submission" / "Paper Submission"), với **countdown tương đối có màu** ở bên phải ("in 39d 2h");
3. giờ tuyệt đối "23:59, Nov 10, 2026 (UTC-12)";
4. ngày tổ chức và địa điểm, chữ nhỏ;
5. tag rank "CCF A", "CORE A*", "THCPL A";
6. tag lĩnh vực.

Nguồn: [screenshot_website.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png). Ngoài card còn có chế độ list ("switch UI") và bảng (`/?view=table`) ([home.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/pages/home.rs), [screenshot_tabular.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_tabular.png)).

**Countdown và AoE.**
- Định dạng **thích ứng**: `in {d}d {h}h` → `in {HH}h {MM}m` → `in {MM}m {SS}s`, càng gần hạn càng chi tiết.
- Độ khẩn: <3 ngày `urgent` (đỏ), <7 ngày `warning` (cam), <30 ngày `attention`, còn lại `normal`. Hai mức cuối cùng màu xanh lá ([countdown.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/countdown.rs)).
- Timezone: `normalize_timezone("AoE") → "UTC-12"`. Bảng offset phủ từ UTC−12 đến UTC+14. "PT" được quy theo DST của Mỹ. Deadline chỉ có ngày thì mặc định `23:59:59` ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)). README quy định: "When the source does not specify a timezone, use `AoE`" ([README](https://github.com/ccfddl/ccf-deadlines/blob/main/README.md)).
- Countdown **giảm một bộ đếm mỗi giây** thay vì tính lại từ `Date.now()`, nên có thể bị trôi khi trình duyệt throttle tab nền. Đây là suy luận của ghi chú nghiên cứu; đồ án không nên làm theo cách này.

**Badge.** Rank hiển thị dạng pill trung tính (nền #f8f6f3, chữ #655f58, cao 20px, chữ 12px). **Màu không phân biệt theo hạng**, nên "CCF A" trông giống "CCF C". Tag khớp với filter đang bật thì được highlight xanh #e9f2fa/#356d9e ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)).

**Pagination, loading, error, empty.**
- Pagination: `page_size = 12`. Đổi filter hoặc base time thì về lại trang 1 ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)).
- Loading: khối `#initial-loading` có `role="status" aria-live="polite"`, nội dung "Loading conference deadlines..." ([index.html](https://github.com/ccfddl/ccf-deadlines/blob/main/index.html)). Có một component `LoadingSkeleton` nhưng có vẻ chưa được dùng [chưa xác minh khi chạy] ([loading.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/loading.rs)).
- Error: watchdog 30 giây, sau đó hiện "Unable to finish loading. Please retry." kèm nút Retry. Lỗi fetch dữ liệu hiện "Unable to load conference deadlines. Please retry." và nút tải lại.
- Empty: **"No data available."** trải toàn grid, nhưng không có nút xoá filter.
- Hội nghị đã qua hạn bị ẩn mặc định. Khi bật lên, card mờ còn opacity 0.68 và hiện chữ "Deadline passed" ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)).

**Điểm mạnh:**
- Mật độ thông tin tốt nhất nhóm: loại deadline, countdown tương đối và giờ tuyệt đối kèm múi giờ cùng nằm trong một card.
- Có filter rank CCF/CORE, rất sát nhu cầu sinh viên Việt Nam.
- Trạng thái loading và error có Retry.
- Mọi cài đặt đều được lưu lại.

**Điểm yếu:**
- Font monospace cho toàn bộ UI khiến tên dài khó đọc.
- Rank không có màu theo hạng.
- Empty state không có hành động.
- Không có JS thì không có nội dung.
- Header rối (ticker, star, wall, subscribe).
- Có quảng cáo AdSense ([index.html](https://github.com/ccfddl/ccf-deadlines/blob/main/index.html)).
- Không có filter địa điểm hay online/offline ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)).

### 3.2 Hugging Face AI Deadlines: empty state và cách diễn đạt tốt nhất

Đây là bản kế nhiệm còn được bảo trì của aideadlin.es. Space đang ở trạng thái "Running" ([HF Space](https://huggingface.co/spaces/huggingface/ai-deadlines)). Stack gồm React + Vite + Tailwind 3.4 + shadcn/ui + date-fns-tz ([package.json](https://github.com/huggingface/ai-deadlines/blob/main/package.json)).

**Layout và màu.**
- Header trắng, có `border-b`, container `max-w-7xl` (1280px) ([Header.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/Header.tsx)).
- Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx)).
- Màu tuỳ biến: primary **#0284C7** (light #7DD3FC, dark #075985), neutral **#6B7280** ([tailwind.config.ts](https://github.com/huggingface/ai-deadlines/blob/main/tailwind.config.ts)).
- Font: không khai báo family riêng, nên nhiều khả năng là stack sans mặc định của Tailwind [ước lượng].
- Tên trên card `text-lg font-semibold`, metadata `text-sm` ([ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)).

**Search và filter.**
- Search: `input type="search"` ở header, placeholder "Search conferences...", so khớp `title` hoặc `full_name`.
- Filter: nút category, Country, toggle "top tier" (ERA A) và "Show past conferences".
- Tag và country được lưu vào `?tags=…&countries=…` ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx)).

**Card và countdown.**
- Card `bg-white rounded-lg shadow-sm hover:shadow-md p-4`. Các dòng icon lần lượt là ngày, địa điểm, deadline kế tiếp (kèm nhãn), countdown màu, rồi tag. Bấm vào card mở dialog liệt kê đủ các deadline.
- Countdown dùng `formatDistanceToNow`, ra kiểu "in about 2 months". Màu: **≤7 ngày `text-red-600`, ≤30 ngày `text-orange-600`, còn lại `text-green-600`** ([ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)). Mã HEX tương ứng là mặc định của Tailwind v3 (#dc2626 / #ea580c / #16a34a), không có trong repo [ước lượng].
- AoE: `'AoE' → '-12:00'`, sau đó chuyển sang múi giờ người dùng ([dateUtils.ts](https://github.com/huggingface/ai-deadlines/blob/main/src/utils/dateUtils.ts)).

**Badge.** Tag là pill `bg-primary/10 text-primary`, **bấm được** để bật/tắt filter ([index.css](https://github.com/huggingface/ai-deadlines/blob/main/src/index.css)).

**Pagination và các trạng thái.**
- Pagination: không có.
- Loading: chỉ là text "Loading conferences...".
- Error: chỉ `console.error`.
- Empty: hộp amber `bg-amber-50 border-amber-200 text-amber-800`, nội dung *"There are no upcoming conferences for the selected categories - enable "Show past conferences" to see previous ones"* ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx)).

**Điểm mạnh:**
- Câu empty state nêu được nguyên nhân và cách khắc phục.
- Ngưỡng 7/30 ngày đơn giản.
- Có interface TypeScript `Conference` / `Deadline` dùng lại được ([conference.ts](https://github.com/huggingface/ai-deadlines/blob/main/src/types/conference.ts)).

**Điểm yếu:**
- Text tương đối "in about 2 months" thiếu chính xác khi đã sát hạn.
- Không có error UI.
- Tag vừa trông như nhãn vừa là nút, nên dễ nhầm.
- Không phân trang.

### 3.3 sec-deadlines: filter nhóm checkbox rõ ràng nhất của thế hệ jQuery

Site là fork trực tiếp của template ai-deadlines, dùng Jekyll + Bootstrap 3.3.7 + jQuery 3.6 + moment-timezone 0.5.34 + jquery.countdown 2.2.0 ([index.html](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/index.html)). Site vẫn được cập nhật, dòng "Last update: 7 October 2026" ([sec-deadlines.github.io](https://sec-deadlines.github.io/)).

**Layout, màu, font.**
- Cấu trúc: dải `.top-strip` #333 cao 0.25em, rồi container **980px**, rồi header (tiêu đề, mô tả, link iCal, filter), rồi các dòng ngăn bằng `<hr>`.
- Mỗi dòng có 2 cột `col-sm-6`, xếp chồng lên nhau khi màn hình dưới 768px.
- Chữ **#333**, nền vùng chọn chữ **#e74c3c**, link không gạch chân mà dùng border-bottom **#ccc**.
- Tên hội nghị 16px weight 600. **Countdown 24px, to hơn cả tên.**
- Nguồn: [deadlines.css](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/css/deadlines.css).

**Filter.** Có ba nhóm checkbox, mỗi nhóm gắn một emoji:
- Research Domain: Security, Privacy, Crypto;
- Publication Type: Conferences, Workshops, Journals;
- CORE Ranking: Top-4, A*, A, B, C, National/Unranked.

Logic là **OR trong nhóm, AND giữa các nhóm**. Trạng thái được ghi lên URL bằng tên dễ đọc (`?domain=Security,Privacy&type=Conferences&rank=A*`) qua `history.replaceState`. Khi tải trang, giá trị trên URL được ưu tiên hơn localStorage ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js), [filters.yml](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/_data/filters.yml)).

**Search.** Không có ô search. Thư viện fuse.js 6.6.2 được nạp nhưng không được dùng ([index.html](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/index.html)).

**Countdown và AoE.**
- **AoE là mặc định**: nếu không có timezone thì dùng `"Etc/GMT+12"`.
- Deadline 00:00 bị lùi 1 giây thành 23:59:59 ngày hôm trước, để tránh "pain and confusion when it happens to be midnight in local time" ([README](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/README.md)).
- Deadline đã qua hiện kiểu "2 months ago" và cả dòng mờ còn **opacity 0.5** ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js), [deadlines.css](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/css/deadlines.css)).
- Hội nghị nhiều vòng nộp được hiển thị **mỗi deadline một dòng**, ghi "Deadline (1 / 2)" và "Deadline (2 / 2)" ([sec-deadlines.github.io](https://sec-deadlines.github.io/)).

**Badge, pagination, các trạng thái.**
- Badge: không có. Tag rank chỉ là class CSS dùng để lọc, nên rank không hiện trên dòng.
- Pagination: không có, cả 208 mục nằm trên một trang ([conferences.yml](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/_data/conferences.yml)).
- Loading: không có. Trước khi JS chạy, người dùng thấy chuỗi YAML thô kiểu "2026-06-11 23:59".
- Empty: khi filter không khớp gì, trang **trắng hoàn toàn** ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js)).

**Điểm mạnh:**
- Filter nhóm rõ ràng, URL đọc được và chia sẻ được.
- Mặc định AoE, có xử lý 00:00.
- Có feed iCal riêng theo chủ đề.

**Điểm yếu:**
- Không có search cho hơn 200 mục.
- Rank không hiển thị.
- Không có màu thể hiện độ khẩn.
- Empty state im lặng.
- Thấy dữ liệu thô trước khi JS chạy.

### 3.4 WikiCFP: chuẩn dữ liệu cũ, UX cũ

Toàn bộ số liệu dưới đây đo bằng trình duyệt thật ngày 2026-10-08. Chúng thay thế ghi chú cũ cho rằng site "không truy cập được".

**Layout.**
- Layout bảng cố định. **Không có meta viewport và có 0 rule @media**, nên ở viewport 390px trình duyệt vẫn hiển thị bản desktop rộng 997px rồi thu nhỏ lại ([WikiCFP category CS](http://www.wikicfp.com/cfp/call?conference=computer%20science)).
- Sidebar trái là phần tử `position:absolute` rộng 140px.
- Chỉ có một stylesheet duy nhất, `wikicfp.css`.

**Màu và font.**
- Body **Verdana 13px**, chữ **#111111** trên nền trắng.
- h1/h2 màu nâu **#966C52** (28px và 24px, weight 500). Nav **#A06C52**.
- Link nội dung **#664444**, có gạch chân. Hover **#FF5D08**.
- Dòng bảng xen kẽ **#F6F6F6/#E6E6E6**, header bảng **#BBBBBB**.
- Nguồn: [WikiCFP home](http://www.wikicfp.com/cfp/), [WikiCFP category CS](http://www.wikicfp.com/cfp/call?conference=computer%20science).

**Bảng danh sách.**
- Các cột: **Event | When | Where | Deadline**. Header là `td`, không phải `th`, nên mất ngữ nghĩa bảng.
- **Mỗi event chiếm 2 dòng**: dòng 1 là acronym kèm link và tên đầy đủ; dòng 2 là When/Where/Deadline.
- Deadline có thể kèm deadline cũ trong ngoặc, ví dụ "Oct 7, 2026 (Oct 1, 2026)". **Không có countdown.**
- 20 event mỗi trang. Pagination dạng chữ "first | previous | Page 1 | next | last", trang cuối là `page=458`.
- Nguồn: [WikiCFP category CS](http://www.wikicfp.com/cfp/call?conference=computer%20science).

**Search.**
- Form GET với `q` và `year` (2026 / 2027 / 2026+ / all).
- Kết quả gồm 2 khối: "Matched Categories" và "Matched Call For Papers", cùng 4 cột như trên, không phân trang ([search "software engineering"](http://www.wikicfp.com/cfp/servlet/tool.search?q=software+engineering&year=t)).
- **Empty state chỉ còn heading 'Matched Call For Papers for "…"' rồi đến footer, không có câu "no results"** ([search vô nghĩa](http://www.wikicfp.com/cfp/servlet/tool.search?q=xqzvbnmplk&year=t)).

**Trang chi tiết.** Có bảng tóm tắt th/td gồm When, Where, Submission Deadline, Final Version Due, tiếp theo là Categories và phần text CFP tự do ([IEEE-ICCEIC 2026](http://www.wikicfp.com/cfp/servlet/event.showcfp?eventid=201537&copyownerid=182680)).

**Loading và error.** Không có spinner hay skeleton vì trang render phía server. Trang 404 chưa được thử [chưa xác minh].

**Điểm mạnh:**
- Mô hình dữ liệu đúng nhu cầu người nộp bài: acronym, deadline và nhiều mốc deadline.
- Danh sách sắp theo deadline.
- URL GET đơn giản.

**Điểm yếu:**
- Không responsive.
- Mỗi event chiếm 2 dòng nên khó quét.
- Empty state im lặng.
- Không có múi giờ hay countdown.
- Header bảng không phải `th`.

### 3.5 ConferenceIndex: Bootstrap 4 mặc định, empty state "kiểu Google"

**Layout và màu.**
- Body dùng system font stack 16px, line-height 24px, chữ **#212529**, link **#007BFF**.
- Container **1140px**. Trang category chia `col-md-3` (sidebar "Discipline", 285px) và `col-md-9` (855px).
- Breakpoint chuẩn Bootstrap 4 (576 / 768 / 992 / 1200).
- Nút "Submit Your Event for FREE" màu #28A745. Badge đếm `badge-info` #17A2B8.
- h3 "CREATE YOUR ACCOUNT" màu hồng #E74E84.
- Nguồn: [ConferenceIndex home](https://conferenceindex.org/), [ConferenceIndex CS](https://conferenceindex.org/conferences/computer-science).
- **Meta viewport có `user-scalable=no, maximum-scale=1`, tức là chặn zoom**, điểm trừ về accessibility ([home](https://conferenceindex.org/)).

**List.**
- **Không có bảng.** Mỗi event là một `<li>` "Oct 08 Tên sự kiện (ACRONYM) - City, Country", nhóm dưới header tháng `card-header`.
- Không có deadline trên listing.
- Pagination Bootstrap "‹ 1 2 … 8 ›" (`?page=2`), trang hiện tại nền #007BFF. Trang 1 có khoảng 500 link event.
- Nguồn: [ConferenceIndex CS](https://conferenceindex.org/conferences/computer-science).

**Filter.** Không có UI filter. Lọc bằng URL facet `/conferences/{tag}/{country}` ([home](https://conferenceindex.org/)).

**Search và empty state.**
- Search GET `query`, render phía server.
- Empty state gồm hai khối ([search vô nghĩa](https://conferenceindex.org/search?query=xqzvbnmplk)):
  - `alert-danger` (nền #F8D7DA, chữ #721C24): "Your search - xqzvbnmplk - did not match any results.";
  - `alert-info` (nền #D1ECF1, chữ #0C5460) với các gợi ý chính tả.
- Lỗi nhỏ: H1 vẫn ghi "Xqzvbnmplk Events" dù không có kết quả nào.
- Dùng màu đỏ "danger" cho tình huống không có kết quả là sai sắc thái, vì đây không phải lỗi.

**Trang chi tiết.**
- Có badge "This event is expired!", tab Description/Organization và tag.
- Deadline ghi **"Submission deadline: Not listed"**.
- Có lỗi dữ liệu: Location ghi "Tokyo, Japan" nhưng venue là "Hearton Hotel Kyoto".
- Nguồn: [detail ICCSIS](https://conferenceindex.org/event/international-conference-on-computer-science-and-intelligence-systems-iccsis-2026-september-tokyo-jp). Màu badge expired [chưa xác minh].

**Mobile.** Ở 390px không cuộn ngang, có hamburger. Vị trí sidebar trên mobile [chưa xác minh].

**Điểm mạnh:**
- URL sạch, tốt cho SEO.
- Nhóm theo tháng dễ quét.
- Empty state có gợi ý.
- Có badge "expired".

**Điểm yếu:**
- Không có deadline trên listing.
- Không có UI filter.
- Taxonomy phẳng và trùng lặp ("Alzheimer's Disease" / "Alzheimers") ([disciplines](https://conferenceindex.org/disciplines)).
- Chặn zoom.

### 3.6 Conference Alerts: bộ lọc thời gian tương đối tốt, giao diện không nhất quán

Site đang chạy **hai thế hệ template song song**.

**Template mới (home, search).**
- Bootstrap **5.3.8**, `system-ui` 16px, chữ #212529, primary **#0D6EFD**. Container 1140px.
- h1 48px/700. h3 màu **#5899D1**. Màu chữ chiếm đa số là #6C757D.
- Nguồn: [Conference Alerts home](https://conferencealerts.com/).

**Template cũ (listing theo quốc gia).**
- Bootstrap **3.4.1**, "Helvetica Neue" 14px, chữ #333333, link **#337AB7**. Container 1170px.
- Danh sách là bảng 1 cột không header.
- Nguồn: [Country Vietnam](https://conferencealerts.com/country-listing?country=Vietnam).

**Badge mode (hình thức tổ chức).** Màu khác nhau giữa hai template. Ví dụ in-person là #0DCAF0 ở template mới nhưng #43ADCA ở template cũ.

| Template | ONLINE | IN-PERSON | ONLINE AND IN-PERSON | Nguồn |
|---|---|---|---|---|
| Mới (BS5) | `bg-success` #198754, chữ trắng | `bg-info` #0DCAF0, chữ #212529 | `bg-warning` #FFC107, chữ #212529 | [Search "software"](https://conferencealerts.com/search?q=software) |
| Cũ (BS3) | #008000 | #43ADCA | #D4A15C | [Country Vietnam](https://conferencealerts.com/country-listing?country=Vietnam) |

**Search và filter.**
- Tham số đúng là **`q`**. Ghi chú cũ đoán `searchTerm` là sai.
- Advanced search có các trường `when` (Any time / Next 30 days / Next 90 days / Next 12 months), `mode`, `countryId`, `city`, `eventTypeId`, `date_from`, `date_to` ([Advanced search](https://conferencealerts.com/advanced-search)).
- **Filter "When" theo khoảng tương đối và filter Mode** là hai filter đáng học nhất cho đối tượng sinh viên.

**Kết quả search.**
- Dòng "**295** events found", nhóm theo tháng bằng `h2.h5`.
- Mỗi dòng gồm ngày ("9th"), tên, thành phố và badge mode. Không thấy pagination ([search "software"](https://conferencealerts.com/search?q=software)).
- Listing quốc gia có pagination "1" và "All" (`ipp=All`), trang hiện tại nền #59ACFF ([Country Vietnam](https://conferencealerts.com/country-listing?country=Vietnam)).

**Empty state.** "0 events found" kèm `alert-light`: *"No events matched your search. Try changing the search term or filters."* ([search vô nghĩa](https://conferencealerts.com/search?q=xqzvbnmplk)). Trang topic "Computer Science" lại trả về "There are no events matching the search criteria", vì taxonomy không khớp ([Topic CS](https://conferencealerts.com/topic-listing?topic=Computer%20Science)).

**Trang chi tiết.**
- Deadline chỉ là text "Deadline for abstracts/proposals: 20th July 2026". Không có countdown hay múi giờ.
- Có link Google Calendar.
- Event đã quá hạn nộp vẫn được quảng bá trên spotlight homepage.
- Nguồn: [show-event 277667](https://conferencealerts.com/show-event?id=277667).

**Điểm mạnh:**
- Filter When/Mode/Country/Type rất thực dụng.
- Có legend giải thích badge.
- Có nút Google Calendar.

**Điểm yếu:**
- Hai template lệch màu nhau, ví dụ cụ thể cho lỗi về tính nhất quán.
- Banner ảnh có alt rỗng.
- Có quảng cáo, cookie banner chỉ có nút Accept.
- Không có deadline trên list.

### 3.7 ICORE (CORE) portal: bảng sort được nhưng rank không có màu

Mọi số liệu dưới đây đo trên trang kết quả [ICORE search "software"](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1).

**Layout.**
- Lưới 960 cố định. **Không có meta viewport, 0 @media**. Trên mobile cả trang bị thu nhỏ.
- Hộp tóm tắt nổi bên phải: "ICORE2026 Summary: A* - 7.52% of 825 ranked venues, A - 13.09%, B - 30.18%, … C - 46.18%".
- `<title>` rỗng.

**Màu và font.**
- Body Helvetica Neue 13px, chữ #333333, **nền trang #E6E6E6**, khung nội dung trắng.
- h2 dùng font serif Goudy Old Style, màu #616364.
- Link **#0464AD**.

**Bảng.**
- 9 cột: **Title | Acronym | Source | Rank | Note | DBLP | Primary FoR | Comments | Average Rating**.
- `th` chữ #003399, border-bottom 2px #6678B1.
- Dòng xen kẽ **#F5DEB3** (wheat) và trắng, hover **#ADD8E6**. Cả dòng bấm được.
- **Ô Rank là chữ thường, không có badge hay màu.**

**Sort.** Mỗi header là `javascript:sortField('dtitle'…)`, submit lại form và tải lại trang. Tiền tố `a`/`d` cho tăng/giảm dần.

**Pagination.** Dòng "**Showing results 1 - 50 of 65**", page size 50, số trang gọi `jumpPage()`.

**Form search.** `search`, `by` (All/Title/Acronym/Rank/FoR), `source` (ICORE2026 … CORE2008), các nút Search và Export.

**Empty state.** Chỉ có "**0 Results found.**" ([ICORE search vô nghĩa](https://portal.core.edu.au/conf-ranks/?search=xqzzvbnmq&by=all&source=all&sort=atitle&page=1)). Trang lỗi khi ID không tồn tại [chưa xác minh].

**Định nghĩa hạng CORE** (dùng cho tooltip badge, [CORE Conference Portal page](https://www.core.edu.au/conference-portal)):
- A* "flagship conference, a leading venue in a discipline area";
- A "excellent conference";
- B "good to very good conference";
- C "meet basic standards for peer reviewed venues".

ICORE 2026 coi National/Regional "equivalent to B or C" ([ICORE 2026 updates](https://www.core.edu.au/icore-portal/icore-portal-2026-rankings-updates)).

**Điểm mạnh:**
- Bảng dày thông tin, sort được, có số đếm "1 - 50 of 65".
- Hộp phân bố rank rẻ mà hữu ích.
- Lịch sử rank qua nhiều vòng.

**Điểm yếu:**
- Filter rank và FoR bị gộp vào "Search by", nên không lọc kết hợp được.
- Rank không có màu, khó quét bằng mắt.
- Không responsive.
- Sort làm tải lại toàn trang.
- `<title>` rỗng.

---

## 4. Thư viện 15 design pattern

Mỗi pattern gồm các mục: vấn đề giải quyết; site đang dùng (kèm nguồn); khi nào nên và không nên dùng; mức ưu tiên cho đồ án; minh hoạ (link trang thật, ảnh công khai nếu có, link thư viện pattern, vị trí nên chụp và phác thảo ASCII). Ảnh công khai duy nhất trong cả nhóm site là hai ảnh README của ccfddl. Với các pattern khác, người đọc cần tự chụp theo mô tả vị trí.

### P1. Card ưu tiên deadline, countdown thích ứng — **Bắt buộc**
- **Vấn đề:** người nộp bài cần biết ngay "còn bao lâu và cho mốc nào". Các site event-alert lại đặt ngày tổ chức lên trước.
- **Site dùng:** ccfddl (loại deadline + "in 39d 2h" + giờ tuyệt đối) ([screenshot](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png)); HF (dòng AlarmClock) ([ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)). Ví dụ ngược: ConferenceIndex và Conference Alerts không có deadline trên list ([ConferenceIndex CS](https://conferenceindex.org/conferences/computer-science)).
- **Dùng khi** người dùng chính là tác giả nộp bài. **Không dùng** cho trang chỉ để tra rank (kiểu ICORE), nơi acronym + rank mới là thông tin chính.
- **Minh hoạ:** trang [ccfddl.com](https://ccfddl.com/). Chụp góc trên bên phải của bất kỳ card nào trong hàng đầu tiên của grid, chỗ có chữ "in …d …h" màu xanh hoặc cam. Ảnh công khai: [screenshot_website.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png). Tham khảo thêm [Cloudscape Timestamps](https://cloudscape.design/patterns/general/timestamps/) (ghép thời gian tương đối với thời gian tuyệt đối có UTC offset).
```
┌──────────────────────────────┐
│ ICSE 2027        [CORE A*]   │
│ Nộp bài toàn văn  [Còn 5 ngày]│ ← màu + chữ
│ 23:59 30/06/2026 AoE (UTC−12)│
│ = 18:59 01/07/2026 giờ VN    │
│ [Thành phố] · Offline        │
└──────────────────────────────┘
```

### P2. Thang màu độ khẩn kèm nhãn chữ — **Bắt buộc**
- **Vấn đề:** chỉ có con số thì người dùng không cảm nhận được mức độ gấp. Chỉ có màu thì vi phạm WCAG 1.4.1.
- **Site dùng:** ccfddl <3 / <7 / <30 ngày, đỏ / cam / xanh ([countdown.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/countdown.rs)); HF ≤7 / ≤30 ngày ([ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)). aideadlin.es và sec-deadlines không có ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js)).
- **Dùng** ở mọi chỗ hiển thị countdown. **Không dùng** cho rank, vì rank không phải mức khẩn.
- **Minh hoạ:** [ccfddl.com](https://ccfddl.com/). So sánh màu countdown giữa card gần hạn và card xa hạn trong hàng đầu. Chuẩn tham khảo: [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [GOV.UK Tag](https://design-system.service.gov.uk/components/tag/) (đỏ cho "Urgent" nhưng không chỉ dùng màu), [Atlassian Lozenge](https://atlassian.design/components/lozenge/usage) (màu + nhãn + icon).
```
[! Còn 2 ngày]  [Còn 6 ngày]  [Còn 21 ngày]  [Còn 64 ngày]  [Đã hết hạn]
  đỏ             cam            xanh dương     xanh lá        xám
```

### P3. Ghi rõ AoE và quy đổi sang giờ địa phương — **Bắt buộc**
- **Vấn đề:** "23:59 AoE" thực chất là **11:59 UTC ngày hôm sau, tức 18:59 giờ Việt Nam ngày hôm sau** ([IEEE 802.16 AoE](https://www.ieee802.org/16/aoe.html); phép tính trong Node: `2026-11-15T23:59:59-12:00` → `2026-11-16T11:59:59Z`). Sinh viên rất dễ nhầm sớm hoặc muộn một ngày.
- **Site dùng:**
  - conf.researchr đặt tiêu đề box là "Important Dates AoE (UTC-12h)" và ghi "All dates are 23:59:59 AoE (UTC-12h)" ([ICSE 2027 Research Track](https://conf.researchr.org/track/icse-2027/icse-2027-research-track));
  - ccfddl hiển thị "(UTC-12)" ([screenshot](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png));
  - sec-deadlines lấy AoE làm mặc định ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js)).
- **Dùng** cho mọi deadline. Nếu nguồn ghi múi giờ khác (PST…) thì hiển thị đúng múi giờ đó.
- **Minh hoạ:** [ICSE 2027 Research Track](https://conf.researchr.org/track/icse-2027/icse-2027-research-track). Chụp box "Important Dates", vị trí cột trên trang [chưa xác minh]. Tham khảo [Cloudscape Timestamps](https://cloudscape.design/patterns/general/timestamps/).
```
Hạn nộp: 23:59 Thứ Ba 30/06/2026 AoE (UTC−12)
         ≙ 18:59 Thứ Tư 01/07/2026 (GMT+7)   ⓘ AoE là gì?
```

### P4. Ẩn deadline đã qua mặc định, có toggle và làm mờ — **Bắt buộc**
- **Vấn đề:** hội nghị đã đóng hạn chiếm chỗ của hội nghị còn mở.
- **Site dùng:**
  - ccfddl ẩn mặc định; khi bật lên thì opacity 0.68 và ghi "Deadline passed" ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css));
  - HF ẩn sau toggle ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx));
  - sec-deadlines để mờ 0.5 ngay trong danh sách ([deadlines.css](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/css/deadlines.css));
  - aideadlin.es chuyển sang mục "Past Events" ([index.html](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/index.html)).
- **Không nên** chỉ làm xám mà không có nhãn chữ. Ghi chú nghiên cứu đề xuất nhãn "Đã hết hạn".
- **Minh hoạ:** [ccfddl.com](https://ccfddl.com/). Bật switch "Show past conferences" ở bên trái, ngay dưới subtitle, rồi cuộn xuống cuối grid để chụp card mờ. Một chỗ khác là [sec-deadlines.github.io](https://sec-deadlines.github.io/): cuộn xuống phần các dòng mờ.
```
[✓] Hiện hội nghị đã hết hạn
┌──────────────┐  (opacity .6)
│ NeurIPS 2025 │
│ Đã hết hạn   │
└──────────────┘
```

### P5. Lưu trạng thái filter trên URL — **Bắt buộc**
- **Vấn đề:** người dùng cần chia sẻ hoặc bookmark kết quả lọc, và nút Back phải khôi phục được bộ lọc.
- **Site dùng:**
  - aideadlin.es `?sub=ML,CV` ([utils.js](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/_includes/utils.js));
  - sec-deadlines `?domain=…&rank=A*` ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js));
  - HF `?tags=&countries=` ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx));
  - ICORE dùng form GET `search/by/source/sort/page` ([ICORE](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1)).
  - ccfddl chỉ lưu localStorage nên không chia sẻ được ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)).
- **Cơ sở:** Baymard khuyên dùng `pushState` để Back hoạt động đúng ([Smashing/Baymard](https://smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons)). GOV.UK yêu cầu đưa về trang 1 khi đổi filter ([GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)). Lưu ý: không tìm thấy nguồn nào phát biểu "filter state phải nằm trên URL" như một quy tắc độc lập [chưa xác minh].
- **Minh hoạ:** mở [aideadlin.es/?sub=NLP](https://aideadlin.es/?sub=NLP), chụp thanh địa chỉ cùng dropdown "Subject Filter" dưới h1.
```
/?q=icse&rank=A*&rank=A&format=hybrid&sort=deadline&page=2
```

### P6. Nhóm filter: checkbox OR trong nhóm, AND giữa nhóm — **Bắt buộc**
- **Vấn đề:** cần lọc kết hợp nhiều chiều, ví dụ "AI và (CORE A* hoặc A) và Hybrid". ICORE gộp hết vào "Search by" nên không làm được.
- **Site dùng:** sec-deadlines có 3 nhóm checkbox ([filters.yml](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/_data/filters.yml)); ccfddl có chip lĩnh vực và dropdown rank đa chọn ([conference_controls.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/conference_controls.rs)); Conference Alerts có When / Mode / Country / Type ([Advanced search](https://conferencealerts.com/advanced-search)).
- **Dùng sidebar** khi có hơn khoảng 6–8 loại filter. Horizontal toolbar chỉ hợp khi có ≤8 loại ([Baymard Horizontal Filtering](https://baymard.com/research-articles/horizontal-filtering-sorting-design)). Nên hiện số đếm cạnh mỗi giá trị ([NN/g Applying Filters](https://www.nngroup.com/articles/applying-filters/)). **Mobile:** dùng tray trượt từ phải, có nút Áp dụng ([NN/g Mobile Faceted Search](https://www.nngroup.com/articles/mobile-faceted-search/)).
- **Minh hoạ:** [sec-deadlines.github.io](https://sec-deadlines.github.io/), chụp 3 hàng checkbox có emoji ngay dưới `<hr>` đầu tiên. Pattern a11y: [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
```
▾ Xếp hạng CORE        ▾ Hình thức
  [x] A* (12)            [ ] Online (8)
  [x] A  (31)            [ ] Offline (40)
  [ ] B  (27)            [x] Hybrid (15)
```

### P7. Chip filter đang áp dụng và "Xoá tất cả" — **Nên có**
- **Vấn đề:** người dùng quên mình đang lọc gì, rồi tưởng là không có dữ liệu.
- **Site dùng:** không site nào trong nhóm có. ccfddl chỉ highlight tag khớp filter ngay trên card ([styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css)).
- **Cơ sở:** Baymard cho biết 28% site không có phần tổng hợp filter đang áp dụng, và khuyên "always display applied filters". Mỗi chip phải gỡ được trực tiếp ([Baymard Applied Filters](https://baymard.com/research-articles/how-to-design-applied-filters)).
- **Minh hoạ:** chưa có trang thật trong nhóm. Xem ảnh minh hoạ trong bài Baymard ở trên.
```
128 hội nghị · [AI ×] [CORE A* ×] [Hybrid ×]  Xoá tất cả
```

### P8. Search tức thì theo tên/acronym, có debounce — **Bắt buộc**
- **Vấn đề:** người dùng thường đã biết tên hội nghị cần tìm (ICSE, NeurIPS).
- **Site dùng:** ccfddl lọc ngay khi gõ trên id/title ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)); HF đặt search ở header ([Header.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/Header.tsx)). Ngược lại, sec-deadlines và aideadlin.es không có search ([aideadlin.es](https://aideadlin.es/)).
- **Cơ sở:** đặt search ở đầu trang, đủ rộng để thấy cả query ([NN/g Search Visible](https://www.nngroup.com/articles/search-visible-and-simple/)). Autocomplete là tuỳ chọn; nếu làm thì theo [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- **Minh hoạ:** [HF Space](https://huggingface.co/spaces/huggingface/ai-deadlines), chụp ô "Search conferences..." trong header trắng.
```
[🔍 Tìm theo tên hoặc viết tắt (vd: ICSE)…        ] [×]
```

### P9. Badge trạng thái/rank (không bấm được) tách khỏi chip lĩnh vực (bấm được) — **Nên có**
- **Vấn đề:** HF cho tag vừa là nhãn vừa là nút ([index.css](https://github.com/huggingface/ai-deadlines/blob/main/src/index.css)). Rank trên ccfddl và ICORE không có màu, nên khó phân biệt A* với C ([ccfddl styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css), [ICORE](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1)).
- **Site dùng tham khảo:** badge mode của Conference Alerts có legend giải thích ([Country Vietnam](https://conferencealerts.com/country-listing?country=Vietnam)); badge "This event is expired!" của ConferenceIndex ([detail ICCSIS](https://conferenceindex.org/event/international-conference-on-computer-science-and-intelligence-systems-iccsis-2026-september-tokyo-jp)).
- **Cơ sở:** GOV.UK Tag phải non-interactive, dùng tính từ ([GOV.UK Tag](https://design-system.service.gov.uk/components/tag/)). Atlassian quy định Lozenge dùng cho trạng thái, Tag dùng cho metadata, viết sentence case ([Atlassian Lozenge](https://atlassian.design/components/lozenge/usage)). CORE/CCF không quy định màu chính thức, nên màu badge là lựa chọn thiết kế của đồ án ([CORE](https://www.core.edu.au/conference-portal)).
- **Minh hoạ:** [Conference Alerts search "software"](https://conferencealerts.com/search?q=software), chụp một dòng kết quả có pill ONLINE / IN-PERSON ở cuối dòng.
```
Badge (span):  [CORE A*] [CCF A] [Hybrid]
Chip (button): (AI) (Software Engineering)  ← có viền, hover, focus ring
```

### P10. Chuyển đổi Card ↔ Bảng — **Nên có**
- **Vấn đề:** card dễ duyệt nhưng khó so sánh. NN/g nhận định card "less appropriate than lists when people search for information" ([NN/g Cards](https://www.nngroup.com/articles/cards-component/)).
- **Site dùng:** ccfddl có "switch UI" và `/?view=table` ([home.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/pages/home.rs)); WikiCFP và ICORE chỉ có bảng ([WikiCFP](http://www.wikicfp.com/cfp/call?conference=computer%20science)).
- **Không dùng bảng trên mobile.** Nếu stack bảng thành card bằng CSS `display` thì có thể mất ngữ nghĩa bảng; cần thêm ARIA role ([Roselli: Tables & CSS display](https://adrianroselli.com/2018/02/tables-css-display-properties-and-aria.html)). Tham khảo thêm [NN/g Mobile Tables](https://www.nngroup.com/articles/mobile-tables/).
- **Minh hoạ:** [ccfddl.com/?view=table](https://ccfddl.com/?view=table), chụp toàn bảng. Ảnh công khai: [screenshot_tabular.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_tabular.png).
```
Hiển thị: [▦ Thẻ] [☰ Bảng]
```

### P11. Header bảng sort được, dùng `aria-sort` — **Nên có**
- **Vấn đề:** cần sắp theo deadline, tên hoặc rank. ICORE sort bằng `javascript:` link và tải lại cả trang ([ICORE](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1)).
- **Cơ sở:** đặt `<button>` trong `<th>`, `aria-sort` chỉ trên cột đang sort, mũi tên ▲▼ có `aria-hidden` ([APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)). Thêm live region tuỳ chọn vì NVDA không đọc thay đổi sort ([Roselli Sortable Columns](https://adrianroselli.com/2021/04/sortable-table-columns.html)). Carbon có 3 trạng thái icon sort ([Carbon Data table](https://carbondesignsystem.com/components/data-table/usage/)). Sort mặc định của đồ án là "deadline gần nhất"; đây là suy luận, chưa được kiểm chứng bằng nghiên cứu cho CFP ([Baymard Default Sort](https://baymard.com/research-articles/default-sort-type)).
- **Minh hoạ:** [ICORE search "software"](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1), chụp hàng header (chữ #003399, gạch dưới #6678B1) và hai dòng đầu (wheat/trắng). Demo sống: [APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).
```
| Hội nghị ♢ | Deadline ▲ | Rank ♢ | Địa điểm | Hình thức |
```

### P12. Phân trang có số, ghi rõ khoảng đang xem — **Bắt buộc**
- **Vấn đề:** danh sách hàng trăm mục. Infinite scroll gây khó tìm lại vị trí và không tới được footer ([NN/g Infinite Scrolling](https://www.nngroup.com/articles/infinite-scrolling-tips/)).
- **Site dùng:**
  - ccfddl 12 mục/trang ([showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs));
  - WikiCFP 20 mục/trang ([WikiCFP](http://www.wikicfp.com/cfp/call?conference=computer%20science));
  - ICORE 50 mục/trang với "Showing results 1 - 50 of 65" ([ICORE](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1));
  - Research.com dùng "Page 1, items 1-100" ([Research.com CS](https://research.com/conference-rankings/computer-science)).
- **Cơ sở:** `<nav aria-label>`, `aria-current="page"`, ẩn pagination khi chỉ có một trang, và ghi số trang vào `<title>` ([GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)).
- **Minh hoạ:** ICORE, chụp dòng "Showing results…" ở trên bảng và dãy số trang ở dưới bảng.
```
Hiển thị 13–24 / 128 hội nghị
‹ Trước  1  [2]  3  …  11  Sau ›
```

### P13. Empty state có giải thích và hành động — **Bắt buộc**
- **Vấn đề:** gặp trang trắng, người dùng nghĩ site hỏng.
- **Site dùng:**
  - Tốt: HF với hộp amber chỉ cách sửa ([Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx)); Conference Alerts với "Try changing the search term or filters" ([search](https://conferencealerts.com/search?q=xqzvbnmplk)); ConferenceIndex với gợi ý ([search](https://conferenceindex.org/search?query=xqzvbnmplk)).
  - Kém: WikiCFP ([search](http://www.wikicfp.com/cfp/servlet/tool.search?q=xqzvbnmplk&year=t)), sec-deadlines ([main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js)), ICORE "0 Results found." ([ICORE](https://portal.core.edu.au/conf-ranks/?search=xqzzvbnmq&by=all&source=all&sort=atitle&page=1)), ccfddl không có hành động nào.
- **Cơ sở:**
  - "Search tips alone are insufficient"; nên đưa ra đường thoát như category liên quan hoặc query đơn giản hơn ([Baymard No Results](https://baymard.com/blog/no-results-page)).
  - Không hiện "không có kết quả" khi dữ liệu vẫn đang tải ([NN/g Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)).
  - Thay toàn bộ vùng nội dung, không để lại header bảng ([Carbon Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)).
  - Thông báo số kết quả bằng `role="status"` ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).
- **Minh hoạ:** [HF Space](https://huggingface.co/spaces/huggingface/ai-deadlines). Bỏ chọn category cho đến khi không còn kết quả, rồi chụp hộp amber ở đầu `<main>`.
```
┌───────────────────────────────────────────────┐
│ Không có hội nghị nào khớp "xqzv" + CORE A*   │
│ Thử: bỏ bớt bộ lọc · bật "Hiện đã hết hạn"    │
│ [Xoá tất cả bộ lọc]   Gợi ý: AI (42) · SE (31) │
└───────────────────────────────────────────────┘
```

### P14. Loading bằng skeleton, Error có nút "Thử lại" — **Bắt buộc**
- **Vấn đề:** fetch JSON có thể chậm hoặc lỗi.
- **Site dùng:** ccfddl có `role="status"`, watchdog 30 giây và nút Retry ([index.html](https://github.com/ccfddl/ccf-deadlines/blob/main/index.html), [showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs)). allconferencealert hiện "Something went wrong. Please try again." ([allconferencealert](https://www.allconferencealert.com/)). Các site còn lại không có loading state.
- **Cơ sở:**
  - Dưới 1 giây thì không cần chỉ báo. Từ khoảng 2 đến 10 giây, dùng skeleton cho tải toàn trang ([NN/g Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/), [NN/g Response Times](https://www.nngroup.com/articles/response-times-3-important-limits/)).
  - Chỉ dùng skeleton cho card/bảng, không dùng cho nút ([Carbon Loading](https://carbondesignsystem.com/patterns/loading-pattern/)).
  - Tắt hiệu ứng shimmer khi `prefers-reduced-motion` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
- **Minh hoạ:** [ccfddl.com](https://ccfddl.com/). Dùng DevTools đặt Network ở chế độ "Slow 3G", tải lại trang và chụp khối "Loading conference deadlines..." ở giữa màn hình.
```
┌──────────┐ ┌──────────┐     ┌──────────────────────────────┐
│ ▓▓▓▓▓    │ │ ▓▓▓▓▓    │     │ Không tải được dữ liệu.      │
│ ▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓ │     │ Kiểm tra mạng rồi thử lại.   │
│ ▓▓▓      │ │ ▓▓▓      │     │ [Thử lại]                    │
└──────────┘ └──────────┘     └──────────────────────────────┘
```

### P15. Thêm vào lịch (.ics và Google Calendar) — **Tùy chọn**
- **Vấn đề:** người dùng muốn được nhắc trước khi hết hạn.
- **Site dùng:** aideadlin.es có widget add-to-calendar ouical ([head.html](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/_includes/head.html)); Conference Alerts có link Google Calendar ([show-event 277667](https://conferencealerts.com/show-event?id=277667)); sec-deadlines có feed iCal theo chủ đề ([index.html](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/index.html)).
- **Cơ sở:** file .ics theo RFC 5545 dùng CRLF, gập dòng ở 75 octet, giờ UTC có hậu tố "Z" ([RFC 5545](https://www.rfc-editor.org/rfc/rfc5545)). Tham số của link Google Calendar lấy từ tài liệu cộng đồng, Google không công bố chính thức ([add-event-to-calendar-docs](https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md)).
- **Minh hoạ:** [Conference Alerts show-event 277667](https://conferencealerts.com/show-event?id=277667), chụp khối CTA gần dòng "Deadline for abstracts/proposals".
```
[📅 Google Calendar]  [⬇ Tải .ics]
```

---

## 5. Đề xuất thiết kế cho đồ án

Toàn bộ mục này là **[Đề xuất]**. Mỗi chỗ dựa vào số liệu cụ thể đều ghi nguồn. Ràng buộc: chỉ HTML + CSS + TypeScript, không UI framework, không CSS framework.

### 5.1 Layout và breakpoint

Breakpoint đặt theo nội dung, dùng đơn vị `rem` để tôn trọng cỡ chữ người dùng chọn ([ghi chú nghiên cứu, tham chiếu Bootstrap 576/768/992/1200](https://getbootstrap.com/docs/5.3/layout/breakpoints/)):

| Tên | Khoảng | Trang danh sách | Trang chi tiết |
|---|---|---|---|
| Mobile | < 40rem (640px) | 1 cột card. Nút "Bộ lọc (3)" mở `<dialog>` tray từ phải, có nút "Áp dụng" và số kết quả luôn hiện. Search full-width dưới header. | 1 cột. Box "Các mốc quan trọng" nằm ngay dưới tiêu đề. |
| Tablet | 40–64rem | Grid card 2 cột. Filter vẫn nằm trong tray. Thanh công cụ (sort, view) ở 1 hàng. | 1 cột, timeline rộng hơn. |
| Desktop | ≥ 64rem (1024px) | Sidebar filter `minmax(15rem,18rem)` sticky, cùng vùng kết quả. Card 2–3 cột theo `auto-fill`, có thể chuyển sang Bảng. | 2 cột: nội dung chính (≈2fr) và sidebar sticky "Countdown + Các mốc + CTA" (≈1fr). |
| Wide | ≥ 80rem | Giới hạn `max-width: 80rem`, căn giữa. | Như desktop. |

Grid card dùng `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))` ([MDN repeat()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat)). Container query (`container-type: inline-size`) đã chạy trên mọi engine từ Chrome 105, Firefox 110, Safari 16, nên dùng được để card tự chuyển sang dạng "hàng ngang" khi vùng kết quả rộng ([BCD container](https://github.com/mdn/browser-compat-data/blob/main/css/at-rules/container.json)). Thêm `scroll-padding-top` để header sticky không che phần tử đang focus (WCAG 2.4.11) ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)).

**Trang tuỳ chọn, chọn 1 trong 2:**
- **Đã lưu (Favorites):** đọc danh sách id từ localStorage và tái dùng ConferenceCard. Empty state có hướng dẫn kiểu "Bấm ☆ trên thẻ hội nghị để lưu vào đây" ([NN/g Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)).
- **Lịch deadline:** danh sách nhóm theo tháng (học từ ConferenceIndex và Conference Alerts, [ConferenceIndex CS](https://conferenceindex.org/conferences/computer-science)), mỗi ngày có mốc thì hiện chấm màu urgency kèm số lượng. Bản tối giản hơn cả lưới lịch: `<section>` cho từng tháng, `<ol>` cho các ngày. Đây là cách dễ làm accessible hơn so với một lưới 7×6.

### 5.2 Bảng màu

Tất cả tỷ lệ tương phản đều được **tính** bằng công thức relative luminance của WCAG, ngưỡng 0.04045, không làm tròn ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). Có hai nguồn:
- **(N)**: số trong ghi chú nghiên cứu;
- **(T)**: tôi tính bổ sung bằng chính script trong ghi chú, cho những cặp màu ghi chú chưa có.

Ngưỡng AA: chữ thường 4.5:1, chữ lớn và thành phần UI 3:1.

**Light theme**

| Vai trò | Token | HEX | Cặp kiểm tra | Tỷ lệ | Kết quả |
|---|---|---|---|---|---|
| Nền trang | `--color-bg` | #f8fafc | — | — | — |
| Bề mặt card | `--color-surface` | #ffffff | — | — | — |
| Chữ chính | `--color-text` | #0f172a | trên #ffffff / trên #f8fafc | 17.85 (N) / 17.06 (T) | AAA |
| Chữ phụ | `--color-text-muted` | #475569 | trên #ffffff / trên #f8fafc | 7.58 (N) / 7.24 (T) | AAA / AA |
| Primary (link, nút) | `--color-primary` | #1d4ed8 | trên #ffffff / trên #f8fafc; chữ #fff trên nền nút | 6.70 (N) / 6.41 (T); 6.70 (N) | AA |
| Primary hover / heading | `--color-primary-strong` | #0a3d91 | trên #ffffff / trên #f8fafc | 10.05 (N) / 9.61 (T) | AAA |
| Secondary (chip trung tính) | `--color-secondary-fg` / `-bg` | #334155 / #f1f5f9 | chữ trên nền | 9.45 (T) | AAA |
| Viền control (input, checkbox) | `--color-border-control` | #64748b | so với #ffffff | 4.76 (N) | Đạt 3:1 (1.4.11) |
| Viền trang trí | `--color-border` | #e2e8f0 | chỉ dùng trang trí, không mang nghĩa | — | — |
| Success (chữ) | `--color-success` | #15803d | trên #ffffff / trên #f8fafc | 5.02 (N) / 4.79 (T) | AA |
| Warning (chữ) | `--color-warning` | #b45309 | trên #ffffff / trên #f8fafc | 5.02 (N) / 4.80 (T) | AA |
| Danger (chữ) | `--color-danger` | #b91c1c | trên #ffffff / trên #f8fafc | 6.47 (N) / 6.18 (T) | AA |

Cần tránh (theo (N)): placeholder #94a3b8 trên trắng chỉ đạt 2.56 (FAIL, vì placeholder không được miễn); viền #cbd5e1 chỉ đạt 1.48 (FAIL nếu là dấu hiệu duy nhất nhận biết input); chữ amber-500 #f59e0b chỉ đạt 2.15 (FAIL). Vì vậy **placeholder dùng `--color-text-muted`**.

**Các mức urgency của deadline** (badge = chữ đậm trên nền nhạt, luôn có nhãn chữ và icon theo WCAG 1.4.1). Ngưỡng ngày kết hợp ccfddl (3/7/30) và HF (7/30) ([countdown.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/countdown.rs), [ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx)). Riêng mức "Sắp tới" tôi tách thành màu xanh dương thay cho xanh lá như ccfddl, để xanh lá chỉ còn nghĩa "còn thoải mái".

| Mức | Điều kiện | Nhãn mẫu | Chữ / Nền | Tỷ lệ |
|---|---|---|---|---|
| `critical` | < 3 ngày | "! Còn 2 ngày 4 giờ" | #991b1b / #fef2f2 | 7.60 (N) |
| `soon` | < 7 ngày | "Còn 6 ngày" | #92400e / #fffbeb | 6.84 (N) |
| `upcoming` | < 30 ngày | "Còn 21 ngày" | #1e40af / #eff6ff | 8.01 (T) |
| `open` | ≥ 30 ngày | "Còn 2 tháng" | #166534 / #f0fdf4 | 6.81 (T) |
| `closed` | đã qua | "Đã hết hạn" + card opacity .6 | #334155 / #f1f5f9 | 9.45 (T) |
| `tba` | chưa công bố | "Chưa công bố" | #334155 / #f1f5f9 | 9.45 (T) |

**Dark theme** (chỉ ghi đè token semantic):

| Vai trò | HEX | Trên nền #0f172a | Trên card #1e293b |
|---|---|---|---|
| Chữ chính | #f1f5f9 | 16.30 (N) | 13.35 (T) |
| Chữ phụ / viền control | #94a3b8 | 6.96 (N) | 5.71 (N) |
| Primary | #60a5fa | 7.02 (N) | 5.75 (T) |
| Chữ trên nút primary | #0f172a trên #60a5fa | 7.02 (T) | — |
| Danger | #f87171 | 6.45 (N) | 5.29 (T) |
| Warning | #fbbf24 | 10.69 (N) | 8.76 (T) |
| Success | #4ade80 | 10.25 (N) | 8.40 (T) |
| Upcoming (badge) | #93c5fd | — | 8.11 (T) |
| Closed/TBA (badge) | #cbd5e1 | — | 9.85 (T) |

Trong dark mode, badge dùng nền `--color-surface` (#1e293b) với chữ và viền cùng màu urgency. Mọi tỷ lệ ở đây đều là chữ trên #1e293b. Cần tránh trong dark: #64748b trên #0f172a chỉ đạt 3.75 (chỉ dùng cho chữ lớn); viền #334155 so với #0f172a chỉ đạt 1.72 (FAIL nếu là dấu hiệu duy nhất) (N).

### 5.3 Typography

- **Font:** **Be Vietnam Pro** (400 / 500 / 600 / 700) cho UI và heading, kết hợp **JetBrains Mono** (500) chỉ cho chữ số countdown và mã rank. Lý do:
  - cả hai đều khai báo subset `vietnamese` và đủ glyph cho chữ có dấu chồng như ặ, ổ, Ậ ([Be Vietnam Pro METADATA](https://github.com/google/fonts/blob/main/ofl/bevietnampro/METADATA.pb), [JetBrains Mono METADATA](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/METADATA.pb));
  - Be Vietnam Pro do designer Việt Nam thiết kế, hợp bản sắc đồ án;
  - **Be Vietnam Pro và Lexend có chữ số tỷ lệ và không có `tnum`**, nên `tabular-nums` không có tác dụng, countdown sẽ "nhảy". Phải dùng font mono cho phần số ([ghi chú kiểm tra font binary, google/fonts](https://github.com/google/fonts/tree/main/ofl)).
- **Phương án thay thế:** chỉ dùng **Inter** (variable, có `tnum`) cho mọi thứ, kèm `font-variant-numeric: tabular-nums` ([Inter METADATA](https://github.com/google/fonts/blob/main/ofl/inter/METADATA.pb)). Không chọn DM Sans, DM Mono hay Fira Code vì **không có subset tiếng Việt** ([DM Sans](https://github.com/google/fonts/blob/main/ofl/dmsans/METADATA.pb), [Fira Code](https://github.com/google/fonts/blob/main/ofl/firacode/METADATA.pb)). Việc WOFF2 phục vụ từ Google Fonts có giữ `tnum` của Inter hay không vẫn [chưa xác minh]. Kiểm tra bằng cách render "1111" và "0000" rồi so độ rộng.
- **Nạp font:** `display=swap`. Be Vietnam Pro là font static nên phải liệt kê từng weight ([Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2)).
- **Line-height:** body 1.55, heading 1.25. Không dùng `line-height: 1` cho chữ in hoa tiếng Việt vì dấu chồng sẽ bị cắt.
- **Thang cỡ chữ fluid:** 5 bậc, tỷ lệ khoảng 1.2 ở 360px lên khoảng 1.25 ở 1280px, base 15→16px. Các số clamp dưới đây là tính minh hoạ trong ghi chú nghiên cứu, có thể tạo lại bằng [Utopia](https://utopia.fyi/blog/designing-with-fluid-type-scales/).

| Bậc | Token | Giá trị | Dùng cho |
|---|---|---|---|
| −1 | `--step--1` | clamp(0.78rem, 0.76rem + 0.10vw, 0.84rem) | meta, badge |
| 0 | `--step-0` | clamp(0.94rem, 0.91rem + 0.11vw, 1.00rem) | body, bảng |
| 1 | `--step-1` | clamp(1.13rem, 1.07rem + 0.24vw, 1.25rem) | tên trên card, countdown |
| 2 | `--step-2` | clamp(1.35rem, 1.25rem + 0.43vw, 1.56rem) | h2 |
| 3 | `--step-3` | clamp(1.62rem, 1.45rem + 0.73vw, 1.95rem) | h1, countdown lớn ở trang chi tiết |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
```

### 5.4 Design token (dán thẳng vào `src/css/tokens.css`)

Token chia ba tầng: primitive, semantic, component. Đặt tên theo ý nghĩa sử dụng, không theo giá trị. Cách này theo mô hình của [Primer token names](https://primer.style/foundations/primitives/token-names). Kỹ thuật theme dựa trên `color-scheme` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme)) và `data-theme` ([web.dev theme switch](https://web.dev/articles/building/a-theme-switch-component)).

```css
@layer reset, tokens, base, layout, components, pages, utilities;

@layer tokens {
  :root {
    color-scheme: light dark;

    /* ---------- Primitive ---------- */
    --slate-50:#f8fafc; --slate-100:#f1f5f9; --slate-200:#e2e8f0; --slate-400:#94a3b8;
    --slate-500:#64748b; --slate-600:#475569; --slate-700:#334155; --slate-800:#1e293b; --slate-900:#0f172a;
    --blue-50:#eff6ff; --blue-300:#93c5fd; --blue-400:#60a5fa; --blue-700:#1d4ed8; --blue-800:#1e40af; --navy-800:#0a3d91;
    --red-50:#fef2f2; --red-400:#f87171; --red-700:#b91c1c; --red-800:#991b1b;
    --amber-50:#fffbeb; --amber-400:#fbbf24; --amber-700:#b45309; --amber-800:#92400e;
    --green-50:#f0fdf4; --green-400:#4ade80; --green-700:#15803d; --green-800:#166534;

    /* ---------- Semantic (light) ---------- */
    --color-bg: var(--slate-50);
    --color-surface: #ffffff;
    --color-surface-sunken: var(--slate-100);
    --color-text: var(--slate-900);              /* 17.85:1 trên #fff */
    --color-text-muted: var(--slate-600);        /* 7.58:1 trên #fff */
    --color-border: var(--slate-200);            /* chỉ trang trí */
    --color-border-control: var(--slate-500);    /* 4.76:1, đạt 1.4.11 */
    --color-primary: var(--blue-700);            /* 6.70:1 */
    --color-primary-strong: var(--navy-800);     /* 10.05:1 */
    --color-on-primary: #ffffff;
    --color-secondary-fg: var(--slate-700);
    --color-secondary-bg: var(--slate-100);      /* 9.45:1 */
    --color-focus-ring: var(--blue-700);
    --color-success: var(--green-700);
    --color-warning: var(--amber-700);
    --color-danger: var(--red-700);

    /* Deadline urgency: fg / bg / border */
    --urgency-critical-fg: var(--red-800);   --urgency-critical-bg: var(--red-50);   --urgency-critical-border: var(--red-700);
    --urgency-soon-fg: var(--amber-800);     --urgency-soon-bg: var(--amber-50);     --urgency-soon-border: var(--amber-700);
    --urgency-upcoming-fg: var(--blue-800);  --urgency-upcoming-bg: var(--blue-50);  --urgency-upcoming-border: var(--blue-700);
    --urgency-open-fg: var(--green-800);     --urgency-open-bg: var(--green-50);     --urgency-open-border: var(--green-700);
    --urgency-closed-fg: var(--slate-700);   --urgency-closed-bg: var(--slate-100);  --urgency-closed-border: var(--slate-500);

    /* ---------- Typography ---------- */
    --font-sans: "Be Vietnam Pro", "Inter", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;
    --step--1: clamp(0.78rem, 0.76rem + 0.10vw, 0.84rem);
    --step-0:  clamp(0.94rem, 0.91rem + 0.11vw, 1.00rem);
    --step-1:  clamp(1.13rem, 1.07rem + 0.24vw, 1.25rem);
    --step-2:  clamp(1.35rem, 1.25rem + 0.43vw, 1.56rem);
    --step-3:  clamp(1.62rem, 1.45rem + 0.73vw, 1.95rem);
    --leading-body: 1.55; --leading-heading: 1.25;
    --weight-regular: 400; --weight-medium: 500; --weight-semibold: 600; --weight-bold: 700;

    /* ---------- Spacing / radius / shadow / z / motion ---------- */
    --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;
    --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem;
    --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-pill: 999px;
    --shadow-1: 0 1px 2px rgb(15 23 42 / .08);
    --shadow-2: 0 4px 12px rgb(15 23 42 / .12);
    --shadow-overlay: 0 12px 32px rgb(15 23 42 / .20);
    --z-sticky: 100; --z-dropdown: 200; --z-drawer: 300; --z-modal: 400; --z-toast: 500; --z-tooltip: 600;
    --duration-fast: 120ms; --duration-base: 200ms; --ease-standard: cubic-bezier(.2,0,0,1);
    --header-h: 4rem;
    --sidebar-w: minmax(15rem, 18rem);
    --content-max: 80rem;

    /* ---------- Component tokens ---------- */
    --card-padding: var(--space-4);
    --card-radius: var(--radius-md);
    --badge-radius: var(--radius-pill);
    --control-height: 2.75rem;  /* 44px, vượt mức tối thiểu 24px của 2.5.8 [chưa xác minh text SC] */
    --focus-ring: 0 0 0 3px var(--color-surface), 0 0 0 5px var(--color-focus-ring);
  }

  /* ---------- Dark: theo hệ điều hành, trừ khi người dùng ép light ---------- */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --color-bg: var(--slate-900); --color-surface: var(--slate-800); --color-surface-sunken: var(--slate-900);
      --color-text: var(--slate-100); --color-text-muted: var(--slate-400);
      --color-border: var(--slate-700); --color-border-control: var(--slate-400);
      --color-primary: var(--blue-400); --color-primary-strong: var(--blue-300); --color-on-primary: var(--slate-900);
      --color-secondary-fg: #cbd5e1; --color-secondary-bg: var(--slate-800);
      --color-focus-ring: var(--blue-400);
      --color-success: var(--green-400); --color-warning: var(--amber-400); --color-danger: var(--red-400);
      --urgency-critical-fg: var(--red-400);   --urgency-critical-bg: var(--slate-800);   --urgency-critical-border: var(--red-400);
      --urgency-soon-fg: var(--amber-400);     --urgency-soon-bg: var(--slate-800);       --urgency-soon-border: var(--amber-400);
      --urgency-upcoming-fg: var(--blue-300);  --urgency-upcoming-bg: var(--slate-800);   --urgency-upcoming-border: var(--blue-400);
      --urgency-open-fg: var(--green-400);     --urgency-open-bg: var(--slate-800);       --urgency-open-border: var(--green-400);
      --urgency-closed-fg: #cbd5e1;            --urgency-closed-bg: var(--slate-800);     --urgency-closed-border: var(--slate-400);
      --shadow-1: 0 1px 2px rgb(0 0 0 / .4); --shadow-2: 0 4px 12px rgb(0 0 0 / .5);
    }
  }
  /* Người dùng chọn thủ công: lặp lại block dark ở trên cho :root[data-theme="dark"] */
  :root[data-theme="dark"]  { color-scheme: dark;  /* …copy các token dark ở trên… */ }
  :root[data-theme="light"] { color-scheme: light; }
}
```

Đoạn chống nháy màu, đặt trong `<head>` trước CSS ([web.dev](https://web.dev/articles/building/a-theme-switch-component)):
```html
<meta name="color-scheme" content="light dark">
<script>try{const t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch{}</script>
```

### 5.5 Danh sách component

Class đặt tên theo BEM ([getbem.com](https://getbem.com/naming/)). Trạng thái focus luôn dùng `:focus-visible { box-shadow: var(--focus-ring) }`, đạt 3:1 theo 1.4.11 ([Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).

| Component | Anatomy | Trạng thái | Accessibility, bàn phím |
|---|---|---|---|
| **AppHeader** | logo/tên → SearchBar (desktop) → link "Đã lưu (n)" → nút theme | sticky; khi cuộn thì có shadow | `<header>`, `<nav aria-label="Chính">`; link "Bỏ qua tới nội dung" đặt đầu trang |
| **SearchBar** | `<form role="search">` → `<label>` (ẩn trực quan) → `<input type="search">` → icon → nút xoá | default · hover (viền primary) · focus (ring) · đang gõ (debounce 250ms) · disabled khi đang tải lần đầu | Label thật, không chỉ dùng placeholder. Esc xoá nội dung. Nếu thêm autocomplete thì theo [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| **FilterPanel** | heading "Bộ lọc" → các nhóm (Lĩnh vực, Rank CORE, Rank CCF, Hình thức, Deadline trong: 7/30/90 ngày, Quốc gia) → toggle "Hiện đã hết hạn" | nhóm mở/đóng · giá trị có count = 0 thì disabled · mobile: `<dialog>` với "Áp dụng (n kết quả)" và "Đặt lại" | Mỗi nhóm là `<fieldset><legend>` + checkbox thật. Nút nhóm có `aria-expanded` ([APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)). Dialog: Esc để đóng, focus trap có sẵn của `<dialog>.showModal()` |
| **AppliedFilters** | dòng "n hội nghị" → các chip `<button>` "AI ×" → "Xoá tất cả" | ẩn khi không có filter · hover · focus | Mỗi chip có `aria-label="Bỏ lọc: AI"`. Số kết quả nằm trong `role="status"` ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)) |
| **Toolbar** | Sort `<select>` (Deadline gần nhất / Tên A–Z / Rank) → ViewToggle (Thẻ/Bảng) | — | ViewToggle là 2 `<button aria-pressed>` |
| **ConferenceCard** | `<article>`: header (acronym `<h3>` + tên đầy đủ + nút ☆) → DeadlineBlock (loại mốc + Countdown + `<time>` AoE + giờ VN) → meta (ngày tổ chức, địa điểm, FormatBadge) → RankBadges → chip lĩnh vực → link "Chi tiết" | default · hover (shadow-2, viền primary) · focus-within · `--closed` (opacity .6 + "Đã hết hạn") · `--urgent` (viền trái 4px theo urgency) · skeleton | Tiêu đề là link duy nhất phủ cả card (dùng `::after` inset), tránh lồng nhiều link. Nút ☆ có `aria-pressed` và `aria-label="Lưu ICSE 2027"` |
| **ConferenceTable** | `<table>` + `<caption>` → `<th scope="col"><button>` sort → các dòng | sort asc/desc · hover dòng · dòng closed thì mờ | `aria-sort` chỉ đặt trên cột đang sort. ▲▼ có `aria-hidden` ([APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)). Dưới 40rem thì ẩn bảng và ép về dạng thẻ (không stack bảng) |
| **Countdown** | badge urgency: icon đồng hồ + text "Còn 5 ngày 03:12:45" (số dùng `--font-mono`, tabular) | critical / soon / upcoming / open / closed / tba | Phần số đang chạy có `aria-hidden="true"`. Screen reader đọc `<span class="sr-only">` dạng tĩnh ("Hạn nộp còn 5 ngày, đến 18:59 ngày 1/7/2026 giờ Việt Nam"), cập nhật theo phút. **Không đặt `aria-live` lên phần đếm giây.** Có nút "Tạm dừng đồng hồ", tham chiếu 2.2.2 ([Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). Khi `prefers-reduced-motion` thì ẩn giây |
| **Badge** (Rank, Format, Status) | `<span class="badge badge--core-astar">CORE A*</span>`; Format có icon (laptop / map-pin / cả hai) | tĩnh, không có hover | Không bấm được ([GOV.UK Tag](https://design-system.service.gov.uk/components/tag/)). Rank có `title` trích định nghĩa CORE và nguồn "ICORE2026" ([CORE](https://www.core.edu.au/conference-portal)). Rank phân biệt bằng chữ, màu chỉ bổ trợ |
| **Pagination** | "Hiển thị 13–24 / 128" → ‹ Trước · 1 · [2] · 3 · … · 11 · Sau › | ẩn khi chỉ có 1 trang · trang hiện tại · Trước/Sau bị ẩn ở trang đầu/cuối | `<nav aria-label="Phân trang">`, `aria-current="page"`, `<title>` có "(trang 2/11)" ([GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)). Đổi trang thì đưa focus về heading kết quả |
| **Skeleton** | khối card giả, giữ đúng kích thước card thật | pulse; tắt khi reduced-motion | Vùng list có `aria-busy="true"`, kèm text ẩn "Đang tải danh sách hội nghị…" trong `role="status"` |
| **EmptyState** | icon → tiêu đề nêu lý do → gợi ý → nút "Xoá tất cả bộ lọc" → gợi ý lĩnh vực có kết quả | biến thể: không khớp search · không khớp filter · danh sách đã lưu rỗng | Thay toàn bộ vùng kết quả ([Carbon](https://carbondesignsystem.com/patterns/empty-states-pattern/)). Số "0 hội nghị" được đọc qua `role="status"`. Không dùng màu đỏ |
| **ErrorState** | icon → "Không tải được dữ liệu" → nguyên nhân (quá thời gian / lỗi mạng / dữ liệu sai) → nút "Thử lại" | — | Dùng `role="alert"` vì đây là lỗi thật. Sau khi bấm Thử lại thì focus trở về vùng list |
| **ImportantDates** (trang chi tiết) | `<h2>Các mốc quan trọng · AoE (UTC−12)</h2>` → `<ol>` theo thời gian tăng dần: nhãn mốc, ngày AoE, giờ VN, Countdown | mốc kế tiếp được highlight · mốc đã qua có gạch ngang và chữ "Đã qua" | Dùng `<time datetime="…Z">`. Không lặp lỗi thứ tự đảo ngược như ICSE 2027 ([nguồn](https://conf.researchr.org/track/icse-2027/icse-2027-research-track)) |
| **CalendarActions** | link "Google Calendar" + nút "Tải .ics" | — | Icon có `aria-hidden`. Nút có tên rõ ràng |
| **ThemeToggle** | `<button aria-label="Chế độ tối" aria-pressed>` | light / dark / hệ thống | Theo [web.dev](https://web.dev/articles/building/a-theme-switch-component) |

### 5.6 Wireframe

**Trang danh sách, desktop (≥64rem)**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] HỘI NGHỊ KH   [ Tìm theo tên hoặc viết tắt (vd: ICSE)…        ][×]  ☆ Đã lưu (3)  [◐] │
├──────────────────┬───────────────────────────────────────────────────────────┤
│ BỘ LỌC   Đặt lại │ Hội nghị sắp hết hạn nộp bài                    (h1)      │
│                  │ 128 hội nghị  ·  [AI ×] [CORE A* ×] [Hybrid ×]  Xoá tất cả│
│ ▾ Lĩnh vực       │ Sắp xếp [Deadline gần nhất ▾]          Hiển thị [▦][☰]    │
│  [x] AI (42)     │ ┌───────────────────┐┌───────────────────┐┌──────────────┐│
│  [ ] SE (31)     │ │ICSE 2027      [☆] ││NeurIPS 2026   [☆] ││CHI 2027  [☆] ││
│  [ ] Security(19)│ │Int'l Conf. on SE  ││Neural Info Proc.  ││Human Factors ││
│ ▾ Rank CORE      │ │Nộp toàn văn       ││Nộp abstract       ││Nộp bài       ││
│  [x] A* [ ] A    │ │[! Còn 2 ngày 04:12]││[Còn 6 ngày]       ││[Còn 21 ngày] ││
│  [ ] B  [ ] C    │ │23:59 30/06 AoE    ││23:59 08/07 AoE    ││…             ││
│ ▾ Rank CCF       │ │=18:59 01/07 GMT+7 ││=18:59 09/07 GMT+7 ││              ││
│  [ ] A [ ] B [ ] C│ │[TP], [QG] · [Offline]││[TP] · [Hybrid]     ││… · [Online]  ││
│ ▾ Hình thức      │ │[CORE A*] [CCF A]  ││[CORE A*] [CCF A]  ││[CORE A*]     ││
│  ( ) Online      │ │(SE)               ││(AI) (ML)          ││(HCI)         ││
│  ( ) Offline     │ └───────────────────┘└───────────────────┘└──────────────┘│
│  (•) Hybrid      │  … (12–24 thẻ/trang)                                      │
│ ▾ Hạn trong      │                                                           │
│  ( ) 7 ngày      │ Hiển thị 1–12 / 128     ‹ Trước  [1] 2 3 … 11  Sau ›      │
│  (•) 30 ngày     │                                                           │
│ [ ] Hiện đã hết hạn│                                                         │
├──────────────────┴───────────────────────────────────────────────────────────┤
│ Footer: Nguồn dữ liệu · Cập nhật 08/10/2026 · Báo lỗi dữ liệu · MSSV          │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Trang danh sách, mobile (<40rem)**
```
┌──────────────────────────────┐
│ HỘI NGHỊ KH        ☆3   [◐]  │
│ [ Tìm ICSE, NeurIPS…     ][×]│
│ [⚙ Bộ lọc (3)] [Deadline ▾]  │
│ 128 hội nghị                 │
│ [AI ×][CORE A* ×][Hybrid ×] →│ (cuộn ngang, mép mờ)
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ ICSE 2027            [☆] │ │
│ │ Nộp toàn văn             │ │
│ │ [! Còn 2 ngày 04:12]     │ │
│ │ 18:59 01/07/2026 (GMT+7) │ │
│ │ [TP], [QG] · [Offline]      │ │
│ │ [CORE A*] [CCF A]        │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ NeurIPS 2026 …           │ │
│ └──────────────────────────┘ │
│ 1–12 / 128   ‹  [1] 2 … 11 › │
└──────────────────────────────┘

Tray bộ lọc (dialog từ phải):
┌──────────┬───────────────────┐
│ (kết quả │ Bộ lọc        [×] │
│  mờ phía │ ▾ Lĩnh vực        │
│  sau)    │ ▾ Rank CORE       │
│          │ ▾ Hình thức       │
│          │ …                 │
│          │ [Đặt lại]         │
│          │ [Áp dụng · 37 KQ] │ ← sticky
└──────────┴───────────────────┘
```

**Trang chi tiết (`conference.html?id=icse-2027`), desktop.** Tên, ngày, rank và địa điểm trong mọi wireframe chỉ là dữ liệu mẫu. Riêng mốc 23/06 và 30/06/2026 lấy theo trang CFP ICSE 2027 ([nguồn](https://conf.researchr.org/track/icse-2027/icse-2027-research-track)).
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Trang chủ › Software Engineering › ICSE 2027                                 │
│ ICSE 2027                                                [☆ Lưu] [↗ Website] │
│ International Conference on Software Engineering                             │
│ [CORE A* · ICORE2026] [CCF A] [Offline]   (SE) (Testing)                     │
├───────────────────────────────────────────────┬──────────────────────────────┤
│ Thông tin chung                               │ ┌──────────────────────────┐ │
│ Ngày tổ chức: [dd–dd/mm/yyyy]                │ │ Mốc kế tiếp: Nộp toàn văn│ │
│ Địa điểm: [Thành phố, Quốc gia] · Venue …      │ │  02 : 04 : 12 : 45       │ │ (mono)
│ Hình thức: Trực tiếp                          │ │ ngày  giờ  phút  giây    │ │
│                                               │ │ 23:59 30/06/2026 AoE     │ │
│ Các mốc quan trọng · AoE (UTC−12)             │ │ = 18:59 01/07 giờ VN     │ │
│ ┌────────────┬────────────────┬─────────────┐ │ │ [⏸ Tạm dừng đồng hồ]     │ │
│ │ Mốc        │ Hạn (AoE)      │ Trạng thái  │ │ ├──────────────────────────┤ │
│ │ Abstract   │ 23/06/2026     │ ̶Đ̶ã̶ ̶q̶u̶a̶    │ │ │ [Google Calendar]        │ │
│ │ Toàn văn ● │ 30/06/2026     │ Còn 2 ngày  │ │ │ [Tải .ics]               │ │
│ │ Thông báo  │ 20/10/2026     │ Còn 4 tháng │ │ │ [↗ Trang CFP gốc]        │ │
│ │ Camera-ready│ 15/11/2026    │ Còn 4 tháng │ │ └──────────────────────────┘ │
│ └────────────┴────────────────┴─────────────┘ │ (sticky)                     │
│ Chủ đề: …                                     │                              │
│ Nguồn dữ liệu: … · Cập nhật: 08/10/2026 · [Báo dữ liệu sai]                  │
│ Hội nghị liên quan (cùng lĩnh vực, rank): 3 card                             │
└───────────────────────────────────────────────┴──────────────────────────────┘
Mobile: sidebar countdown chuyển lên ngay dưới tiêu đề; bảng mốc → <ol> dọc.
```

Ghi chú: "Nguồn dữ liệu / Cập nhật / Báo dữ liệu sai" được đưa vào vì ghi chú nghiên cứu phát hiện các site không có các thông tin này, và ConferenceIndex có lỗi dữ liệu Tokyo/Kyoto ([detail ICCSIS](https://conferenceindex.org/event/international-conference-on-computer-science-and-intelligence-systems-iccsis-2026-september-tokyo-jp)).

### 5.7 Hướng dẫn hiện thực bằng TypeScript thuần

**Build tool.** Có hai lựa chọn hợp lệ, cần nêu rõ lý do chọn trong báo cáo đồ án:

| | tsc thuần | Vite `vanilla-ts` |
|---|---|---|
| Lý do chọn | Câu chuyện "không framework" rõ ràng nhất; tsc vừa là trình biên dịch vừa là type-checker | Có dev server + HMR, import JSON trực tiếp, build ra `dist/` đã minify. Vite là build tool, không phải framework |
| Lưu ý | Import phải ghi `./time.js`; cần static server riêng (Live Server) vì `fetch` qua `file://` thường lỗi [chưa xác minh theo trình duyệt] | **Vite không type-check** → script build là `tsc --noEmit && vite build`. Cần Node 20.19+ hoặc 22.12+ ([Vite Guide](https://vite.dev/guide/), [Vite Features](https://vite.dev/guide/features.html)) |

Cấu hình `tsconfig` nên bật `strict`, `noUncheckedIndexedAccess`, `isolatedModules` ([TSConfig reference](https://www.typescriptlang.org/tsconfig/#strict)). Nếu giảng viên yêu cầu nộp một file HTML duy nhất, nhúng JSON vào `<script type="application/json" id="data">` rồi `JSON.parse(textContent)`.

**Icon.** Chọn tay khoảng 15 SVG từ `lucide-static` (giấy phép ISC), đóng thành sprite `<symbol>`, tô bằng `currentColor`. Không dùng sprite đầy đủ vì Lucide cảnh báo nó "can significantly increase your app's bundle size" ([Lucide sprite](https://lucide.dev/guide/static/svg-sprite), [lucide-static](https://lucide.dev/guide/packages/lucide-static)).

**Interface dữ liệu.** Kết hợp các schema của ccfddl, HF và sec-deadlines ([ccfddl README](https://github.com/ccfddl/ccf-deadlines/blob/main/README.md), [HF conference.ts](https://github.com/huggingface/ai-deadlines/blob/main/src/types/conference.ts), [sec README](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/README.md)), bổ sung `format` và `country` vì chưa site nào lọc theo hai trường này:

```ts
// src/ts/types.ts
export type DeadlineKind = "abstract" | "full_paper" | "notification" | "camera_ready" | "rebuttal" | "other";
export type CoreRank = "A*" | "A" | "B" | "C" | "Australasian B" | "Australasian C" | "National" | "Regional" | "Unranked";
export type CcfRank = "A" | "B" | "C";
export type EventFormat = "online" | "offline" | "hybrid";
export type Urgency = "critical" | "soon" | "upcoming" | "open" | "closed" | "tba";

export interface Deadline {
  kind: DeadlineKind;
  label?: string;            // "Mandatory abstract", "Round 2"…
  /** ISO 8601 có offset, đã chuẩn hoá lúc nhập liệu; null = TBA */
  at: string | null;         // "2026-06-30T23:59:59-12:00"
  timezoneLabel: string;     // "AoE" | "UTC+2" | "PDT"… chỉ để hiển thị
  estimated?: boolean;       // giống "Est." của ccfddl
}

export interface Conference {
  id: string;                // "icse-2027" (slug dùng cho URL)
  acronym: string;           // "ICSE"
  year: number;
  name: string;              // tên đầy đủ
  deadlines: Deadline[];     // abstract / full paper / notification / camera-ready
  start?: string;            // "2027-04-12" (ngày tổ chức, không giờ)
  end?: string;
  location: { city?: string; country?: string; countryCode?: string; venue?: string };
  format: EventFormat;
  rank: { core?: CoreRank; coreSource?: string; ccf?: CcfRank };  // coreSource: "ICORE2026"
  topics: string[];          // khớp taxonomy cố định trong data/topics.json
  link: string;              // website chính thức / trang CFP
  note?: string;
  updatedAt: string;         // ngày cập nhật bản ghi
  source?: string;           // nguồn dữ liệu
}
```

Quy tắc dữ liệu:
- Nguồn chỉ ghi ngày, hoặc ghi "AoE" mà không có giờ: chuẩn hoá thành `T23:59:59-12:00` ngay lúc nhập liệu. Đây là quy ước của ccfddl và sec-deadlines ([ccfddl README](https://github.com/ccfddl/ccf-deadlines/blob/main/README.md), [sec main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js)).
- Múi giờ có DST (PST/PDT): tra offset đúng ngày khi nhập liệu, không để trình duyệt tự đoán.
- Nhớ dấu ngược của tên vùng `Etc/GMT`: **`Etc/GMT+12` nghĩa là UTC−12** ([tz database](https://en.wikipedia.org/wiki/Tz_database)).

**Thời gian, AoE và Intl tiếng Việt** (kết quả đã kiểm chứng trong ghi chú: `vi-VN` + `Asia/Ho_Chi_Minh` cho ra "lúc 18:59:59 GMT+7 Thứ Hai, 16 tháng 11, 2026"; `RelativeTimeFormat('vi')` cho ra "sau 3 ngày nữa" và "Ngày mai"). Nguồn: [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat), [MDN RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/format).

```ts
// src/ts/time.ts
export const VN_TZ = "Asia/Ho_Chi_Minh";
const fmtVN = new Intl.DateTimeFormat("vi-VN", {
  timeZone: VN_TZ, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", timeZoneName: "shortOffset",
});
const fmtAoE = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "-12:00", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
}); // offset identifier được Intl chấp nhận (MDN)
const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

export const toMs = (iso: string) => Date.parse(iso);              // ISO có offset → instant tuyệt đối
export const formatVN = (ms: number) => fmtVN.format(ms);
export const formatAoE = (ms: number) => `${fmtAoE.format(ms)} AoE (UTC−12)`;

export function nextDeadline(c: Conference, now = Date.now()): Deadline | undefined {
  return c.deadlines
    .filter((d) => d.at && toMs(d.at) > now && d.kind !== "notification")
    .sort((a, b) => toMs(a.at!) - toMs(b.at!))[0];
}

export function urgencyOf(ms: number | null, now = Date.now()): Urgency {
  if (ms === null) return "tba";
  const days = (ms - now) / 86_400_000;
  if (days <= 0) return "closed";
  if (days < 3) return "critical";
  if (days < 7) return "soon";
  if (days < 30) return "upcoming";
  return "open";
}

/** Định dạng thích ứng như ccfddl, nhưng tính lại từ Date.now() mỗi lần gọi (không trôi) */
export function countdownText(ms: number, now = Date.now(), showSeconds = true): string {
  let s = Math.max(0, Math.floor((ms - now) / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600);  s %= 3600;
  const m = Math.floor(s / 60);    const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  if (d >= 30) return rtf.format(Math.round(d / 30), "month");         // "sau 2 tháng nữa"
  if (d >= 1)  return `Còn ${d} ngày ${p(h)}:${p(m)}${showSeconds ? ":" + p(sec) : ""}`;
  return `Còn ${p(h)}:${p(m)}${showSeconds ? ":" + p(sec) : ""}`;
}
```

**Một timer dùng chung cho toàn trang, tự dừng khi tab ẩn.** Timer căn theo giây đồng hồ thật và tính lại từ `Date.now()` mỗi lần chạy. Trình duyệt throttle timer ở tab nền, Chrome có thể chỉ chạy timer "once per minute" ([MDN setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)). Sự kiện `visibilitychange` là thời điểm hợp lý để "stop making UI updates" ([MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)).

```ts
// src/ts/ticker.ts
type Sub = (now: number) => void;
const subs = new Set<Sub>();
let timer: number | undefined;
let paused = false;   // nút "Tạm dừng đồng hồ" (WCAG 2.2.2)
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

function tick() {
  const now = Date.now();
  subs.forEach((fn) => fn(now));
  const step = reduce.matches ? 60_000 - (now % 60_000) : 1000 - (now % 1000); // reduced-motion → theo phút
  timer = window.setTimeout(tick, step);
}
function start() { if (timer === undefined && subs.size && !document.hidden && !paused) tick(); }
function stop()  { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } }

document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start())); // quay lại → tick() ngay, nhảy về giá trị hiện tại
reduce.addEventListener("change", () => { stop(); start(); });
export function setPaused(v: boolean) { paused = v; v ? stop() : start(); }
export function subscribe(fn: Sub): () => void {
  subs.add(fn); start();
  return () => { subs.delete(fn); if (!subs.size) stop(); };
}
```

```ts
// Gắn countdown cho các phần tử đang có trong DOM (gọi lại sau mỗi lần render)
let unsub: (() => void) | undefined;
export function bindCountdowns(root: ParentNode) {
  unsub?.();
  const els = [...root.querySelectorAll<HTMLElement>("[data-deadline-ms]")];
  unsub = subscribe((now) => {
    for (const el of els) {
      const ms = Number(el.dataset.deadlineMs);
      const u = urgencyOf(ms, now);
      el.dataset.urgency = u;                                  // CSS: .countdown[data-urgency="critical"]{…}
      el.querySelector(".countdown__value")!.textContent =
        u === "closed" ? "Đã hết hạn" : countdownText(ms, now, !reduce.matches);
    }
  });
}
```

**Đồng bộ filter với URL.** URL là nguồn sự thật duy nhất. Dùng `pushState` khi click filter, `replaceState` khi đang gõ search. Lắng nghe `popstate` vì `pushState` tự nó không phát sự kiện này ([MDN pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState), [MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)). Tham số không hợp lệ thì bỏ đi một cách tường minh, không im lặng bỏ qua như Research.com ([Research.com country=xqzzvbnmq](https://research.com/conference-rankings/computer-science?country=xqzzvbnmq)).

```ts
// src/ts/state.ts
export type SortKey = "deadline" | "name" | "rank";
export interface Filters {
  q: string; topic: string[]; core: CoreRank[]; ccf: CcfRank[];
  format: EventFormat[]; within: 0 | 7 | 30 | 90; past: boolean;
  sort: SortKey; view: "grid" | "table"; page: number;
}
export const DEFAULTS: Filters = { q: "", topic: [], core: [], ccf: [], format: [], within: 0, past: false, sort: "deadline", view: "grid", page: 1 };
const CORE: readonly string[] = ["A*", "A", "B", "C", "National", "Regional", "Unranked"];

export function readURL(search = location.search): Filters {
  const p = new URLSearchParams(search);
  const pick = <T extends string>(k: string, ok: readonly string[]) => p.getAll(k).filter((v) => ok.includes(v)) as T[];
  const within = Number(p.get("within"));
  return {
    q: (p.get("q") ?? "").slice(0, 100),
    topic: p.getAll("topic"),
    core: pick<CoreRank>("core", CORE),
    ccf: pick<CcfRank>("ccf", ["A", "B", "C"]),
    format: pick<EventFormat>("format", ["online", "offline", "hybrid"]),
    within: ([7, 30, 90] as const).includes(within as 7) ? (within as 7 | 30 | 90) : 0,
    past: p.get("past") === "1",
    sort: (["name", "rank"] as const).includes(p.get("sort") as "name") ? (p.get("sort") as SortKey) : "deadline",
    view: p.get("view") === "table" ? "table" : "grid",
    page: Math.max(1, Number(p.get("page")) || 1),
  };
}
export function writeURL(f: Filters, mode: "push" | "replace" = "push") {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  f.topic.forEach((v) => p.append("topic", v));
  f.core.forEach((v) => p.append("core", v));
  f.ccf.forEach((v) => p.append("ccf", v));
  f.format.forEach((v) => p.append("format", v));
  if (f.within) p.set("within", String(f.within));
  if (f.past) p.set("past", "1");
  if (f.sort !== "deadline") p.set("sort", f.sort);
  if (f.view !== "grid") p.set("view", f.view);
  if (f.page > 1) p.set("page", String(f.page));
  const qs = p.toString();                       // tránh URLSearchParams.size cho Safari cũ
  history[mode === "push" ? "pushState" : "replaceState"](null, "", location.pathname + (qs ? "?" + qs : ""));
}

// Lọc: OR trong nhóm, AND giữa các nhóm (như sec-deadlines)
export function applyFilters(all: Conference[], f: Filters, now = Date.now()): Conference[] {
  const q = f.q.toLocaleLowerCase("vi");
  const any = <T>(sel: T[], v: T | undefined) => sel.length === 0 || (v !== undefined && sel.includes(v));
  return all.filter((c) => {
    const nd = nextDeadline(c, now);
    const ms = nd?.at ? toMs(nd.at) : null;
    if (!f.past && ms === null && c.deadlines.every((d) => d.at && toMs(d.at) <= now)) return false;
    if (q && !`${c.acronym} ${c.name}`.toLocaleLowerCase("vi").includes(q)) return false;
    if (f.topic.length && !c.topics.some((t) => f.topic.includes(t))) return false;
    if (!any(f.core, c.rank.core) || !any(f.ccf, c.rank.ccf) || !any(f.format, c.format)) return false;
    if (f.within && (ms === null || ms - now > f.within * 86_400_000)) return false;
    return true;
  });
}
```

Luồng chính: gọi `update(patch)` để gộp state và đưa về trang 1 (theo GOV.UK). Tiếp đến là `writeURL` và `render`. Render bằng cách clone `<template>` vào `DocumentFragment` và chỉ gán `textContent`, vừa tránh XSS vừa dùng `replaceChildren` một lần ([MDN template](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template)). Click được bắt bằng event delegation: một listener trên list, xử lý `[data-action="fav"|"ics"]`. Search dùng debounce 250ms. Tải dữ liệu bằng `fetch` kèm `AbortSignal.any([ctrl.signal, AbortSignal.timeout(8000)])`, phân biệt `TimeoutError` với `AbortError` để chọn câu thông báo lỗi ([MDN AbortSignal.timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)). Kiểu trạng thái `LoadState = loading | error | ready` quyết định hiện Skeleton, ErrorState, EmptyState (ready nhưng 0 kết quả) hay danh sách. Favorites lưu localStorage key `conf:favorites:v1`, bọc try/catch ([MDN Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)). File `.ics` gập dòng theo **octet UTF-8** vì chữ tiếng Việt chiếm 2–3 byte ([RFC 5545 §3.1](https://www.rfc-editor.org/rfc/rfc5545)).

`Temporal` chưa có trên Safari tính đến 10/2026 (BCD ghi "preview"), nên chỉ dùng nếu feature-detect được ([BCD Temporal](https://github.com/mdn/browser-compat-data/tree/main/javascript/builtins/Temporal), [MDN Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)).

**Cấu trúc thư mục**
```
hoi-nghi-khoa-hoc/
├─ index.html                 # danh sách + bộ lọc
├─ conference.html            # chi tiết (?id=icse-2027)
├─ saved.html                 # (tuỳ chọn) đã lưu / lịch deadline
├─ public/                    # (Vite) phục vụ nguyên trạng; tsc-only: để ở gốc
│  ├─ data/conferences.json
│  ├─ data/topics.json        # taxonomy cố định, có cấp cha–con
│  └─ icons/sprite.svg        # ~15 icon Lucide (ISC)
├─ src/
│  ├─ css/
│  │  ├─ main.css             # @layer order + @import
│  │  ├─ tokens.css           # mục 5.4
│  │  ├─ base/reset.css, typography.css
│  │  ├─ layout/app-shell.css # grid sidebar + results, breakpoints
│  │  ├─ components/search-bar.css, filter-panel.css, conf-card.css, conf-table.css,
│  │  │              countdown.css, badge.css, pagination.css, skeleton.css, states.css
│  │  └─ pages/list.css, detail.css
│  └─ ts/
│     ├─ types.ts   data.ts   state.ts   filters.ts   render.ts   time.ts   ticker.ts
│     ├─ favorites.ts   calendar.ts   theme.ts
│     ├─ pages/list.ts   pages/detail.ts   pages/saved.ts
│     └─ main.ts
├─ tsconfig.json
└─ package.json               # "dev": "vite", "build": "tsc --noEmit && vite build"
```

---

## 6. Checklist triển khai

**Bắt buộc**
- [ ] `Conference` / `Deadline` interface. Mọi deadline lưu dạng ISO có offset, ngày AoE chuẩn hoá thành `T23:59:59-12:00`.
- [ ] Tải JSON với timeout, xử lý đủ 4 trạng thái: Skeleton → Error (nút "Thử lại") → Empty (lý do + "Xoá tất cả bộ lọc") → danh sách.
- [ ] ConferenceCard ưu tiên deadline: loại mốc kế tiếp, Countdown, giờ AoE, giờ VN, hình thức, rank.
- [ ] Countdown dùng một ticker chung, tính lại từ `Date.now()`, dừng khi tab ẩn, theo phút khi `prefers-reduced-motion`, có nút tạm dừng. Phần số đang chạy có `aria-hidden` và có bản text tĩnh cho screen reader.
- [ ] 5 mức urgency, mỗi mức có **nhãn chữ và icon**, không chỉ dùng màu (WCAG 1.4.1).
- [ ] Search theo acronym/tên, debounce, có label thật.
- [ ] FilterPanel: Lĩnh vực, CORE, CCF, Hình thức, Hạn trong N ngày. OR trong nhóm, AND giữa nhóm. Có số đếm.
- [ ] Toàn bộ state (filter, sort, page, view) nằm trên URL, có xử lý `popstate`, tham số sai thì bỏ đi.
- [ ] Ẩn hội nghị đã hết hạn mặc định, có toggle; khi hiện thì làm mờ và ghi "Đã hết hạn".
- [ ] Pagination có số kèm dòng "Hiển thị x–y / N", `aria-current`, quay về trang 1 khi đổi filter, `<title>` ghi số trang.
- [ ] Số kết quả đặt trong `role="status"`.
- [ ] Trang chi tiết: mọi mốc deadline xếp theo thời gian tăng dần, tiêu đề ghi "AoE (UTC−12)", có link CFP gốc.
- [ ] Responsive 3 mức (<40rem, 40–64rem, ≥64rem). Có meta viewport, **không chặn zoom**.
- [ ] Token màu trong mục 5.4. Placeholder và viền control đạt mức tương phản đã tính. Có focus ring rõ.
- [ ] Font Be Vietnam Pro (subset `vietnamese`), số countdown dùng JetBrains Mono.

**Nên có**
- [ ] Chip filter đang áp dụng, mỗi chip có nút ×, kèm "Xoá tất cả".
- [ ] Chuyển Card ↔ Bảng. Bảng có `<button>` trong `<th>` và `aria-sort`. Mobile luôn ở dạng thẻ.
- [ ] Mobile: filter trong `<dialog>` tray, nút "Áp dụng (n kết quả)" luôn hiện.
- [ ] Badge rank có tooltip định nghĩa CORE và nguồn "ICORE2026". Badge tĩnh tách biệt với chip bấm được.
- [ ] Dark mode theo hệ điều hành, có ThemeToggle và script chống nháy màu.
- [ ] Sort theo Deadline / Tên / Rank.
- [ ] Footer ghi nguồn dữ liệu, ngày cập nhật, link "Báo dữ liệu sai".

**Tùy chọn**
- [ ] Trang "Đã lưu" (localStorage) có empty state hướng dẫn, hoặc trang lịch deadline nhóm theo tháng.
- [ ] Nút Google Calendar và tải `.ics` (RFC 5545, giờ UTC "Z", gập dòng theo octet).
- [ ] Bộ chọn múi giờ hiển thị (như ccfddl), mặc định `Asia/Ho_Chi_Minh`.
- [ ] Search có autocomplete theo APG Combobox.
- [ ] Hộp phân bố rank kiểu "ICORE2026 Summary" đặt trên danh sách.
- [ ] Container query để card tự chuyển sang dạng hàng ngang khi vùng kết quả rộng.
- [ ] Light-DOM custom element `<deadline-countdown>` (không dùng Shadow DOM).

---

## Kết luận

Kết quả phân tích cho thấy một điều ngược với trực giác: **các site tra cứu hội nghị lâu đời nhất lại là những site có UX yếu nhất ở đúng chỗ quan trọng nhất**. Đó là thời gian còn lại để nộp bài và việc giải thích khi không tìm thấy gì. Các tracker mã nguồn mở đã giải được bài toán AoE và countdown. Điều đó cho thấy độ khó thực sự nằm ở **dữ liệu sạch** (deadline có offset, taxonomy cố định, rank ghi rõ vòng xếp hạng) chứ không nằm ở công nghệ. Toàn bộ phần khó đều làm được bằng API có sẵn của trình duyệt. Vì vậy một đồ án HTML/CSS/TS thuần có thể vượt cả ccfddl ở ba điểm cụ thể: empty state có hành động, filter hình thức kết hợp rank, và URL chia sẻ được.

Rủi ro lớn nhất của đồ án không phải là giao diện mà là **tính đúng của giờ**. Lệch một ngày ở deadline AoE gây hậu quả thật cho người dùng. Vì thế nên đầu tư viết unit test cho `aoeEndOfDay` / `urgencyOf` và hiển thị song song giờ AoE với giờ Việt Nam ở mọi nơi. Đây là chi tiết nhỏ nhưng là thứ khiến người dùng tin vào site.

---

## 7. Danh sách nguồn

**Site phân tích**
- ccfddl: [ccfddl.com](https://ccfddl.com/) · [README](https://github.com/ccfddl/ccf-deadlines/blob/main/README.md) · [styles.css](https://github.com/ccfddl/ccf-deadlines/blob/main/public/styles.css) · [showtable.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/showtable.rs) · [countdown.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/countdown.rs) · [conference_controls.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/conference_controls.rs) · [index.html](https://github.com/ccfddl/ccf-deadlines/blob/main/index.html) · [loading.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/components/loading.rs) · [home.rs](https://github.com/ccfddl/ccf-deadlines/blob/main/src/pages/home.rs) · [Cargo.toml](https://github.com/ccfddl/ccf-deadlines/blob/main/Cargo.toml) · [screenshot_website.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_website.png) · [screenshot_tabular.png](https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/.readme_assets/screenshot_tabular.png)
- Hugging Face AI Deadlines: [Space](https://huggingface.co/spaces/huggingface/ai-deadlines) · [README](https://github.com/huggingface/ai-deadlines/blob/main/README.md) · [Index.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/pages/Index.tsx) · [ConferenceCard.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/ConferenceCard.tsx) · [Header.tsx](https://github.com/huggingface/ai-deadlines/blob/main/src/components/Header.tsx) · [dateUtils.ts](https://github.com/huggingface/ai-deadlines/blob/main/src/utils/dateUtils.ts) · [conference.ts](https://github.com/huggingface/ai-deadlines/blob/main/src/types/conference.ts) · [tailwind.config.ts](https://github.com/huggingface/ai-deadlines/blob/main/tailwind.config.ts) · [index.css](https://github.com/huggingface/ai-deadlines/blob/main/src/index.css) · [package.json](https://github.com/huggingface/ai-deadlines/blob/main/package.json)
- sec-deadlines: [sec-deadlines.github.io](https://sec-deadlines.github.io/) · [README](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/README.md) · [index.html](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/index.html) · [main.js](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/js/main.js) · [deadlines.css](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/static/css/deadlines.css) · [filters.yml](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/_data/filters.yml) · [conferences.yml](https://github.com/sec-deadlines/sec-deadlines.github.io/blob/master/_data/conferences.yml)
- aideadlin.es: [aideadlin.es](https://aideadlin.es/) · [index.html](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/index.html) · [utils.js](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/_includes/utils.js) · [head.html](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/_includes/head.html) · [deadlines.css](https://github.com/paperswithcode/ai-deadlines/blob/gh-pages/static/css/deadlines.css)
- WikiCFP: [Home](http://www.wikicfp.com/cfp/) · [Category CS](http://www.wikicfp.com/cfp/call?conference=computer%20science) · [Search](http://www.wikicfp.com/cfp/servlet/tool.search?q=software+engineering&year=t) · [Empty search](http://www.wikicfp.com/cfp/servlet/tool.search?q=xqzvbnmplk&year=t) · [Detail](http://www.wikicfp.com/cfp/servlet/event.showcfp?eventid=201537&copyownerid=182680)
- ConferenceIndex: [Home](https://conferenceindex.org/) · [CS](https://conferenceindex.org/conferences/computer-science) · [Empty search](https://conferenceindex.org/search?query=xqzvbnmplk) · [Detail ICCSIS](https://conferenceindex.org/event/international-conference-on-computer-science-and-intelligence-systems-iccsis-2026-september-tokyo-jp) · [Disciplines](https://conferenceindex.org/disciplines)
- Conference Alerts: [Home](https://conferencealerts.com/) · [Search](https://conferencealerts.com/search?q=software) · [Empty search](https://conferencealerts.com/search?q=xqzvbnmplk) · [Advanced search](https://conferencealerts.com/advanced-search) · [Country Vietnam](https://conferencealerts.com/country-listing?country=Vietnam) · [Topic CS](https://conferencealerts.com/topic-listing?topic=Computer%20Science) · [Detail 277667](https://conferencealerts.com/show-event?id=277667)
- ICORE/CORE: [Portal](https://portal.core.edu.au/conf-ranks/) · [Search "software"](https://portal.core.edu.au/conf-ranks/?search=software&by=all&source=ICORE2026&sort=atitle&page=1) · [Empty](https://portal.core.edu.au/conf-ranks/?search=xqzzvbnmq&by=all&source=all&sort=atitle&page=1) · [Conf 213](https://portal.core.edu.au/conf-ranks/213) · [CORE Conference Portal page](https://www.core.edu.au/conference-portal) · [ICORE 2026 updates](https://www.core.edu.au/icore-portal/icore-portal-2026-rankings-updates)
- Đã xem, không phân tích chính: [conf.researchr.org](https://conf.researchr.org/) · [ICSE 2027 Research Track](https://conf.researchr.org/track/icse-2027/icse-2027-research-track) · [ICSE 2027 Dates](https://conf.researchr.org/dates/icse-2027) · [Research.com CS](https://research.com/conference-rankings/computer-science) · [call4paper](https://www.call4paper.com/) · [allconferencealert](https://www.allconferencealert.com/) · [CCF TCS](https://www.ccf.org.cn/Academic_Evaluation/TCS/)

**Thư viện pattern và hướng dẫn UX**
- NN/g: [Search Visible & Simple](https://www.nngroup.com/articles/search-visible-and-simple/) · [Site Search Suggestions](https://www.nngroup.com/articles/site-search-suggestions/) · [Applying Filters](https://www.nngroup.com/articles/applying-filters/) · [Mobile Faceted Search](https://www.nngroup.com/articles/mobile-faceted-search/) · [Infinite Scrolling](https://www.nngroup.com/articles/infinite-scrolling-tips/) · [Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/) · [Response Times](https://www.nngroup.com/articles/response-times-3-important-limits/) · [Empty States](https://www.nngroup.com/articles/empty-state-interface-design/) · [Cards](https://www.nngroup.com/articles/cards-component/) · [Mobile Tables](https://www.nngroup.com/articles/mobile-tables/)
- Baymard: [Horizontal Filtering](https://baymard.com/research-articles/horizontal-filtering-sorting-design) · [Applied Filters](https://baymard.com/research-articles/how-to-design-applied-filters) · [Default Sort](https://baymard.com/research-articles/default-sort-type) · [No Results Page](https://baymard.com/blog/no-results-page) · [Smashing/Baymard: Pagination vs Load more](https://smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons)
- Design system: [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/) · [GOV.UK Tag](https://design-system.service.gov.uk/components/tag/) · [Carbon Data table](https://carbondesignsystem.com/components/data-table/usage/) · [Carbon Loading](https://carbondesignsystem.com/patterns/loading-pattern/) · [Carbon Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/) · [Atlassian Lozenge](https://atlassian.design/components/lozenge/usage) · [Cloudscape Timestamps](https://cloudscape.design/patterns/general/timestamps/) · [Primer token names](https://primer.style/foundations/primitives/token-names)
- W3C và accessibility: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Understanding 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) · [Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) · [Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) · [Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) · [APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) · [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) · [Roselli: Sortable Columns](https://adrianroselli.com/2021/04/sortable-table-columns.html) · [Roselli: Tables & CSS display](https://adrianroselli.com/2018/02/tables-css-display-properties-and-aria.html) · [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Nền tảng kỹ thuật**
- Font: [google/fonts ofl/](https://github.com/google/fonts/tree/main/ofl) · [Be Vietnam Pro](https://github.com/google/fonts/blob/main/ofl/bevietnampro/METADATA.pb) · [Inter](https://github.com/google/fonts/blob/main/ofl/inter/METADATA.pb) · [JetBrains Mono](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/METADATA.pb) · [DM Sans](https://github.com/google/fonts/blob/main/ofl/dmsans/METADATA.pb) · [Fira Code](https://github.com/google/fonts/blob/main/ofl/firacode/METADATA.pb) · [Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2) · [Utopia](https://utopia.fyi/blog/designing-with-fluid-type-scales/) · [MDN font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric)
- Thời gian: [IEEE 802.16 AoE](https://www.ieee802.org/16/aoe.html) · [tz database](https://en.wikipedia.org/wiki/Tz_database) · [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) · [MDN RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/format) · [MDN Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) · [BCD Temporal](https://github.com/mdn/browser-compat-data/tree/main/javascript/builtins/Temporal) · [MDN setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) · [MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) · [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- DOM và state: [MDN pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) · [MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) · [MDN template](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template) · [MDN custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) · [MDN AbortSignal.timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) · [MDN Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- CSS: [MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme) · [web.dev theme switch](https://web.dev/articles/building/a-theme-switch-component) · [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) · [MDN repeat()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat) · [MDN Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) · [BCD container](https://github.com/mdn/browser-compat-data/blob/main/css/at-rules/container.json) · [Bootstrap breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/) · [getbem.com](https://getbem.com/naming/)
- Công cụ và icon: [Vite Guide](https://vite.dev/guide/) · [Vite Features](https://vite.dev/guide/features.html) · [TSConfig reference](https://www.typescriptlang.org/tsconfig/#strict) · [lucide-static](https://lucide.dev/guide/packages/lucide-static) · [Lucide sprite](https://lucide.dev/guide/static/svg-sprite)
- Lịch: [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) · [Google Calendar URL (cộng đồng)](https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md)
