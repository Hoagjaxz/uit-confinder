// tools/build-lists.mjs
// Dùng: node tools/build-lists.mjs
// Sinh các thẻ .badge-card từ conferences.mjs vào giữa marker <!--tickets:NAME-->...<!--/tickets:NAME--> (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { createRequire } from 'node:module';
import { formatVN, daysLeft, urgency, nextDue, NOW_AT } from './time-vn.mjs';

const hero = createRequire(import.meta.url)('../site/js/hero-clock.js'); // cùng hàm với trình duyệt, nên HTML tĩnh khớp bản chạy

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

const open = CONFERENCES.filter(c => !c.closed).sort(byDue);

// Hero: mỗi hội nghị đưa về một "hạn" (ms) giống dữ liệu backend sẽ gửi. Hội nghị đặt closed mà mốc còn ở tương lai thì coi như hạn vừa qua.
const heroItem = c => {
    const due = nextDue(c);
    const iso = c.closed && Date.parse(due.at) > NOW_AT ? new Date(NOW_AT - 1000 + 7 * 36e5).toISOString().replace('.000Z', '+07:00') : due.at, deadline = Date.parse(iso);
    const prev = c.milestones.filter(m => m.at && Date.parse(m.at) < deadline).at(-1); // mốc có hạn ngay trước đó = lúc mở nộp; thiếu thì hero tự đặt 30 ngày trước hạn
    const opens = prev ? Date.parse(prev.at) : hero.defaultOpens(deadline);
    return { c, iso, deadline, opens, opensIso: prev ? prev.at : new Date(opens + 7 * 36e5).toISOString().replace('.000Z', '+07:00'), name: c.name, href: c.file, label: due.name };
};
const heroItems = CONFERENCES.map(heroItem);
const { open: heroOpen, closed: heroClosed } = hero.order(heroItems, NOW_AT);
const noneOpen = !heroOpen.length;

// Khối tiêu đề: trạng thái "còn từ 1 ngày" hoặc "dưới 24 giờ" cho hạn gần nhất, hoặc "không còn hội nghị nào mở".
const heroHead = () => {
    const [first] = heroOpen;
    const sec = first ? hero.remaining(first.deadline, NOW_AT) : 0;
    return hero.block({ ...first, phase: first ? hero.phase(sec) : 'none', sec, now: NOW_AT, next: null });
};
// Hàng tên hội nghị: cỡ chữ theo thứ tự hạn (--r), chấm và nhãn chữ theo mức khẩn. Hội nghị đã đóng vẫn có mặt (ẩn) để JS dùng khi hạn qua.
const heroNames = () => {
    const shown = noneOpen ? heroClosed : heroOpen, rest = heroItems.filter(i => !shown.includes(i));
    const li = (it, r, hidden) => {
        const lv = hero.level(it.deadline, NOW_AT), dm = formatVN(it.iso).date.slice(0, 5);
        return `<li data-deadline="${it.iso}" data-opens="${it.opensIso}" data-label="${it.label}" data-level="${lv}"${noneOpen ? ' class="is-closed"' : ''}${hidden ? ' hidden' : ''} style="--r:${r}"><a href="${it.href}"><span class="nm-n"><i class="nm-dot" aria-hidden="true"></i><span class="nm-nm">${it.name}</span><span class="vh"> ${it.c.year}</span></span><span class="vh">,</span><span class="nm-due"><b class="nm-lv">${hero.LV[lv]}</b><span class="vh"> hạn</span> <span class="nm-d">${dm}</span></span></a></li>`;
    };
    return `<h2 id="names-h">${noneOpen ? 'Đã đóng nộp bài' : 'Đang mở nộp bài'}</h2>
<ul class="names" data-hero-list>
${[...shown.map((it, k) => li(it, noneOpen ? 3 : k, false)), ...rest.map(it => li(it, 0, true))].join('\n')}
</ul>`;
};

const TARGETS = {
    'tickets:lich': { file: 'lich-hoi-nghi.html', html: list(CONFERENCES) },
    'hero:head': { file: 'index.html', html: heroHead() },
    'hero:names': { file: 'index.html', html: heroNames() },
    'tickets:trang-chu': { file: 'index.html', html: list(open.slice(1)) },
    'tickets:da-luu': { file: 'da-luu.html', html: list(CONFERENCES, c => `<li data-saved-item="${c.slug}" hidden>`) },
};

for (const [name, { file, html }] of Object.entries(TARGETS)) {
    const path = fileURLToPath(new URL(`../site/${file}`, import.meta.url));
    const src = readFileSync(path, 'utf8');
    const re = new RegExp(`<!--${name}-->[\\s\\S]*?<!--/${name}-->`);
    if (!re.test(src)) throw new Error(`${file}: thiếu marker ${name}`);
    const out = src.replace(re, () => `<!--${name}-->\n${html}\n<!--/${name}-->`);
    if (out !== src) { writeFileSync(path, out); console.log('updated', file); }
}
