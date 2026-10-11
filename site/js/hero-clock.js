// Hero trang chủ: câu tiêu đề "Hạn gần nhất: X, còn [viên nang đồng hồ]", thanh mốc ngày và hàng tên hội nghị.
// Mọi thời gian tính từ hạn ISO có múi giờ (data-deadline) trừ đi giờ máy mỗi nhịp, nên tải lại trang hay mở tab lâu vẫn đúng.
// data-server-now (tuỳ chọn, ISO) bù lệch giờ máy. Phần hàm thuần có test ở tools/hero-clock.test.mjs;
// build-lists.mjs dùng lại chính các hàm này để HTML tĩnh khớp đúng thứ trình duyệt vẽ.
(function () {
    const DAY = 864e5, HOUR = 36e5, HOLD_MS = 4000, TICKS = 15;
    const pad = n => String(n).padStart(2, '0');
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const LV = { c: 'Gấp', s: 'Trong tuần', u: 'Trong tháng', o: 'Còn rộng', x: 'Đã hết hạn' };

    // 187929 -> "2 ngày 04:12:09"; còn dưới một ngày thì bỏ phần ngày.
    function format(sec) {
        const t = Math.max(0, Math.floor(sec)), d = Math.floor(t / 86400);
        const clock = `${pad(Math.floor((t % 86400) / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
        return d ? `${d} ngày ${clock}` : clock;
    }
    // Cách đọc cho trình đọc màn hình: chỉ đơn vị lớn nhất, đổi vài lần một ngày chứ không đổi mỗi giây.
    function spoken(sec) {
        const t = Math.max(0, Math.floor(sec));
        if (t >= 86400) return `${Math.floor(t / 86400)} ngày`;
        if (t >= 3600) return `${Math.floor(t / 3600)} giờ`;
        if (t >= 60) return `${Math.floor(t / 60)} phút`;
        return `${t} giây`;
    }
    // Giây còn lại, làm tròn lên: chỉ về 0 khi hạn thật sự đã qua.
    const remaining = (deadline, now) => Math.ceil((deadline - now) / 1000);
    // far: còn từ 1 ngày; soon: dưới 24 giờ; expired: bằng 0 hoặc đã qua.
    const phase = sec => (sec <= 0 ? 'expired' : sec < 86400 ? 'soon' : 'far');
    // Độ lệch giờ máy so với máy chủ; thiếu hoặc sai định dạng thì coi như 0.
    const clockOffset = (serverNowIso, deviceNow) => { const s = Date.parse(serverNowIso); return Number.isNaN(s) ? 0 : s - deviceNow; };
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
    // Danh sách hạn: còn mở xếp tăng dần theo hạn (hạn gần nhất đứng đầu), đã qua xếp mới nhất trước.
    function order(items, now) {
        const open = items.filter(i => i.deadline > now).sort((a, b) => a.deadline - b.deadline);
        const closed = items.filter(i => i.deadline <= now).sort((a, b) => b.deadline - a.deadline);
        return { open, closed };
    }
    // Ngày mở nộp bài không có trong dữ liệu thì coi như mở 30 ngày trước hạn.
    const defaultOpens = deadline => deadline - 30 * DAY;
    // 15 vạch chia đều khoảng từ lúc mở đến hạn: p = đã qua, t = đang ở đây, f = còn lại.
    function ticks(opens, deadline, now, n = TICKS) {
        const w = (deadline - opens) / n;
        return Array.from({ length: n }, (_, i) => (now >= opens + (i + 1) * w ? 'p' : now >= opens + i * w ? 't' : 'f'));
    }

    // Mặt số: mỗi chữ số một ô để cuộn riêng; chữ "ngày" nhỏ hơn.
    const faceHtml = sec => (format(sec).match(/\d|\D+/g) || []).map(p =>
        /\d/.test(p) ? `<span class="dg"><span>${p}</span></span>` : `<span class="sp${p.includes('ngày') ? ' u' : ''}">${p}</span>`).join('');
    // Độ rộng mặt số tính bằng "số ký tự mono", để CSS chọn cỡ chữ vừa khít chiều ngang.
    const faceWidth = sec => { const s = format(sec); return (s.match(/[\d:]/g) || []).length + (s.includes('ngày') ? 3 : 0); };

    // Nội dung ba vùng của hero cho một trạng thái. m: { phase, sec, name, href, label, iso, opensIso, deadline, opens, now, next }.
    function head(m) {
        const link = `<a href="${esc(m.href || '')}">${esc(m.name || '')}</a>`;
        if (m.phase === 'far' || m.phase === 'soon') {
            const due = vnParts(m.deadline);
            const cap = `<span class="cap${m.phase === 'soon' ? ' is-urgent' : ''}" data-deadline="${esc(m.iso)}" data-opens="${esc(m.opensIso)}" style="--n:${faceWidth(m.sec)}"><span class="vh">${spoken(m.sec)}</span><span class="cap-face mono" data-cd data-sig="${format(m.sec).replace(/\d/g, '#')}" aria-hidden="true">${faceHtml(m.sec)}</span></span>`;
            const lead = m.phase === 'soon' ? `Sắp hết hạn: ${link} chỉ&nbsp;còn` : `Hạn gần nhất: ${link},&nbsp;còn`;
            return {
                h1: `<span class="hl">${lead}</span> ${cap}`,
                ticks: ticks(m.opens, m.deadline, m.now).map(s => `<i${s === 'f' ? '' : ` class="${s}"`}></i>`).join(''),
                sub: `${esc(m.label)} trước ${due.time} ngày ${due.date} (giờ Việt Nam)`,
            };
        }
        if (m.phase === 'expired') {
            const next = m.next ? `Hạn&nbsp;kế&nbsp;tiếp là ${esc(m.next.name)},&nbsp;ngày&nbsp;${vnParts(m.next.deadline).dm}.` : 'Hiện chưa có hội nghị nào mở nhận&nbsp;bài.';
            return { h1: `<span class="hl">${link} đã hết hạn nộp&nbsp;bài. ${next}</span>`, ticks: '', sub: '' };
        }
        return { h1: '<span class="hl">Hiện chưa có hội nghị nào mở nhận&nbsp;bài. Xem lịch để biết đợt tiếp&nbsp;theo.</span>', ticks: '', sub: '' };
    }
    // Khối HTML tĩnh (build-lists.mjs); trình duyệt dựng lại đúng ba vùng này khi đổi trạng thái.
    function block(m) {
        const v = head(m);
        return `<p class="hero-line" data-hero-clock data-state="${m.phase}">${v.h1}</p>\n<div class="ticks"${v.ticks ? '' : ' hidden'} aria-hidden="true">${v.ticks}</div>\n<p class="hero-sub"${v.sub ? '' : ' hidden'}>${v.sub}</p>`;
    }
    // Câu thông báo cho vùng aria-live khi trạng thái đổi.
    function announce(m) {
        if (m.phase === 'soon') return `Sắp hết hạn: ${m.name} còn dưới 24 giờ.`;
        if (m.phase === 'expired') return `${m.name} đã hết hạn nộp bài. ${m.next ? `Hạn kế tiếp là ${m.next.name}, ngày ${vnParts(m.next.deadline).dm}.` : 'Hiện chưa có hội nghị nào mở nhận bài.'}`;
        return '';
    }

    if (typeof module !== 'undefined') {
        module.exports = { format, spoken, remaining, phase, clockOffset, level, vnParts, order, defaultOpens, ticks, head, block, announce, LV, HOLD_MS };
        return;
    }

    // ---- Phần chạy trong trình duyệt ----
    const h1 = document.querySelector('[data-hero-clock]'), list = document.querySelector('[data-hero-list]');
    const live = document.querySelector('[data-hero-live]');
    if (!h1 || !list || !live) return;
    const box = h1.parentElement, ticksEl = box.querySelector('.ticks'), subEl = box.querySelector('.hero-sub');
    const heading = document.getElementById('names-h');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const offset = clockOffset(h1.dataset.serverNow, Date.now());
    const clock = () => Date.now() + offset;

    const items = [...list.children].map((li, n) => {
        const deadline = Date.parse(li.dataset.deadline);
        if (Number.isNaN(deadline)) { li.hidden = true; return null; }
        const opens = Date.parse(li.dataset.opens), a = li.querySelector('a');
        return {
            n, li, deadline, iso: li.dataset.deadline, label: li.dataset.label || 'Nộp bài',
            opens: Number.isNaN(opens) ? defaultOpens(deadline) : opens, opensIso: li.dataset.opens || new Date(defaultOpens(deadline)).toISOString(),
            name: li.querySelector('.nm-nm').textContent, href: a.getAttribute('href'),
        };
    }).filter(Boolean);

    let cur = null, hold = false, shownKey = '', namesSig = '', timer = 0;
    const model = (it, t, ph, next) => ({ ...(it || {}), phase: ph, sec: it ? remaining(it.deadline, t) : 0, now: t, next });

    function setDigit(dg, ch, animate) {
        const kids = [...dg.children], old = kids.pop();
        kids.forEach(k => k.remove());
        if (old.textContent === ch) return;
        const nu = document.createElement('span');
        nu.textContent = ch;
        dg.append(nu);
        if (!animate) { old.remove(); return; }
        const opt = { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' };
        old.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], opt).finished.then(() => old.remove(), () => old.remove());
        nu.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], opt);
    }
    function setFace(sec) {
        const face = h1.querySelector('[data-cd]'), cap = face.parentElement, text = format(sec), sig = text.replace(/\d/g, '#');
        if (face.dataset.sig !== sig) { face.innerHTML = faceHtml(sec); face.dataset.sig = sig; cap.style.setProperty('--n', faceWidth(sec)); }
        else {
            const digits = text.match(/\d/g), animate = !reduce.matches && !document.hidden;
            face.querySelectorAll('.dg').forEach((dg, i) => setDigit(dg, digits[i], animate));
        }
        const say = spoken(sec), vh = cap.querySelector('.vh');
        if (vh.textContent !== say) vh.textContent = say;
    }
    function setTicks(it, t) {
        const states = ticks(it.opens, it.deadline, t);
        [...ticksEl.children].forEach((el, i) => { const c = states[i] === 'f' ? '' : states[i]; if (el.className !== c) el.className = c; });
    }
    function paint(it, t, ph, next) {
        const key = ph + (it ? it.iso : '');
        if (key !== shownKey) {
            const m = model(it, t, ph, next), v = head(m), was = shownKey;
            h1.innerHTML = v.h1; ticksEl.innerHTML = v.ticks; ticksEl.hidden = !v.ticks; subEl.innerHTML = v.sub; subEl.hidden = !v.sub;
            h1.dataset.state = ph;
            shownKey = key;
            if (ph === 'soon' && was === 'far' + it.iso) live.textContent = announce(m); // chỉ khi đổi trạng thái, không phải mỗi giây
        } else if (ph === 'far' || ph === 'soon') { setFace(remaining(it.deadline, t)); setTicks(it, t); }
    }
    function syncNames(t) {
        const { open, closed } = order(items, t), none = !open.length, shown = none ? closed : open;
        const sig = (none ? 'x' : 'o') + shown.map(i => i.n).join();
        if (sig !== namesSig) {
            namesSig = sig;
            if (heading) heading.textContent = none ? 'Đã đóng nhận bài' : 'Đang mở nhận bài';
            items.forEach(i => { i.li.hidden = !shown.includes(i); });
            shown.forEach((i, k) => { list.append(i.li); i.li.style.setProperty('--r', none ? 3 : k); i.li.classList.toggle('is-closed', none); });
        }
        shown.forEach(i => {
            const lv = level(i.deadline, t);
            if (i.li.dataset.level !== lv) { i.li.dataset.level = lv; i.li.querySelector('.nm-lv').textContent = LV[lv]; }
        });
    }
    function tick() {
        const t = clock();
        syncNames(t);
        if (hold) return;
        const first = order(items, t).open[0] || null;
        if (cur && cur !== first) { // hạn đang hiển thị vừa qua: báo hết hạn một lúc rồi chuyển sang hội nghị kế tiếp
            hold = true;
            paint(cur, t, 'expired', first);
            live.textContent = announce(model(cur, t, 'expired', first));
            setTimeout(() => { hold = false; cur = null; shownKey = ''; tick(); }, HOLD_MS);
            return;
        }
        cur = first;
        paint(cur, t, cur ? phase(remaining(cur.deadline, t)) : 'none', null);
    }
    function start() { if (!timer) { tick(); timer = setInterval(tick, 250); } }
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInterval(timer); timer = 0; } else start(); });
    start();
})();
