// tools/save.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/js/save.js', import.meta.url)), 'utf8');

const button = slug => ({
    dataset: { save: slug },
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    querySelector: () => null,
    classList: { contains: () => true },
});

const run = ({ stored = null, throws = false, buttons = [] } = {}) => {
    const written = {};
    const count = { textContent: '' };
    let onClick;
    const ctx = {
        document: {
            querySelectorAll: sel => (sel === '[data-save]' ? buttons : sel === '[data-saved-count]' ? [count] : []),
            getElementById: () => null,
            addEventListener: (type, fn) => { if (type === 'click') onClick = fn; },
        },
        localStorage: {
            getItem: () => { if (throws) throw new Error('blocked'); return stored; },
            setItem: (k, v) => { if (throws) throw new Error('blocked'); written[k] = v; },
        },
    };
    vm.runInNewContext(SRC, ctx);
    return { count, written, click: b => onClick({ target: { closest: () => b } }) };
};

test('đọc danh sách đã lưu: nút được bật và đếm đúng', () => {
    const b = button('icse');
    const r = run({ stored: '["icse","acl"]', buttons: [b] });
    assert.equal(b.attrs['aria-pressed'], 'true');
    assert.equal(r.count.textContent, '2');
});
test('bấm để lưu rồi bỏ lưu, có ghi vào localStorage', () => {
    const b = button('fse');
    const r = run({ buttons: [b] });
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'true');
    assert.equal(r.written['confinder-saved'], '["fse"]');
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'false');
    assert.equal(r.written['confinder-saved'], '[]');
});
test('localStorage bị chặn vẫn bật/tắt được trong phiên', () => {
    const b = button('ase');
    const r = run({ throws: true, buttons: [b] });
    r.click(b);
    assert.equal(b.attrs['aria-pressed'], 'true');
});
test('dữ liệu hỏng được coi là rỗng', () => {
    const r = run({ stored: '{không phải json', buttons: [] });
    assert.equal(r.count.textContent, '0');
});
