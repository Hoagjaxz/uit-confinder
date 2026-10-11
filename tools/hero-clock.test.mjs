// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { viet, spoken, phrase, remainingAt, dayState, paneStates, heat, planetOrbit, clockParts } = createRequire(import.meta.url)('../site/js/hero-clock.js');
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

test('15 tấm kính: 12 đã qua, 1 hôm nay, 2 còn lại khi trôi 12,83 ngày', () => {
    const st = paneStates(15, 12.83);
    assert.equal(st.length, 15);
    assert.deepEqual(['past', 'today', 'future'].map(k => st.filter(x => x === k).length), [12, 1, 2]);
    assert.equal(st[12], 'today');
    assert.deepEqual(paneStates(3, 0), ['today', 'future', 'future']);
    assert.deepEqual(paneStates(3, 99), ['past', 'past', 'past']);
});

test('độ nóng tăng đơn điệu 0..1 theo tỉ lệ đã trôi, ICSE (85,5%) ở trạng thái nóng', () => {
    assert.equal(heat(0), 0);
    assert.equal(heat(1), 1);
    assert.equal(heat(-3), 0);
    assert.ok(heat(0.855) > 0.9 && heat(0.855) < 1);
    const xs = Array.from({ length: 21 }, (_, i) => heat(i / 20));
    assert.ok(xs.every((v, i) => i === 0 || v >= xs[i - 1]));
    assert.ok(heat(0.4) < 0.3);
});

test('đồng hồ số: tách giây còn lại thành ngày, giờ, phút, giây; âm thì về 0', () => {
    assert.deepEqual(clockParts(2 * DAY + 4 * 3600 + 12 * 60 + 9), { d: 2, h: 4, m: 12, s: 9 });
    assert.deepEqual(clockParts(59.9), { d: 0, h: 0, m: 0, s: 59 });
    assert.deepEqual(clockParts(-3), { d: 0, h: 0, m: 0, s: 0 });
});

test('quỹ đạo hành tinh: bán kính và chu kỳ tăng theo số ngày còn lại, trong khoảng cho phép', () => {
    const fse = planetOrbit(5, 18, 0, 2), acl = planetOrbit(18, 18, 1, 2);
    assert.ok(fse.r < acl.r && fse.T < acl.T);
    assert.ok(fse.r > 39 && acl.r <= 45 && acl.r - fse.r > 3);
    assert.ok(fse.T >= 90 && acl.T <= 140);
    assert.equal(planetOrbit(0, 18, 0, 2).r, 39);
    assert.equal(planetOrbit(99, 18, 0, 2).r, 45);
    assert.equal(planetOrbit(5, 0, 0, 1).r, 45);
});

test('góc xuất phát rải đều và không trùng nhau', () => {
    const a = [0, 1, 2].map(i => planetOrbit(5, 18, i, 3).a0);
    assert.equal(new Set(a).size, 3);
    assert.deepEqual([0, 1].map(i => planetOrbit(5, 18, i, 2).a0), [40, 220]);
});
