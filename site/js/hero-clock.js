// Mặt trời hạn chót ở hero trang chủ: ánh sáng trôi sau 15 tấm kính đứng yên, mỗi tấm là một ngày từ mốc đầu đến hạn.
// Các hàm thuần (đọc số thành chữ, trạng thái tấm kính, độ nóng) có test ở tools/hero-clock.test.mjs; phần cập nhật mỗi giây ở dưới.
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
    const paneStates = (n, elapsedDays) => Array.from({ length: n }, (_, i) => dayState(i, elapsedDays));
    // Độ nóng 0..1 theo tỉ lệ thời gian đã trôi: lạnh đến 25%, nóng dần (smoothstep) và đạt tối đa ở 95%.
    function heat(ratio) {
        const x = Math.min(1, Math.max(0, (ratio - 0.25) / 0.7));
        return x * x * (3 - 2 * x);
    }
    if (typeof module !== 'undefined') { module.exports = { viet, spoken, phrase, remainingAt, dayState, paneStates, heat }; return; }

    const root = document.querySelector('[data-hero-clock]');
    if (!root) return;
    const { d, h, m, s, total } = root.dataset;
    const remaining = +d * 86400 + +h * 3600 + +m * 60 + +s;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; // giảm chuyển động: không chạy giây, ánh sáng đứng yên (CSS)
    const say = root.querySelector('.orb-say'), sec = root.querySelector('.orb-sec'), orb = root.querySelector('.orb');
    const panes = [...root.querySelectorAll('.pane')];
    const name = root.querySelector('.orb-name').textContent;
    let lastT = -1, lastText = '';

    function sync(t, el) {
        lastT = t;
        const ratio = Math.min(1, 1 - t / +total);
        root.style.setProperty('--p', (ratio * 100).toFixed(3));
        root.style.setProperty('--heat', heat(ratio).toFixed(3));
        const text = phrase(t);
        if (text !== lastText) {
            lastText = text;
            say.textContent = text;
            orb.setAttribute('aria-label', `Mặt trời đếm ngược: ${name} ${text}`);
        }
        paneStates(panes.length, (+total - t) / 86400).forEach((st, i) => { if (panes[i].dataset.s !== st) panes[i].dataset.s = st; });
        if (!still) sec.style.transform = `rotate(${Math.floor(el) * 6}deg)`;
    }

    const t0 = performance.now(); // đo bằng performance.now() nên không trôi khi tab ẩn rồi quay lại
    let timer = 0;
    function tick() {
        const el = (performance.now() - t0) / 1000, t = remainingAt(remaining, el);
        if (t !== lastT) sync(t, el);
    }
    sync(remaining, 0);
    if (still) return;
    const run = () => {
        if (document.hidden) { clearInterval(timer); timer = 0; } else if (!timer) { tick(); timer = setInterval(tick, 250); }
    };
    document.addEventListener('visibilitychange', run);
    run();
})();
