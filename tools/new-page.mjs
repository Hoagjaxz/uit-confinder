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
