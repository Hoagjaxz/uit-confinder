// Dải "Hạn từ … đến …" ở đầu danh sách: tính lại theo các thẻ đang nhìn thấy. Không có JS thì giữ chữ tĩnh trong HTML.
(() => {
    const out = document.querySelector('[data-range-text]');
    const cards = [...document.querySelectorAll('.badge-card:not(.sk)')];
    if (!out || !cards.length || !('IntersectionObserver' in window)) return;

    const VN = 7 * 3600e3; // mọi mốc hiển thị theo giờ Việt Nam
    const parts = ms => { const d = new Date(ms + VN); return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()]; };
    const fmt = (ms, year) => { const [d, m, y] = parts(ms); return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}${year ? '/' + y : ''}`; };
    const at = card => Date.parse(card.querySelector('time[datetime]').dateTime);

    const seen = new Set();
    const render = () => {
        const live = [...seen].filter(c => c.dataset.level !== 'x');
        const list = live.length ? live : [...seen];
        if (!list.length) return;
        const t = list.map(at);
        const lo = Math.min(...t), hi = Math.max(...t);
        const year = parts(lo)[2] !== parts(hi)[2];
        out.textContent = fmt(lo, year) === fmt(hi, year) ? `Hạn ngày ${fmt(lo, year)}` : `Hạn từ ${fmt(lo, year)} đến ${fmt(hi, year)}`;
    };

    // Bỏ phần thẻ nằm dưới header dính và dải này (≈ 110px) khỏi vùng nhìn thấy.
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        render();
    }, { rootMargin: '-110px 0px 0px 0px' });
    cards.forEach(c => io.observe(c));
})();
