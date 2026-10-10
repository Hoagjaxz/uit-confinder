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
