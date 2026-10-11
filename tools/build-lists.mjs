// tools/build-lists.mjs
// Dùng: node tools/build-lists.mjs
// Sinh các thẻ .badge-card từ conferences.mjs vào giữa marker <!--tickets:NAME-->...<!--/tickets:NAME--> (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { formatVN, daysLeft, urgency, nextDue } from './time-vn.mjs';

const { phrase, paneStates, heat } = createRequire(import.meta.url)('../site/js/hero-clock.js'); // cùng hàm đọc thời gian bằng chữ với trình duyệt

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

// Mặt trời đếm ngược ở hero: vòng đầy = phần thời gian đã trôi từ mốc trước đến hạn này (hạn thiếu mốc trước thì lấy 30 ngày).
const secs = n => +n.d * 86400 + +n.h * 3600 + +n.m * 60 + +n.s;
const windowSecs = c => {
    const due = Date.parse(nextDue(c).at);
    const prev = Math.max(...c.milestones.filter(m => m.at && Date.parse(m.at) < due).map(m => Date.parse(m.at)));
    return Number.isFinite(prev) ? (due - prev) / 1000 : 30 * 86400;
};
const sat = (c, i) => {
    const due = nextDue(c);
    return `<a class="sat sat-${i + 1}" data-level="${urgency(daysLeft(due.at))}" href="${c.file}"><b>${c.name}</b> <span class="mono">${formatVN(due.at).date.slice(0, 5)}</span><small>còn ${c.next.text.replace(/^Còn /, '')}</small></a>`;
};
const orb = () => {
    const [c, ...rest] = open;
    const due = nextDue(c);
    const { time, date } = formatVN(due.at);
    const total = windowSecs(c);
    const left = secs(c.next);
    const ratio = Math.min(1, Math.max(0, 1 - left / total));
    const { d, h, m, s } = c.next;
    const say = phrase(left);
    const panes = paneStates(Math.max(1, Math.round(total / 86400)), (total - left) / 86400)
        .map((st, i) => `<span class="pane" data-s="${st}" style="--i:${i}"></span>`).join('');
    return `<h2 class="vh">Hạn chót gần nhất</h2>
<p class="vh">${c.name} ${c.year} ${say} đến hạn ${due.name.toLowerCase()}, ${time} ngày ${date}, giờ Việt Nam.</p>
<div class="orb-main" style="--p:${(ratio * 100).toFixed(1)};--heat:${heat(ratio).toFixed(3)}" data-hero-clock data-d="${+d}" data-h="${+h}" data-m="${+m}" data-s="${+s}" data-total="${total}">
    <div class="orb-fig">
        <div class="orb" role="img" aria-label="Mặt trời đếm ngược: ${c.name} ${c.year} ${say}">
            <span class="orb-orbit"></span>
            <span class="orb-sec"></span>
            <svg class="orb-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg>
            <span class="orb-sun"></span>
            <span class="orb-halo"></span>
            <span class="orb-ball"><i class="lt lt-1"></i><i class="lt lt-2"></i><i class="lt lt-3"></i><span class="orb-panes">${panes}</span></span>
        </div>
        <div class="orb-sats">
            ${rest.slice(0, HERO_N - 1).map(sat).join('\n            ')}
        </div>
    </div>
    <div class="orb-info">
        <a class="orb-name" href="${c.file}">${c.name} ${c.year}</a>
        <p class="orb-say" aria-hidden="true">${say}</p>
        <p class="orb-lab">${due.name} · ${date.slice(0, 5)} ${time} giờ Việt Nam</p>
    </div>
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
