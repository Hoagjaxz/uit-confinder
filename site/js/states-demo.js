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
