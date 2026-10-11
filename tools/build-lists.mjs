// tools/build-lists.mjs
// Dùng: node tools/build-lists.mjs
// Sinh các thẻ .badge-card từ conferences.mjs vào giữa marker <!--tickets:NAME-->...<!--/tickets:NAME--> (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { createRequire } from 'node:module';
import { formatVN, daysLeft, urgency, nextDue } from './time-vn.mjs';

const { format, spoken } = createRequire(import.meta.url)('../site/js/hero-clock.js'); // cùng hàm với trình duyệt, nên HTML tĩnh khớp bản chạy

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
const [first] = open; // hạn gần nhất nằm trong câu tiêu đề hero; phần "Các hạn tiếp theo" liệt kê phần còn lại

// Tiêu đề hero: "Còn [viên nang đồng hồ] để nộp ICSE". Giây còn lại lấy từ c.next (dữ liệu minh hoạ nhập tay).
const heroHead = () => {
    const { d, h, m, s } = first.next, sec = +d * 86400 + +h * 3600 + +m * 60 + +s;
    const due = nextDue(first), { time, date } = formatVN(due.at);
    return `<h1 id="home-h1">Còn <span class="cap" data-hero-clock data-sec="${sec}"><span class="vh">${spoken(sec)}</span><span class="cap-face mono" data-cd aria-hidden="true">${format(sec)}</span></span> để nộp <a href="${first.file}">${first.name}</a></h1>
<p class="hero-sub">${due.name} lúc ${time} ngày ${date}, giờ Việt Nam.</p>`;
};
// Hàng tên hội nghị viết như logo, xếp theo hạn gần nhất.
const heroNames = () => `<ul class="names">\n${open.map(c => `<li><a href="${c.file}" aria-label="${c.name} ${c.year}, hạn ${formatVN(nextDue(c).at).date.slice(0, 5)}">${c.name}</a></li>`).join('\n')}\n</ul>`;

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
