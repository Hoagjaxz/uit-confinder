---
name: UIT ConFinder
description: Tra cứu hạn nộp bài hội nghị khoa học theo giờ Việt Nam, mỗi hội nghị là một thẻ tên đeo cổ.
colors:
  primary: "#5b2d9b"
  lanyard: "#d6336c"
  paper: "#f1eff5"
  badge: "#ffffff"
  ink: "#1d1a24"
  mute: "#625c70"
  rule: "#dcd8e4"
  rule-strong: "#c8c2d6"
  hover: "#f7f5fa"
  tint: "#e6e2ee"
  closed: "#ebe8f0"
  dim: "#8a8399"
  ribbon-core-a-star: "#2a1647"
  ribbon-tier-a: "#7a3fc0"
  ribbon-tier-b: "#8a4cb8"
  ribbon-tier-c: "#6e6880"
  urgent-fg: "#a8200f"
  urgent-bg: "#fde6e1"
  week-fg: "#8a5200"
  week-bg: "#fdf0d3"
  month-fg: "#1f4fae"
  month-bg: "#e5edfb"
  open-fg: "#3b6a12"
  open-bg: "#ecf3d6"
  closed-fg: "#586070"
  closed-bg: "#eceef2"
  dark-paper: "#131018"
  dark-badge: "#1c1823"
  dark-ink: "#f2eff6"
  dark-primary: "#b794f6"
  dark-lanyard: "#ff5c93"
typography:
  display:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(34px, 9vw, 64px)"
    fontWeight: 600
    lineHeight: 1.04
  headline:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.15
  title:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Be Vietnam Pro, system-ui, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Be Vietnam Pro, system-ui, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
  deadline:
    fontFamily: "JetBrains Mono, ui-monospace, 'Cascadia Mono', Consolas, monospace"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "3px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  badge-card:
    backgroundColor: "{colors.badge}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 16px 10px"
  badge-card-hover:
    backgroundColor: "{colors.hover}"
  badge-card-closed:
    backgroundColor: "{colors.closed}"
  ribbon:
    backgroundColor: "{colors.ribbon-tier-a}"
    textColor: "{colors.badge}"
    rounded: "{rounded.sm}"
    height: "22px"
    padding: "0 16px 0 9px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 18px"
  button-outline:
    backgroundColor: "{colors.badge}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 18px"
  chip:
    backgroundColor: "{colors.badge}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "30px"
    padding: "0 13px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  urgency-label-urgent:
    backgroundColor: "{colors.urgent-bg}"
    textColor: "{colors.urgent-fg}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
  state-box:
    backgroundColor: "{colors.badge}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "32px 24px"
---

# Design System: UIT ConFinder

## Overview

**Creative North Star: "Thẻ đeo hội nghị"**

Mỗi hội nghị là một thẻ tên đeo cổ đặt trên mặt bàn xám ánh tím: tên lớn bằng serif, ruy-băng đuôi chữ V báo hạng, hạn chót in bằng mono như số bàn. Bảng màu Mận giữ ít màu; thứ bậc đến từ độ đậm, cỡ chữ, đảo màu mực và đường kẻ mảnh, không từ trang trí. Một dải dây đeo hồng cánh sen 4px ở đỉnh trang và gạch chân mục nav hiện tại là điểm nhấn duy nhất của thế giới này.

Mật độ vừa, phục vụ người so sánh nhiều hội nghị khi đang gấp. Mọi thời điểm là giờ Việt Nam (GMT+7). Bản dựng phẳng hoàn toàn: không bóng đổ, hover chỉ đổi nền. Khi bản dựng lệch hợp đồng hướng đi, bản dựng thắng (xem ruy-băng hạng B ở Colors).

**Key Characteristics:**
- Thẻ trắng trên nền bàn tím nhạt, viền 1px, bo 6px; ruy-băng và nhãn bo 3px.
- Ba giọng chữ có việc riêng: Be Vietnam Pro cho giao diện, Newsreader upright cho tên và tiêu đề, JetBrains Mono cho ngày giờ và đếm ngược.
- Mức khẩn luôn là biểu tượng cộng chữ, không bao giờ chỉ là màu.
- Có bản sáng và bản tối, cùng một bộ token đổi giá trị theo `data-theme`.

## Colors

Bảng Mận: nền xám ánh tím, mực tím đen, một nhấn tím mận và một dây hồng, cộng bộ màu ngữ nghĩa chỉ dành cho mức khẩn.

### Primary
- **Tím mận** (#5b2d9b): liên kết, sao đã lưu, viền và chữ nút viền, trạng thái focus, nền ô được chọn trong bộ lọc. Bản tối là Tím oải hương (#b794f6).

### Secondary
- **Dây đeo hồng cánh sen** (#d6336c): dải 4px trên đỉnh masthead, gạch chân mục nav hiện tại, dây xuyên qua các thẻ ở trang chủ. Bản tối #ff5c93.

### Neutral
- **Nền bàn** (#f1eff5): nền trang. Bản tối #131018.
- **Thẻ trắng** (#ffffff): mặt thẻ, masthead, ô nhập (ô nhập bản sáng cũng #ffffff). Bản tối #1c1823.
- **Mực tím đen** (#1d1a24): chữ chính và nền nút chính. Bản tối #f2eff6.
- **Chữ phụ** (#625c70): mô tả, nhãn, ngày phụ.
- **Đường kẻ** (#dcd8e4) và **đường kẻ đậm** (#c8c2d6): viền thẻ, phân cách; đậm dùng cho viền ô nhập và chip.
- **Nền hover** (#f7f5fa), **nền tint** (#e6e2ee), **nền hết hạn** (#ebe8f0), **chữ mờ** (#8a8399): các tầng tonal cho hover, khung xương tải, thẻ đã qua hạn, nút vô hiệu.

### Ruy-băng rank
- **CORE A*** (#2a1647, chữ trắng; bản tối nền sáng #f2eff6 chữ tối), **hạng A / CCF A** (#7a3fc0), **hạng B** (#8a4cb8), **hạng C** (#6e6880). Chỉ tông tím, đen, xám. Hợp đồng ghi hạng B là #a15bd0; bản dựng dùng #8a4cb8 (đủ tương phản với chữ trắng), nên #8a4cb8 là giá trị chuẩn.

### Mức khẩn (ngữ nghĩa)
- **Gấp** đỏ (#a8200f trên #fde6e1), **Trong tuần** vàng nâu (#8a5200 trên #fdf0d3), **Trong tháng** lam (#1f4fae trên #e5edfb), **Còn rộng** lục (#3b6a12 trên #ecf3d6), **Đã hết hạn** xám lam (#586070 trên #eceef2). Mỗi mức có bản tối riêng trong site.css.

### Named Rules
**The Lanyard Rule.** Hồng dây đeo chỉ là dải đỉnh trang, gạch nav hiện tại và dây trang chủ. Không tô nút, chữ hay nền bằng hồng.
**The No Warm Ribbon Rule.** Ruy-băng rank không bao giờ đỏ hay cam; đỏ và cam dành cho mức khẩn.

## Typography

**Display Font:** Newsreader (Georgia, Times New Roman, serif), upright, trục optical size tự động
**Body Font:** Be Vietnam Pro (system-ui, Segoe UI, Roboto, Arial, sans-serif)
**Label/Mono Font:** JetBrains Mono (ui-monospace, Cascadia Mono, Consolas, monospace)

**Character:** Serif thẳng đứng cho tên hội nghị và tiêu đề tạo giọng ấn phẩm, sans cho giao diện, mono cho con số cần tin. Số dùng `tabular-nums` toàn site để cột ngày thẳng hàng.

### Hierarchy
- **Display** (600, clamp(34px, 9vw, 64px), 1.04): tiêu đề hero trang chủ. Tên hội nghị đầu hàng trang chủ 38px, trang chi tiết h1 40px, 52px từ 64rem.
- **Headline** (600, 28px, 1.15; 34px từ 40rem): h1 trang danh sách, blog; bài blog 32/40/44px.
- **Title** (600, 19px, 1.2): tên hội nghị trên thẻ đeo; tiêu đề phần 22px.
- **Body** (400, 15px, 1.55): giao diện; văn bản bài blog 17px, 1.7, tối đa 68ch.
- **Label** (700 hoặc 600, 12 đến 13px): ruy-băng, nhãn, chip, tiêu đề nhóm lọc.
- **Deadline** (mono 700, 24px, 1.2): ngày chót trên thẻ; 40px và 56px ở thẻ trang chủ, 44px ở trang chi tiết. Giờ 12.5px mono, đếm ngược 17px mono 600.

### Named Rules
**The Mono For Moments Rule.** Mọi ngày, giờ và đếm ngược dùng JetBrains Mono; mọi tên hội nghị và tiêu đề dùng Newsreader upright, không nghiêng.

## Layout

Khung `.container` tối đa 1280px, đệm ngang 16px (24px từ 40rem). Danh sách là cột lọc trái 260px cố định (sticky) cộng vùng thẻ từ 64rem; dưới đó xếp dọc. Thẻ đeo là lưới một cột ở di động (tên, ngày, trạng thái xếp tầng) và một hàng bốn vùng từ 40rem: sao, tên, ngày chót 9.5rem, trạng thái 11.5rem. Danh sách thẻ cách nhau 8px. Trang chủ treo ba thẻ trên dây: ba cột 1.35fr 1fr 1fr từ 64rem, dưới đó cuộn ngang có snap (cột min(82vw, 330px)). Trang đọc dùng cột 46rem (trang phụ) hoặc 68ch (bài blog) cộng mục lục 280px sticky từ 64rem. Nhịp khoảng cách chủ yếu 4, 8, 12, 16, 24, 32px. Mọi vùng chạm tối thiểu 44px. Breakpoint: 40rem và 64rem.

## Elevation & Depth

Không dùng bóng đổ ở bất cứ đâu (không có `box-shadow` trong stylesheet). Chiều sâu đến từ viền 1px, tầng nền tonal (bàn, thẻ trắng, hover, tint, hết hạn) và khe xỏ dây ở mép trên thẻ.

### Named Rules
**The Flat Card Rule.** Thẻ phẳng khi nghỉ và khi hover; hover chỉ đổi nền sang #f7f5fa. Focus là vòng 2px tím mận cách 2px.

## Shapes

Hình khối vuông vức, bo nhỏ: 6px cho thẻ, nút, ô nhập, panel; 3px cho ruy-băng, nhãn, chip, ô chọn. Dấu hiệu nhận diện là khe xỏ dây (vết cắt 28x8px ở mép trên thẻ, bo dưới 8px, màu nền bàn) và ruy-băng có đuôi chữ V (clip-path, đuôi sâu 7px). Nút tròn chỉ cho nút biểu tượng 44px (menu, sáng/tối, lưu). Thẻ hết hạn mờ còn 66% và đổi sang nền #ebe8f0.

## Components

### Thẻ đeo (badge-card)
Thành phần ký hiệu. Khe xỏ dây ở mép trên, sao lưu ở trái, tên Newsreader 19px, tên đầy đủ cắt một dòng, ruy-băng và nơi tổ chức; giữa là mốc kế tiếp, ngày chót mono 24px và giờ; phải là nhãn mức khẩn và đếm ngược. Cả thẻ là một vùng bấm (liên kết phủ kín), focus-within vẽ vòng focus. Ở trang chủ khe thành tai treo 30x10px màu dây hồng.

### Ruy-băng rank (ribbon)
Cao 22px, chữ 12px đậm, đuôi V; bốn màu theo hạng (xem Colors). Trên trang chi tiết cao 26px.

### Nhãn mức khẩn (ub)
Biểu tượng SVG 16px cộng chữ đậm, viền 1px cùng màu chữ, nền ngữ nghĩa, cao tối thiểu 28px, bo 3px. Năm mức: Gấp (dưới 3 ngày), Trong tuần (dưới 7), Trong tháng (dưới 30), Còn rộng (từ 30), Đã hết hạn.

### Buttons
- **Shape:** bo 6px, cao 44px, đệm ngang 18px, chữ 14px đậm.
- **Outline (mặc định):** nền thẻ trắng, viền và chữ tím mận; hover đổi nền #f7f5fa.
- **Primary:** nền mực tím đen, chữ nền bàn; hover giảm opacity còn 0.88.
- **Ghost:** không viền, hover đổi nền.

### Chips
Cao 30px, bo 3px, viền #c8c2d6, nền trắng; chọn: nền mực, chữ nền bàn. Chip lọc đang áp dụng (`fchip`) viền và chữ tím mận, cao 34px. Chip đứng trong nút 44px.

### Inputs / Fields
Cao tối thiểu 44px, viền #c8c2d6, nền trắng (tối #241f2d), bo 6px. Focus: vòng 2px tím mận cách 2px quanh cả khung. Ô chọn và radio tự vẽ 20px, chọn thì nền hoặc chấm tím mận.

### Navigation
Masthead dính đỉnh, nền thẻ trắng, dải hồng 4px phía trên. Wordmark Newsreader 21px, "Con" nhấn tím mận. Mục nav 14px, chữ phụ; hiện tại đậm 700 và gạch chân hồng 2px. Dưới 64rem nav thu vào nút menu; ô tìm kiếm xuống hàng riêng ở di động.

### Trạng thái danh sách (state-box)
Khung trắng viền 1px, bo 6px, căn giữa, đệm 32x24px, tiêu đề 20px; lỗi dùng biểu tượng đỏ. Đang tải dùng khung xương nhấp nháy opacity (tắt khi giảm chuyển động). Dải xem thử `?state=` là khung viền mảnh phía trên danh sách.

## Hợp đồng dữ liệu: hạn nộp bài ở hero trang chủ

Giao diện chỉ đọc các trường dưới đây; số "Còn ..." không bao giờ nhập tay. Trình duyệt lấy hạn trừ giờ máy mỗi nhịp nên tải lại trang hay để tab mở lâu vẫn đúng.

```json
{
  "serverNow": "2026-10-09T14:46:51+07:00",
  "conferences": [
    { "name": "ICSE", "year": "2027", "href": "hoi-nghi.html",
      "milestone": "Nộp toàn văn",
      "deadline": "2026-10-11T18:59:00+07:00",
      "opensAt": "2026-09-26T18:59:00+07:00" }
  ]
}
```

- **`deadline`** (bắt buộc): ISO 8601 có múi giờ, ví dụ `2026-10-11T18:59:00+07:00`. Thiếu múi giờ hoặc sai định dạng thì hội nghị đó bị bỏ qua. Là mốc đang đếm ngược (mốc chưa qua gần nhất của hội nghị).
- **`milestone`** (bắt buộc): tên mốc, hiện ở dòng phụ ("Nộp toàn văn lúc 18:59 ngày 11/10/2026, giờ Việt Nam"). Giờ hiển thị luôn quy về giờ Việt Nam (+07:00).
- **`opensAt`** (tuỳ chọn): ISO có múi giờ, lúc mở nộp bài. Vạch thanh mốc ngày chia đều khoảng `opensAt` đến `deadline`. Vắng thì giao diện lấy 30 ngày trước hạn.
- **`serverNow`** (tuỳ chọn): ISO tại lúc máy chủ dựng trang. Giao diện tính độ lệch = `serverNow` trừ giờ máy lúc tải rồi cộng vào mọi phép so sánh; vắng hoặc sai thì độ lệch 0.
- **Cờ đóng**: không có cờ riêng. Hội nghị là "đã đóng" khi `deadline` không còn ở tương lai. Hội nghị đóng sớm hơn hạn thì backend gửi `deadline` bằng thời điểm đóng; hội nghị đã đóng hẳn gửi hạn của mốc nộp cuối cùng.
- **Thứ tự**: giao diện tự sắp tăng dần theo `deadline` (hạn gần nhất lên đầu), backend không cần sắp. Hội nghị đã đóng chỉ hiện khi không còn hội nghị nào mở.
- **Gắn vào HTML**: mỗi hội nghị là một `<li data-deadline data-opens data-label>` trong `ul[data-hero-list]` (xem `hero:names` trong `tools/build-lists.mjs`); `serverNow` là `data-server-now` trên `h1[data-hero-clock]`. Khối HTML tĩnh dựng từ cùng hàm với trình duyệt (`site/js/hero-clock.js`), nên server render đúng khuôn đó thì tắt JS vẫn hợp lý.

Bốn trạng thái, tính từ giây còn lại của hội nghị đầu danh sách còn mở:

| Còn lại | Hiển thị |
|---|---|
| từ 1 ngày | "Còn 2 ngày 04:12:09 để nộp ICSE" |
| dưới 24 giờ | bỏ phần ngày, viên nang đỏ khẩn, nhãn "Sắp hết hạn" ở dòng phụ |
| bằng 0 hoặc đã qua khi đang xem | "Đã hết hạn nộp ICSE" 4 giây, rồi tự chuyển sang hội nghị kế tiếp còn mở |
| không còn hội nghị mở | "Hiện chưa có hội nghị nào đang mở nộp bài", hàng tên chuyển sang các hội nghị đã đóng |

Vùng `aria-live="polite"` (`[data-hero-live]`) chỉ đọc khi trạng thái đổi (sang dưới 24 giờ, hết hạn), không đọc mỗi giây. Tên và liên kết từ dữ liệu được thoát ký tự HTML trước khi chèn.

## Do's and Don'ts

### Do:
- **Do** dùng token trong `:root` (`--paper`, `--badge`, `--ink`, `--accent`, `--lanyard`); mọi màu mới có cặp bản sáng và tối.
- **Do** hiển thị mọi hạn bằng giờ Việt Nam (GMT+7), ngày giờ bằng JetBrains Mono.
- **Do** ghép mức khẩn bằng biểu tượng cộng chữ, không chỉ màu.
- **Do** giữ vùng chạm tối thiểu 44px và vòng focus 2px tím mận.
- **Do** để hạng đi bằng ruy-băng tím, đen, xám.

### Don't:
- **Don't** dùng bóng đổ; chiều sâu dùng viền và tầng nền.
- **Don't** làm ruy-băng rank đỏ hoặc cam.
- **Don't** viết nghiêng Newsreader hay đặt tên hội nghị bằng sans.
- **Don't** dùng hồng dây đeo cho nút hoặc nền khối lớn.
- **Don't** thêm hero giới thiệu, lưới thẻ đều chằng chịt, biểu đồ hay thước trang trí vào danh sách.
