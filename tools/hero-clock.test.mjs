// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { viet, spoken, phrase, remainingAt, dayState, ribbon } = createRequire(import.meta.url)('../site/js/hero-clock.js');
const DAY = 86400;

test('đọc số bằng chữ: mười, mười lăm, hai mươi mốt, hai mươi lăm, bốn mươi', () => {
    assert.deepEqual([1, 4, 10, 11, 15, 20, 21, 24, 25, 40, 59].map(viet),
        ['một', 'bốn', 'mười', 'mười một', 'mười lăm', 'hai mươi', 'hai mươi mốt', 'hai mươi bốn', 'hai mươi lăm', 'bốn mươi', 'năm mươi chín']);
    assert.equal(viet(120), '120');
});

test('câu thời gian còn lại', () => {
    assert.equal(spoken(2 * DAY + 4 * 3600 + 12 * 60 + 9), 'hai ngày, bốn giờ');
    assert.equal(spoken(DAY + 3 * 3600 + 10 * 60), 'một ngày, ba giờ, mười phút');
    assert.equal(spoken(2 * DAY), 'hai ngày');
    assert.equal(spoken(5 * 3600 + 7 * 60), 'năm giờ, bảy phút');
    assert.equal(spoken(40 * 60 + 20), 'bốn mươi phút');
    assert.equal(spoken(30), 'ba mươi giây');
    assert.equal(spoken(0), 'hết hạn');
    assert.equal(spoken(-5), 'hết hạn');
});

test('phrase thêm "còn", hết hạn thì "đã hết hạn"', () => {
    assert.equal(phrase(2 * DAY + 4 * 3600), 'còn hai ngày, bốn giờ');
    assert.equal(phrase(0), 'đã hết hạn');
});

test('thời gian còn lại làm tròn theo giây đã trôi, về 0 rồi đứng', () => {
    assert.equal(remainingAt(100, 1.003), 99);
    assert.equal(remainingAt(5, 5), 0);
    assert.equal(remainingAt(5, 9999), 0);
});

test('trạng thái ngày: đã qua, hôm nay, còn lại', () => {
    assert.deepEqual([0, 11, 12, 13, 14].map(i => dayState(i, 12.83)), ['past', 'past', 'today', 'future', 'future']);
    assert.equal(dayState(0, 0), 'today');
});

test('dải ở giữa mặt cầu rộng hơn dải sát mép, và dải quá mép thì khuất', () => {
    const n = 15, step = 360 / n;
    const centre = ribbon(0, n, 0), side = ribbon(0, n, 70), back = ribbon(0, n, 180);
    assert.ok(centre.visible && side.visible);
    assert.ok(centre.width > side.width * 2);
    assert.equal(back.visible, false);
    assert.ok(Math.abs(centre.light - 1) < 1e-9 && side.light < 0.4);
    assert.ok(centre.lo < 0 && centre.hi > 0 && centre.hi - centre.lo < step);
});

test('xoay một vòng 360 độ thì trở lại như cũ; số dải thấy được quanh 7-8', () => {
    assert.deepEqual(ribbon(3, 15, 40), ribbon(3, 15, 400));
    const seen = Array.from({ length: 15 }, (_, i) => ribbon(i, 15, 13).visible).filter(Boolean).length;
    assert.ok(seen >= 7 && seen <= 9);
});
