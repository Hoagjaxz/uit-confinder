// Viên nang đếm ngược trong tiêu đề hero. Thời gian còn lại lấy từ data-sec trong HTML (dữ liệu minh hoạ, khớp các thẻ khác), không lấy từ giờ máy.
// Hàm thuần có test ở tools/hero-clock.test.mjs; build-lists.mjs dùng lại chúng để HTML tĩnh khớp đúng với những gì trình duyệt vẽ.
(function () {
    const pad = n => String(n).padStart(2, '0');
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
    if (typeof module !== 'undefined') { module.exports = { format, spoken }; return; }

    const root = document.querySelector('[data-hero-clock]');
    if (!root) return;
    // Giảm chuyển động hoặc không có JS: giữ nguyên số trong HTML, giây đứng yên.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const face = root.querySelector('[data-cd]'), say = root.querySelector('.vh');
    const start = +root.dataset.sec, t0 = performance.now(); // performance.now() không trôi khi tab ẩn rồi quay lại
    let timer = 0, last = -1;
    function tick() {
        const t = Math.max(0, start - Math.round((performance.now() - t0) / 1000));
        if (t === last) return;
        last = t;
        face.textContent = format(t);
        const s = spoken(t);
        if (say.textContent !== s) say.textContent = s;
        if (!t) stop();
    }
    function stop() { clearInterval(timer); timer = 0; }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (!timer) { tick(); timer = setInterval(tick, 250); } });
    timer = setInterval(tick, 250);
})();
