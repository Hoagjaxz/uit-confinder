// Header/footer dùng chung: dữ liệu + mẫu HTML. sync-chrome.mjs ghi vào trang, check-site.mjs đối chiếu.
export const NAV = [
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'blog.html', label: 'Bài viết' },
    { href: 'gioi-thieu.html', label: 'Giới thiệu' },
    { href: 'lien-he.html', label: 'Liên hệ' },
];
export const FOOT_PAGES = [
    { href: 'index.html', label: 'Trang chủ' },
    { href: 'lich-hoi-nghi.html', label: 'Lịch hội nghị' },
    { href: 'da-luu.html', label: 'Đã lưu' },
    { href: 'blog.html', label: 'Bài viết' },
    { href: 'gioi-thieu.html', label: 'Giới thiệu' },
    { href: 'lien-he.html', label: 'Liên hệ' },
];
export const FOOT_NOTE = '© 2026 UIT ConFinder. Dữ liệu hội nghị là dữ liệu minh hoạ cho đồ án, hãy kiểm tra lại trên trang chính thức trước khi nộp bài.';

const svg = (cls, body) =>
    `<svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const MENU = svg('ic', '<path d="M4 6h16M4 12h16M4 18h16"/>');
const MOON = svg('ic moon', '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>');
const SUN = svg('ic sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>');

/** Trang con của một mục nav vẫn được đánh dấu aria-current. */
export const currentFor = rel => {
    if (rel.startsWith('blog/')) return 'blog.html';
    if (/^hoi-nghi/.test(rel)) return 'lich-hoi-nghi.html';
    return rel;
};

export const skipHtml = '<a class="skip" href="#main">Bỏ qua đến nội dung chính</a>';

export const navHtml = (prefix, current) =>
    '<!--c:nav--><button type="button" class="menu-btn" aria-expanded="false" aria-controls="site-nav">' + MENU + '<span class="vh">Mở menu</span></button>' +
    '<nav class="nav" id="site-nav" aria-label="Điều hướng chính">' +
    NAV.map(n => `<a href="${prefix}${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('') +
    '</nav><button type="button" class="theme-btn" data-theme-toggle aria-pressed="false">' + MOON + SUN + '<span class="vh">Giao diện tối</span></button><!--/c:nav-->';

export const brandHtml = prefix => `<a class="brand" href="${prefix}index.html">UIT <em>ConFinder</em></a>`;

export const footerHtml = prefix =>
    `<footer class="foot"><div class="container foot-in">${brandHtml(prefix)}<nav class="foot-nav" aria-label="Liên kết chân trang">` +
    FOOT_PAGES.map(n => `<a href="${prefix}${n.href}">${n.label}</a>`).join('') + `</nav><small>${FOOT_NOTE}</small></div></footer>`;

export const savedHtml = prefix =>
    `<!--c:saved--><a class="saved" href="${prefix}da-luu.html" aria-label="Đã lưu"><svg class="ic fill" width="18" height="18" aria-hidden="true"><use href="#i-star"/></svg><span><span class="sv-t">Đã lưu </span>(<span data-saved-count>0</span>)</span></a><!--/c:saved-->`;

// Bộ chữ: Be Vietnam Pro (giao diện), Newsreader upright (tiêu đề, tên), JetBrains Mono (ngày giờ). Chèn trước site.css.
export const FONTS_HTML =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    ' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">';

export const faviconHtml = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' rx=\'6\' fill=\'%235b2d9b\'/%3E%3Ctext x=\'16\' y=\'23\' font-size=\'20\' text-anchor=\'middle\' fill=\'%23ffffff\' font-family=\'system-ui,sans-serif\' font-weight=\'700\'%3EC%3C/text%3E%3C/svg%3E">';
