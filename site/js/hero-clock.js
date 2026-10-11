// Hero trang chủ: thẻ lớn, dải chạy và danh sách "Các hạn tiếp theo" đều tính từ hạn ISO (datetime) trừ Date.now().
// HTML tĩnh (build-lists.mjs) có sẵn thẻ cho mọi hội nghị đang mở; ở đây chỉ chọn thẻ của hạn gần nhất còn mở.
// Các hàm thuần ở đầu file có test ở tools/hero-clock.test.mjs.
(function () {
    const DAY = 864e5, HOUR = 36e5;
    const pad = n => String(n).padStart(2, '0');
    const LV = { c: 'Gấp', s: 'Trong tuần', u: 'Trong tháng', o: 'Còn rộng', x: 'Đã hết hạn' };
    const ICON = { c: 'i-alert', s: 'i-clock', u: 'i-calendar', o: 'i-okc', x: 'i-xc' };

    // Giây còn lại, làm tròn lên: chỉ về 0 khi hạn thật sự đã qua.
    const remaining = (deadline, now) => Math.ceil((deadline - now) / 1000);
    function parts(sec) {
        const t = Math.max(0, Math.floor(sec));
        return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
    }
    // 187929 -> ["2 ngày", "4 giờ", "12 phút"]; đơn vị bằng 0 bị bỏ, dưới một phút thì còn số giây.
    function units(sec) {
        const { d, h, m, s } = parts(sec);
        const u = [[d, 'ngày'], [h, 'giờ'], [m, 'phút']].filter(([n]) => n);
        return (u.length ? u : [[s, 'giây']]).map(([n, w]) => `${n} ${w}`);
    }
    const spoken = sec => units(sec).join(' ');
    // Hội nghị còn mở có hạn gần nhất; null nếu không còn hội nghị nào.
    const pick = (items, now) => items.filter(i => i.deadline > now).sort((a, b) => a.deadline - b.deadline)[0] || null;
    // Mức khẩn theo số ngày lịch (giờ Việt Nam) còn lại, cùng ngưỡng với time-vn.mjs.
    const vnDay = ms => Math.floor((ms + 7 * HOUR) / DAY);
    function level(deadline, now) {
        if (deadline <= now) return 'x';
        const d = vnDay(deadline) - vnDay(now);
        return d < 3 ? 'c' : d < 7 ? 's' : d < 30 ? 'u' : 'o';
    }

    if (typeof module !== 'undefined') { module.exports = { parts, units, spoken, remaining, pick, level, LV }; return; }

    // ---- Phần chạy trong trình duyệt ----
    const cards = [...document.querySelectorAll('.pcard:not(.pc-empty)')].map(card => ({
        card, deadline: Date.parse(card.querySelector('.pc-due time').dateTime),
        slug: card.querySelector('[data-save]').dataset.save,
    }));
    if (!cards.length) return;
    const empty = document.querySelector('.pc-empty');
    const ticker = document.querySelector('.ticker');
    const soon = document.querySelector('.badge-list');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setLevel(card, lv) {
        if (card.dataset.level === lv) return;
        card.dataset.level = lv;
        const ub = card.querySelector('.ub');
        ub.className = 'ub u-' + lv;
        ub.querySelector('use').setAttribute('href', '#' + ICON[lv]);
        ub.querySelector('b').textContent = LV[lv];
    }
    const setText = (el, text) => { if (el.textContent !== text) el.textContent = text; };

    function tick() {
        const now = Date.now(), cur = pick(cards, now);
        cards.forEach(i => { i.card.hidden = i !== cur; });
        if (empty) empty.hidden = !!cur;
        if (cur) {
            const sec = remaining(cur.deadline, now), p = parts(sec);
            for (const k in p) setText(cur.card.querySelector(`[data-u="${k}"]`), pad(p[k]));
            setText(cur.card.querySelector('.pc-clock .vh'), `Còn ${spoken(sec)}`);
            setLevel(cur.card, level(cur.deadline, now));
        }
        if (ticker) {
            ticker.querySelectorAll('li').forEach(li => {
                const dl = Date.parse(li.querySelector('time').dateTime);
                li.hidden = dl <= now;
                if (dl > now) setText(li.querySelector('.tk-left'), `còn ${units(remaining(dl, now))[0]}`);
            });
            ticker.hidden = !ticker.querySelector('li:not([hidden])');
        }
        if (soon) {
            soon.querySelectorAll('.badge-card').forEach(c => {
                const dl = Date.parse(c.querySelector('time').dateTime);
                c.parentElement.hidden = dl <= now || (cur && c.querySelector('[data-save]').dataset.save === cur.slug);
                if (dl > now) { setLevel(c, level(dl, now)); setText(c.querySelector('.bc-cd'), units(remaining(dl, now))[0]); }
            });
            soon.hidden = !soon.querySelector(':scope > li:not([hidden])');
        }
    }
    tick();
    // Giảm chuyển động: số không nhảy mỗi giây (CSS ẩn cụm giây), cập nhật thưa hơn.
    setInterval(tick, reduce ? 15000 : 1000);

    const toggle = ticker && ticker.querySelector('.tk-toggle');
    if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
            const paused = ticker.classList.toggle('is-paused');
            toggle.textContent = paused ? 'Chạy' : 'Dừng';
            toggle.setAttribute('aria-label', paused ? 'Chạy lại dải hội nghị' : 'Dừng dải hội nghị');
        });
    }
})();
