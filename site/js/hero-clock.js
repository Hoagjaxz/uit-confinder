// Quả cầu đồng hồ ở hero trang chủ. tick() là hàm thuần, có test ở tools/hero-clock.test.mjs.
// Thời gian còn lại lấy từ data-d/h/m/s trong HTML (dữ liệu minh hoạ, khớp "Còn 2 ngày 04:12" ở các nơi khác), không lấy từ giờ máy.
(function () {
    function tick(remaining, elapsed) {
        const t = Math.max(0, remaining - Math.round(elapsed));
        return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
    }
    if (typeof module !== 'undefined') { module.exports = { tick }; return; }

    const orb = document.querySelector('[data-hero-clock]');
    // Giảm chuyển động: giữ giá trị tĩnh, CSS ẩn cụm giây và quả cầu đứng yên.
    if (!orb || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { d, h, m, s, total } = orb.dataset;
    const remaining = +d * 86400 + +h * 3600 + +m * 60 + +s;
    const cells = Object.fromEntries([...orb.querySelectorAll('[data-u]')].map(el => [el.dataset.u, el]));
    const t0 = performance.now(); // đo bằng performance.now() nên không trôi khi tab ẩn rồi quay lại
    const timer = setInterval(() => {
        const elapsed = (performance.now() - t0) / 1000;
        const t = tick(remaining, elapsed);
        for (const k in cells) cells[k].textContent = String(t[k]).padStart(2, '0');
        orb.style.setProperty('--p', Math.min(100, (1 - (remaining - Math.round(elapsed)) / +total) * 100).toFixed(3));
        if (t.d + t.h + t.m + t.s > 0) return;
        clearInterval(timer);
        orb.querySelector('.orb-lab').textContent = 'Đã hết hạn';
    }, 1000);
})();
