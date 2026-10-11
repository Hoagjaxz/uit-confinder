// tools/build-lists.mjs
// Dùng: node tools/build-lists.mjs
// Sinh các thẻ .badge-card từ conferences.mjs vào giữa marker <!--tickets:NAME-->...<!--/tickets:NAME--> (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { formatVN, daysLeft, urgency, nextDue } from './time-vn.mjs';

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

const HERO_N = 3; // trang chủ: hạn gần nhất là quả cầu đồng hồ, 2 hạn kế là vệ tinh; phần "Các hạn tiếp theo" liệt kê phần còn lại
const open = CONFERENCES.filter(c => !c.closed).sort(byDue);

// Quả cầu đồng hồ ở hero: vòng đầy = phần thời gian đã trôi từ mốc trước đến hạn này (hạn thiếu mốc trước thì lấy 30 ngày).
const secs = n => +n.d * 86400 + +n.h * 3600 + +n.m * 60 + +n.s;
const windowSecs = c => {
    const due = Date.parse(nextDue(c).at);
    const prev = Math.max(...c.milestones.filter(m => m.at && Date.parse(m.at) < due).map(m => Date.parse(m.at)));
    return Number.isFinite(prev) ? (due - prev) / 1000 : 30 * 86400;
};
const SAT_ANGLES = [38, 150]; // độ, tính từ đỉnh theo chiều kim đồng hồ
const sat = (c, i) => {
    const due = nextDue(c);
    const a = SAT_ANGLES[i] * Math.PI / 180;
    const pos = `left:${(50 + 50 * Math.sin(a)).toFixed(1)}%;top:${(50 - 50 * Math.cos(a)).toFixed(1)}%`;
    return `<a class="sat" data-level="${urgency(daysLeft(due.at))}" style="${pos}" href="${c.file}"><b>${c.name}</b> <span class="mono">${formatVN(due.at).date.slice(0, 5)}</span><small>còn ${c.next.text.replace(/^Còn /, '')}</small></a>`;
};
const orb = () => {
    const [c, ...rest] = open;
    const due = nextDue(c);
    const { time, date } = formatVN(due.at);
    const total = windowSecs(c);
    const p = Math.min(100, Math.max(0, (1 - secs(c.next) / total) * 100)).toFixed(1);
    const { d, h, m, s } = c.next;
    return `<h2 class="vh">Hạn chót gần nhất</h2>
<p class="vh">${c.name} ${c.year} còn ${c.next.text.replace(/^Còn /, '')} đến hạn ${due.name.toLowerCase()}, ${time} ngày ${date}, giờ Việt Nam.</p>
<div class="orb" style="--p:${p}" data-hero-clock data-d="${+d}" data-h="${+h}" data-m="${+m}" data-s="${+s}" data-total="${total}">
    <span class="orb-orbit" aria-hidden="true"></span>
    <svg class="orb-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg>
    <span class="orb-sun" aria-hidden="true"></span>
    <span class="orb-ball" aria-hidden="true"></span>
    <span class="orb-glass" aria-hidden="true"></span>
    <div class="orb-clock">
        <a class="orb-name" href="${c.file}">${c.name} ${c.year}</a>
        <p class="orb-lab">${due.name} · ${date.slice(0, 5)} ${time}</p>
        <p class="orb-dig mono" aria-hidden="true"><span><b data-u="d">${d}</b><i>ngày</i></span><span><b data-u="h">${h}</b><i>giờ</i></span><span><b data-u="m">${m}</b><i>phút</i></span><span class="orb-s"><b data-u="s">${s}</b><i>giây</i></span></p>
    </div>
    ${rest.slice(0, HERO_N - 1).map(sat).join('\n    ')}
</div>`;
};
const openList = () => `<ul>
${open.map(c => `<li><a href="${c.file}"><b>${c.name}</b> <span>${c.core}</span></a></li>`).join('\n')}
</ul>`;

const TARGETS = {
    lich: { file: 'lich-hoi-nghi.html', html: list(CONFERENCES) },
    'hero:orb': { file: 'index.html', html: orb() },
    'hero:open': { file: 'index.html', html: openList() },
    'trang-chu': { file: 'index.html', html: list(open.slice(HERO_N)) },
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
