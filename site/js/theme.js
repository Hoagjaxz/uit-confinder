// Chuyển giao diện sáng/tối. Nạp đồng bộ trong <head> để không bị nháy màu.
(() => {
    const KEY = 'confinder-theme';
    const root = document.documentElement;
    const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
    const write = v => { try { localStorage.setItem(KEY, v); } catch { /* bị chặn: chỉ đổi trong phiên */ } };
    const system = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const apply = t => {
        root.dataset.theme = t;
        document.querySelectorAll('[data-theme-toggle]').forEach(b => b.setAttribute('aria-pressed', String(t === 'dark')));
    };

    const stored = read();
    apply(stored === 'dark' || stored === 'light' ? stored : system());

    document.addEventListener('DOMContentLoaded', () => {
        apply(root.dataset.theme);
        document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            write(next);
            apply(next);
        }));
    });
})();
