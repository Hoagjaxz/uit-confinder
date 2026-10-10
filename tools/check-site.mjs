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

// Mỗi thẻ hội nghị trong lịch phải dẫn tới một trang chi tiết.
for (const rel of ['lich-hoi-nghi.html', 'index.html']) {
    for (const m of (pages.get(rel) ?? '').matchAll(/<article class="cd (?!sk)[\s\S]*?<\/article>/g)) {
        if (!/<h3><a href="hoi-nghi[^"]*\.html">/.test(m[0])) {
            err(rel, `thẻ chưa có trang chi tiết: ${m[0].match(/<h3>(?:<a[^>]*>)?([^<]+)/)?.[1] ?? '?'}`);
        }
    }
}

// Mỗi trang một <title> riêng.
const titles = new Map();
for (const [rel, html] of pages) {
    const t = html.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!t) continue;
    if (titles.has(t)) err(rel, `trùng <title> với ${titles.get(t)}: ${t}`);
    else titles.set(t, rel);
}

if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} lỗi`);
    process.exit(1);
}
console.log(`OK: ${pages.size} trang`);
