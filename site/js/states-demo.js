// Xem thử 4 trạng thái danh sách bằng ?state=ready|loading|error|empty (không có JS thì luôn hiện "ready"). Thanh xem thử ẩn mặc định.
(() => {
    const STATES = ['ready', 'loading', 'error', 'empty'];
    const q = new URLSearchParams(location.search).get('state');
    const cur = STATES.includes(q) ? q : 'ready';
    if (q !== null) document.body.classList.remove('demo-off'); // thanh xem thử chỉ hiện khi có ?state=
    document.querySelectorAll('[data-state]').forEach(el => { el.hidden = el.dataset.state !== cur; });
    document.querySelectorAll('.demo-bar a').forEach(a => {
        a.setAttribute('aria-current', String(new URL(a.href).searchParams.get('state') === cur));
    });
})();

// Mô phỏng: bảng lọc bên trái là markup tĩnh, nên đồng bộ với chip của từng trạng thái xem thử.
(() => {
    const cur = document.querySelector('[data-state]:not([hidden])')?.dataset.state;
    document.body.dataset.demoState = cur || 'ready';
    if (cur !== 'empty') return;
    // Khớp 3 chip ở data-state="empty": An toàn thông tin, CORE A*, Hạn trong 7 ngày (đã hết hạn tắt).
    const on = { 'Lĩnh vực': ['An toàn thông tin'], 'Rank CORE': ['A*'], 'Hạn trong': ['7 ngày'] };
    document.querySelectorAll('.side .fg').forEach(g => {
        const group = g.querySelector('summary').firstChild.textContent.trim();
        g.querySelectorAll('input').forEach(i => {
            i.checked = (on[group] || []).includes(i.nextElementSibling.textContent.trim());
        });
    });
})();
