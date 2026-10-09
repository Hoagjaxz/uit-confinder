# UIT ConFinder: hoàn thiện giao diện tĩnh, kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện website tĩnh `site/` (nền responsive + a11y + dark mode, 4 trạng thái danh sách, 5 trang phụ, 6 trang chi tiết hội nghị) theo spec `docs/superpowers/specs/2026-10-09-confinder-hoan-thien-ui-design.md`.

**Architecture:** Site vẫn là HTML/CSS tĩnh, JS tối thiểu. Header/footer được đồng bộ vào mọi trang bằng một script Node idempotent (`tools/sync-chrome.mjs`) và được `tools/check-site.mjs` đối chiếu, nên không phải sửa tay ~40 file. Dark mode là `:root[data-theme="dark"]` ghi đè token màu; mọi màu cứng được chuyển thành token trước. Trang chi tiết hội nghị được sinh từ một file dữ liệu để thẻ trong lịch và trang chi tiết luôn khớp.

**Tech Stack:** HTML5, CSS (custom properties, `color-mix`), JS thuần (IIFE, không bundler), Node 24 (`node:test`, ESM `.mjs`) chỉ cho công cụ kiểm tra/sinh trang. Không thêm dependency.

**Lệch so với spec (có chủ đích):**
- Dark mode chỉ dùng `:root[data-theme="dark"]`, không nhân đôi khối `@media (prefers-color-scheme)`. `theme.js` chạy đồng bộ trong `<head>`, đọc lựa chọn đã lưu hoặc `prefers-color-scheme` rồi gán `data-theme` trước khi vẽ. Không có JS thì hiện giao diện sáng.
- Thêm `js/nav.js` (menu điện thoại + mở/đóng nhóm bộ lọc theo độ rộng) và `js/contact.js` (thông báo form liên hệ), ngoài ba file JS nêu trong spec.
- Thêm thư mục `tools/` ở gốc repo (ngoài `site/`) cho script kiểm tra/sinh trang.

**Quy ước chung**
- Thư mục làm việc: gốc repo `D:\UIT\Cơ sở ngành\IE104 - Internet & Web\Đồ án` (gọi là `<repo>`). Mọi lệnh `node tools/...` chạy từ `<repo>`.
- Xem thử: `node tools/serve.mjs` rồi mở `http://localhost:5173/` (hoặc `preview_start` với `.claude/launch.json`).
- Kiểm tra toàn site: `node tools/check-site.mjs`, `node tools/check-contrast.mjs`, `node --test tools/theme.test.mjs tools/save.test.mjs`.
- Mỗi task kết thúc bằng một commit. Không `git push` trừ khi người dùng đồng ý (xem Task 19).
- Dữ liệu hội nghị là dữ liệu minh hoạ, "hôm nay" cố định là 09/10/2026.

---

## Cấu trúc file

| File | Việc | Task |
|---|---|---|
| `tools/serve.mjs` | Máy chủ tĩnh để xem thử | 1 |
| `.claude/launch.json` | Cấu hình `preview_start` | 1 |
| `tools/chrome.mjs` | Dữ liệu + mẫu HTML header/footer | 1, 9, 16, 19 |
| `tools/sync-chrome.mjs` | Ghi header/footer vào mọi trang (idempotent) | 1, 9, 19 |
| `tools/check-site.mjs` | Kiểm link nội bộ, meta, đồng bộ chrome | 1, 18, 19 |
| `tools/check-contrast.mjs` | Contrast WCAG AA, hai giao diện | 1 |
| `tools/probe-overflow.js` | Đoạn dán vào console để dò tràn ngang | 6 |
| `site/css/site.css` | Token, header, dark mode | 2, 3, 4 |
| `site/js/theme.js` + `tools/theme.test.mjs` | Chuyển giao diện sáng/tối | 3 |
| `site/js/nav.js` | Menu điện thoại, nhóm bộ lọc | 4, 6 |
| `site/css/states.css`, `site/js/states-demo.js` | 4 trạng thái danh sách | 8 |
| `site/js/save.js` + `tools/save.test.mjs` | Lưu hội nghị (★) | 9 |
| `tools/shell.mjs`, `tools/new-page.mjs` | Dựng khung trang mới | 10 |
| `site/css/pages.css` | Style trang phụ | 10 |
| `site/faq-aoe.html`, `gioi-thieu.html`, `lien-he.html`, `da-luu.html`, `404.html` | Trang phụ | 11–15 |
| `site/js/contact.js` | Form liên hệ | 13 |
| `tools/conferences.mjs`, `tools/build-conferences.mjs` | Dữ liệu + bộ sinh trang chi tiết | 17 |
| `site/hoi-nghi.html`, `site/hoi-nghi-<slug>.html` | 6 trang chi tiết (sinh ra) | 17 |

---

## Giai đoạn 0: công cụ

### Task 1: Công cụ dev và kiểm tra

**Files:**
- Create: `tools/serve.mjs`, `.claude/launch.json`, `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/check-site.mjs`, `tools/check-contrast.mjs`

- [ ] **Step 1: Tạo máy chủ xem thử**

```js
// tools/serve.mjs
// Máy chủ tĩnh tối giản cho site/ (chỉ dùng khi phát triển).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
};

createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = normalize(join(ROOT, path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file));
    } catch {
        try { res.writeHead(404, { 'content-type': TYPES['.html'] }).end(await readFile(join(ROOT, '404.html'))); }
        catch { res.writeHead(404).end('Not found'); }
    }
}).listen(5173, () => console.log('http://localhost:5173'));
```

```json
// .claude/launch.json (không có dòng comment trong file thật)
{
    "version": "0.0.1",
    "configurations": [
        { "name": "site", "runtimeExecutable": "node", "runtimeArgs": ["tools/serve.mjs"], "port": 5173 }
    ]
}
```

(File `.claude/launch.json` chỉ chứa phần JSON, bỏ dòng comment đầu.)

- [ ] **Step 2: Tạo `tools/chrome.mjs`**

```js
// tools/chrome.mjs
// Header/footer dùng chung: dữ liệu + mẫu HTML. sync-chrome.mjs ghi vào trang, check-site.mjs đối chiếu.
export const NAV = [
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'blog.html', label: 'Bài viết' },
];
export const FOOT_PAGES = [
    { href: 'index.html', label: 'Trang chủ' },
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'blog.html', label: 'Bài viết' },
];
export const FOOT_NOTE = '© 2026 UIT ConFinder. Dữ liệu hội nghị là dữ liệu minh hoạ cho đồ án, hãy kiểm tra lại trên trang chính thức trước khi nộp bài.';

const svg = (cls, body) =>
    `<svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const MENU = svg('ic', '<path d="M4 6h16M4 12h16M4 18h16"/>');
const MOON = svg('ic moon', '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>');
const SUN = svg('ic sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>');

/** Trang con của một mục nav vẫn được đánh dấu aria-current. */
export const currentFor = rel => {
    if (rel.startsWith('blog/')) return 'blog.html';
    if (/^hoi-nghi/.test(rel)) return 'lich-hoi-nghi.html';
    return rel;
};

export const skipHtml = '<a class="skip" href="#main">Bỏ qua đến nội dung chính</a>';

export const navHtml = (prefix, current) =>
    '<!--c:nav--><button type="button" class="menu-btn" aria-expanded="false" aria-controls="site-nav">' + MENU + '<span class="vh">Mở menu</span></button>' +
    '<nav class="nav" id="site-nav" aria-label="Điều hướng chính">' +
    NAV.map(n => `<a href="${prefix}${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('') +
    '</nav><button type="button" class="theme-btn" data-theme-toggle aria-pressed="false">' + MOON + SUN + '<span class="vh">Giao diện tối</span></button><!--/c:nav-->';

export const footLinksHtml = prefix =>
    '<!--c:foot--><div><h2>Trang</h2>' + FOOT_PAGES.map(n => `<a href="${prefix}${n.href}">${n.label}</a>`).join('') + '</div><!--/c:foot-->';
```

- [ ] **Step 3: Tạo `tools/sync-chrome.mjs`**

```js
// tools/sync-chrome.mjs
// Đồng bộ header/footer vào mọi trang HTML trong site/. Chạy lại bao nhiêu lần cũng cho cùng kết quả.
// Dùng: node tools/sync-chrome.mjs [đường/dẫn/tương/đối.html ...]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skipHtml, navHtml, footLinksHtml, currentFor, FOOT_NOTE } from './chrome.mjs';

export const SITE = fileURLToPath(new URL('../site/', import.meta.url));
export const htmlFiles = (dir = SITE) =>
    readdirSync(dir, { withFileTypes: true }).flatMap(e =>
        e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);

const NAV_RE = /<!--c:nav-->[\s\S]*?<!--\/c:nav-->|<nav class="nav"[\s\S]*?<\/nav>/;
const FOOT_RE = /<!--c:foot-->[\s\S]*?<!--\/c:foot-->|<div><h2>Trang<\/h2>[\s\S]*?<\/div>/;

export const syncPage = (html, rel) => {
    const prefix = '../'.repeat(rel.split('/').length - 1);
    let out = html;
    if (!out.includes('class="skip"')) out = out.replace('<body>', `<body>\n${skipHtml}`);
    if (!out.includes('js/theme.js')) out = out.replace('</head>', `    <script src="${prefix}js/theme.js"></script>\n</head>`);
    if (!out.includes('js/nav.js')) out = out.replace('</body>', `<script src="${prefix}js/nav.js"></script>\n</body>`);
    out = out.replace(/<main(?:\s[^>]*)?>/, '<main id="main" tabindex="-1">');
    out = out.replace(NAV_RE, () => navHtml(prefix, currentFor(rel)));
    out = out.replace(FOOT_RE, () => footLinksHtml(prefix));
    const i = out.indexOf('<footer class="foot">');
    if (i >= 0) out = out.slice(0, i) + out.slice(i).replace(/<small>[\s\S]*?<\/small>/, () => `<small>${FOOT_NOTE}</small>`);
    return out;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const only = process.argv.slice(2);
    for (const file of htmlFiles()) {
        const rel = relative(SITE, file).split('\\').join('/');
        if (only.length && !only.includes(rel)) continue;
        const before = readFileSync(file, 'utf8');
        const after = syncPage(before, rel);
        if (after !== before) { writeFileSync(file, after); console.log('updated', rel); }
    }
}
```

- [ ] **Step 4: Tạo `tools/check-site.mjs`**

```js
// tools/check-site.mjs
// Kiểm tra tĩnh toàn site. Dùng: node tools/check-site.mjs (thoát mã 1 nếu có lỗi).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { SITE, htmlFiles, syncPage } from './sync-chrome.mjs';

const errors = [];
const err = (rel, msg) => errors.push(`${rel}: ${msg}`);
const slash = p => p.split('\\').join('/');
const pages = new Map(htmlFiles().map(f => [slash(relative(SITE, f)), readFileSync(f, 'utf8')]));

for (const [rel, html] of pages) {
    if (!/<html lang="vi"/.test(html)) err(rel, 'thiếu <html lang="vi">');
    if (!/<title>[^<]+<\/title>/.test(html)) err(rel, 'thiếu <title>');
    if (!/<meta name="description" content="[^"]+"/.test(html)) err(rel, 'thiếu meta description');
    if (!/<meta name="viewport"/.test(html)) err(rel, 'thiếu meta viewport');
    if (syncPage(html, rel) !== html) err(rel, 'header/footer chưa đồng bộ (chạy node tools/sync-chrome.mjs)');
    for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) err(rel, `<img> thiếu alt: ${m[0].slice(0, 60)}`);
    for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
        const url = m[1];
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue;
        if (url === '#' || url === '') { err(rel, `liên kết rỗng href="${url}"`); continue; }
        const [pathPart, hash = ''] = url.split('#');
        const file = pathPart.split('?')[0];
        const target = file ? slash(join(dirname(rel), file)) : rel;
        const targetHtml = pages.get(target);
        if (!targetHtml && !existsSync(join(SITE, target))) { err(rel, `liên kết gãy: ${url}`); continue; }
        if (hash && targetHtml && !targetHtml.includes(`id="${hash}"`)) err(rel, `neo không tồn tại: ${url}`);
    }
}

if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} lỗi`);
    process.exit(1);
}
console.log(`OK: ${pages.size} trang`);
```

- [ ] **Step 5: Tạo `tools/check-contrast.mjs`**

```js
// tools/check-contrast.mjs
// Kiểm tra contrast WCAG AA (4.5:1) của token màu sáng/tối trong site/css/site.css.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../site/css/site.css', import.meta.url)), 'utf8');
const tokens = re => {
    const m = css.match(re);
    if (!m) throw new Error(`không tìm thấy khối ${re}`);
    return Object.fromEntries([...m[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map(x => [x[1], x[2]]));
};
const light = tokens(/:root\s*\{([^}]*)\}/);
const dark = { ...light, ...tokens(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/) };

const lum = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

const PAIRS = [
    ['ink', 'paper'], ['ink', 'card'], ['mute', 'paper'], ['mute', 'card'], ['mute', 'closed'], ['mute', 'tint'], ['mute', 'past'],
    ['ink', 'field'], ['mute', 'field'], ['link', 'paper'], ['link', 'card'], ['link', 'gold-soft'],
    ['gold-text', 'paper'], ['gold-text', 'card'], ['#ffffff', 'navy'], ['#ffffff', 'navy-2'], ['on-navy', 'navy'],
    ['ink', 'gold-soft'], ['ink', 'tint'],
    ['c-fg', 'c-bg'], ['s-fg', 's-bg'], ['u-fg', 'u-bg'], ['o-fg', 'o-bg'], ['x-fg', 'x-bg'],
];

let bad = 0;
for (const [mode, t] of [['sáng', light], ['tối', dark]]) {
    for (const [fg, bg] of PAIRS) {
        const f = fg.startsWith('#') ? fg : t[fg];
        const b = bg.startsWith('#') ? bg : t[bg];
        if (!f || !b) { console.error(`[${mode}] thiếu token ${fg} hoặc ${bg}`); bad++; continue; }
        const r = ratio(f, b);
        if (r < 4.5) { console.error(`[${mode}] ${fg} trên ${bg}: ${r.toFixed(2)} < 4.5`); bad++; }
    }
}
if (bad) process.exit(1);
console.log('OK: mọi cặp màu đạt WCAG AA (4.5:1) ở cả hai giao diện');
```

- [ ] **Step 6: Chạy, xác nhận FAIL đúng chỗ**

Run: `node tools/check-site.mjs`
Expected: thoát mã 1; mỗi trang (4 trang + 29 bài) có dòng `header/footer chưa đồng bộ`; không có dòng `liên kết gãy` nào (nếu có, ghi lại để biết lỗi có sẵn).

Run: `node tools/check-contrast.mjs`
Expected: thoát mã 1 với `thiếu token ... closed ...` (token chưa tồn tại) hoặc lỗi `không tìm thấy khối`.

- [ ] **Step 7: Commit**

```bash
git add tools .claude/launch.json
git commit -m "chore: thêm công cụ xem thử, kiểm tra site và contrast"
```

---

## Giai đoạn 1: nền (responsive, a11y, dark mode)

### Task 2: Chuyển màu cứng thành token (giao diện sáng không đổi)

**Files:**
- Modify: `site/css/site.css`, `site/css/conference.css`, `site/css/blog.css`, `site/css/landing.css`
- Tạm: `tools/_migrate-tokens.mjs` (xoá sau khi chạy, không commit)

- [ ] **Step 1: Chụp ảnh nền so sánh (giao diện sáng)**

Chạy `node tools/serve.mjs`. Mở và chụp màn hình `http://localhost:5173/index.html`, `lich-hoi-nghi.html`, `hoi-nghi.html`, `blog.html` ở 1280px. Dùng làm mốc "không đổi".

- [ ] **Step 2: Thêm token sáng mới vào `:root`**

Edit `site/css/site.css`, thay `    --r: 8px;` bằng:

```css
    --link: #1e2a4a;
    --focus: #8a6411;
    --gold-text: #8a6411;
    --on-navy: #f3e6c4;
    --field: #ffffff;
    --tint: #e9e1cf;
    --tint-2: #efe8d7;
    --closed: #efeadd;
    --past: #f4efe3;
    --dim: #a7a08f;
    color-scheme: light;
    --r: 8px;
```

- [ ] **Step 3: Viết và chạy script chuyển đổi**

```js
// tools/_migrate-tokens.mjs  (chạy một lần rồi xoá)
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../site/css/', import.meta.url);
const NAMES = ['site.css', 'conference.css', 'blog.css', 'landing.css'];
const files = Object.fromEntries(NAMES.map(n => [n, readFileSync(new URL(n, dir), 'utf8')]));

const everywhere = (from, to) => { for (const n of NAMES) files[n] = files[n].split(from).join(to); };
const everywhereRe = (re, to) => { for (const n of NAMES) files[n] = files[n].replace(re, to); };
const onLine = (file, start, from, to) => {
    let hit = 0;
    files[file] = files[file].split('\n').map(l => {
        if (l.trimStart().startsWith(start) && l.includes(from)) { hit++; return l.split(from).join(to); }
        return l;
    }).join('\n');
    if (!hit) throw new Error(`không thấy ${file}: ${start} / ${from}`);
};

// Màu chữ/đường viền dùng token riêng để tối được độc lập với nền.
everywhereRe(/(?<![-\w])color: var\(--navy\)/g, 'color: var(--link)');
everywhereRe(/(?<![-\w])color: var\(--gold\)/g, 'color: var(--gold-text)');
everywhere('border: 1px solid var(--navy)', 'border: 1px solid var(--link)');
everywhere('outline: 3px solid var(--gold)', 'outline: 3px solid var(--focus)');
// Màu nền cứng.
everywhere('#a7a08f', 'var(--dim)');
everywhere('#f4efe3', 'var(--past)');
everywhere('#efeadd', 'var(--closed)');
everywhere('#efe8d6', 'var(--tint-2)');
everywhere('#efe8d7', 'var(--tint-2)');
everywhere('#e9e1cf', 'var(--tint)');
everywhere('rgba(246, 241, 231, .94)', 'color-mix(in srgb, var(--paper) 94%, transparent)');
everywhere('rgba(30, 42, 74, .07)', 'color-mix(in srgb, var(--link) 8%, transparent)');
everywhere('border: 1px solid #bbdcc5', 'border: 1px solid color-mix(in srgb, currentColor 35%, transparent)');

// Chữ trên nền navy luôn sáng.
onLine('site.css', '.brand-mark {', 'color: var(--gold-soft)', 'color: var(--on-navy)');
onLine('site.css', '.badge {', 'color: var(--gold-soft)', 'color: var(--on-navy)');
onLine('landing.css', '.ticker {', 'color: var(--gold-soft)', 'color: var(--on-navy)');
onLine('landing.css', '.field-t i {', 'color: var(--gold-soft)', 'color: var(--on-navy)');
onLine('site.css', '.btn.pri {', 'color: #fff }', 'color: #fff; border-color: var(--navy) }');
// Ô nhập: nền theo token; riêng ô trong dải bản tin luôn trắng.
onLine('site.css', '.news .field {', 'color: var(--ink)', 'color: #16202a');
onLine('site.css', '.news .field input', 'font: inherit;', 'font: inherit; color: inherit;');
onLine('blog.css', '.field {', 'background: #fff', 'background: var(--field)');
onLine('blog.css', '.select {', 'background: #fff', 'background: var(--field)');
onLine('conference.css', '.digits div', 'background: #fff', 'background: var(--field)');
// Ô chọn: tô bằng --link để vẫn thấy rõ ở giao diện tối.
onLine('conference.css', '.opt input:checked', 'var(--navy)', 'var(--link)');
onLine('conference.css', '.opt input[type=checkbox]:checked::after', 'border: solid #fff', 'border: solid var(--card)');
onLine('conference.css', '.opt input[type=radio]:checked::after', 'background: var(--navy)', 'background: var(--link)');

// Trang chi tiết: màu "mốc kế tiếp" theo --k-fg/--k-bg (mặc định đỏ, đổi theo .lv-*).
files['conference.css'] = files['conference.css'].split('\n').map(l =>
    l.trimStart().startsWith('.cd.lc') ? l : l.split('var(--c-fg)').join('var(--k-fg)').split('var(--c-bg)').join('var(--k-bg)')).join('\n');
onLine('conference.css', '.dgrid {', 'margin-top: 8px }',
    'margin-top: 8px; --k-fg: var(--c-fg); --k-bg: var(--c-bg) }\n' +
    '.dgrid.lv-s { --k-fg: var(--s-fg); --k-bg: var(--s-bg) }\n' +
    '.dgrid.lv-u { --k-fg: var(--u-fg); --k-bg: var(--u-bg) }\n' +
    '.dgrid.lv-o { --k-fg: var(--o-fg); --k-bg: var(--o-bg) }\n' +
    '.dgrid.lv-x { --k-fg: var(--x-fg); --k-bg: var(--x-bg) }');

for (const n of NAMES) writeFileSync(new URL(n, dir), files[n]);
console.log('xong');
```

Run: `node tools/_migrate-tokens.mjs`
Expected: in `xong`. Nếu ném `không thấy ...`, mở file CSS tương ứng, so dòng với script rồi sửa script (không sửa tay CSS).

- [ ] **Step 4: Kiểm tra còn sót màu cứng nào**

Run: `grep -nE "#[0-9a-fA-F]{3,6}\b" site/css/*.css | grep -v "^site/css/site.css:[0-9]*:    --"`
Expected: chỉ còn các giá trị hằng ở cả hai giao diện: `#fff` (chữ/viền trên nền navy), `#1b1303` (chữ trên nền vàng), `#16202a` (chữ trong ô bản tin), `#c9d1e6` `#f87171` `#fecaca` `#bbf7d0` `#cf9c36` (dải bản tin), `#10172b` `#aab3cc` `#263055` (footer). Mọi giá trị khác là sót, thêm một dòng `everywhere`/`onLine` rồi chạy lại trên bản `git checkout site/css` mới.

- [ ] **Step 5: So sánh trực quan**

Tải lại 4 trang ở Step 1. Expected: giống hệt ảnh nền (chữ vàng "eyebrow" và "ConFinder" ở logo sẫm hơn một chút, đó là chủ ý để đủ contrast).

- [ ] **Step 6: Xoá script tạm và commit**

```bash
rm tools/_migrate-tokens.mjs
git add site/css
git commit -m "refactor(css): chuyển màu cứng thành token, chuẩn bị dark mode"
```

### Task 3: Dark mode (token tối + theme.js)

**Files:**
- Modify: `site/css/site.css`
- Create: `site/js/theme.js`, `tools/theme.test.mjs`

- [ ] **Step 1: Viết test thất bại cho theme.js**

```js
// tools/theme.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/js/theme.js', import.meta.url)), 'utf8');

const run = ({ stored = null, prefersDark = false, storageThrows = false } = {}) => {
    const saved = {};
    const button = {
        pressed: null,
        setAttribute(k, v) { if (k === 'aria-pressed') this.pressed = v; },
        addEventListener(type, fn) { if (type === 'click') this.click = fn; },
    };
    const ctx = {
        document: {
            documentElement: { dataset: {} },
            querySelectorAll: () => [button],
            addEventListener: (type, fn) => { if (type === 'DOMContentLoaded') ctx.ready = fn; },
        },
        localStorage: {
            getItem: () => { if (storageThrows) throw new Error('blocked'); return saved.v ?? stored; },
            setItem: (k, v) => { if (storageThrows) throw new Error('blocked'); saved.v = v; },
        },
        matchMedia: () => ({ matches: prefersDark }),
    };
    vm.runInNewContext(SRC, ctx);
    ctx.ready();
    return { button, saved, theme: () => ctx.document.documentElement.dataset.theme };
};

test('mặc định theo hệ thống: tối', () => {
    assert.equal(run({ prefersDark: true }).theme(), 'dark');
});
test('mặc định theo hệ thống: sáng', () => {
    assert.equal(run({ prefersDark: false }).theme(), 'light');
});
test('lựa chọn đã lưu thắng hệ thống', () => {
    assert.equal(run({ stored: 'light', prefersDark: true }).theme(), 'light');
});
test('bấm nút đổi giao diện, lưu lại và cập nhật aria-pressed', () => {
    const r = run({ prefersDark: false });
    r.button.click();
    assert.equal(r.theme(), 'dark');
    assert.equal(r.saved.v, 'dark');
    assert.equal(r.button.pressed, 'true');
    r.button.click();
    assert.equal(r.theme(), 'light');
    assert.equal(r.button.pressed, 'false');
});
test('localStorage bị chặn vẫn chạy được', () => {
    const r = run({ storageThrows: true, prefersDark: true });
    assert.equal(r.theme(), 'dark');
    r.button.click();
    assert.equal(r.theme(), 'light');
});
```

- [ ] **Step 2: Chạy, xác nhận FAIL**

Run: `node --test tools/theme.test.mjs`
Expected: FAIL (`ENOENT ... theme.js`).

- [ ] **Step 3: Viết `site/js/theme.js`**

```js
// Chuyển giao diện sáng/tối. Nạp đồng bộ trong <head> để không bị nháy màu.
(() => {
    const KEY = 'confinder-theme';
    const root = document.documentElement;
    const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
    const write = v => { try { localStorage.setItem(KEY, v); } catch { /* bị chặn: chỉ đổi trong phiên */ } };
    const system = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const apply = t => {
        root.dataset.theme = t;
        document.querySelectorAll('[data-theme-toggle]').forEach(b => b.setAttribute('aria-pressed', String(t === 'dark')));
    };

    const stored = read();
    apply(stored === 'dark' || stored === 'light' ? stored : system());

    document.addEventListener('DOMContentLoaded', () => {
        apply(root.dataset.theme);
        document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            write(next);
            apply(next);
        }));
    });
})();
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `node --test tools/theme.test.mjs`
Expected: 5 test pass.

- [ ] **Step 5: Thêm khối token tối**

Edit `site/css/site.css`: thay đoạn

```css
    --mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
}
```

bằng

```css
    --mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
}
:root[data-theme="dark"] {
    color-scheme: dark;
    --ink: #e9e6dc;
    --mute: #a9b3c4;
    --paper: #0e1424;
    --card: #161f35;
    --rule: #2a3550;
    --navy: #2c4075;
    --navy-2: #3a5190;
    --gold: #d4a64a;
    --gold-soft: #2b2a22;
    --link: #a9bdf2;
    --focus: #e0b45a;
    --gold-text: #e0b45a;
    --on-navy: #f3e6c4;
    --field: #1c2742;
    --tint: #222c45;
    --tint-2: #1d2740;
    --closed: #121a2d;
    --past: #131b2f;
    --dim: #5b667e;
    --c-fg: #fca5a5; --c-bg: #3a1518;
    --s-fg: #fcd34d; --s-bg: #35280a;
    --u-fg: #a9c4ff; --u-bg: #14284f;
    --o-fg: #86efac; --o-bg: #0f2d1b;
    --x-fg: #cbd5e1; --x-bg: #232c3f;
    --sh: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 22px rgba(0, 0, 0, .35);
}
```

- [ ] **Step 6: Kiểm contrast**

Run: `node tools/check-contrast.mjs`
Expected: `OK: mọi cặp màu đạt WCAG AA (4.5:1) ở cả hai giao diện`.

- [ ] **Step 7: Commit**

```bash
git add site/css/site.css site/js/theme.js tools/theme.test.mjs
git commit -m "feat: dark mode (token tối, theme.js có test, kiểm contrast)"
```

### Task 4: CSS khung trang và nav.js

**Files:**
- Modify: `site/css/site.css`
- Create: `site/js/nav.js`

- [ ] **Step 1: Sửa `.masthead-in` và `.nav` hiện có**

Edit `site/css/site.css`:

Thay
```css
.masthead-in { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 20px; min-height: 68px }
```
bằng
```css
.masthead-in { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; min-height: 68px }
```

Thay
```css
.nav { display: flex; margin-left: auto }
```
bằng
```css
.nav { display: none; order: 2; flex: 1 1 100%; flex-direction: column; padding-bottom: 8px }
.nav[data-open=true] { display: flex }
```

- [ ] **Step 2: Thêm style skip link, nút menu, nút giao diện**

Edit `site/css/site.css`, thêm ngay trước dòng `/* ---------- controls ---------- */`:

```css
/* ---------- khung trang: skip link, menu, giao diện tối ---------- */
.skip { position: absolute; left: 12px; top: -64px; z-index: 100; padding: 12px 16px; border-radius: var(--r); background: var(--navy); color: #fff; font-weight: 600; text-decoration: none }
.skip:focus { top: 12px }
main:focus { outline: none }
.menu-btn, .theme-btn { flex: none; width: 44px; height: 44px; display: inline-grid; place-items: center; border-radius: 50%; color: var(--ink) }
.menu-btn:hover, .theme-btn:hover { background: var(--gold-soft) }
.menu-btn { margin-left: auto }
.theme-btn .sun, :root[data-theme="dark"] .theme-btn .moon { display: none }
:root[data-theme="dark"] .theme-btn .sun { display: block }

```

- [ ] **Step 3: Thêm breakpoint**

Trong khối `@media (min-width: 40rem) {` ở cuối file, thêm dòng `    .masthead-in { gap: 4px 20px }` ngay sau dòng `.container { padding: 0 24px }`. Sau khối đó thêm:

```css
@media (min-width: 64rem) {
    .menu-btn { display: none }
    .nav { display: flex; order: 0; flex: 0 0 auto; flex-direction: row; margin-left: auto; padding: 0 }
}
```

- [ ] **Step 4: Viết `site/js/nav.js`**

```js
// Menu trên điện thoại và trạng thái mở/đóng của nhóm bộ lọc theo độ rộng màn hình.
(() => {
    // Bộ lọc: màn rộng mở hết; điện thoại chỉ mở nhóm đầu để danh sách không bị đẩy xuống quá xa.
    const wide = matchMedia('(min-width: 64rem)');
    document.querySelectorAll('.side .fg').forEach((d, i) => { d.open = wide.matches || i === 0; });

    const btn = document.querySelector('.menu-btn');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    const set = open => {
        nav.dataset.open = String(open);
        btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => set(nav.dataset.open !== 'true'));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.dataset.open === 'true') { set(false); btn.focus(); }
    });
})();
```

- [ ] **Step 5: Commit**

```bash
git add site/css/site.css site/js/nav.js
git commit -m "feat: CSS khung trang (skip link, menu, nút giao diện) và nav.js"
```

### Task 5: Đồng bộ header/footer vào mọi trang

**Files:**
- Modify: toàn bộ `site/**/*.html` (qua script)

- [ ] **Step 1: Kiểm các giả định của script**

Run: `grep -L "<body>" site/*.html site/blog/*.html`
Expected: không in gì (mọi trang có đúng thẻ `<body>`).

Run: `grep -c '<div><h2>Trang</h2>' site/index.html site/blog.html site/blog/cach-viet-abstract-hoi-thao.html`
Expected: mỗi file `1`.

- [ ] **Step 2: Chạy thử trên 2 trang và xem diff**

Run: `node tools/sync-chrome.mjs index.html blog/cach-viet-abstract-hoi-thao.html && git diff --stat`
Expected: 2 file đổi. `git diff site/blog/cach-viet-abstract-hoi-thao.html` cho thấy: skip link sau `<body>`, `<script src="../js/theme.js">` trước `</head>`, `<main id="main" tabindex="-1">`, khối nav mới có tiền tố `../`, footer có dòng ghi chú mới, `<script src="../js/nav.js">` trước `</body>`. Không có thay đổi nào khác.

- [ ] **Step 3: Chạy cho cả site, rồi chạy lần nữa (idempotent)**

Run: `node tools/sync-chrome.mjs`
Expected: in `updated ...` cho các trang còn lại.

Run: `node tools/sync-chrome.mjs && git status --short | wc -l`
Expected: lần chạy thứ hai không in `updated` nào.

- [ ] **Step 4: Kiểm tra**

Run: `node tools/check-site.mjs`
Expected: `OK: 33 trang` (4 trang + 29 bài blog).

- [ ] **Step 5: Xem trên trình duyệt**

Mở `lich-hoi-nghi.html` ở 1280px: nav dàn ngang, nút trăng ở góc phải, bấm vào thì trang chuyển tối và lưu lại sau khi tải lại. Thu cửa sổ còn 375px: hiện nút ☰, bấm thì nav xổ xuống, `Esc` đóng. Bấm `Tab` ngay khi vào trang: xuất hiện "Bỏ qua đến nội dung chính".

- [ ] **Step 6: Commit**

```bash
git add site
git commit -m "feat: đồng bộ header/footer, skip link, nút giao diện vào mọi trang"
```

### Task 6: Rà responsive 375 / 768 / 1024

**Files:**
- Create: `tools/probe-overflow.js`
- Modify: `site/css/*.css` (chỉ khi dò ra lỗi)

- [ ] **Step 1: Tạo đoạn dò tràn ngang**

```js
// tools/probe-overflow.js
// Dán vào console (hoặc javascript_tool) của trình duyệt: cho biết trang có tràn ngang không và phần tử nào gây ra.
(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
        .filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest('.ticker, .lp-art, .hero');
        })
        .slice(0, 8)
        .map(el => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
    return { vw, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > vw, offenders };
})()
```

- [ ] **Step 2: Chạy dò ở 3 độ rộng cho các trang đại diện**

Với từng độ rộng 375, 768, 1024 (dùng `resize_window` hoặc DevTools) và từng trang `index.html`, `lich-hoi-nghi.html`, `hoi-nghi.html`, `blog.html`, `blog/cach-viet-abstract-hoi-thao.html`: tải trang, chạy đoạn dò.
Expected: `overflow: false` ở mọi trường hợp.

- [ ] **Step 3: Sửa nếu có lỗi**

Với mỗi `offenders` còn lại, áp dụng đúng một trong các cách sau vào CSS của trang đó:
- phần tử flex/grid con bị đẩy rộng: thêm `min-width: 0` cho phần tử đó;
- chuỗi dài không ngắt (tên bài, URL): thêm `overflow-wrap: anywhere`;
- hàng nút/chip cố định: thêm `flex-wrap: wrap`;
- bảng rộng: bọc trong `overflow-x: auto`.
Chạy lại Step 2 cho trang đã sửa. Nếu Step 2 sạch ngay từ đầu thì không đổi CSS nào.

- [ ] **Step 4: Kiểm tra bố cục thủ công**

Ở 375px, mở `lich-hoi-nghi.html`: bộ lọc chỉ mở nhóm "Lĩnh vực"; thẻ xếp 1 cột; nút ☰ và nút trăng đều bấm được (≥44px). Ở 768px: thẻ 2 cột. Ở 1024px: bộ lọc cột trái, thẻ 3 cột, nav ngang. Mở `hoi-nghi.html` ở 375px: bảng mốc chuyển thành thẻ xếp dọc (có nhãn "Hạn (AoE)").

- [ ] **Step 5: Commit**

```bash
git add tools/probe-overflow.js site
git commit -m "fix: rà responsive 375/768/1024, thêm đoạn dò tràn ngang"
```

### Task 7: Rà dark mode bằng mắt

**Files:**
- Modify: `site/**/*.html`, `site/css/*.css` (chỉ khi dò ra lỗi)

- [ ] **Step 1: Tìm màu cứng trong HTML**

Run: `grep -noE '(fill|stroke)="#[0-9a-fA-F]{3,6}"|style="[^"]*#[0-9a-fA-F]{3,6}[^"]*"' site/*.html`
Expected: không có kết quả. Nếu có (ví dụ vòng đồng hồ SVG trên trang chủ), đổi `fill="#xxxxxx"`/`stroke="#xxxxxx"` thành `currentColor` hoặc `var(--…)` phù hợp, kiểm lại bằng lệnh này.

- [ ] **Step 2: Chuyển sang tối và xem từng loại trang**

Bấm nút trăng, mở lần lượt: `index.html`, `lich-hoi-nghi.html`, `hoi-nghi.html`, `blog.html`, một bài blog, ở 1280px và 375px. Checklist cho mỗi trang:
- không có chữ xám trên nền xám khó đọc, không có khối nền sáng "lạc" giữa trang tối;
- 5 mức khẩn (đỏ/cam/xanh dương/xanh lá/xám) đều đọc rõ, viền thẻ trên cùng đúng màu;
- ô lọc: ô tick và nút radio đã chọn nhìn thấy rõ;
- dải bản tin và footer vẫn dễ đọc; ô email trắng, chữ đậm;
- vòng focus (Tab) nhìn thấy trên nền tối.

- [ ] **Step 3: Sửa lỗi tìm được**

Mỗi lỗi: nếu là màu cứng còn sót, thay bằng token đã có trong `:root` (không thêm token mới nếu một token hiện có dùng được); nếu cần token mới thì thêm cả giá trị sáng ở `:root` lẫn tối ở `:root[data-theme="dark"]`, thêm cặp tương ứng vào `PAIRS` của `tools/check-contrast.mjs`. Chạy lại `node tools/check-contrast.mjs`.

- [ ] **Step 4: Commit**

```bash
git add site tools
git commit -m "fix: rà dark mode (màu cứng còn sót, focus, ô lọc)"
```

---

## Giai đoạn 2: bốn trạng thái danh sách

### Task 8: Loading / Error / Empty / Ready trên `lich-hoi-nghi.html`

**Files:**
- Create: `site/css/states.css`, `site/js/states-demo.js`
- Modify: `site/lich-hoi-nghi.html`

- [ ] **Step 1: Viết `site/css/states.css`**

```css
/* Trạng thái danh sách: đang tải, lỗi, trống + dải xem thử */
.demo-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 16px 0 0; padding: 10px 12px; border: 1px dashed var(--rule); border-radius: var(--r); font-size: 13px; color: var(--mute) }
.demo-off .demo-bar { display: none }
.demo-bar a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; border: 1px solid var(--rule); border-radius: 999px; background: var(--card); color: var(--link); font-weight: 600; text-decoration: none }
.demo-bar a[aria-current=true] { background: var(--navy); border-color: var(--navy); color: #fff }

.sk-line { height: 14px; border-radius: 4px; background: var(--tint) }
.sk-line.lg { height: 28px; width: 55% }
.sk-line.w80 { width: 80% }
.sk-line.w60 { width: 60% }
.sk-line.w40 { width: 40% }
.cd.sk:hover { transform: none; box-shadow: var(--sh) }
@media (prefers-reduced-motion: no-preference) {
    @keyframes shimmer { 0%, 100% { opacity: 1 } 50% { opacity: .45 } }
    .sk .sk-line { animation: shimmer 1.4s ease-in-out infinite }
}

.state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 24px; text-align: center; background: var(--card); border: 1px solid var(--rule); border-radius: var(--r); box-shadow: var(--sh) }
.state-box.plain { border: 0; box-shadow: none }
.state-box h2, .state-box h3 { font-family: var(--serif); font-size: 24px }
.state-box p { max-width: 52ch; color: var(--mute) }
.state-box .big { width: 68px; height: 68px; display: grid; place-items: center; border-radius: 50%; background: var(--gold-soft); color: var(--link) }
.state-box.err .big { background: var(--c-bg); color: var(--c-fg) }
.state-box .acts { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 6px }
```

- [ ] **Step 2: Viết `site/js/states-demo.js`**

```js
// Xem thử 4 trạng thái danh sách bằng ?state=ready|loading|error|empty (không có JS thì luôn hiện "ready").
(() => {
    const STATES = ['ready', 'loading', 'error', 'empty'];
    const q = new URLSearchParams(location.search).get('state');
    const cur = STATES.includes(q) ? q : 'ready';
    document.querySelectorAll('[data-state]').forEach(el => { el.hidden = el.dataset.state !== cur; });
    document.querySelectorAll('.demo-bar a').forEach(a => {
        a.setAttribute('aria-current', String(new URL(a.href).searchParams.get('state') === cur));
    });
})();
```

- [ ] **Step 3: Thêm link CSS và script vào `lich-hoi-nghi.html`**

Edit: thay `    <link rel="stylesheet" href="css/conference.css">` bằng
```html
    <link rel="stylesheet" href="css/conference.css">
    <link rel="stylesheet" href="css/states.css">
```
Edit: thay `<script src="js/newsletter.js"></script>` bằng
```html
<script src="js/newsletter.js"></script>
<script src="js/states-demo.js"></script>
```

- [ ] **Step 4: Bọc danh sách thành vùng "ready" và thêm ba trạng thái**

Edit 1: thay
```html
        <section aria-label="Danh sách hội nghị">
            <div class="tb"><h2>37 hội nghị
```
bằng
```html
        <section aria-label="Danh sách hội nghị">
            <div class="demo-bar" role="navigation" aria-label="Xem thử trạng thái danh sách"><span>Xem thử trạng thái:</span><a href="?state=ready">Có dữ liệu</a><a href="?state=loading">Đang tải</a><a href="?state=error">Lỗi</a><a href="?state=empty">Không có kết quả</a></div>
            <div data-state="loading" hidden>
                <div class="tb" role="status"><h2>Đang tải lịch hội nghị…</h2></div>
                <div class="grid" aria-hidden="true" style="margin-top:16px">
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                    <article class="cd sk"><div class="sk-line lg"></div><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line w80"></div></article>
                </div>
            </div>
            <div data-state="error" hidden>
                <div class="state-box err" role="alert" style="margin-top:16px">
                    <span class="big"><svg class="ic" width="32" height="32" aria-hidden="true"><use href="#i-alert"/></svg></span>
                    <h2>Không tải được lịch hội nghị</h2>
                    <p>Kết nối bị gián đoạn hoặc máy chủ đang bận. Bộ lọc bạn chọn vẫn được giữ nguyên, hãy thử lại sau ít giây.</p>
                    <div class="acts"><a class="btn pri" href="?state=ready"><svg class="ic" width="18" height="18" aria-hidden="true"><use href="#i-refresh"/></svg>Thử lại</a><a class="btn" href="index.html">Về trang chủ</a></div>
                </div>
            </div>
            <div data-state="empty" hidden>
                <div class="tb"><h2>0 hội nghị <small>trên tổng 128</small></h2></div>
                <div class="chips" aria-label="Bộ lọc đang áp dụng">
                    <button type="button" class="fchip" aria-label="Bỏ lọc Lĩnh vực: An toàn thông tin">Lĩnh vực: An toàn thông tin<svg class="ic" width="14" height="14" aria-hidden="true"><use href="#i-x"/></svg></button>
                    <button type="button" class="fchip" aria-label="Bỏ lọc Rank CORE: A*">Rank CORE: A*<svg class="ic" width="14" height="14" aria-hidden="true"><use href="#i-x"/></svg></button>
                    <button type="button" class="fchip" aria-label="Bỏ lọc Hạn trong 7 ngày">Hạn trong 7 ngày<svg class="ic" width="14" height="14" aria-hidden="true"><use href="#i-x"/></svg></button>
                </div>
                <div class="state-box">
                    <span class="big"><svg class="ic" width="32" height="32" aria-hidden="true"><use href="#i-nores"/></svg></span>
                    <h2>Không có hội nghị khớp bộ lọc</h2>
                    <p>Chưa có hội nghị nào vừa thuộc lĩnh vực và rank đã chọn, vừa còn hạn trong 7 ngày tới. Thử bỏ bớt bộ lọc, hoặc bật "Hiện đã hết hạn" để xem cả các hội nghị đã qua hạn.</p>
                    <div class="acts"><a class="btn pri" href="?state=ready">Xoá tất cả bộ lọc</a><a class="btn" href="?state=ready">Hiện đã hết hạn</a></div>
                </div>
            </div>
            <div data-state="ready">
            <div class="tb"><h2>37 hội nghị
```

Edit 2: thay
```html
</nav></div>
        </section>
```
bằng
```html
</nav></div>
            </div>
        </section>
```

- [ ] **Step 5: Kiểm tra**

Run: `node tools/check-site.mjs` → Expected: `OK`.

Trên trình duyệt, mở lần lượt `lich-hoi-nghi.html`, `?state=loading`, `?state=error`, `?state=empty`: mỗi lần chỉ một vùng hiện, nút tương ứng trên dải xem thử sáng (navy). Bấm "Thử lại" và "Xoá tất cả bộ lọc" đều về `?state=ready`. Lặp lại ở 375px và ở giao diện tối: skeleton nhấp nháy nhẹ (tắt khi bật "giảm chuyển động"), hộp lỗi có nền đỏ nhạt, hộp trống nền trung tính (không đỏ).

- [ ] **Step 6: Commit**

```bash
git add site
git commit -m "feat: 4 trạng thái danh sách (loading, error, empty, ready) kèm dải xem thử"
```

---

## Giai đoạn 3: trang phụ

### Task 9: Lưu hội nghị (save.js) và liên kết "Đã lưu" ở header

**Files:**
- Create: `site/js/save.js`, `tools/save.test.mjs`
- Modify: `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `site/lich-hoi-nghi.html`, `site/index.html`

- [ ] **Step 1: Viết test thất bại cho save.js**

```js
// tools/save.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/js/save.js', import.meta.url)), 'utf8');

const button = slug => ({
    dataset: { save: slug },
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    querySelector: () => null,
    classList: { contains: () => true },
});

const run = ({ stored = null, throws = false, buttons = [] } = {}) => {
    const written = {};
    const count = { textContent: '' };
    let onClick;
    const ctx = {
        document: {
            querySelectorAll: sel => (sel === '[data-save]' ? buttons : sel === '[data-saved-count]' ? [count] : []),
            getElementById: () => null,
            addEventListener: (type, fn) => { if (type === 'click') onClick = fn; },
        },
        localStorage: {
            getItem: () => { if (throws) throw new Error('blocked'); return stored; },
            setItem: (k, v) => { if (throws) throw new Error('blocked'); written[k] = v; },
        },
    };
    vm.runInNewContext(SRC, ctx);
    return { count, written, click: b => onClick({ target: { closest: () => b } }) };
};

test('đọc danh sách đã lưu: nút được bật và đếm đúng', () => {
    const b = button('icse');
    const r = run({ stored: '["icse","acl"]', buttons: [b] });
    assert.equal(b.attrs['aria-pressed'], 'true');
    assert.equal(r.count.textContent, '2');
});
test('bấm để lưu rồi bỏ lưu, có ghi vào localStorage', () => {
    const b = button('fse');
    const r = run({ buttons: [b] });
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'true');
    assert.equal(r.written['confinder-saved'], '["fse"]');
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'false');
    assert.equal(r.written['confinder-saved'], '[]');
});
test('localStorage bị chặn vẫn bật/tắt được trong phiên', () => {
    const b = button('ase');
    const r = run({ throws: true, buttons: [b] });
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'true');
});
test('dữ liệu hỏng được coi là rỗng', () => {
    const r = run({ stored: '{không phải json', buttons: [] });
    assert.equal(r.count.textContent, '0');
});
```

- [ ] **Step 2: Chạy, xác nhận FAIL**

Run: `node --test tools/save.test.mjs`
Expected: FAIL (`ENOENT ... save.js`).

- [ ] **Step 3: Viết `site/js/save.js`**

```js
// Lưu hội nghị bằng nút ★ (data-save="slug"). Trạng thái nằm trong localStorage; bị chặn thì chỉ giữ trong phiên.
(() => {
    const KEY = 'confinder-saved';
    const load = () => {
        try {
            const v = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(v) ? v : [];
        } catch { return []; }
    };
    const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* bị chặn */ } };
    let saved = load();

    const paint = () => {
        document.querySelectorAll('[data-save]').forEach(b => {
            const on = saved.includes(b.dataset.save);
            b.setAttribute('aria-pressed', String(on));
            b.querySelector('.ic')?.classList.toggle('fill', on);
            const text = b.querySelector('[data-save-text]');
            if (text) text.textContent = on ? 'Đã lưu' : 'Lưu hội nghị';
            else if (b.classList.contains('iconbtn')) b.setAttribute('aria-label', on ? 'Bỏ lưu hội nghị' : 'Lưu hội nghị');
        });
        document.querySelectorAll('[data-saved-count]').forEach(n => { n.textContent = String(saved.length); });
        document.querySelectorAll('[data-saved-item]').forEach(li => { li.hidden = !saved.includes(li.dataset.savedItem); });
        const empty = document.getElementById('saved-empty');
        if (empty) empty.hidden = saved.length > 0;
    };

    document.addEventListener('click', e => {
        const b = e.target.closest('[data-save]');
        if (!b) return;
        const slug = b.dataset.save;
        saved = saved.includes(slug) ? saved.filter(s => s !== slug) : [...saved, slug];
        store(saved);
        paint();
    });
    paint();
})();
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `node --test tools/save.test.mjs`
Expected: 4 test pass.

- [ ] **Step 5: Thêm khối "Đã lưu" vào bộ đồng bộ header**

Edit `tools/chrome.mjs`, thêm cuối file:

```js
export const savedHtml = prefix =>
    `<!--c:saved--><a class="saved" href="${prefix}da-luu.html"><svg class="ic fill" width="18" height="18" aria-hidden="true"><use href="#i-star"/></svg>Đã lưu (<span data-saved-count>0</span>)</a><!--/c:saved-->`;
```

Edit `tools/sync-chrome.mjs`:
- dòng import: thêm `savedHtml` vào danh sách import từ `./chrome.mjs`;
- sau dòng `const FOOT_RE = ...` thêm:
```js
const SAVED_RE = /<!--c:saved-->[\s\S]*?<!--\/c:saved-->|<span class="saved">[\s\S]*?<\/span>/;
```
- trong `syncPage`, sau dòng `out = out.replace(FOOT_RE, ...)` thêm:
```js
    out = out.replace(SAVED_RE, () => savedHtml(prefix));
```

Sửa style `.saved` cho thẻ `<a>`: trong `site/css/site.css` dòng `.saved { ... }` thêm `text-decoration: none;` vào cuối danh sách khai báo.

- [ ] **Step 6: Gắn `data-save` vào các thẻ hội nghị (script tạm)**

```js
// tools/_wire-save.mjs  (chạy một lần rồi xoá)
import { readFileSync, writeFileSync } from 'node:fs';

for (const f of ['lich-hoi-nghi.html', 'index.html']) {
    const p = new URL(`../site/${f}`, import.meta.url);
    let html = readFileSync(p, 'utf8');
    let n = 0;
    html = html.replace(/<article class="cd (?!sk)[\s\S]*?<\/article>/g, art => {
        const name = art.match(/<h3>(?:<a[^>]*>)?([A-Za-z]+)/)?.[1];
        if (!name) return art;
        n++;
        return art.replace(
            /<button type="button" class="iconbtn" aria-pressed="(?:true|false)" aria-label="[^"]*"([^>]*)>(<svg class="ic)(?: fill)?"/,
            `<button type="button" class="iconbtn" data-save="${name.toLowerCase()}" aria-pressed="false" aria-label="Lưu hội nghị"$1>$2"`,
        );
    });
    writeFileSync(p, html);
    console.log(f, n, 'thẻ');
}
```

Run: `node tools/_wire-save.mjs`
Expected: `lich-hoi-nghi.html 6 thẻ` và `index.html` với số thẻ bằng số `<article class="cd` đang có trên trang chủ. Rồi: `rm tools/_wire-save.mjs`.

Edit `site/js` nạp script: thêm `<script src="js/save.js"></script>` ngay trước `<script src="js/newsletter.js"></script>` trong `lich-hoi-nghi.html` và `index.html`.

- [ ] **Step 7: Đồng bộ và kiểm tra**

Run: `node tools/sync-chrome.mjs && node tools/check-site.mjs`
Expected: `check-site` báo lỗi `liên kết gãy: da-luu.html` (trang sẽ có ở Task 14). Chỉ lỗi này, không lỗi khác.

Trên trình duyệt ở `lich-hoi-nghi.html`: bấm ★ ở ICSE thì đầy sao, "Đã lưu (1)" ở header; tải lại vẫn giữ.

- [ ] **Step 8: Commit**

```bash
git add tools site
git commit -m "feat: lưu hội nghị bằng ★ (save.js có test), liên kết Đã lưu ở header"
```

### Task 10: Khung trang mới và pages.css

**Files:**
- Create: `tools/shell.mjs`, `tools/new-page.mjs`, `site/css/pages.css`

- [ ] **Step 1: Viết `tools/shell.mjs`**

```js
// tools/shell.mjs
// Dựng khung trang mới (head + sprite + header + bản tin + footer) từ lich-hoi-nghi.html.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/lich-hoi-nghi.html', import.meta.url)), 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const pageShell = ({ title, description, css = [], scripts = [], main = '<main><!--MAIN--></main>' }) => {
    const mainAt = SRC.indexOf('<main');
    const mainEnd = SRC.indexOf('</main>') + '</main>'.length;
    const footEnd = SRC.indexOf('</footer>') + '</footer>'.length;
    const head = SRC.slice(0, mainAt)
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)} | UIT ConFinder</title>`)
        .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(description)}">`)
        .replace(/\s*<link rel="stylesheet" href="css\/(?:states|pages)\.css">/g, '')
        .replace(/\s*<script src="js\/[^"]+"><\/script>/g, '')
        .replace('<link rel="stylesheet" href="css/conference.css">', () =>
            ['conference', ...css].map(c => `<link rel="stylesheet" href="css/${c}.css">`).join('\n    '));
    const tail = SRC.slice(mainEnd, footEnd);
    const scriptTags = scripts.map(s => `<script src="js/${s}.js"></script>`).join('\n');
    return `${head}${main}${tail}\n${scriptTags}\n</body>\n</html>\n`;
};
```

- [ ] **Step 2: Viết `tools/new-page.mjs`**

```js
// tools/new-page.mjs
// Dùng: node tools/new-page.mjs <slug> "<tiêu đề>" "<mô tả>" [css,..] [js,..]
// Tạo site/<slug>.html có khung chuẩn và <main><!--MAIN--></main> để điền nội dung. Sau đó chạy tools/sync-chrome.mjs.
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pageShell } from './shell.mjs';

const [slug, title, description, css = 'pages', scripts = ''] = process.argv.slice(2);
if (!slug || !title || !description) {
    console.error('Cách dùng: node tools/new-page.mjs <slug> "<tiêu đề>" "<mô tả>" [css,..] [js,..]');
    process.exit(1);
}
const out = fileURLToPath(new URL(`../site/${slug}.html`, import.meta.url));
if (existsSync(out)) { console.error(`${slug}.html đã tồn tại`); process.exit(1); }
writeFileSync(out, pageShell({
    title,
    description,
    css: css.split(',').filter(Boolean),
    scripts: scripts.split(',').filter(Boolean),
}));
console.log('đã tạo', out);
```

- [ ] **Step 3: Viết `site/css/pages.css`**

```css
/* Trang phụ: giới thiệu, hướng dẫn AoE, liên hệ, đã lưu, 404 */
.pg-wrap { padding-bottom: 8px }
.cols { display: grid; gap: 24px; margin-top: 24px; align-items: start }
.stack { display: grid; gap: 24px }
.panel.pad { padding: 20px 18px }
.panel.pad > h2 { padding: 0 0 10px; font-size: 22px }
.panel.pad p + p { margin-top: 10px }
.panel.pad ul { padding-left: 20px; margin-top: 10px }
.panel.pad .lvl { list-style: none; padding: 0; display: grid; gap: 10px }
.panel.pad .lvl li { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px }
.lvl .r { color: var(--mute); font-size: 14px }
.rank-row { display: flex; gap: 10px; align-items: flex-start; margin-top: 10px }
.rank-row .badge { margin-top: 2px }
.links { display: grid; gap: 4px }
.links a { display: flex; align-items: center; justify-content: space-between; min-height: 44px; color: var(--link); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--rule) }
.links a:last-child { border: 0 }
.links a:hover { background: var(--gold-soft) }

.fform { display: grid; gap: 16px }
.fr { display: grid; gap: 6px }
.fr label { font-weight: 600; font-size: 14px }
.fr input, .fr select, .fr textarea { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule); border-radius: var(--r); background: var(--field); color: var(--ink); font: inherit }
.fr textarea { min-height: 140px; resize: vertical }
.fr .hint { font-size: 12.5px; color: var(--mute) }
.fmsg { min-height: 22px; font-weight: 600; color: var(--o-fg) }

.qa { border-bottom: 1px solid var(--rule) }
.qa:last-child { border: 0 }
.qa summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; cursor: pointer; list-style: none; font-weight: 600 }
.qa summary::-webkit-details-marker { display: none }
.qa summary .ic { transition: transform .2s }
.qa[open] summary .ic { transform: rotate(180deg) }
.qa p { padding: 0 0 16px; color: var(--mute) }

.saved-list { list-style: none }
.srow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 14px 18px; border-top: 1px solid var(--rule) }
.srow:first-child { border-top: 0 }
.srow-t { flex: 1 1 260px; display: grid; gap: 2px; text-decoration: none }
.srow-t b { font-family: var(--serif); font-size: 22px; line-height: 1.2 }
.srow-t b span { font-weight: 400; font-style: italic; color: var(--mute) }
.srow-n { font-size: 13px; color: var(--mute) }

.nf { margin: 56px auto 0; max-width: 560px }
.nf-code { font: 600 clamp(64px, 18vw, 120px) var(--serif); line-height: 1; color: var(--gold-text); letter-spacing: -.04em }

@media (min-width: 64rem) {
    .cols { grid-template-columns: minmax(0, 1fr) 340px }
}
```

- [ ] **Step 4: Commit**

```bash
git add tools site/css/pages.css
git commit -m "feat: công cụ dựng trang mới và pages.css cho các trang phụ"
```

### Task 11: Trang Hướng dẫn AoE (`faq-aoe.html`)

**Files:**
- Create: `site/faq-aoe.html`

- [ ] **Step 1: Tạo khung**

Run: `node tools/new-page.mjs faq-aoe "Hướng dẫn AoE và đổi múi giờ" "AoE là gì, cách đổi hạn nộp bài sang giờ Việt Nam (GMT+7) và các câu hỏi thường gặp." states,pages`
Expected: `đã tạo ...\site\faq-aoe.html`.

- [ ] **Step 2: Điền nội dung**

Edit `site/faq-aoe.html`, thay `<!--MAIN-->` bằng:

```html
<div class="container pg-wrap">
    <div class="page-head"><span class="eyebrow">Hướng dẫn</span><h1>AoE là gì và đổi sang giờ Việt Nam thế nào?</h1>
        <p>Hầu hết hội nghị ghi hạn nộp bài theo AoE. Đọc nhầm múi giờ có thể khiến bạn nộp trễ gần một ngày.</p></div>
    <div class="cols">
        <div class="stack">
            <section class="panel pad"><h2>AoE (Anywhere on Earth)</h2>
                <p>AoE là UTC−12, múi giờ đến sau cùng trên Trái Đất. Hạn "23:59 AoE" nghĩa là hạn chỉ kết thúc khi ở mọi nơi trên thế giới đều đã qua 23:59 của ngày đó.</p>
                <p>Đổi sang giờ Việt Nam (GMT+7): cộng thêm <b>19 giờ</b>. Vì vậy 23:59 AoE ngày D là <b>18:59 ngày D+1</b> theo giờ Việt Nam.</p></section>
            <section class="panel"><h2>Ví dụ quy đổi <small>mốc 23:59 AoE</small></h2>
                <table class="mt"><thead><tr><th>Hạn (AoE)</th><th>GMT+7 (Việt Nam)</th><th>UTC</th><th>UTC−8</th></tr></thead>
                <tbody>
<tr><td class="mono">23:59 10/10/2026</td><td class="mono" data-l="GMT+7 (Việt Nam)"><b>18:59 11/10/2026</b></td><td class="mono" data-l="UTC">11:59 11/10/2026</td><td class="mono" data-l="UTC−8">03:59 11/10/2026</td></tr>
<tr><td class="mono">23:59 13/10/2026</td><td class="mono" data-l="GMT+7 (Việt Nam)"><b>18:59 14/10/2026</b></td><td class="mono" data-l="UTC">11:59 14/10/2026</td><td class="mono" data-l="UTC−8">03:59 14/10/2026</td></tr>
<tr><td class="mono">23:59 31/12/2026</td><td class="mono" data-l="GMT+7 (Việt Nam)"><b>18:59 01/01/2027</b></td><td class="mono" data-l="UTC">11:59 01/01/2027</td><td class="mono" data-l="UTC−8">03:59 01/01/2027</td></tr>
                </tbody></table>
            </section>
            <section class="panel pad" aria-labelledby="faq-h"><h2 id="faq-h">Câu hỏi thường gặp</h2>
                <details class="qa"><summary>Hạn "00:00 AoE" là lúc nào?<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-down"/></svg></summary><p>Là đầu ngày D theo UTC−12, tức 19:00 ngày D theo giờ Việt Nam. Nhiều hội nghị khuyên coi đó như 23:59 của ngày hôm trước, nên hãy nộp sớm vài giờ.</p></details>
                <details class="qa"><summary>Hội nghị không ghi múi giờ thì sao?<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-down"/></svg></summary><p>Nhiều trang tổng hợp ngầm hiểu là AoE. Hãy kiểm tra lại trên website chính thức của hội nghị và liên hệ ban tổ chức nếu vẫn chưa rõ.</p></details>
                <details class="qa"><summary>Giờ mùa hè (DST) có ảnh hưởng không?<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-down"/></svg></summary><p>AoE là UTC−12 cố định, không có giờ mùa hè, và Việt Nam cũng không đổi giờ. Chỉ khi hạn ghi theo PST/PDT hoặc CET/CEST bạn mới cần tra thêm múi giờ đó.</p></details>
                <details class="qa"><summary>Vì sao nên nộp sớm hơn hạn?<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-down"/></svg></summary><p>Hệ thống nộp bài thường quá tải ở giờ chót và tải file lớn mất thời gian. Nộp sớm ít nhất vài giờ giúp bạn còn thời gian sửa lỗi định dạng.</p></details>
            </section>
        </div>
        <aside class="panel pad" aria-label="Liên kết nhanh"><h2>Xem tiếp</h2>
            <div class="links"><a href="lich-hoi-nghi.html">Lịch hội nghị<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a><a href="gioi-thieu.html">Cách đọc rank và độ khẩn<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a><a href="lien-he.html">Báo dữ liệu sai<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a></div>
        </aside>
    </div>
</div>
```

- [ ] **Step 3: Đồng bộ và xem**

Run: `node tools/sync-chrome.mjs faq-aoe.html`
Mở `http://localhost:5173/faq-aoe.html` ở 1280px, 375px, và giao diện tối: bảng ví dụ thành thẻ dọc ở 375px; các mục FAQ mở/đóng được bằng bàn phím. (Các liên kết tới `gioi-thieu.html` và `lien-he.html` còn gãy cho tới Task 12–13.)

- [ ] **Step 4: Commit**

```bash
git add site/faq-aoe.html
git commit -m "feat: trang Hướng dẫn AoE"
```

### Task 12: Trang Giới thiệu (`gioi-thieu.html`)

**Files:**
- Create: `site/gioi-thieu.html`

- [ ] **Step 1: Tạo khung**

Run: `node tools/new-page.mjs gioi-thieu "Giới thiệu" "UIT ConFinder là gì, dữ liệu lấy từ đâu và cách đọc rank CORE/CCF cùng thang độ khẩn của hạn nộp bài." states,pages`

- [ ] **Step 2: Điền nội dung**

Edit `site/gioi-thieu.html`, thay `<!--MAIN-->` bằng:

```html
<div class="container pg-wrap">
    <div class="page-head"><span class="eyebrow">Giới thiệu</span><h1>Hạn nộp bài lên đầu, mọi thứ khác theo sau</h1>
        <p>UIT ConFinder giúp sinh viên và nhà nghiên cứu biết hội nghị nào còn mở nhận bài, còn bao lâu và nên ưu tiên cái nào.</p></div>
    <div class="cols">
        <div class="stack">
            <section class="panel pad"><h2>Mục tiêu</h2>
                <p>Website là sản phẩm của đồ án môn IE104 (Internet và Công nghệ Web) tại Trường Đại học Công nghệ Thông tin (UIT). Thông tin quan trọng nhất, hạn nộp bài kèm đồng hồ đếm ngược và giờ Việt Nam tương ứng, luôn nằm trên cùng mỗi thẻ hội nghị.</p>
                <p>Bộ lọc theo lĩnh vực, rank CORE/CCF và hình thức tham dự (online, offline, hybrid) giúp thu hẹp danh sách chỉ còn những hội nghị phù hợp với bài của bạn.</p></section>
            <section class="panel pad" id="du-lieu"><h2>Dữ liệu</h2>
                <p><b>Dữ liệu hội nghị trên website là dữ liệu minh hoạ.</b> Tên hội nghị, địa điểm và rank mô phỏng theo thực tế, nhưng các mốc ngày chỉ phục vụ việc trình bày giao diện. Hãy luôn kiểm tra lại trên website chính thức của hội nghị trước khi nộp bài.</p></section>
            <section class="panel pad" id="rank"><h2>Cách đọc rank</h2>
                <p>Rank giúp ước lượng uy tín của hội nghị, không thay thế việc đọc kỹ yêu cầu của hội đồng khoa học nơi bạn công tác.</p>
                <div class="rank-row"><span class="badge">CORE A*</span><span>Hội nghị hàng đầu của lĩnh vực.</span></div>
                <div class="rank-row"><span class="badge">CORE A</span><span>Hội nghị xuất sắc.</span></div>
                <div class="rank-row"><span class="badge">CORE B</span><span>Hội nghị tốt đến rất tốt.</span></div>
                <div class="rank-row"><span class="badge">CORE C</span><span>Đạt chuẩn tối thiểu của hội nghị có phản biện.</span></div>
                <div class="rank-row"><span class="badge">CCF A/B/C</span><span>Danh mục của Liên đoàn Máy tính Trung Quốc; A là cao nhất.</span></div></section>
            <section class="panel pad" id="do-khan"><h2>Thang độ khẩn</h2>
                <p>Màu luôn đi kèm chữ và biểu tượng, nên bạn vẫn đọc được dù không phân biệt màu.</p>
                <ol class="lvl" style="margin-top:12px">
                    <li><span class="ub u-c"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-alert"/></svg><b>Gấp</b></span><span class="mono">dưới 3 ngày</span><span class="r">Tính đến phút.</span></li>
                    <li><span class="ub u-s"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-clock"/></svg><b>Trong tuần</b></span><span class="mono">dưới 7 ngày</span><span class="r">Hiện cả giờ và phút còn lại.</span></li>
                    <li><span class="ub u-u"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-calendar"/></svg><b>Trong tháng</b></span><span class="mono">dưới 30 ngày</span><span class="r">Nên bắt đầu lên kế hoạch.</span></li>
                    <li><span class="ub u-o"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-okc"/></svg><b>Còn rộng</b></span><span class="mono">từ 30 ngày</span><span class="r">Chưa cần vội.</span></li>
                    <li><span class="ub u-x"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-xc"/></svg><b>Đã hết hạn</b></span><span class="mono">đã qua</span><span class="r">Thẻ chuyển sang màu xám.</span></li>
                </ol></section>
        </div>
        <aside class="panel pad" aria-label="Liên kết nhanh"><h2>Xem tiếp</h2>
            <div class="links"><a href="lich-hoi-nghi.html">Xem lịch hội nghị<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a><a href="faq-aoe.html">AoE và đổi múi giờ<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a><a href="blog.html">Bài viết về hội thảo<svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-right"/></svg></a></div>
        </aside>
    </div>
</div>
```

- [ ] **Step 3: Đồng bộ và xem**

Run: `node tools/sync-chrome.mjs gioi-thieu.html`
Mở trang ở 1280px, 375px, giao diện tối. Thang 5 mức hiển thị đúng màu và chữ.

- [ ] **Step 4: Commit**

```bash
git add site/gioi-thieu.html
git commit -m "feat: trang Giới thiệu"
```

### Task 13: Trang Liên hệ (`lien-he.html`)

**Files:**
- Create: `site/lien-he.html`, `site/js/contact.js`

- [ ] **Step 1: Viết `site/js/contact.js`**

```js
// Form liên hệ: trình duyệt tự kiểm tra các trường bắt buộc; ở đây chỉ báo kết quả, chưa gửi đi đâu.
(() => {
    const form = document.getElementById('contact-form');
    const msg = document.getElementById('contact-msg');
    if (!form || !msg) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        msg.textContent = 'Cảm ơn bạn. Biểu mẫu mới chỉ kiểm tra trên trình duyệt, chưa gửi đi đâu.';
        form.reset();
    });
})();
```

- [ ] **Step 2: Tạo khung**

Run: `node tools/new-page.mjs lien-he "Liên hệ" "Gửi góp ý, báo dữ liệu hội nghị sai hoặc đề xuất hợp tác với UIT ConFinder." states,pages contact`

- [ ] **Step 3: Điền nội dung**

Edit `site/lien-he.html`, thay `<!--MAIN-->` bằng:

```html
<div class="container pg-wrap">
    <div class="page-head"><span class="eyebrow">Liên hệ</span><h1>Góp ý hoặc báo dữ liệu sai</h1>
        <p>Thấy hạn nộp bài hoặc rank chưa đúng? Cho chúng tôi biết hội nghị nào và nguồn chính thức bạn dùng để đối chiếu.</p></div>
    <div class="cols">
        <section class="panel pad" aria-labelledby="form-h"><h2 id="form-h">Gửi tin nhắn</h2>
            <form class="fform" id="contact-form" style="margin-top:12px">
                <div class="fr"><label for="c-name">Họ và tên</label><input id="c-name" name="name" type="text" autocomplete="name" required></div>
                <div class="fr"><label for="c-mail">Email</label><input id="c-mail" name="email" type="email" autocomplete="email" placeholder="ten@truong.edu.vn" required><span class="hint">Chỉ dùng để phản hồi bạn.</span></div>
                <div class="fr"><label for="c-topic">Chủ đề</label><select id="c-topic" name="topic"><option>Báo dữ liệu hội nghị sai</option><option>Góp ý giao diện</option><option>Đề xuất hợp tác</option><option>Khác</option></select></div>
                <div class="fr"><label for="c-text">Nội dung</label><textarea id="c-text" name="message" minlength="10" required></textarea></div>
                <div><button type="submit" class="btn pri">Gửi tin nhắn</button></div>
                <p class="fmsg" id="contact-msg" role="status" aria-live="polite"></p>
            </form>
        </section>
        <aside class="panel pad" aria-label="Thông tin liên hệ"><h2>Thông tin</h2>
            <p>Đồ án môn IE104 (Internet và Công nghệ Web), Trường Đại học Công nghệ Thông tin (UIT), ĐHQG-HCM.</p>
            <p>Email: <span class="mono">contact@uit-confinder.example</span> (địa chỉ minh hoạ)</p>
            <p style="margin-top:12px"><a class="crumb" href="faq-aoe.html">Xem hướng dẫn AoE trước khi gửi</a></p>
        </aside>
    </div>
</div>
```

- [ ] **Step 4: Đồng bộ và kiểm tra**

Run: `node tools/sync-chrome.mjs lien-he.html`
Trên trình duyệt: bấm "Gửi tin nhắn" khi để trống thì trình duyệt báo thiếu trường; điền hợp lệ rồi gửi thì dưới form hiện lời cảm ơn và form được xoá. Kiểm tra ở 375px và giao diện tối (ô nhập có nền `--field`, chữ đọc rõ).

- [ ] **Step 5: Commit**

```bash
git add site/lien-he.html site/js/contact.js
git commit -m "feat: trang Liên hệ với form kiểm tra phía trình duyệt"
```

### Task 14: Trang Đã lưu (`da-luu.html`)

**Files:**
- Create: `site/da-luu.html`

- [ ] **Step 1: Tạo khung**

Run: `node tools/new-page.mjs da-luu "Hội nghị đã lưu" "Danh sách hội nghị bạn đã đánh dấu sao, lưu ngay trong trình duyệt." states,pages save`

- [ ] **Step 2: Điền nội dung**

Edit `site/da-luu.html`, thay `<!--MAIN-->` bằng:

```html
<div class="container pg-wrap">
    <div class="page-head"><span class="eyebrow">Đã lưu</span><h1>Hội nghị bạn đã lưu</h1>
        <p>Danh sách chỉ nằm trong trình duyệt này, không cần đăng nhập. Xoá dữ liệu trình duyệt sẽ mất danh sách.</p></div>
    <section class="panel" style="margin-top:24px" aria-label="Danh sách hội nghị đã lưu">
        <ul class="saved-list">
            <li class="srow" data-saved-item="icse" hidden><a class="srow-t" href="hoi-nghi.html"><b>ICSE <span>2027</span></b><span class="srow-n">IEEE/ACM International Conference on Software Engineering</span></a><span class="ub u-c"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-alert"/></svg><b>Gấp</b><i class="sep">·</i><span class="mono">Còn 2 ngày</span></span><button type="button" class="btn ghost" data-save="icse">Bỏ lưu</button></li>
            <li class="srow" data-saved-item="fse" hidden><a class="srow-t" href="hoi-nghi-fse.html"><b>FSE <span>2027</span></b><span class="srow-n">ACM International Conference on the Foundations of Software Engineering</span></a><span class="ub u-s"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-clock"/></svg><b>Trong tuần</b><i class="sep">·</i><span class="mono">Còn 5 ngày</span></span><button type="button" class="btn ghost" data-save="fse">Bỏ lưu</button></li>
            <li class="srow" data-saved-item="acl" hidden><a class="srow-t" href="hoi-nghi-acl.html"><b>ACL <span>2027</span></b><span class="srow-n">Annual Meeting of the Association for Computational Linguistics</span></a><span class="ub u-u"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-calendar"/></svg><b>Trong tháng</b><i class="sep">·</i><span class="mono">Còn 18 ngày</span></span><button type="button" class="btn ghost" data-save="acl">Bỏ lưu</button></li>
            <li class="srow" data-saved-item="ase" hidden><a class="srow-t" href="hoi-nghi-ase.html"><b>ASE <span>2027</span></b><span class="srow-n">IEEE/ACM International Conference on Automated Software Engineering</span></a><span class="ub u-o"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-okc"/></svg><b>Còn rộng</b><i class="sep">·</i><span class="mono">Còn 41 ngày</span></span><button type="button" class="btn ghost" data-save="ase">Bỏ lưu</button></li>
            <li class="srow" data-saved-item="iclr" hidden><a class="srow-t" href="hoi-nghi-iclr.html"><b>ICLR <span>2027</span></b><span class="srow-n">International Conference on Learning Representations</span></a><span class="ub u-o"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-okc"/></svg><b>Còn rộng</b><i class="sep">·</i><span class="mono">Còn 62 ngày</span></span><button type="button" class="btn ghost" data-save="iclr">Bỏ lưu</button></li>
            <li class="srow" data-saved-item="neurips" hidden><a class="srow-t" href="hoi-nghi-neurips.html"><b>NeurIPS <span>2026</span></b><span class="srow-n">Conference on Neural Information Processing Systems</span></a><span class="ub u-x"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#i-xc"/></svg><b>Đã hết hạn</b></span><button type="button" class="btn ghost" data-save="neurips">Bỏ lưu</button></li>
        </ul>
        <div class="state-box plain" id="saved-empty">
            <span class="big"><svg class="ic" width="32" height="32" aria-hidden="true"><use href="#i-star"/></svg></span>
            <h2>Bạn chưa lưu hội nghị nào</h2>
            <p>Bấm biểu tượng ngôi sao trên thẻ hội nghị để lưu lại và theo dõi hạn nộp bài ở đây.</p>
            <div class="acts"><a class="btn pri" href="lich-hoi-nghi.html">Xem lịch hội nghị</a></div>
        </div>
    </section>
</div>
```

(Các liên kết `hoi-nghi-*.html` sẽ hết gãy sau Task 17.)

- [ ] **Step 3: Đồng bộ và kiểm tra**

Run: `node tools/sync-chrome.mjs da-luu.html`
Trên trình duyệt: ban đầu hiện hộp "chưa lưu"; sang `lich-hoi-nghi.html` bấm ★ ở ICSE và FSE, quay lại `da-luu.html` thấy đúng 2 dòng, hộp rỗng ẩn, header ghi "Đã lưu (2)"; bấm "Bỏ lưu" thì dòng biến mất ngay. Kiểm tra 375px và giao diện tối.

- [ ] **Step 4: Commit**

```bash
git add site/da-luu.html
git commit -m "feat: trang Đã lưu đọc danh sách từ localStorage"
```

### Task 15: Trang 404

**Files:**
- Create: `site/404.html`

- [ ] **Step 1: Tạo khung**

Run: `node tools/new-page.mjs 404 "Không tìm thấy trang" "Trang bạn tìm không tồn tại hoặc đã được chuyển đi." states,pages`

- [ ] **Step 2: Điền nội dung**

Edit `site/404.html`, thay `<!--MAIN-->` bằng:

```html
<div class="container pg-wrap">
    <div class="state-box nf">
        <span class="nf-code" aria-hidden="true">404</span>
        <h1 style="font-family:var(--serif);font-size:28px">Không tìm thấy trang này</h1>
        <p>Đường dẫn có thể đã gõ sai hoặc trang đã được chuyển đi. Bạn có thể quay về trang chủ hoặc xem lịch hội nghị.</p>
        <div class="acts"><a class="btn pri" href="index.html">Về trang chủ</a><a class="btn" href="lich-hoi-nghi.html">Xem lịch hội nghị</a></div>
    </div>
</div>
```

- [ ] **Step 3: Đồng bộ và kiểm tra**

Run: `node tools/sync-chrome.mjs 404.html`
Mở `http://localhost:5173/khong-co.html`: `serve.mjs` trả trang 404 này. (Lưu ý: khi host ở thư mục con, các liên kết tương đối trong trang 404 chỉ đúng nếu 404.html nằm ở gốc site, đúng với cấu trúc hiện tại.)

- [ ] **Step 4: Commit**

```bash
git add site/404.html
git commit -m "feat: trang 404"
```

### Task 16: Đưa trang phụ vào nav và footer

**Files:**
- Modify: `tools/chrome.mjs`

- [ ] **Step 1: Cập nhật dữ liệu nav/footer**

Edit `tools/chrome.mjs`, thay hai mảng `NAV` và `FOOT_PAGES` bằng:

```js
export const NAV = [
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'blog.html', label: 'Bài viết' },
    { href: 'faq-aoe.html', label: 'Hướng dẫn AoE' },
    { href: 'gioi-thieu.html', label: 'Giới thiệu' },
    { href: 'lien-he.html', label: 'Liên hệ' },
];
export const FOOT_PAGES = [
    { href: 'index.html', label: 'Trang chủ' },
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'da-luu.html', label: 'Đã lưu' },
    { href: 'blog.html', label: 'Bài viết' },
    { href: 'faq-aoe.html', label: 'Hướng dẫn AoE' },
    { href: 'gioi-thieu.html', label: 'Giới thiệu' },
    { href: 'lien-he.html', label: 'Liên hệ' },
];
```

- [ ] **Step 2: Đồng bộ toàn site và kiểm tra**

Run: `node tools/sync-chrome.mjs && node tools/check-site.mjs`
Expected: `check-site` chỉ còn lỗi `liên kết gãy: hoi-nghi-fse.html` (và các `hoi-nghi-*` khác) từ `da-luu.html`; không còn lỗi nào khác.

Trên trình duyệt: 5 mục nav hiển thị đủ ở 1280px và 1024px (không xuống dòng); ở 768px nav thu vào nút ☰. Mục "Giới thiệu" được gạch chân khi ở `gioi-thieu.html`. Footer có 7 liên kết.

- [ ] **Step 3: Commit**

```bash
git add tools site
git commit -m "feat: đưa các trang phụ vào nav và footer"
```

---

## Giai đoạn 4: thêm hội nghị và hoàn thiện

### Task 17: Dữ liệu và bộ sinh trang chi tiết hội nghị

**Files:**
- Create: `tools/conferences.mjs`, `tools/build-conferences.mjs`
- Modify (sinh ra): `site/hoi-nghi.html`; Create (sinh ra): `site/hoi-nghi-fse.html`, `hoi-nghi-acl.html`, `hoi-nghi-ase.html`, `hoi-nghi-iclr.html`, `hoi-nghi-neurips.html`

- [ ] **Step 1: Viết dữ liệu**

```js
// tools/conferences.mjs
// Dữ liệu MINH HOẠ cho 6 hội nghị trong lịch. Ngày là "hạn AoE" (ISO); giờ Việt Nam và "Còn N ngày" được tính tự động.
// Mốc "next" có chữ đếm ngược nhập tay (c.next) vì hiển thị cả giờ phút.
export const CONFERENCES = [
    {
        slug: 'icse', file: 'hoi-nghi.html', name: 'ICSE', year: '2027',
        full: 'IEEE/ACM International Conference on Software Engineering',
        core: 'CORE A*', ccf: 'CCF A', format: 'Hybrid', fields: ['Kỹ thuật phần mềm'],
        place: 'Lisbon, Bồ Đào Nha', dates: '18–24/04/2027', level: 'c', updated: '05/10/2026',
        next: { text: 'Còn 2 ngày 04:12', d: '02', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-09-25' },
            { name: 'Nộp toàn văn', date: '2026-10-10' },
            { name: 'Phản hồi phản biện (rebuttal)', date: '2026-11-20' },
            { name: 'Thông báo kết quả', date: '2026-12-15' },
            { name: 'Bản cuối (camera-ready)', date: '2027-01-20' },
            { name: 'Hội nghị diễn ra', range: '18–24/04/2027' },
        ],
    },
    {
        slug: 'fse', file: 'hoi-nghi-fse.html', name: 'FSE', year: '2027',
        full: 'ACM International Conference on the Foundations of Software Engineering',
        core: 'CORE A*', ccf: 'CCF A', format: 'Offline', fields: ['Kỹ thuật phần mềm'],
        place: 'Singapore', dates: '05–09/07/2027', level: 's', updated: '05/10/2026',
        next: { text: 'Còn 5 ngày 11:30', d: '05', h: '11', m: '30', s: '00' },
        milestones: [
            { name: 'Nộp toàn văn (đợt 1)', date: '2026-09-15' },
            { name: 'Nộp toàn văn (đợt 2)', date: '2026-10-13' },
            { name: 'Thông báo kết quả', date: '2026-12-20' },
            { name: 'Bản cuối (camera-ready)', date: '2027-02-25' },
            { name: 'Hội nghị diễn ra', range: '05–09/07/2027' },
        ],
    },
    {
        slug: 'acl', file: 'hoi-nghi-acl.html', name: 'ACL', year: '2027',
        full: 'Annual Meeting of the Association for Computational Linguistics',
        core: 'CORE A*', ccf: 'CCF A', format: 'Online', fields: ['Trí tuệ nhân tạo', 'Xử lý ngôn ngữ'],
        place: 'Trực tuyến', dates: '12–17/07/2027', level: 'u', updated: '05/10/2026',
        next: { text: 'Còn 18 ngày', d: '18', h: '04', m: '12', s: '00' },
        milestones: [
            { name: 'Nộp bài (ARR)', date: '2026-10-26' },
            { name: 'Thông báo kết quả', date: '2027-02-15' },
            { name: 'Bản cuối (camera-ready)', date: '2027-03-10' },
            { name: 'Hội nghị diễn ra', range: '12–17/07/2027' },
        ],
    },
    {
        slug: 'ase', file: 'hoi-nghi-ase.html', name: 'ASE', year: '2027',
        full: 'IEEE/ACM International Conference on Automated Software Engineering',
        core: 'CORE A', ccf: 'CCF A', format: 'Online', fields: ['Kỹ thuật phần mềm'],
        place: 'Trực tuyến', dates: '09–13/11/2027', level: 'o', updated: '05/10/2026',
        next: { text: 'Còn 41 ngày', d: '41', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-11-18' },
            { name: 'Nộp toàn văn', date: '2026-11-25' },
            { name: 'Thông báo kết quả', date: '2027-02-10' },
            { name: 'Bản cuối (camera-ready)', date: '2027-04-01' },
            { name: 'Hội nghị diễn ra', range: '09–13/11/2027' },
        ],
    },
    {
        slug: 'iclr', file: 'hoi-nghi-iclr.html', name: 'ICLR', year: '2027',
        full: 'International Conference on Learning Representations',
        core: 'CORE A*', ccf: null, format: 'Hybrid', fields: ['Trí tuệ nhân tạo'],
        place: 'Vienna, Áo', dates: '27/04–01/05/2027', level: 'o', updated: '05/10/2026',
        next: { text: 'Còn 62 ngày', d: '62', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-12-09' },
            { name: 'Nộp toàn văn', date: '2026-12-16' },
            { name: 'Thông báo kết quả', date: '2027-02-01' },
            { name: 'Bản cuối (camera-ready)', date: '2027-03-15' },
            { name: 'Hội nghị diễn ra', range: '27/04–01/05/2027' },
        ],
    },
    {
        slug: 'neurips', file: 'hoi-nghi-neurips.html', name: 'NeurIPS', year: '2026',
        full: 'Conference on Neural Information Processing Systems',
        core: 'CORE A*', ccf: 'CCF A', format: 'Offline', fields: ['Trí tuệ nhân tạo'],
        place: 'Sydney, Úc', dates: '06–12/12/2026', level: 'x', closed: true, closedLabel: 'Nộp toàn văn', updated: '05/10/2026',
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-05-08' },
            { name: 'Nộp toàn văn', date: '2026-05-15' },
            { name: 'Thông báo kết quả', date: '2026-09-25' },
            { name: 'Hội nghị diễn ra', range: '06–12/12/2026' },
        ],
    },
];
```

- [ ] **Step 2: Viết bộ sinh trang**

```js
// tools/build-conferences.mjs
// Dùng: node tools/build-conferences.mjs && node tools/sync-chrome.mjs
// Sinh trang chi tiết của mọi hội nghị trong conferences.mjs (ghi đè site/<file>).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pageShell } from './shell.mjs';
import { CONFERENCES } from './conferences.mjs';

const LEVELS = {
    c: { cls: 'u-c', icon: 'i-alert', label: 'Gấp', range: 'dưới 3 ngày' },
    s: { cls: 'u-s', icon: 'i-clock', label: 'Trong tuần', range: 'dưới 7 ngày' },
    u: { cls: 'u-u', icon: 'i-calendar', label: 'Trong tháng', range: 'dưới 30 ngày' },
    o: { cls: 'u-o', icon: 'i-okc', label: 'Còn rộng', range: 'từ 30 ngày' },
    x: { cls: 'u-x', icon: 'i-xc', label: 'Đã hết hạn', range: 'đã qua' },
};
const DAY = 864e5;
const NOW = Date.UTC(2026, 9, 9); // 09/10/2026: mốc tính "Còn N ngày"

const pad = n => String(n).padStart(2, '0');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const parse = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const dmy = d => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
const ymd = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const icon = (id, size = 16) => `<svg class="ic" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;
const ub = (lv, tail) => `<span class="ub ${LEVELS[lv].cls}">${icon(LEVELS[lv].icon)}<b>${LEVELS[lv].label}</b>${tail ? `<i class="sep">·</i><span class="mono">${tail}</span>` : ''}</span>`;

// 23:59 AoE ngày D = 18:59 ngày D+1 theo giờ Việt Nam.
const aoeText = m => `23:59 ${dmy(m.aoe)} AoE`;
const vnText = m => `18:59 ${dmy(m.vn)}`;

const analyse = c => {
    const items = c.milestones.map(m => {
        if (!m.date) return { ...m, kind: 'event' };
        const aoe = parse(m.date);
        const vn = new Date(aoe.getTime() + DAY);
        return { ...m, aoe, vn, days: Math.round((vn - NOW) / DAY), kind: 'dated' };
    });
    const next = c.closed ? -1 : items.findIndex(m => m.kind === 'dated' && m.days >= 0);
    return items.map((m, i) => ({ ...m, kind: m.kind === 'event' ? 'event' : m.days < 0 ? 'past' : i === next ? 'next' : 'later' }));
};

const row = (c, m) => {
    if (m.kind === 'event') {
        return `<tr><td><span class="nm2">${m.name}</span></td><td class="mono" data-l="Hạn (AoE)">${m.range}</td><td class="mono" data-l="Quy đổi GMT+7">—</td><td data-l="Trạng thái"><span class="cvv">Không áp dụng AoE</span></td></tr>`;
    }
    const when = (bold) => `<td class="mono" data-l="Hạn (AoE)">${bold ? `<b>${aoeText(m)}</b>` : aoeText(m)}</td><td class="mono" data-l="Quy đổi GMT+7">${bold ? `<b>${vnText(m)}</b>` : vnText(m)}</td>`;
    if (m.kind === 'past') {
        return `<tr class="past"><td><span class="nm2">${m.name}</span></td>${when(false)}<td data-l="Trạng thái"><span class="badge soft">${icon('i-check', 12)}Đã qua</span></td></tr>`;
    }
    if (m.kind === 'next') {
        return `<tr class="next"><td><div class="nxt">${icon('i-alert', 14)}Mốc kế tiếp</div><div class="nm2">${m.name}</div></td>${when(true)}<td data-l="Trạng thái">${ub(c.level, c.next.text)}</td></tr>`;
    }
    return `<tr><td><span class="nm2">${m.name}</span></td>${when(false)}<td data-l="Trạng thái"><span class="mono cvv">Còn ${m.days} ngày</span></td></tr>`;
};

const calendarLinks = (c, m) => {
    const title = `${c.name} ${c.year}: ${m.name}`;
    const note = `Hạn ${aoeText(m)}. Dữ liệu minh hoạ, hãy kiểm tra lại trên trang chính thức.`;
    const day = ymd(m.vn);
    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${day}T115900Z/${day}T120000Z&details=${encodeURIComponent(note)}`;
    const text = s => s.replace(/,/g, '\\,');
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UIT ConFinder//VI', 'BEGIN:VEVENT',
        `UID:${c.slug}-${m.date}@uit-confinder.example`, 'DTSTAMP:20261009T000000Z',
        `DTSTART:${day}T115900Z`, `DTEND:${day}T120000Z`,
        `SUMMARY:${text(title)}`, `DESCRIPTION:${text(note)}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n') + '\r\n';
    return `<a class="btn pri block" href="${esc(gcal)}" target="_blank" rel="noopener">${icon('i-calplus', 18)}Thêm vào Google Calendar</a>
                <a class="btn block" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" download="${c.slug}-${c.year}.ics">${icon('i-dl', 18)}Tải .ics</a>`;
};

const sidebar = (c, items) => {
    if (c.closed) {
        const m = items.find(x => x.name === c.closedLabel);
        return `<div class="cdbig">
                <div class="lab">Hạn nộp bài đã kết thúc<b>${m.name}</b></div>
                ${ub('x')}
                <div class="tm mono"><div>${aoeText(m)} (UTC−12)</div><div class="cv">= ${vnText(m)} (GMT+7)</div></div>
            </div>`;
    }
    const m = items.find(x => x.kind === 'next');
    const n = c.next;
    return `<div class="cdbig">
                <div class="lab">Mốc kế tiếp<b>${m.name}</b></div>
                ${ub(c.level, LEVELS[c.level].range)}
                <div class="digits mono" role="timer" aria-live="off">
                    <div><b>${n.d}</b><small>ngày</small></div><div><b>${n.h}</b><small>giờ</small></div><div><b>${n.m}</b><small>phút</small></div><div><b>${n.s}</b><small>giây</small></div>
                </div>
                <div class="tm mono"><div>${aoeText(m)} (UTC−12)</div><div class="cv">= ${vnText(m)} (GMT+7)</div></div>
            </div>`;
};

const main = c => {
    const items = analyse(c);
    const next = items.find(m => m.kind === 'next');
    const lv = c.closed ? 'x' : c.level;
    return `<main>
<div class="container dp">
    <a class="crumb" href="lich-hoi-nghi.html">${icon('i-left', 18)}Danh sách hội nghị</a>
    <div class="dgrid lv-${lv}">
        <div>
            <div class="dh"><h1>${c.name} <span>${c.year}</span></h1>
                <p class="full">${c.full}</p>
                <div class="brow"><span class="badge">${c.core}</span>${c.ccf ? `<span class="badge">${c.ccf}</span>` : ''}<span class="badge fmt">${c.format}</span>${c.fields.map(f => `<span class="chipbtn"><span class="chip">${f}</span></span>`).join('')}</div>
                <div class="meta"><span>${icon('i-pin')}${c.place}</span><span>${icon('i-calendar')}${c.dates}</span></div>
            </div>
            <section class="panel"><h2>Các mốc quan trọng · <small>AoE (UTC−12)</small></h2>
                <table class="mt"><thead><tr><th>Mốc</th><th>Hạn (AoE)</th><th>Quy đổi GMT+7</th><th>Trạng thái</th></tr></thead>
                <tbody>
${items.map(m => row(c, m)).join('\n')}
                </tbody></table>
            </section>
            <footer class="dfoot"><span>Nguồn: website chính thức của hội nghị ${icon('i-ext', 12)} (dữ liệu minh hoạ)</span><span>Cập nhật: ${c.updated}</span>
                <a class="btn" href="lien-he.html">${icon('i-flag')}Báo dữ liệu sai</a></footer>
        </div>
        <aside class="dsb" aria-label="Đồng hồ đếm ngược">
            ${sidebar(c, items)}
            <div class="panel actions">
                ${next ? calendarLinks(c, next) : ''}
                <button type="button" class="btn block" data-save="${c.slug}" aria-pressed="false">${icon('i-star', 18)}<span data-save-text>Lưu hội nghị</span></button>
            </div>
        </aside>
    </div>
</div>
</main>`;
};

for (const c of CONFERENCES) {
    const html = pageShell({
        title: `${c.name} ${c.year}, chi tiết hội nghị`,
        description: `${c.name} ${c.year}: các mốc quan trọng, hạn nộp bài theo AoE và giờ Việt Nam.`,
        scripts: ['save', 'newsletter'],
        main: main(c),
    });
    writeFileSync(fileURLToPath(new URL(`../site/${c.file}`, import.meta.url)), html);
    console.log('đã sinh', c.file);
}
```

- [ ] **Step 3: Sinh trang và đồng bộ**

Run: `node tools/build-conferences.mjs && node tools/sync-chrome.mjs`
Expected: 6 dòng `đã sinh ...`; sau đó `updated hoi-nghi*.html` cho các trang vừa sinh (aria-current, skip link…).

- [ ] **Step 4: Duyệt khác biệt của ICSE so với bản cũ**

Run: `git diff site/hoi-nghi.html`
Expected: chỉ các khác biệt có chủ ý: `<tr class="">` thành `<tr>`; ba nút lịch/lưu/tạm dừng thành hai liên kết lịch thật + nút lưu có `data-save`; "Báo dữ liệu sai" thành liên kết `lien-he.html`; không còn nút "Tạm dừng đồng hồ"; thêm `<script src="js/save.js">`. Số liệu (mốc, "Còn 43 ngày", "Còn 68 ngày", "Còn 104 ngày") phải khớp bản cũ. Nếu số "Còn N ngày" lệch bản cũ, kiểm tra `NOW` và logic `+DAY`.

- [ ] **Step 5: Kiểm tra trên trình duyệt**

Mở `hoi-nghi-fse.html`, `hoi-nghi-neurips.html`: FSE hiện badge "Trong tuần" màu cam và mốc kế tiếp nền cam nhạt; NeurIPS hiện hộp xám "Hạn nộp bài đã kết thúc", mọi mốc "Đã qua", không có nút lịch. Bấm "Tải .ics" ở FSE tải về file `fse-2027.ics`; mở file thấy `DTSTART:20261014T115900Z`. Nút "Lưu hội nghị" đổi thành "Đã lưu" và đồng bộ với trang Đã lưu.

- [ ] **Step 6: Commit**

```bash
git add tools site
git commit -m "feat: sinh 6 trang chi tiết hội nghị từ một file dữ liệu (lịch .ics thật)"
```

### Task 18: Nối thẻ trong lịch và trang chủ với trang chi tiết

**Files:**
- Modify: `site/lich-hoi-nghi.html`, `site/index.html`, `tools/check-site.mjs`

- [ ] **Step 1: Thêm kiểm tra "mỗi thẻ có trang chi tiết" (thất bại trước)**

Edit `tools/check-site.mjs`, thêm trước khối `if (errors.length)`:

```js
// Mỗi thẻ hội nghị trong lịch phải dẫn tới một trang chi tiết.
for (const rel of ['lich-hoi-nghi.html', 'index.html']) {
    for (const m of (pages.get(rel) ?? '').matchAll(/<article class="cd (?!sk)[\s\S]*?<\/article>/g)) {
        if (!/<h3><a href="hoi-nghi[^"]*\.html">/.test(m[0])) {
            err(rel, `thẻ chưa có trang chi tiết: ${m[0].match(/<h3>(?:<a[^>]*>)?([^<]+)/)?.[1] ?? '?'}`);
        }
    }
}
```

Run: `node tools/check-site.mjs`
Expected: FAIL với `thẻ chưa có trang chi tiết: FSE` (và các thẻ khác ngoài ICSE).

- [ ] **Step 2: Gắn liên kết (script tạm)**

```js
// tools/_link-cards.mjs  (chạy một lần rồi xoá)
import { readFileSync, writeFileSync } from 'node:fs';
import { CONFERENCES } from './conferences.mjs';

const fileOf = Object.fromEntries(CONFERENCES.map(c => [c.name, c.file]));
for (const f of ['lich-hoi-nghi.html', 'index.html']) {
    const p = new URL(`../site/${f}`, import.meta.url);
    const html = readFileSync(p, 'utf8').replace(/<article class="cd (?!sk)[\s\S]*?<\/article>/g, art =>
        art.replace(/<h3>([A-Za-z]+) <span>(\d{4})<\/span><\/h3>/, (all, name, year) =>
            fileOf[name] ? `<h3><a href="${fileOf[name]}">${name} <span>${year}</span></a></h3>` : all));
    writeFileSync(p, html);
}
console.log('xong');
```

Run: `node tools/_link-cards.mjs && rm tools/_link-cards.mjs`

- [ ] **Step 3: Kiểm tra**

Run: `node tools/check-site.mjs`
Expected: `OK: ... trang` (không còn lỗi, kể cả `hoi-nghi-*.html` từ trang Đã lưu).

Trên trình duyệt: ở `lich-hoi-nghi.html` bấm vào cả 6 thẻ đều tới đúng trang; bấm ★ không kích hoạt điều hướng.

- [ ] **Step 4: Commit**

```bash
git add site tools/check-site.mjs
git commit -m "feat: thẻ hội nghị trong lịch và trang chủ dẫn tới trang chi tiết"
```

### Task 19: Hoàn thiện, kiểm tra cuối

**Files:**
- Modify: `tools/chrome.mjs`, `tools/sync-chrome.mjs`, `tools/check-site.mjs`, các trang có tiêu đề trùng hoặc thiếu mô tả

- [ ] **Step 1: Thêm favicon vào bộ đồng bộ**

Edit `tools/chrome.mjs`, thêm cuối file:

```js
export const faviconHtml = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' rx=\'6\' fill=\'%231e2a4a\'/%3E%3Ctext x=\'16\' y=\'23\' font-size=\'20\' text-anchor=\'middle\' fill=\'%23f3e6c4\' font-family=\'Georgia,serif\' font-weight=\'700\'%3EC%3C/text%3E%3C/svg%3E">';
```

Edit `tools/sync-chrome.mjs`: thêm `faviconHtml` vào import; trong `syncPage`, sau dòng chèn `js/theme.js`, thêm:
```js
    if (!out.includes('rel="icon"')) out = out.replace('</head>', `    ${faviconHtml}\n</head>`);
```

- [ ] **Step 2: Thêm kiểm tra tiêu đề không trùng**

Edit `tools/check-site.mjs`, thêm trước khối `if (errors.length)`:

```js
// Mỗi trang một <title> riêng.
const titles = new Map();
for (const [rel, html] of pages) {
    const t = html.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!t) continue;
    if (titles.has(t)) err(rel, `trùng <title> với ${titles.get(t)}: ${t}`);
    else titles.set(t, rel);
}
```

- [ ] **Step 3: Đồng bộ và chạy toàn bộ kiểm tra**

Run:
```bash
node tools/sync-chrome.mjs
node tools/check-site.mjs
node tools/check-contrast.mjs
node --test tools/theme.test.mjs tools/save.test.mjs
```
Expected: cả bốn lệnh thành công. Nếu `check-site` báo `trùng <title>`, sửa `<title>` của trang đứng sau cho khác (giữ đuôi ` | UIT ConFinder`); nếu báo thiếu `meta description`, thêm mô tả 1 câu cho trang đó.

- [ ] **Step 4: Rà cuối bằng mắt**

Với các trang `index`, `lich-hoi-nghi` (4 trạng thái), `hoi-nghi`, `hoi-nghi-neurips`, `faq-aoe`, `gioi-thieu`, `lien-he`, `da-luu`, `404`, `blog`, một bài blog: ở 375px, 768px, 1280px, cả sáng và tối, chạy `tools/probe-overflow.js`, kiểm `overflow: false` và quét nhanh bố cục. Dùng Tab xuyên một trang: skip link đầu tiên, thứ tự focus hợp lý, vòng focus nhìn thấy.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: favicon, kiểm tiêu đề không trùng, rà cuối"
```

- [ ] **Step 6: Hỏi người dùng trước khi đẩy lên GitHub**

Không tự `git push`. Hỏi người dùng có muốn đẩy lên `origin/main` (repo private `Hoagjaxz/uit-confinder`) không; nếu có thì chạy `git push`.

---

## Tự rà soát với spec

| Yêu cầu spec | Task |
|---|---|
| Token tối, dark mode, nút toggle, nhớ lựa chọn, mặc định theo hệ thống | 2, 3, 4, 5 |
| Contrast AA cho 5 mức urgency và badge | 3 (kiểm bằng `check-contrast`), 7 |
| Skip link, `<main id>`, focus ring | 4, 5 |
| Breakpoint 375/768/1024, nav thu gọn, grid 3→2→1, bảng thành thẻ | 4, 6 (bảng mốc đã có sẵn dạng thẻ dưới 40rem, xác nhận ở Task 6) |
| Đồng bộ header/footer ~35 file bằng script một lần | 1, 5 |
| 4 trạng thái (loading skeleton, error + Thử lại, empty + Xoá bộ lọc, ready), `?state=` và dải demo ẩn được bằng class | 8 |
| Trang Giới thiệu (có cách đọc rank), Liên hệ, FAQ + AoE, 404, Đã lưu | 11–15 |
| Nav/footer dẫn tới trang có thật, không còn `href="#"` | 16, 19 (`check-site` bắt `href="#"`) |
| 4–6 trang hội nghị mới, nút thêm lịch, card tương ứng trong lịch | 17, 18 (5 trang mới + ICSE = 6) |
| `<title>`, meta description, alt, favicon | 19 |
| Script kiểm link nội bộ | 1, 18, 19 |
| Ghi chú "dữ liệu minh hoạ" ở footer và Giới thiệu | `FOOT_NOTE` (Task 1), Task 12 |
| Rủi ro: backup/git trước khi đồng bộ hàng loạt | Đã có git; Task 5 chạy thử 2 trang rồi xem diff |
| localStorage bị chặn | `theme.js`, `save.js` có test (Task 3, 9) |
| Ngoài phạm vi: backend, countdown động, filter thật, framework | Không có task nào làm |

Khoảng trống đã biết và chấp nhận: "Chế độ xem Thẻ/Bảng" và bộ lọc ở trang lịch vẫn tĩnh (đúng ngoài phạm vi); ngày mẫu quanh 10/2026 sẽ lỗi thời dần.
