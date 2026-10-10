// tools/theme.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/js/theme.js', import.meta.url)), 'utf8');

const run = ({ stored = null, prefersDark = false, storageThrows = false } = {}) => {
    const saved = {};
    const button = {
        pressed: null,
        setAttribute(k, v) { if (k === 'aria-pressed') this.pressed = v; },
        addEventListener(type, fn) { if (type === 'click') this.click = fn; },
    };
    const ctx = {
        document: {
            documentElement: { dataset: {} },
            querySelectorAll: () => [button],
            addEventListener: (type, fn) => { if (type === 'DOMContentLoaded') ctx.ready = fn; },
        },
        localStorage: {
            getItem: () => { if (storageThrows) throw new Error('blocked'); return saved.v ?? stored; },
            setItem: (k, v) => { if (storageThrows) throw new Error('blocked'); saved.v = v; },
        },
        matchMedia: () => ({ matches: prefersDark }),
    };
    vm.runInNewContext(SRC, ctx);
    ctx.ready();
    return { button, saved, theme: () => ctx.document.documentElement.dataset.theme };
};

test('mặc định theo hệ thống: tối', () => {
    assert.equal(run({ prefersDark: true }).theme(), 'dark');
});
test('mặc định theo hệ thống: sáng', () => {
    assert.equal(run({ prefersDark: false }).theme(), 'light');
});
test('lựa chọn đã lưu thắng hệ thống', () => {
    assert.equal(run({ stored: 'light', prefersDark: true }).theme(), 'light');
});
test('bấm nút đổi giao diện, lưu lại và cập nhật aria-pressed', () => {
    const r = run({ prefersDark: false });
    r.button.click();
    assert.equal(r.theme(), 'dark');
    assert.equal(r.saved.v, 'dark');
    assert.equal(r.button.pressed, 'true');
    r.button.click();
    assert.equal(r.theme(), 'light');
    assert.equal(r.button.pressed, 'false');
});
test('localStorage bị chặn vẫn chạy được', () => {
    const r = run({ storageThrows: true, prefersDark: true });
    assert.equal(r.theme(), 'dark');
    r.button.click();
    assert.equal(r.theme(), 'light');
});
