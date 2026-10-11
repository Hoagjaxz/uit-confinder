// Lưu hội nghị bằng nút ★ (data-save="slug"). Trạng thái nằm trong localStorage; bị chặn thì chỉ giữ trong phiên.
(() => {
    const KEY = 'confinder-saved';
    const load = () => {
        try {
            const v = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(v) ? v : [];
        } catch { return []; }
    };
    const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* bị chặn */ } };
    let saved = load();

    const paint = () => {
        document.querySelectorAll('[data-save]').forEach(b => {
            const on = saved.includes(b.dataset.save);
            b.setAttribute('aria-pressed', String(on));
            b.querySelector('.ic')?.classList.toggle('fill', on);
            const text = b.querySelector('[data-save-text]');
            if (text) text.textContent = on ? 'Đã lưu' : 'Lưu hội nghị';
            else if (b.classList.contains('iconbtn')) b.setAttribute('aria-label', `${on ? 'Bỏ lưu' : 'Lưu'} ${b.dataset.saveName || 'hội nghị'}`);
        });
        document.querySelectorAll('[data-saved-count]').forEach(n => { n.textContent = String(saved.length); });
        document.querySelectorAll('[data-saved-item]').forEach(li => { li.hidden = !saved.includes(li.dataset.savedItem); });
        const empty = document.getElementById('saved-empty');
        if (empty) empty.hidden = saved.length > 0;
    };

    document.addEventListener('click', e => {
        const b = e.target.closest('[data-save]');
        if (!b) return;
        const slug = b.dataset.save;
        saved = saved.includes(slug) ? saved.filter(s => s !== slug) : [...saved, slug];
        store(saved);
        paint();
    });
    paint();
})();
