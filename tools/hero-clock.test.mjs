// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { tick } = createRequire(import.meta.url)('../site/js/hero-clock.js');
const DAY = 86400;

test('chưa trôi giây nào thì giữ nguyên', () => {
    assert.deepEqual(tick(2 * DAY + 4 * 3600 + 12 * 60 + 9, 0), { d: 2, h: 4, m: 12, s: 9 });
});

test('làm tròn thời gian đã trôi: 1.003 giây vẫn là 1 giây', () => {
    assert.deepEqual(tick(100, 1.003), { d: 0, h: 0, m: 1, s: 39 });
});

test('qua mốc phút, giờ, ngày', () => {
    assert.deepEqual(tick(60, 1), { d: 0, h: 0, m: 0, s: 59 });
    assert.deepEqual(tick(3600, 1), { d: 0, h: 0, m: 59, s: 59 });
    assert.deepEqual(tick(DAY, 1), { d: 0, h: 23, m: 59, s: 59 });
    assert.deepEqual(tick(2 * DAY, DAY + 1), { d: 0, h: 23, m: 59, s: 59 });
});

test('về 0 rồi đứng, không âm', () => {
    assert.deepEqual(tick(5, 5), { d: 0, h: 0, m: 0, s: 0 });
    assert.deepEqual(tick(5, 9999), { d: 0, h: 0, m: 0, s: 0 });
});
