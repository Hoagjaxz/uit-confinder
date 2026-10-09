(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const PER = 9;
    const CATS = {'': 'Tất cả', 'kien-thuc': 'Kiến thức'};
    const SORTS = ['new', 'old', 'az'];
    const grid = $('#grid');
    const cards = $$('.bcard', grid);
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
    cards.forEach(c => {
        c._ti = c.dataset.title;
        c._k = norm(c.dataset.title + ' ' + c.dataset.desc);
        c._t = Date.parse(c.dataset.iso);
    });

    const P = new URLSearchParams(location.search);
    const st = {
        q: P.get('q') || '',
        cat: (P.get('cat') ?? '') in CATS ? P.get('cat') ?? '' : '',
        sort: SORTS.includes(P.get('sort')) ? P.get('sort') : 'new',
        page: Math.max(1, parseInt(P.get('page'), 10) || 1)
    };

    const input = $('#q'), sortSel = $('#sort');
    const count = $('#count'), range = $('#range'), pager = $('#pager'), pages = $('#pages');
    const qn = () => norm(st.q.trim());

    function sync() {
        const p = new URLSearchParams();
        if (st.q.trim()) p.set('q', st.q.trim());
        if (st.cat) p.set('cat', st.cat);
        if (st.sort !== 'new') p.set('sort', st.sort);
        if (st.page > 1) p.set('page', st.page);
        const qs = p.toString();
        try {
            history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
        } catch (e) { /* file:// có thể chặn replaceState; trang vẫn chạy, chỉ không lưu URL */
        }
    }

    function render() {
        const hits = cards.filter(c => (!st.cat || c.dataset.cat === st.cat) && (!qn() || c._k.includes(qn())));
        hits.sort({
            new: (a, b) => b._t - a._t,
            old: (a, b) => a._t - b._t,
            az: (a, b) => a._ti.localeCompare(b._ti, 'vi')
        }[st.sort]);
        const total = Math.max(1, Math.ceil(hits.length / PER));
        st.page = Math.min(st.page, total);
        const from = (st.page - 1) * PER;
        const shown = new Set(hits.slice(from, from + PER));
        cards.forEach(c => c.hidden = !shown.has(c));
        hits.forEach(c => grid.append(c));

        const empty = !hits.length;
        grid.hidden = empty;
        $('#empty').hidden = !empty;
        pager.hidden = empty;
        count.textContent = `Hiển thị ${hits.length} bài viết`;
        $('#feat').hidden = !!(st.q.trim() || st.cat);

        if (!empty) {
            range.textContent = `Hiển thị ${from + 1}–${from + shown.size} / ${hits.length}`;
            pages.innerHTML = '';
            pages.hidden = total === 1;
            const btn = (label, page, opts = {}) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'pb' + (opts.cur ? ' cur' : '');
                b.textContent = label;
                b.disabled = !!opts.off;
                if (opts.cur) b.setAttribute('aria-current', 'page');
                b.setAttribute('aria-label', opts.aria);
                b.addEventListener('click', () => {
                    st.page = page;
                    render();
                    sync();
                    $('#tools').scrollIntoView({block: 'start'});
                });
                pages.append(b);
            };
            btn('‹', st.page - 1, {off: st.page === 1, aria: 'Trang trước'});
            for (let i = 1; i <= total; i++) btn(String(i), i, {cur: i === st.page, aria: 'Trang ' + i});
            btn('›', st.page + 1, {off: st.page === total, aria: 'Trang sau'});
        } else {
            const parts = [];
            if (st.q.trim()) parts.push(`từ khoá "${st.q.trim()}"`);
            if (st.cat) parts.push(`danh mục "${CATS[st.cat]}"`);
            $('#empty-why').textContent = `Không có bài viết nào khớp ${parts.join(' trong ')}.`;
            const sug = $('#sug');
            sug.innerHTML = '';
            Object.keys(CATS).filter(k => k && k !== st.cat && cards.some(c => c.dataset.cat === k && (!qn() || c._k.includes(qn())))).forEach(k => {
                const w = document.createElement('button');
                w.type = 'button';
                w.className = 'chipbtn';
                w.innerHTML = '<span class="chip"></span>';
                w.firstChild.textContent = CATS[k];
                w.addEventListener('click', () => setCat(k));
                sug.append(w);
            });
            $('#sug-wrap').hidden = !sug.children.length;
        }
        $$('[data-cat-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.catBtn === st.cat)));
    }

    function setCat(k) {
        st.cat = k;
        st.page = 1;
        render();
        sync();
    }

    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            st.q = input.value;
            st.page = 1;
            render();
            sync();
        }, 250);
    });
    sortSel.addEventListener('change', () => {
        st.sort = sortSel.value;
        st.page = 1;
        render();
        sync();
    });
    $$('[data-cat-btn]').forEach(b => b.addEventListener('click', () => setCat(b.dataset.catBtn)));
    $('#clear').addEventListener('click', () => {
        st.q = '';
        st.cat = '';
        st.page = 1;
        input.value = '';
        render();
        sync();
    });

    input.value = st.q;
    sortSel.value = st.sort;
    render();
})();
