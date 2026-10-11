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

// Hero trang chủ: thẻ đeo lớn của hạn gần nhất (có đồng hồ chạy) và dòng meta cho hai hạn kế tiếp.
const poster = c => {
    const due = nextDue(c);
    const lv = urgency(daysLeft(due.at));
    const { time, date } = formatVN(due.at);
    const { d, h, m, s = '00' } = c.next;
    const cell = (u, v, lab, cls = '') => `<span class="ck${cls}"><b data-u="${u}">${v}</b><small>${lab}</small></span>`;
    return `<article class="pcard" data-level="${lv}">
    <button type="button" class="iconbtn" data-save="${c.slug}" aria-pressed="false" aria-label="Lưu hội nghị">${icon('i-star', 24)}</button>
    <div class="pc-rib">${[c.core, c.ccf].filter(Boolean).map(ribbon).join('')}</div>
    <h3 class="pc-name"><a href="${c.file}">${c.name} ${c.year}</a></h3>
    <p class="pc-full">${c.full}</p>
    <div class="pc-clock">
        <p class="vh">${c.next.text}</p>
        <div class="clock mono" data-hero-clock data-d="${d}" data-h="${h}" data-m="${m}" data-s="${s}" aria-hidden="true">${cell('d', d, 'ngày')}<i class="sep">:</i>${cell('h', h, 'giờ')}<i class="sep">:</i>${cell('m', m, 'phút')}<i class="sep sep-s">:</i>${cell('s', s, 'giây', ' ck-s')}</div>
    </div>
    <div class="pc-foot">
        <p class="pc-due"><span class="bc-lab">${due.name}</span><time class="mono" datetime="${due.at}">${time} ${date}</time><span class="bc-tz">giờ Việt Nam</span></p>
        ${ub(lv)}
    </div>
</article>`;
};
const heroNext = cs => `<ul class="pm-list" aria-label="Hai hạn chót kế tiếp">
${cs.map(c => {
    const due = nextDue(c);
    return `<li><a href="${c.file}">${c.name} ${c.year}</a><time class="mono" datetime="${due.at}">${formatVN(due.at).date.slice(0, 5)}</time><span class="mono">${c.next.text.replace(/^Còn /, '')}</span></li>`;
}).join('\n')}
</ul>`;

const HERO_N = 3; // trang chủ: hạn đầu thành thẻ lớn, hai hạn kế tiếp thành dòng meta ở hero, phần "Các hạn tiếp theo" liệt kê phần còn lại
const open = CONFERENCES.filter(c => !c.closed).sort(byDue);

const TARGETS = {
    lich: { file: 'lich-hoi-nghi.html', html: list(CONFERENCES) },
    'hero-big': { file: 'index.html', html: poster(open[0]) },
    hero: { file: 'index.html', html: heroNext(open.slice(1, HERO_N)) },
    'trang-chu': { file: 'index.html', html: list(open.slice(HERO_N)) },
    'da-luu': { file: 'da-luu.html', html: list(CONFERENCES, c => `<li data-saved-item="${c.slug}" hidden>`) },
};

for (const [name, { file, html }] of Object.entries(TARGETS)) {
    const path = fileURLToPath(new URL(`../site/${file}`, import.meta.url));
    const src = readFileSync(path, 'utf8');
    const re = new RegExp(`<!--tickets:${name}-->[\\s\\S]*?<!--/tickets:${name}-->`);
    if (!re.test(src)) throw new Error(`${file}: thiếu marker tickets:${name}`);
    const out = src.replace(re, () => `<!--tickets:${name}-->\n${html}\n<!--/tickets:${name}-->`);
    if (out !== src) { writeFileSync(path, out); console.log('updated', file); }
}
