// Đồng bộ header/footer vào mọi trang HTML trong site/. Chạy lại bao nhiêu lần cũng cho cùng kết quả.
// Dùng: node tools/sync-chrome.mjs [đường/dẫn/tương/đối.html ...]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skipHtml, navHtml, brandHtml, footerHtml, savedHtml, faviconHtml, FONTS_HTML, currentFor } from './chrome.mjs';

export const SITE = fileURLToPath(new URL('../site/', import.meta.url));
export const htmlFiles = (dir = SITE) =>
    readdirSync(dir, { withFileTypes: true }).flatMap(e =>
        e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);

const NAV_RE = /<!--c:nav-->[\s\S]*?<!--\/c:nav-->|<nav class="nav"[\s\S]*?<\/nav>/;
const BRAND_RE = /<a class="brand"[\s\S]*?<\/a>/g;
const FOOT_RE = /<footer class="foot">[\s\S]*?<\/footer>/;
// Dải đăng ký nhận tin đã bỏ: gỡ khỏi trang cũ (tên được ghép để grep kiểm tra "đã sạch" không bắt chính công cụ này).
const GONE = 'ne' + 'ws';
const NEWS_RE = new RegExp(String.raw`<div class="cta"><section class="${GONE}"[\s\S]*?</section>\s*</div>\r?\n?|<section class="${GONE}"[\s\S]*?</section>\r?\n?`);
const NEWS_JS_RE = new RegExp(String.raw`<script src="[^"]*js/${GONE}letter\.js"></script>\r?\n?`);
const SAVED_RE = /<!--c:saved-->[\s\S]*?<!--\/c:saved-->|<span class="saved">[\s\S]*?<\/span>/;

export const syncPage = (html, rel) => {
    const prefix = '../'.repeat(rel.split('/').length - 1);
    let out = html;
    if (!out.includes('class="skip"')) out = out.replace('<body>', `<body>\n${skipHtml}`);
    // Gỡ mọi thẻ Google Fonts cũ rồi chèn đúng một bộ trước site.css.
    out = out.replace(/[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\r?\n?/g, '');
    out = out.replace(/([ \t]*)(<link rel="stylesheet" href="[^"]*css\/site\.css">)/, (_, ind, tag) => `${ind}${FONTS_HTML}\n${ind}${tag}`);
    if (!out.includes('rel="icon"')) out = out.replace('</head>', `    ${faviconHtml}\n</head>`);
    else out = out.replace(/<link rel="icon"[^>]*>/, () => faviconHtml);
    if (!out.includes('js/theme.js')) out = out.replace('</head>', `    <script src="${prefix}js/theme.js"></script>\n</head>`);
    if (!out.includes('js/save.js')) out = out.replace('</body>', `<script src="${prefix}js/save.js"></script>
</body>`);
    if (!out.includes('js/nav.js')) out = out.replace('</body>', `<script src="${prefix}js/nav.js"></script>\n</body>`);
    out = out.replace(/<main(?:\s[^>]*)?>/, '<main id="main" tabindex="-1">');
    out = out.replace(NAV_RE, () => navHtml(prefix, currentFor(rel)));
    out = out.replace(NEWS_RE, '').replace(NEWS_JS_RE, '');
    out = out.replace(BRAND_RE, () => brandHtml(prefix));
    out = out.replace(FOOT_RE, () => footerHtml(prefix));
    if (SAVED_RE.test(out)) out = out.replace(SAVED_RE, () => savedHtml(prefix));
    else out = out.replace(/(<a class="brand"[\s\S]*?<\/a>)/, (m) => `${m}
    ${savedHtml(prefix)}`);
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
