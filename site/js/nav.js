// Menu trên điện thoại và trạng thái mở/đóng của nhóm bộ lọc theo độ rộng màn hình.
(() => {
    // Bộ lọc: màn rộng mở hết; điện thoại chỉ mở nhóm đầu để danh sách không bị đẩy xuống quá xa.
    const wide = matchMedia('(min-width: 64rem)');
    document.querySelectorAll('.side .fg').forEach((d, i) => { d.open = wide.matches || i === 0; });

    const btn = document.querySelector('.menu-btn');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    const set = open => {
        nav.dataset.open = String(open);
        btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => set(nav.dataset.open !== 'true'));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.dataset.open === 'true') { set(false); btn.focus(); }
    });
})();
