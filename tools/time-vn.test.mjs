import test from 'node:test';
import assert from 'node:assert/strict';
import { NOW, formatVN, daysLeft, icsStart, urgency, nextDue } from './time-vn.mjs';
import { CONFERENCES } from './conferences.mjs';

// Ảnh chụp dữ liệu TRƯỚC khi migrate: ngày D theo mốc cũ, hạn là 23:59 ngày D ở UTC-12.
const OLD = {
    icse: ['2026-09-25', '2026-10-10', '2026-11-20', '2026-12-15', '2027-01-20'],
    fse: ['2026-09-15', '2026-10-13', '2026-12-20', '2027-02-25'],
    acl: ['2026-10-26', '2027-02-15', '2027-03-10'],
    ase: ['2026-11-18', '2026-11-25', '2027-02-10', '2027-04-01'],
    iclr: ['2026-12-09', '2026-12-16', '2027-02-01', '2027-03-15'],
    neurips: ['2026-05-08', '2026-05-15', '2026-09-25'],
};
const dated = c => c.milestones.filter(m => !m.range);

test('formatVN tách giờ và ngày theo giờ Việt Nam', () => {
    assert.deepEqual(formatVN('2026-10-11T18:59:00+07:00'), { time: '18:59', date: '11/10/2026' });
});

test('migrate: thời điểm UTC của at mới bằng 23:59 UTC-12 của date cũ', () => {
    assert.deepEqual(CONFERENCES.map(c => c.slug).sort(), Object.keys(OLD).sort());
    for (const c of CONFERENCES) {
        const ms = dated(c);
        assert.equal(ms.length, OLD[c.slug].length, c.slug);
        ms.forEach((m, i) => {
            assert.ok(!('date' in m), `${c.slug}: còn trường date`);
            assert.equal(Date.parse(m.at), Date.parse(`${OLD[c.slug][i]}T23:59:00-12:00`), `${c.slug} ${m.name}`);
        });
    }
});

test('daysLeft theo NOW 09/10/2026', () => {
    assert.equal(NOW, Date.UTC(2026, 9, 9));
    const icse = Object.fromEntries(dated(CONFERENCES[0]).map(m => [m.name, m.at]));
    assert.equal(daysLeft(icse['Nộp toàn văn']), 2);
    assert.equal(daysLeft(icse['Phản hồi phản biện (rebuttal)']), 43);
    assert.equal(daysLeft(icse['Thông báo kết quả']), 68);
    assert.equal(daysLeft(icse['Bản cuối (camera-ready)']), 104);
});

test('chữ đếm ngược nhập tay khớp daysLeft của mốc kế tiếp', () => {
    for (const c of CONFERENCES.filter(x => !x.closed)) {
        assert.ok(c.next.text.startsWith(`Còn ${daysLeft(nextDue(c).at)} ngày`), c.slug);
    }
});

test('icsStart ra giờ UTC dạng ICS', () => {
    assert.equal(icsStart('2026-10-14T18:59:00+07:00'), '20261014T115900Z');
    assert.equal(icsStart('2026-10-14T18:59:00+07:00', 1), '20261014T120000Z');
});

test('urgency có đúng 5 mức', () => {
    assert.deepEqual([-1, 0, 2, 3, 6, 7, 29, 30, 100].map(urgency), ['x', 'c', 'c', 's', 's', 'u', 'u', 'o', 'o']);
});
