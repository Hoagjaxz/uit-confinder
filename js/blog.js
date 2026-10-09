(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const app = $('#bx-app');
    if (!app) return;
    const PER = 9;
    const CATS = {'': 'Tất cả', 'kien-thuc': 'Kiến thức'};
    const SORTS = ['new', 'old', 'az'];
    const grid = $('#bx-grid');
    const cards = $$('.bx-card', grid);
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
    let demo = null; // trạng thái ép bởi nút demo: loading | error | empty

    const input = $('#bx-q'), sortSel = $('#bx-sort'), region = $('#bx-region');
    const count = $('#bx-count'), range = $('#bx-range'), pager = $('#bx-pager');

    const matches = (c, withCat) => (!withCat || !st.cat || c.dataset.cat === st.cat) && (!norm(st.q.trim()) || c._k.includes(norm(st.q.trim())));

    function urlbar() {
        const m = /^#\/blog\/([a-z0-9-]+)$/.exec(location.hash);
        $('#bx-url').textContent = 'conference.io.vn/blog' + (m ? '/' + m[1] : location.search);
    }

    function sync() {
        const p = new URLSearchParams();
        if (st.q.trim()) p.set('q', st.q.trim());
        if (st.cat) p.set('cat', st.cat);
        if (st.sort !== 'new') p.set('sort', st.sort);
        if (st.page > 1) p.set('page', st.page);
        const qs = p.toString();
        try {
            history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
        } catch (e) { /* file:// có thể chặn replaceState; trạng thái vẫn chạy, chỉ không lưu URL */
        }
        urlbar();
    }

    function render() {
        const hits = cards.filter(c => matches(c, true));
        const cmp = {
            new: (a, b) => b._t - a._t,
            old: (a, b) => a._t - b._t,
            az: (a, b) => a._ti.localeCompare(b._ti, 'vi')
        }[st.sort];
        hits.sort(cmp);
        const pages = Math.max(1, Math.ceil(hits.length / PER));
        st.page = Math.min(st.page, pages);
        const from = (st.page - 1) * PER;
        const shown = new Set(hits.slice(from, from + PER));
        cards.forEach(c => c.hidden = !shown.has(c));
        hits.forEach(c => grid.append(c));

        const state = demo || (hits.length ? 'ready' : 'empty');
        region.dataset.state = state;
        $$('[data-bx-state]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bxState === (demo ?? 'ready'))));
        count.textContent = state === 'loading' ? 'Đang tải bài viết…' : state === 'error' ? 'Không tải được bài viết' : `Hiển thị ${hits.length} bài viết`;
        $('#bx-feat').hidden = !!(st.q.trim() || st.cat);

        // phân trang
        const showPager = state === 'ready' && hits.length > 0;
        pager.hidden = !showPager;
        if (showPager) {
            range.textContent = `Hiển thị ${from + 1}–${from + shown.size} / ${hits.length}`;
            const nav = $('#bx-pages');
            nav.innerHTML = '';
            const btn = (label, page, opts = {}) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'pb' + (opts.cur ? ' cur' : '') + (opts.off ? ' dis' : '');
                b.textContent = label;
                if (opts.off) b.disabled = true;
                if (opts.cur) b.setAttribute('aria-current', 'page');
                if (opts.aria) b.setAttribute('aria-label', opts.aria);
                b.addEventListener('click', () => {
                    st.page = page;
                    render();
                    sync();
                    $('#bx-tools').scrollIntoView({block: 'start'});
                });
                nav.append(b);
            };
            btn('‹', st.page - 1, {off: st.page === 1, aria: 'Trang trước'});
            for (let i = 1; i <= pages; i++) btn(String(i), i, {cur: i === st.page, aria: 'Trang ' + i});
            btn('›', st.page + 1, {off: st.page === pages, aria: 'Trang sau'});
            nav.hidden = pages === 1;
        }

        // empty: lý do + gợi ý danh mục còn bài
        if (state === 'empty') {
            const parts = [];
            if (st.q.trim()) parts.push(`từ khoá "${st.q.trim()}"`);
            if (st.cat) parts.push(`danh mục "${CATS[st.cat]}"`);
            $('#bx-empty-why').textContent = parts.length ? `Không có bài viết nào khớp ${parts.join(' trong ')}.` : 'Chưa có bài viết nào để hiển thị.';
            const sug = $('#bx-sug');
            sug.innerHTML = '';
            Object.keys(CATS).filter(k => k && k !== st.cat && cards.some(c => c.dataset.cat === k && (!norm(st.q.trim()) || c._k.includes(norm(st.q.trim()))))).forEach(k => {
                const w = document.createElement('button');
                w.type = 'button';
                w.className = 'chipbtn';
                w.innerHTML = '<span class="chip"></span>';
                w.firstChild.textContent = CATS[k];
                w.addEventListener('click', () => setCat(k));
                sug.append(w);
            });
            $('#bx-sug-wrap').hidden = !sug.children.length;
        }
        $$('[data-bx-cat]').forEach(b => {
            const on = b.dataset.bxCat === st.cat;
            b.setAttribute('aria-pressed', String(on));
            b.firstElementChild.classList.toggle('on', on);
        });
    }

    function setCat(k) {
        st.cat = k;
        st.page = 1;
        demo = null;
        render();
        sync();
    }

    function clearFilters() {
        st.q = '';
        st.cat = '';
        st.page = 1;
        demo = null;
        input.value = '';
        render();
        sync();
    }

    // ---- toolbar
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            st.q = input.value;
            st.page = 1;
            demo = null;
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
    $$('[data-bx-cat]').forEach(b => b.addEventListener('click', () => setCat(b.dataset.bxCat)));
    $('#bx-clear').addEventListener('click', clearFilters);
    $('#bx-retry').addEventListener('click', () => {
        demo = null;
        render();
    });

    // ---- demo wireframe: trạng thái + độ rộng khung
    $$('[data-bx-state]').forEach(b => b.addEventListener('click', () => {
        demo = b.dataset.bxState === 'ready' ? null : b.dataset.bxState;
        render();
    }));
    $$('[data-bx-w]').forEach(b => b.addEventListener('click', () => {
        $('#bx-fw').style.width = (+b.dataset.bxW + 4) + 'px';
        $$('[data-bx-w]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));

    // ---- chi tiết bài viết
    const det = $('#bx-detail'), lst = $('#bx-list');
    const toc = $('#bx-toc');
    $('#bx-toc-btn').addEventListener('click', e => {
        const open = toc.dataset.open !== 'true';
        toc.dataset.open = String(open);
        e.currentTarget.setAttribute('aria-expanded', String(open));
    });
    const back = () => {
        location.hash = '#/blog';
    };
    $('#bx-back').addEventListener('click', back);
    $('#bx-crumb-blog').addEventListener('click', back);

    let copyTimer;
    $('#bx-copy').addEventListener('click', async () => {
        const url = $('#bx-copy').dataset.url;
        const msg = $('#bx-copy-msg');
        try {
            await navigator.clipboard.writeText(url);
            msg.textContent = 'Đã sao chép liên kết.';
        } catch (e) {
            msg.textContent = 'Không sao chép được. Liên kết: ' + url;
        }
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => msg.textContent = '', 3000);
    });

    function openDetail(c) {
        const d = c.dataset;
        $('#bx-d-crumb').textContent = d.title;
        $('#bx-d-title').textContent = d.title;
        $('#bx-d-meta').innerHTML = '';
        [d.author, c.querySelector('time').textContent, d.read].forEach(t => {
            const s = document.createElement('span');
            s.textContent = t;
            $('#bx-d-meta').append(s);
        });
        $('#bx-copy').dataset.url = 'https://conference.io.vn/blog/' + d.slug;
        $('#bx-src').href = 'https://conference.io.vn/blog/' + d.slug;
        const body = $('#bx-d-body');
        body.innerHTML = '';
        const t = document.getElementById('bx-body-' + d.slug);
        if (t) body.append(t.content.cloneNode(true));
        const list = $('#bx-toc-list');
        list.innerHTML = '';
        $$('h2, h3', body).forEach((h, i) => {
            h.id = 'bx-s' + i;
            const li = document.createElement('li');
            if (h.tagName === 'H3') li.className = 'h3';
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = h.textContent;
            b.addEventListener('click', () => h.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start'
            }));
            li.append(b);
            list.append(li);
        });
        toc.dataset.open = 'false';
        $('#bx-toc-btn').setAttribute('aria-expanded', 'false');
        const rel = $('#bx-rel');
        rel.innerHTML = '';
        (d.related || '').split(',').map(s => cards.find(x => x.dataset.slug === s)).filter(Boolean).forEach(r => {
            const a = document.createElement('article');
            a.className = 'bx-card';
            a.innerHTML = '<span class="badge"></span><h3><a class="bx-link"></a></h3><div class="bx-ft"><span></span><time></time></div>';
            a.querySelector('.badge').textContent = r.querySelector('.badge').textContent;
            const l = a.querySelector('a');
            l.textContent = r.dataset.title;
            l.href = '#/blog/' + r.dataset.slug;
            a.querySelector('.bx-ft span').textContent = r.dataset.author;
            a.querySelector('time').textContent = r.querySelector('time').textContent;
            rel.append(a);
        });
    }

    function route() {
        const m = /^#\/blog\/([a-z0-9-]+)$/.exec(location.hash);
        const c = m && cards.find(x => x.dataset.slug === m[1]);
        lst.hidden = !!c;
        det.hidden = !c;
        $$('.bx-nav a').forEach(a => a.removeAttribute('aria-current'));
        $('#bx-nav-blog').setAttribute('aria-current', 'page');
        if (c) openDetail(c);
        urlbar();
    }

    addEventListener('hashchange', () => {
        route();
        $('#bx-blog').scrollIntoView({block: 'start'});
    });

    // ---- đăng ký nhận tin (chỉ kiểm tra phía client)
    const form = $('#bx-news-form'), em = $('#bx-email'), msg = $('#bx-news-msg'), fld = $('#bx-email-field');
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
        say('Email hợp lệ. (Wireframe: chỉ kiểm tra phía client, chưa gửi đi đâu.)', 'ok');
    });
    em.addEventListener('input', () => {
        if (msg.dataset.bad === 'true') say('', '');
    });

    // ---- khởi tạo
    input.value = st.q;
    sortSel.value = st.sort;
    route();
    render();
})();
