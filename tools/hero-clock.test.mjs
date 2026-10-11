// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { CONFERENCES } from './conferences.mjs';
import { LEVELS } from './levels.mjs';
import { daysLeft, urgency, nextDue, NOW } from './time-vn.mjs';

const { parts, units, spoken, remaining, pick, level, LV } = createRequire(import.meta.url)('../site/js/hero-clock.js');
const at = iso => Date.parse(iso);
const DAY = 86400;

test('tách giây còn lại thành ngày, giờ, phút, giây; không âm', () => {
    assert.deepEqual(parts(2 * DAY + 4 * 3600 + 12 * 60 + 9), { d: 2, h: 4, m: 12, s: 9 });
    assert.deepEqual(parts(-5), { d: 0, h: 0, m: 0, s: 0 });
});

test('câu đọc thời lượng đúng nghĩa, bỏ đơn vị bằng 0', () => {
    assert.equal(spoken(2 * DAY + 4 * 3600 + 12 * 60 + 9), '2 ngày 4 giờ 12 phút');
    assert.equal(spoken(2 * DAY + 12 * 60), '2 ngày 12 phút');
    assert.equal(spoken(5 * 3600), '5 giờ');
    assert.equal(spoken(90), '1 phút');
    assert.equal(spoken(42), '42 giây');
    assert.equal(units(18 * DAY + 4 * 3600)[0], '18 ngày');
});

test('giây còn lại làm tròn lên: chưa hết hạn thì chưa về 0', () => {
    const d = at('2026-10-11T18:59:00+07:00');
    assert.equal(remaining(d, d - 187929000), 187929);
    assert.equal(remaining(d, d - 400), 1);
    assert.equal(remaining(d, d), 0);
});

test('chọn hội nghị còn mở có hạn gần nhất; ICSE hết hạn thì sang FSE', () => {
    const items = CONFERENCES.filter(c => !c.closed).map(c => ({ slug: c.slug, deadline: at(nextDue(c).at) }));
    assert.equal(pick(items, at('2026-10-11T12:00:00+07:00')).slug, 'icse');
    assert.equal(pick(items, at('2026-10-11T18:59:00+07:00')).slug, 'fse'); // đúng hạn là hết hạn
    assert.equal(pick(items, at('2026-10-15T00:00:00+07:00')).slug, 'acl');
    assert.equal(pick([...items].reverse(), at('2026-10-11T12:00:00+07:00')).slug, 'icse'); // không phụ thuộc thứ tự
});

test('không còn hội nghị nào mở thì pick trả null', () => {
    assert.equal(pick([], NOW), null);
    assert.equal(pick([{ deadline: NOW - 1 }, { deadline: NOW }], NOW), null);
});

test('mức khẩn khớp ngưỡng của time-vn.mjs', () => {
    for (const iso of ['2026-10-09T23:00:00+07:00', '2026-10-11T18:59:00+07:00', '2026-10-14T18:59:00+07:00', '2026-10-27T18:59:00+07:00', '2026-11-19T18:59:00+07:00', '2026-12-10T18:59:00+07:00']) {
        assert.equal(level(at(iso), NOW), urgency(daysLeft(iso)), iso);
    }
    assert.equal(level(NOW, NOW), 'x');
    assert.deepEqual(LV, Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [k, v.label])));
});
