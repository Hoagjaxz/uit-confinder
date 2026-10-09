(() => {
    const form = document.getElementById('news-form');
    if (!form) return;
    const em = document.getElementById('news-email'), msg = document.getElementById('news-msg'), fld = document.getElementById('news-field');
    const say = (text, kind) => {
        msg.textContent = text;
        msg.dataset.bad = String(kind === 'bad');
        msg.dataset.ok = String(kind === 'ok');
        fld.dataset.bad = String(kind === 'bad');
        em.setAttribute('aria-invalid', String(kind === 'bad'));
    };
    form.addEventListener('submit', e => {
        e.preventDefault();
        const v = em.value.trim();
        if (!v) return say('Vui lòng nhập email.', 'bad');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return say('Email chưa hợp lệ. Ví dụ: ten@truong.edu.vn', 'bad');
        say('Email hợp lệ. Biểu mẫu mới chỉ kiểm tra trên trình duyệt, chưa gửi đi đâu.', 'ok');
    });
    em.addEventListener('input', () => {
        if (msg.dataset.bad === 'true') say('', '');
    });
})();
