(() => {
    // Mục lục: mở sẵn ở desktop (≥64rem), thu gọn ở mobile/tablet
    const toc = document.getElementById('toc');
    if (toc && !matchMedia('(min-width: 64rem)').matches) toc.removeAttribute('open');

    const btn = document.getElementById('copy');
    if (!btn) return;
    const msg = document.getElementById('copy-msg');
    let t;
    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(btn.dataset.url);
            msg.textContent = 'Đã sao chép liên kết.';
        } catch (e) {
            msg.textContent = 'Không sao chép được. Liên kết: ' + btn.dataset.url;
        }
        clearTimeout(t);
        t = setTimeout(() => msg.textContent = '', 3000);
    });
})();
