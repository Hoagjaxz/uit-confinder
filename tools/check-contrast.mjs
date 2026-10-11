// Kiểm tra contrast WCAG AA (4.5:1) của token màu sáng/tối trong site/css/site.css.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../site/css/site.css', import.meta.url)), 'utf8');
const tokens = re => {
    const m = css.match(re);
    if (!m) throw new Error(`không tìm thấy khối ${re}`);
    return Object.fromEntries([...m[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map(x => [x[1], x[2]]));
};
const light = tokens(/:root\s*\{([^}]*)\}/);
const dark = { ...light, ...tokens(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/) };

const lum = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

// Mỗi cặp: [chữ, nền]. Ruy-băng A* dùng --on-ribbon-a, các ruy-băng còn lại dùng --on-ribbon.
const PAIRS = [
    ['ink', 'paper'], ['ink', 'card'], ['ink', 'badge'], ['ink', 'hover'], ['ink', 'field'], ['ink', 'tint'],
    ['mute', 'paper'], ['mute', 'card'], ['mute', 'badge'], ['mute', 'hover'], ['mute', 'field'], ['mute', 'closed'], ['mute', 'tint'], ['mute', 'tint-2'], ['mute', 'past'],
    ['accent', 'paper'], ['accent', 'card'], ['accent', 'badge'], ['accent', 'hover'], ['link', 'paper'], ['link', 'card'], ['focus', 'paper'],
    ['paper', 'ink'], ['paper', 'accent'],
    ['on-ribbon-a', 'ribbon-a'], ['on-ribbon', 'ribbon-b'], ['on-ribbon', 'ribbon-c'], ['on-ribbon', 'ribbon-d'],
    ['c-fg', 'card'], ['s-fg', 'card'], ['u-fg', 'card'], ['o-fg', 'card'], ['c-fg', 'c-bg'], ['s-fg', 's-bg'], ['u-fg', 'u-bg'], ['o-fg', 'o-bg'], ['x-fg', 'x-bg'],
];

let bad = 0;
for (const [mode, t] of [['sáng', light], ['tối', dark]]) {
    for (const [fg, bg] of PAIRS) {
        const f = fg.startsWith('#') ? fg : t[fg];
        const b = bg.startsWith('#') ? bg : t[bg];
        if (!f || !b) { console.error(`[${mode}] thiếu token ${fg} hoặc ${bg}`); bad++; continue; }
        const r = ratio(f, b);
        if (r < 4.5) { console.error(`[${mode}] ${fg} trên ${bg}: ${r.toFixed(2)} < 4.5`); bad++; }
    }
}
if (bad) process.exit(1);
console.log('OK: mọi cặp màu đạt WCAG AA (4.5:1) ở cả hai giao diện');
