// tools/build-conferences.mjs
// Dùng: node tools/build-conferences.mjs && node tools/sync-chrome.mjs
// Sinh trang chi tiết của mọi hội nghị trong conferences.mjs (ghi đè site/<file>).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pageShell } from './shell.mjs';
import { CONFERENCES } from './conferences.mjs';
import { icon, ub, ribbon } from './levels.mjs';
import { formatVN, daysLeft, icsStart, urgency } from './time-vn.mjs';

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const when = m => { const t = formatVN(m.at); return `${t.time} ${t.date}`; };

const analyse = c => {
    const items = c.milestones.map(m => (m.at ? { ...m, days: daysLeft(m.at), kind: 'dated' } : { ...m, kind: 'event' }));
    const next = c.closed ? -1 : items.findIndex(m => m.kind === 'dated' && m.days >= 0);
    return items.map((m, i) => ({ ...m, kind: m.kind === 'event' ? 'event' : urgency(m.days) === 'x' ? 'past' : i === next ? 'next' : 'later' }));
};

const row = (c, m) => {
    if (m.kind === 'event') {
        return `<tr><td><span class="nm2">${m.name}</span></td><td class="mono" data-l="Hạn (giờ Việt Nam)">${m.range}</td><td data-l="Trạng thái"><span class="cvv">Diễn ra</span></td></tr>`;
    }
    const cell = bold => `<td class="mono" data-l="Hạn (giờ Việt Nam)">${bold ? `<b>${when(m)}</b>` : when(m)}</td>`;
    if (m.kind === 'past') {
        return `<tr class="past"><td><span class="nm2">${m.name}</span></td>${cell(false)}<td data-l="Trạng thái"><span class="badge soft">${icon('i-check', 12)}Đã qua</span></td></tr>`;
    }
    if (m.kind === 'next') {
        return `<tr class="next"><td><div class="nxt">${icon('i-alert', 14)}Mốc kế tiếp</div><div class="nm2">${m.name}</div></td>${cell(true)}<td data-l="Trạng thái">${ub(c.level, c.next.text)}</td></tr>`;
    }
    return `<tr><td><span class="nm2">${m.name}</span></td>${cell(false)}<td data-l="Trạng thái"><span class="mono cvv">Còn ${m.days} ngày</span></td></tr>`;
};

const calendarLinks = (c, m) => {
    const title = `${c.name} ${c.year}: ${m.name}`;
    const note = `Hạn ${when(m)} (giờ Việt Nam). Dữ liệu minh hoạ, hãy kiểm tra lại trên trang chính thức.`;
    const from = icsStart(m.at), to = icsStart(m.at, 1);
    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${from}/${to}&details=${encodeURIComponent(note)}`;
    const text = s => s.replace(/,/g, '\\,');
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UIT ConFinder//VI', 'BEGIN:VEVENT',
        `UID:${c.slug}-${from}@uit-confinder.example`, 'DTSTAMP:20261009T000000Z',
        `DTSTART:${from}`, `DTEND:${to}`,
        `SUMMARY:${text(title)}`, `DESCRIPTION:${text(note)}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n') + '\r\n';
    return `<a class="btn pri block" href="${esc(gcal)}" target="_blank" rel="noopener">${icon('i-calplus', 18)}Thêm vào Google Calendar</a>
                <a class="btn block" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" download="${c.slug}-${c.year}.ics">${icon('i-dl', 18)}Tải .ics</a>`;
};

const bigDue = (m, c) => {
    const { time, date } = formatVN(m.at);
    return `<div class="cd-due"><time class="cd-date mono" datetime="${m.at}">${date.slice(0, 5)}<small>${date.slice(5)}</small></time><span class="cd-time mono">${time} giờ Việt Nam</span></div>`;
};

const sidebar = (c, items) => {
    if (c.closed) {
        const m = items.find(x => x.name === c.closedLabel);
        return `<div class="cdbig">
                <h2 class="lab">Hạn nộp bài đã kết thúc<b>${m.name}</b></h2>
                ${bigDue(m, c)}
                <div class="cd-state">${ub('x')}</div>
            </div>`;
    }
    const m = items.find(x => x.kind === 'next');
    return `<div class="cdbig">
                <h2 class="lab">Mốc kế tiếp<b>${m.name}</b></h2>
                ${bigDue(m, c)}
                <div class="cd-state">${ub(c.level)}<span class="cd-left mono" role="timer" aria-live="off">${c.next.text.replace(/^Còn /, '')}</span></div>
            </div>`;
};

const main = c => {
    const items = analyse(c);
    const next = items.find(m => m.kind === 'next');
    const lv = c.closed ? 'x' : c.level;
    return `<main>
<div class="container dp">
    <a class="crumb" href="lich-hoi-nghi.html">${icon('i-left', 18)}Danh sách hội nghị</a>
    <header class="dh"><h1>${c.name} <span>${c.year}</span></h1>
        <p class="full">${c.full}</p>
        <div class="brow">${[c.core, c.ccf].filter(Boolean).map(ribbon).join('')}${c.fields.map(f => `<span class="chip">${f}</span>`).join('')}</div>
        <div class="meta"><span>${icon('i-pin')}${c.place}</span><span>${icon('i-calendar')}${c.dates}</span><span>Hình thức: ${c.format}</span></div>
    </header>
    <div class="dgrid lv-${lv}">
        <div>
            <section class="panel"><h2>Các mốc quan trọng</h2>
                <table class="mt"><thead><tr><th>Mốc</th><th>Hạn (giờ Việt Nam)</th><th>Trạng thái</th></tr></thead>
                <tbody>
${items.map(m => row(c, m)).join('\n')}
                </tbody></table>
            </section>
            <footer class="dfoot"><span>Nguồn: website chính thức của hội nghị ${icon('i-ext', 12)} (dữ liệu minh hoạ)</span><span>Cập nhật: ${c.updated}</span>
                <a class="btn" href="lien-he.html">${icon('i-flag')}Báo dữ liệu sai</a></footer>
        </div>
        <aside class="dsb" aria-label="Mốc kế tiếp">
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
        description: `${c.name} ${c.year}: các mốc quan trọng, hạn nộp bài theo giờ Việt Nam.`,
        scripts: ['save'],
        main: main(c),
    });
    writeFileSync(fileURLToPath(new URL(`../site/${c.file}`, import.meta.url)), html);
    console.log('đã sinh', c.file);
}
