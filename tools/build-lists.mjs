// tools/build-lists.mjs
// Dùng: node tools/build-lists.mjs
// Sinh các thẻ .badge-card từ conferences.mjs vào giữa marker <!--tickets:NAME-->...<!--/tickets:NAME--> (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { formatVN, daysLeft, urgency, nextDue, NOW, DAY } from './time-vn.mjs';

const { orbHtml } = createRequire(import.meta.url)('../site/js/hero-clock.js'); // cùng hàm dựng quả cầu với trình duyệt

const card = c => {
    const due = nextDue(c);
    const lv = c.closed ? 'x' : urgency(daysLeft(due.at));
    const { time, date } = formatVN(due.at);
    const [dm, y] = [date.slice(0, 5), date.slice(5)];
    const where = c.format === 'Online' ? c.place : `${c.place} · ${c.format}`;
    return `<article class="badge-card" data-level="${lv}">
    <button type="button" class="iconbtn" data-save="${c.slug}" aria-pressed="false" aria-label="Lưu hội nghị">${icon('i-star', 20)}</button>
    <div class="bc-main">
        <h3 class="bc-name"><a href="${c.file}">${c.name} ${c.year}</a></h3>
        <p class="bc-full">${c.full}</p>
        <div class="bc-meta">${[c.core, c.ccf].filter(Boolean).map(ribbon).join('')}<span class="bc-loc">${where}</span></div>
    </div>
    <div class="bc-due">
        <span class="bc-lab">${due.name}</span>
        <time class="bc-date mono" datetime="${due.at}">${dm}<small>${y}</small></time>
        <span class="bc-time mono">${time}</span>
    </div>
    <div class="bc-state">${ub(lv)}${c.closed ? '' : `<span class="bc-cd mono">${c.next.text.replace(/^Còn /, '')}</span>`}</div>
</article>`;
};

const list = (cs, li = c => '<li>', cls = 'badge-list') => `<ul class="${cls}">\n${cs.map(c => `${li(c)}\n${card(c)}\n</li>`).join('\n')}\n</ul>`;
const byDue = (a, b) => Date.parse(nextDue(a).at) - Date.parse(nextDue(b).at);

const HERO_N = 3; // trang chủ: hạn gần nhất là quả cầu đồng hồ, 2 hạn kế là hành tinh; phần "Các hạn tiếp theo" liệt kê phần còn lại
const open = CONFERENCES.filter(c => !c.closed).sort(byDue);

// Mặt trời đếm ngược ở hero: vòng đầy = phần thời gian đã trôi từ mốc trước đến hạn này (hạn thiếu mốc trước thì lấy 30 ngày).
// HTML tĩnh tính ở mốc NOW; trình duyệt dựng lại từ data-deadline theo giờ máy (site/js/hero-clock.js).
const windowMs = c => {
    const due = Date.parse(nextDue(c).at);
    const prev = Math.max(...c.milestones.filter(m => m.at && Date.parse(m.at) < due).map(m => Date.parse(m.at)));
    return Number.isFinite(prev) ? due - prev : 30 * DAY;
};
const heroItem = c => ({ name: `${c.name} ${c.year}`, short: c.name, href: c.file, label: nextDue(c).name, deadline: Date.parse(nextDue(c).at), opens: Date.parse(nextDue(c).at) - windowMs(c) });
const orb = () => `<h2 class="vh">Hạn gần nhất</h2>
<p class="vh" role="status" data-hero-live></p>
<div data-hero-orb>
${orbHtml(open.map(heroItem), NOW)}
</div>`;
const openList = () => `<ul data-hero-list>
${open.map(c => { const h = heroItem(c); return `<li data-deadline="${nextDue(c).at}" data-opens="${new Date(h.opens).toISOString()}" data-label="${h.label}" data-year="${c.year}"><a href="${c.file}"><b>${c.name}</b> <span>${c.core}</span></a></li>`; }).join('\n')}
</ul>`;

const TARGETS = {
    lich: { file: 'lich-hoi-nghi.html', html: list(CONFERENCES) },
    'hero:orb': { file: 'index.html', html: orb() },
    'hero:open': { file: 'index.html', html: openList() },
    'trang-chu': { file: 'index.html', html: list(open, c => `<li data-deadline="${nextDue(c).at}"${open.indexOf(c) < HERO_N ? ' hidden' : ''}>`) }, // trình duyệt ẩn/hiện lại theo giờ máy
    'da-luu': { file: 'da-luu.html', html: list(CONFERENCES, c => `<li data-saved-item="${c.slug}" hidden>`) },
};

for (const [name, { file, html }] of Object.entries(TARGETS)) {
    const path = fileURLToPath(new URL(`../site/${file}`, import.meta.url));
    const src = readFileSync(path, 'utf8');
    const key = name.includes(':') ? name : `tickets:${name}`;
    const re = new RegExp(`<!--${key}-->[\\s\\S]*?<!--/${key}-->`);
    if (!re.test(src)) throw new Error(`${file}: thiếu marker ${key}`);
    const out = src.replace(re, () => `<!--${key}-->\n${html}\n<!--/${key}-->`);
    if (out !== src) { writeFileSync(path, out); console.log('updated', file); }
}
