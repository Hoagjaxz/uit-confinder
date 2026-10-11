// Mặt trời hạn chót ở hero trang chủ: quả cầu tự quay, mỗi dải kinh tuyến là một ngày từ mốc đầu đến hạn.
// Các hàm thuần (đọc số thành chữ, hình học dải, trạng thái ngày) có test ở tools/hero-clock.test.mjs; phần vẽ canvas ở dưới.
// Thời gian còn lại lấy từ data-d/h/m/s trong HTML (dữ liệu minh hoạ, khớp các nơi khác), không lấy từ giờ máy.
(function () {
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
    // Giây còn lại -> "hai ngày, bốn giờ". Phút chỉ hiện khi còn đúng một ngày trở xuống.
    function spoken(sec) {
        const t = Math.max(0, Math.floor(sec));
        if (!t) return 'hết hạn';
        const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60);
        const parts = d ? [[d, 'ngày'], [h, 'giờ'], [d === 1 ? m : 0, 'phút']] : h ? [[h, 'giờ'], [m, 'phút']] : m ? [[m, 'phút']] : [[t, 'giây']];
        return parts.filter(p => p[0]).map(p => viet(p[0]) + ' ' + p[1]).join(', ');
    }
    const phrase = sec => (sec > 0 ? 'còn ' + spoken(sec) : 'đã hết hạn');
    const remainingAt = (remaining, elapsed) => Math.max(0, remaining - Math.round(elapsed));

    // Ngày i (0 là ngày đầu) so với số ngày đã trôi (có phần lẻ).
    const dayState = (i, elapsedDays) => (i + 1 <= elapsedDays ? 'past' : i <= elapsedDays ? 'today' : 'future');
    // Dải kinh tuyến thứ i trong n dải khi cầu quay rot độ. Kinh độ 0 là chính giữa mặt cầu, ±90 là mép.
    // width = bề rộng chiếu ở xích đạo (đơn vị bán kính), tỉ lệ cos của kinh độ nên dải sát mép hẹp lại; quá mép thì khuất.
    function ribbon(i, n, rot, gap = 0.16) {
        const step = 360 / n, hw = (step * (1 - gap)) / 2;
        const mid = ((((i * step + rot + 180) % 360) + 360) % 360) - 180;
        const lo = Math.max(mid - hw, -90), hi = Math.min(mid + hw, 90);
        if (hi <= lo) return { visible: false };
        const rad = Math.PI / 180;
        return { visible: true, lo, hi, mid, width: Math.sin(hi * rad) - Math.sin(lo * rad), light: Math.cos(mid * rad) };
    }
    if (typeof module !== 'undefined') { module.exports = { viet, spoken, phrase, remainingAt, dayState, ribbon }; return; }

    const orb = document.querySelector('[data-hero-clock]');
    const cv = orb && orb.querySelector('canvas');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; // giảm chuyển động: vẽ một khung, không quay, không chạy giây
    const { d, h, m, s, total } = orb.dataset;
    const remaining = +d * 86400 + +h * 3600 + +m * 60 + +s;
    const n = Math.max(1, Math.round(+total / 86400));
    const say = orb.querySelector('.orb-say'), sec = orb.querySelector('.orb-sec');
    const name = orb.querySelector('.orb-name').textContent;
    const ROT0 = 28; // góc đứng yên: ngày hôm nay và các ngày còn lại nằm gần chính giữa mặt cầu
    const DEG_PER_S = 6; // một vòng / 60 giây
    const R_FRAC = 0.35; // bán kính cầu / cạnh .orb
    const cs = getComputedStyle(orb), v = k => cs.getPropertyValue(k).trim();
    const rgba = (hex, a) => `rgb(${parseInt(hex.slice(1, 3), 16)} ${parseInt(hex.slice(3, 5), 16)} ${parseInt(hex.slice(5, 7), 16)} / ${a})`;
    let S = 0, lastT = -1, elapsedDays = 0, raf = 0, inView = true;

    function resize() {
        S = orb.clientWidth;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = cv.height = Math.round(S * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function path(r, lo, hi) {
        const c = S / 2, rad = Math.PI / 180, L = Math.sin(lo * rad), H = Math.sin(hi * rad), N = 22;
        ctx.beginPath();
        for (let j = 0; j <= N; j++) { const f = (j / N - 0.5) * Math.PI; ctx.lineTo(c + r * Math.cos(f) * L, c - r * Math.sin(f)); }
        for (let j = N; j >= 0; j--) { const f = (j / N - 0.5) * Math.PI; ctx.lineTo(c + r * Math.cos(f) * H, c - r * Math.sin(f)); }
        ctx.closePath();
    }
    function draw(rot, time) {
        const c = S / 2, r = S * R_FRAC, [a, b, cc, dd, hot, now] = ['--orb-a', '--orb-b', '--orb-c', '--orb-d', '--orb-hot', '--orb-now'].map(v);
        ctx.clearRect(0, 0, S, S);
        // quầng sáng (corona) dập dờn: hai lớp lệch pha
        for (const [grow, ph, alpha] of [[1.5, 0, 0.5], [1.26, 1.9, 0.7]]) {
            const rr = r * (grow + 0.035 * Math.sin(time * 1.6 + ph)), g = ctx.createRadialGradient(c, c, r * 0.94, c, c, rr);
            g.addColorStop(0, rgba(a, alpha)); g.addColorStop(0.4, rgba(b, alpha * 0.4)); g.addColorStop(1, rgba(b, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, rr, 0, 7); ctx.fill();
        }
        ctx.save();
        ctx.beginPath(); ctx.arc(c, c, r, 0, 7); ctx.clip();
        const base = ctx.createRadialGradient(c - r * 0.32, c - r * 0.38, r * 0.04, c - r * 0.1, c - r * 0.1, r * 1.2);
        base.addColorStop(0, a); base.addColorStop(0.3, b); base.addColorStop(0.72, cc); base.addColorStop(1, dd);
        ctx.fillStyle = base; ctx.fillRect(0, 0, S, S);
        for (let i = 0; i < n; i++) {
            const g = ribbon(i, n, rot);
            if (!g.visible) continue;
            const st = dayState(i, elapsedDays), face = 0.5 + 0.5 * g.light;
            path(r, g.lo, g.hi);
            if (st === 'past') { ctx.globalAlpha = 0.5 * (0.6 + 0.4 * face); ctx.fillStyle = dd; ctx.fill(); }
            else {
                ctx.shadowColor = st === 'today' ? now : a; ctx.shadowBlur = S * (st === 'today' ? 0.07 : 0.03);
                ctx.globalAlpha = (st === 'today' ? 0.92 + 0.08 * Math.sin(time * 3) : 0.86) * (0.55 + 0.45 * face);
                ctx.fillStyle = st === 'today' ? now : hot; ctx.fill(); ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        }
        // bóng cầu: tối dần về rìa, điểm sáng trên-trái
        const limb = ctx.createRadialGradient(c - r * 0.2, c - r * 0.25, r * 0.25, c, c, r);
        limb.addColorStop(0, rgba(dd, 0)); limb.addColorStop(0.55, rgba(dd, 0.05)); limb.addColorStop(1, rgba(dd, 0.78));
        ctx.fillStyle = limb; ctx.fillRect(0, 0, S, S);
        const spec = ctx.createRadialGradient(c - r * 0.38, c - r * 0.42, 0, c - r * 0.38, c - r * 0.42, r * 0.45);
        spec.addColorStop(0, 'rgb(255 255 255 / .3)'); spec.addColorStop(1, 'rgb(255 255 255 / 0)');
        ctx.fillStyle = spec; ctx.fillRect(0, 0, S, S);
        ctx.restore();
    }
    function sync(t, el) {
        lastT = t;
        elapsedDays = (+total - t) / 86400;
        const text = phrase(t);
        if (say.textContent !== text) say.textContent = text;
        cv.setAttribute('aria-label', `Mặt trời đếm ngược: ${name} ${text}`);
        orb.style.setProperty('--p', Math.min(100, (1 - t / +total) * 100).toFixed(3));
        if (!still) sec.style.transform = `rotate(${Math.floor(el) * DEG_PER_S}deg)`;
    }

    const t0 = performance.now(); // đo bằng performance.now() nên không trôi khi tab ẩn rồi quay lại
    function frame(now) {
        const el = (now - t0) / 1000, t = remainingAt(remaining, el);
        if (t !== lastT) sync(t, el);
        draw(ROT0 + el * DEG_PER_S, el);
        raf = requestAnimationFrame(frame);
    }
    const run = () => {
        const want = inView && !document.hidden;
        if (want && !raf) raf = requestAnimationFrame(frame);
        else if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
    };

    orb.classList.add('has-cv');
    resize();
    sync(remaining, 0);
    if (still) {
        draw(ROT0, 0);
        new ResizeObserver(() => { resize(); draw(ROT0, 0); }).observe(orb);
        return;
    }
    new ResizeObserver(resize).observe(orb);
    new IntersectionObserver(es => { inView = es[0].isIntersecting; run(); }).observe(orb);
    document.addEventListener('visibilitychange', run);
    run();
})();
