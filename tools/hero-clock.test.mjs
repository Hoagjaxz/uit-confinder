// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { format, spoken } = createRequire(import.meta.url)('../site/js/hero-clock.js');
const DAY = 86400;

test('định dạng đồng hồ: có ngày thì thêm "N ngày", dưới một ngày thì chỉ giờ:phút:giây', () => {
    assert.equal(format(2 * DAY + 4 * 3600 + 12 * 60 + 9), '2 ngày 04:12:09');
    assert.equal(format(18 * DAY), '18 ngày 00:00:00');
    assert.equal(format(5 * 3600 + 7 * 60 + 3), '05:07:03');
    assert.equal(format(0), '00:00:00');
    assert.equal(format(-9), '00:00:00');
});

test('câu đọc cho trình đọc màn hình chỉ lấy đơn vị lớn nhất', () => {
    assert.equal(spoken(2 * DAY + 5000), '2 ngày');
    assert.equal(spoken(5 * 3600), '5 giờ');
    assert.equal(spoken(90), '1 phút');
    assert.equal(spoken(42), '42 giây');
    assert.equal(spoken(-1), '0 giây');
});
