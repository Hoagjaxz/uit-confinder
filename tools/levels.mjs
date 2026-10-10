// tools/levels.mjs
// Năm mức khẩn và nhãn mức khẩn (.ub), dùng chung cho build-conferences và build-lists.
export const LEVELS = {
    c: { cls: 'u-c', icon: 'i-alert', label: 'Gấp', range: 'dưới 3 ngày' },
    s: { cls: 'u-s', icon: 'i-clock', label: 'Trong tuần', range: 'dưới 7 ngày' },
    u: { cls: 'u-u', icon: 'i-calendar', label: 'Trong tháng', range: 'dưới 30 ngày' },
    o: { cls: 'u-o', icon: 'i-okc', label: 'Còn rộng', range: 'từ 30 ngày' },
    x: { cls: 'u-x', icon: 'i-xc', label: 'Đã hết hạn', range: 'đã qua' },
};
export const icon = (id, size = 16) => `<svg class="ic" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;
export const ub = (lv, tail) => `<span class="ub ${LEVELS[lv].cls}">${icon(LEVELS[lv].icon)}<b>${LEVELS[lv].label}</b>${tail ? `<i class="sep">·</i><span class="mono">${tail}</span>` : ''}</span>`;
export const ribbon = text => `<span class="ribbon rb-${/A\*/.test(text) ? 'a' : /A$/.test(text) ? 'b' : /B$/.test(text) ? 'c' : 'd'}">${text}</span>`;
