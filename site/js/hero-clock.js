// Mặt trời hạn chót ở hero trang chủ: quả cầu là hạn gần nhất còn mở, hai hành tinh là hai hạn kế tiếp.
// Mọi thời gian tính từ hạn ISO (data-deadline trên danh sách "Đang mở nhận bài") trừ giờ máy, nên tải lại trang hay mở tab lâu vẫn đúng;
// hạn nào qua thì quả cầu và hành tinh tự dịch sang hội nghị kế. Hàm thuần có test ở tools/hero-clock.test.mjs;
// build-lists.mjs dùng lại orbHtml để HTML tĩnh khớp đúng thứ trình duyệt vẽ.
(function () {
    const DAY = 864e5, HOUR = 36e5, HERO_N = 3;
    const pad = n => String(n).padStart(2, '0');
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const LV = { c: 'Gấp', s: 'Trong tuần', u: 'Trong tháng', o: 'Còn rộng', x: 'Đã hết hạn' };
    const NONE = 'Hiện chưa có hội nghị nào mở nhận bài. Xem lịch để biết đợt tiếp theo.';

    const ONES = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    // 1..99 bằng chữ; từ 100 trở lên giữ chữ số (ngày còn lại hiếm khi dài vậy).
    function viet(n) {
        if (n >= 100) return String(n);
        if (n < 10) return ONES[n];
        const u = n % 10, t = (n - u) / 10;
        const head = t === 1 ? 'mười' : ONES[t] + ' mươi';
        if (!u) return head;
        return head + ' ' + (u === 5 ? 'lăm' : u === 1 && t > 1 ? 'mốt' : ONES[u]);
    }
    // Giây còn lại -> "hai ngày, bốn giờ" (num = viet) hoặc "2 ngày, 4 giờ" (num = String). Phút chỉ hiện khi còn đúng một ngày trở xuống.
    function spoken(sec, num = viet) {
        const t = Math.max(0, Math.floor(sec));
        if (!t) return 'hết hạn';
        const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60);
        const parts = d ? [[d, 'ngày'], [h, 'giờ'], [d === 1 ? m : 0, 'phút']] : h ? [[h, 'giờ'], [m, 'phút']] : m ? [[m, 'phút']] : [[t, 'giây']];
        return parts.filter(p => p[0]).map(p => num(p[0]) + ' ' + p[1]).join(', ');
    }
    // Giây còn lại -> ngày, giờ, phút, giây cho đồng hồ số trong quả cầu.
    const clockParts = t => { t = Math.max(0, Math.floor(t)); return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }; };
    const phrase = sec => (sec > 0 ? 'còn ' + spoken(sec) : 'đã hết hạn');
    // Giây còn lại, làm tròn lên: chỉ về 0 khi hạn thật sự đã qua.
    const remaining = (deadline, now) => Math.max(0, Math.ceil((deadline - now) / 1000));

    // Mức khẩn theo số ngày lịch (giờ Việt Nam) còn lại, cùng ngưỡng với time-vn.mjs.
    const vnDay = ms => Math.floor((ms + 7 * HOUR) / DAY);
    function level(deadline, now) {
        if (deadline <= now) return 'x';
        const d = vnDay(deadline) - vnDay(now);
        return d < 3 ? 'c' : d < 7 ? 's' : d < 30 ? 'u' : 'o';
    }
    function vnParts(ms) {
        const d = new Date(ms + 7 * HOUR);
        const dm = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
        return { time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`, dm, date: `${dm}/${d.getUTCFullYear()}` };
    }
    // Các hạn còn mở, gần nhất đứng đầu.
    const openItems = (items, now) => items.filter(i => i.deadline > now).sort((a, b) => a.deadline - b.deadline);

    // Ngày i (0 là ngày đầu) so với số ngày đã trôi (có phần lẻ).
    const dayState = (i, elapsedDays) => (i + 1 <= elapsedDays ? 'past' : i <= elapsedDays ? 'today' : 'future');
    const paneStates = (n, elapsedDays) => Array.from({ length: n }, (_, i) => dayState(i, elapsedDays));
    // Độ nóng 0..1 theo tỉ lệ thời gian đã trôi: lạnh đến 25%, nóng dần (smoothstep) và đạt tối đa ở 95%.
    function heat(ratio) {
        const x = Math.min(1, Math.max(0, (ratio - 0.25) / 0.7));
        return x * x * (3 - 2 * x);
    }
    // Quỹ đạo hành tinh theo số ngày còn lại (nội suy tuyến tính, % cạnh khung): ngày gần quay trong, nhanh; ngày xa quay ngoài, chậm.
    // Góc xuất phát rải đều quanh tâm nên hai hành tinh không bao giờ khởi đầu chồng nhau.
    const ORBIT = { r0: 41, r1: 46, t0: 90, t1: 140, a0: 40 };
    function planetOrbit(days, maxDays, i, n) {
        const u = maxDays > 0 ? Math.min(1, Math.max(0, days / maxDays)) : 1;
        return { r: ORBIT.r0 + (ORBIT.r1 - ORBIT.r0) * u, T: ORBIT.t0 + (ORBIT.t1 - ORBIT.t0) * u, a0: (ORBIT.a0 + (360 * i) / n) % 360 };
    }

    // Chữ cho hành tinh: nhãn đọc màn hình (số bằng chữ) và dòng hiện khi trỏ vào (số bằng chữ số), cùng một cách viết với quả cầu.
    const satAria = (c, now) => `${c.name}, hạn nộp bài ngày ${vnParts(c.deadline).dm}, ${LV[level(c.deadline, now)]}, ${phrase(remaining(c.deadline, now))}, mở trang hội nghị`;
    const satRead = (c, now) => `${c.name} · hạn ${vnParts(c.deadline).dm} · ${LV[level(c.deadline, now)]} · còn ${spoken(remaining(c.deadline, now), String)}`;
    function satHtml(c, i, n, maxDays, now) {
        const dm = vnParts(c.deadline).dm, lv = level(c.deadline, now);
        const { r, T, a0 } = planetOrbit((c.deadline - now) / DAY, maxDays, i, n);
        return `<div class="ptk ptk-${i + 1}" data-level="${lv}" style="--r:${r.toFixed(2)};--a0:${a0}deg;--T:${Math.round(T)}s">
                <a class="pl" href="${esc(c.href)}" aria-label="${esc(satAria(c, now))}"><i class="pl-dot"></i><span class="pl-lab"><b>${esc(c.short)} ${dm}</b><span>${LV[lv]}</span></span></a>
            </div>
            <p class="pl-rd rd-${i + 1}" aria-hidden="true">${esc(satRead(c, now))}</p>`;
    }

    // items: các hạn còn mở, gần nhất trước (tối đa HERO_N). Rỗng thì ra câu "chưa có hội nghị nào mở".
    // Mỗi item: { name, short, href, label, deadline, opens } (thời điểm tính bằng ms).
    function orbHtml(items, now) {
        if (!items.length) return `<p class="orb-none">${NONE}</p>`;
        const [c, ...sats] = items.slice(0, HERO_N);
        const sec = remaining(c.deadline, now), total = Math.max(1, (c.deadline - c.opens) / 1000);
        const ratio = Math.min(1, Math.max(0, 1 - sec / total)), due = vnParts(c.deadline), parts = clockParts(sec);
        const maxDays = sats.length ? (sats.at(-1).deadline - now) / DAY : 0;
        const panes = paneStates(Math.max(1, Math.round(total / 86400)), (total - sec) / 86400)
            .map((st, i) => `<span class="pane" data-s="${st}" style="--i:${i}"></span>`).join('');
        const clock = [['d', 'ngày'], ['h', 'giờ'], ['m', 'phút'], ['s', 'giây']]
            .map(([k, u]) => `<span class="ck ck-${k}"><b data-u="${k}">${pad(parts[k])}</b><i>${u}</i></span>`).join('<span class="sp"></span>');
        return `<div class="orb-main" style="--p:${(ratio * 100).toFixed(1)};--heat:${heat(ratio).toFixed(3)}" data-sec="${sec}">
    <div class="orb-fig">
        <div class="orb" role="img" aria-label="Hạn gần nhất ${phrase(sec)}">
            <span class="orb-sec"></span>
            <svg class="orb-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg>
            <span class="orb-sun"></span>
            <span class="orb-ball"><i class="lt lt-1"></i><i class="lt lt-2"></i><i class="lt lt-3"></i><span class="orb-panes">${panes}</span></span>
        </div>
        <div class="orb-info">
            <a class="orb-name" href="${esc(c.href)}">${esc(c.name)}</a>
            <p class="orb-clock" aria-hidden="true">${clock}</p>
            <p class="orb-lab">${esc(c.label)} trước ${due.time} ngày ${due.date} (giờ Việt Nam)</p>
        </div>
        <div class="orb-sats">
            ${sats.map((s, i) => satHtml(s, i, sats.length, maxDays, now)).join('\n            ')}
        </div>
    </div>
    <button type="button" class="orb-pause" hidden>Dừng chuyển động</button>
</div>`;
    }
    // Câu thông báo cho vùng aria-live khi quả cầu chuyển hội nghị.
    const announce = (gone, next) => `${gone.name} đã hết hạn nộp bài. ${next ? `Hạn kế tiếp là ${next.name}, ngày ${vnParts(next.deadline).dm}.` : NONE}`;

    if (typeof module !== 'undefined') {
        module.exports = { viet, spoken, phrase, remaining, level, vnParts, openItems, dayState, paneStates, heat, planetOrbit, clockParts, orbHtml, announce, LV, HERO_N };
        return;
    }

    // ---- Phần chạy trong trình duyệt ----
    const root = document.querySelector('[data-hero-orb]'), live = document.querySelector('[data-hero-live]'), nav = document.querySelector('[data-hero-list]');
    if (!root || !live || !nav) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; // giảm chuyển động: không có kim giây quay, quỹ đạo đứng yên (CSS); số vẫn chạy
    const rest = document.getElementById('soon-h')?.closest('section');
    const restLis = new Map([...(rest?.querySelectorAll('li[data-deadline]') || [])].map(li => [li.querySelector('.bc-name a').getAttribute('href'), li]));
    const items = [...nav.children].map(li => {
        const deadline = Date.parse(li.dataset.deadline), a = li.querySelector('a');
        if (Number.isNaN(deadline)) { li.hidden = true; return null; }
        const opens = Date.parse(li.dataset.opens);
        return { li, deadline, opens: Number.isNaN(opens) ? deadline - 30 * DAY : opens, href: a.getAttribute('href'), short: a.querySelector('b').textContent, name: `${a.querySelector('b').textContent} ${li.dataset.year}`, label: li.dataset.label };
    }).filter(Boolean);

    let shownKey = null, shown = [], paused = false, view = {};
    const t0 = performance.now();
    function bind() {
        const el = root.querySelector('.orb-main');
        view = !el ? {} : {
            el, orb: root.querySelector('.orb'), sec: root.querySelector('.orb-sec'),
            cells: Object.fromEntries([...root.querySelectorAll('[data-u]')].map(e => [e.dataset.u, e])),
            panes: [...root.querySelectorAll('.pane')], pls: [...root.querySelectorAll('.pl')], rds: [...root.querySelectorAll('.pl-rd')],
            labs: [...root.querySelectorAll('.pl-lab')], dots: [...root.querySelectorAll('.pl-dot')], btn: root.querySelector('.orb-pause'),
        };
        if (view.btn && !still) { view.btn.hidden = false; setPaused(paused); }
    }
    function setPaused(p) {
        paused = p;
        view.el.toggleAttribute('data-paused', p);
        view.btn.textContent = p ? 'Chạy lại chuyển động' : 'Dừng chuyển động';
    }
    root.addEventListener('click', e => { if (e.target.closest('.orb-pause')) setPaused(!paused); });

    function sync(t) {
        const c = shown[0], sec = remaining(c.deadline, t), total = (c.deadline - c.opens) / 1000, ratio = Math.min(1, Math.max(0, 1 - sec / total));
        view.el.style.setProperty('--p', (ratio * 100).toFixed(3));
        view.el.style.setProperty('--heat', heat(ratio).toFixed(3));
        const parts = clockParts(sec);
        for (const k in view.cells) { const v = pad(parts[k]); if (view.cells[k].textContent !== v) view.cells[k].textContent = v; }
        const aria = `Hạn gần nhất ${phrase(sec)}`;
        if (view.orb.getAttribute('aria-label') !== aria) view.orb.setAttribute('aria-label', aria);
        paneStates(view.panes.length, (total - sec) / 86400).forEach((st, i) => { if (view.panes[i].dataset.s !== st) view.panes[i].dataset.s = st; });
        shown.slice(1).forEach((s, i) => {
            const a = satAria(s, t), r = satRead(s, t), lv = level(s.deadline, t);
            if (view.pls[i].getAttribute('aria-label') !== a) view.pls[i].setAttribute('aria-label', a);
            if (view.rds[i].textContent !== r) view.rds[i].textContent = r;
            const ptk = view.pls[i].parentElement;
            if (ptk.dataset.level !== lv) { ptk.dataset.level = lv; view.labs[i].lastElementChild.textContent = LV[lv]; }
        });
        if (!still) view.sec.style.transform = `rotate(${Math.floor((performance.now() - t0) / 1000) * 6}deg)`;
    }

    // Hai hành tinh gần nhau thì tạm ẩn nhãn vướng (CSS .hide-1, .hide-2) để nhãn không chồng lên nhau hay lên chấm kia.
    const near = (a, b) => a.left < b.right + 4 && b.left < a.right + 4 && a.top < b.bottom + 4 && b.top < a.bottom + 4;
    function clash() {
        if (!view.labs || view.labs.length < 2) return;
        const [l1, l2] = view.labs.map(e => e.getBoundingClientRect()), [d1, d2] = view.dots.map(e => e.getBoundingClientRect());
        root.classList.toggle('hide-1', near(l1, d2));
        root.classList.toggle('hide-2', near(l1, l2) || near(l2, d1));
    }

    function tick() {
        const t = Date.now(), open = openItems(items, t), top = open.slice(0, HERO_N), key = top.map(i => i.href).join();
        items.forEach(i => { i.li.hidden = i.deadline <= t; });
        nav.parentElement.hidden = !open.length;
        restLis.forEach((li, href) => { li.hidden = !open.slice(HERO_N).some(i => i.href === href); });
        if (rest) rest.hidden = ![...restLis.values()].some(li => !li.hidden);
        if (key !== shownKey) {
            if (shownKey !== null && shown[0] && shown[0] !== top[0]) live.textContent = announce(shown[0], top[0]);
            shownKey = key; shown = top;
            root.innerHTML = orbHtml(top, t);
            bind();
        }
        if (view.el) { sync(t); clash(); }
    }
    let timer = 0;
    function run() {
        if (document.hidden) { clearInterval(timer); timer = 0; } else if (!timer) { tick(); timer = setInterval(tick, 250); }
    }
    document.addEventListener('visibilitychange', run);
    run();
})();
