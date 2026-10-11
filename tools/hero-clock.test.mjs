// tools/hero-clock.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { LEVELS } from './levels.mjs';
import { formatVN, daysLeft, urgency, NOW_AT } from './time-vn.mjs';

const H = createRequire(import.meta.url)('../site/js/hero-clock.js');
const { format, spoken, remaining, phase, clockOffset, level, vnParts, order, ticks, head, block, announce } = H;
const DAY = 86400;
const at = iso => Date.parse(iso);

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

test('phân loại trạng thái theo ngưỡng 1 ngày và 0', () => {
    assert.equal(phase(2 * DAY), 'far');
    assert.equal(phase(DAY), 'far'); // đúng 24 giờ vẫn còn cả ngày
    assert.equal(phase(DAY - 1), 'soon');
    assert.equal(phase(1), 'soon');
    assert.equal(phase(0), 'expired');
    assert.equal(phase(-1), 'expired');
});

test('giây còn lại làm tròn lên: chưa hết hạn thì chưa về 0', () => {
    const d = at('2026-10-11T18:59:00+07:00');
    assert.equal(remaining(d, d - 187929000), 187929);
    assert.equal(remaining(d, d - 400), 1);
    assert.equal(remaining(d, d), 0);
    assert.equal(remaining(d, d + 5000), -5);
});

test('độ lệch giờ máy: lấy serverNow trừ giờ máy, vắng hoặc sai thì 0', () => {
    const device = at('2026-10-09T08:00:00Z');
    assert.equal(clockOffset('2026-10-09T08:00:30Z', device), 30000);
    assert.equal(clockOffset('2026-10-09T15:00:00+07:00', device), 0);
    assert.equal(clockOffset('2026-10-09T08:00:00Z', device + 5000), -5000);
    assert.equal(clockOffset(undefined, device), 0);
    assert.equal(clockOffset('không phải ngày', device), 0);
});

test('hạn đã qua được xếp vào nhóm đóng, hạn còn mở xếp tăng dần; JS tự sắp lại', () => {
    const now = at('2026-10-12T00:00:00+07:00');
    const items = [
        { id: 'iclr', deadline: at('2026-12-10T18:59:00+07:00') },
        { id: 'icse', deadline: at('2026-10-11T18:59:00+07:00') },
        { id: 'fse', deadline: at('2026-10-14T18:59:00+07:00') },
        { id: 'neurips', deadline: at('2026-05-16T18:59:00+07:00') },
    ];
    const { open, closed } = order(items, now);
    assert.deepEqual(open.map(i => i.id), ['fse', 'iclr']);
    assert.deepEqual(closed.map(i => i.id), ['icse', 'neurips']); // mới qua nhất đứng trước
    assert.equal(open[0], items[2]); // hội nghị kế tiếp sau ICSE là FSE
});

test('hạn đúng bằng giờ hiện tại thì đã hết hạn, không còn mở', () => {
    const d = at('2026-10-11T18:59:00+07:00');
    assert.equal(order([{ deadline: d }], d).open.length, 0);
    assert.equal(order([{ deadline: d }], d - 1).open.length, 1);
});

test('danh sách rỗng hoặc toàn hạn đã qua: không còn hội nghị nào mở', () => {
    assert.deepEqual(order([], NOW_AT), { open: [], closed: [] });
    assert.equal(order([{ deadline: NOW_AT - 1 }], NOW_AT).open.length, 0);
    const v = head({ phase: 'none' });
    assert.match(v.h1, /^<span class="hl">Hiện chưa có hội nghị nào mở nhận&nbsp;bài\. Xem lịch để biết đợt tiếp&nbsp;theo\.<\/span>$/);
    assert.equal(v.ticks, '');
    assert.equal(v.sub, '');
    assert.match(block({ phase: 'none' }), /data-state="none"[\s\S]*class="ticks" hidden/);
});

test('mức khẩn khớp ngưỡng của time-vn.mjs với mọi mốc minh hoạ', () => {
    for (const iso of ['2026-10-09T23:00:00+07:00', '2026-10-11T18:59:00+07:00', '2026-10-14T18:59:00+07:00', '2026-10-27T18:59:00+07:00', '2026-11-19T18:59:00+07:00', '2026-12-10T18:59:00+07:00']) {
        assert.equal(level(at(iso), NOW_AT), urgency(daysLeft(iso)), iso);
    }
    assert.equal(level(NOW_AT, NOW_AT), 'x');
    assert.deepEqual(H.LV, Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [k, v.label])));
});

test('giờ Việt Nam khớp formatVN', () => {
    const iso = '2026-10-11T18:59:00+07:00';
    assert.deepEqual(vnParts(at(iso)), { ...formatVN(iso), dm: '11/10' });
    assert.equal(vnParts(at('2026-10-11T23:30:00Z')).date, '12/10/2026'); // qua nửa đêm giờ Việt Nam
});

test('15 vạch mốc ngày: đã qua, hôm nay, còn lại', () => {
    const opens = at('2026-09-26T18:59:00+07:00'), deadline = at('2026-10-11T18:59:00+07:00');
    assert.equal(ticks(opens, deadline, NOW_AT).join(''), 'pppppppppppptff'); // ngày thứ 13 trong 15 ngày
    assert.equal(ticks(opens, deadline, opens - 1).join(''), 'f'.repeat(15));
    assert.equal(ticks(opens, deadline, opens).join(''), 't' + 'f'.repeat(14));
    assert.equal(ticks(opens, deadline, deadline).join(''), 'p'.repeat(15));
});

test('trạng thái dưới 24 giờ: viên nang khẩn kèm câu chữ "Sắp hết hạn"', () => {
    const base = { name: 'ICSE', href: 'hoi-nghi.html', label: 'Nộp toàn văn', iso: '2026-10-11T18:59:00+07:00', opensIso: '2026-09-26T18:59:00+07:00', deadline: at('2026-10-11T18:59:00+07:00'), opens: at('2026-09-26T18:59:00+07:00') };
    const soon = head({ ...base, phase: 'soon', sec: 5 * 3600 + 12 * 60 + 9, now: NOW_AT });
    assert.match(soon.h1, /class="cap is-urgent"/);
    assert.doesNotMatch(soon.sub, /Sắp hết hạn/); // chữ trạng thái chỉ nằm ở câu động, không lặp ở dòng mốc
    assert.match(soon.h1, /^<span class="hl">Sắp hết hạn: <a href="hoi-nghi.html">ICSE<\/a> chỉ&nbsp;còn<\/span>/);
    assert.doesNotMatch(soon.h1, /ngày/); // bỏ phần ngày
    const far = head({ ...base, phase: 'far', sec: 187929, now: NOW_AT });
    assert.doesNotMatch(far.h1, /is-urgent/);
    assert.match(far.h1, /<span class="vh">2 ngày<\/span>/);
    assert.match(far.h1, /^<span class="hl">Hạn gần nhất: <a href="hoi-nghi.html">ICSE<\/a>,&nbsp;còn<\/span>/);
    assert.equal(far.sub, 'Nộp toàn văn trước 18:59 ngày 11/10/2026 (giờ Việt Nam)');
});

test('hết hạn khi đang xem: một câu nêu hội nghị kế tiếp, thông báo đọc đúng câu đó', () => {
    const m = { phase: 'expired', name: 'ICSE', href: 'hoi-nghi.html', next: { name: 'FSE', deadline: at('2026-10-14T18:59:00+07:00') } };
    assert.equal(head(m).h1, '<span class="hl"><a href="hoi-nghi.html">ICSE</a> đã hết hạn nộp&nbsp;bài. Hạn&nbsp;kế&nbsp;tiếp là FSE,&nbsp;ngày&nbsp;14/10.</span>');
    assert.equal(head(m).sub, '');
    assert.match(block(m), /<p class="hero-sub" hidden><\/p>/);
    assert.equal(announce(m), 'ICSE đã hết hạn nộp bài. Hạn kế tiếp là FSE, ngày 14/10.');
    assert.match(head({ ...m, next: null }).h1, /đã hết hạn nộp&nbsp;bài\. Hiện chưa có hội nghị nào mở nhận&nbsp;bài\.<\/span>$/);
    assert.match(announce({ ...m, next: null }), /Hiện chưa có hội nghị nào mở nhận bài\./);
    assert.equal(announce({ phase: 'soon', name: 'ICSE' }), 'Sắp hết hạn: ICSE còn dưới 24 giờ.');
    assert.equal(announce({ phase: 'far', name: 'ICSE' }), ''); // trạng thái không đổi thì không đọc gì
});

test('báo "Sắp hết hạn" khi vừa chuyển sang hội nghị kế đã dưới 24 giờ, không báo khi tải trang hay còn xa', () => {
    const { shouldAnnounceSoon, SWITCHED } = H;
    assert.equal(shouldAnnounceSoon(SWITCHED, 'soon', 'X'), true);     // vừa chuyển hội nghị, hội nghị kế dưới 24 giờ
    assert.equal(shouldAnnounceSoon('farX', 'soon', 'X'), true);       // cùng hội nghị, từ còn xa sang dưới 24 giờ
    assert.equal(shouldAnnounceSoon('farY', 'soon', 'X'), false);      // khóa của hội nghị khác
    assert.equal(shouldAnnounceSoon('', 'soon', 'X'), false);          // tải trang
    assert.equal(shouldAnnounceSoon(SWITCHED, 'far', 'X'), false);     // hội nghị kế còn xa: câu hero mới không vào vùng live
});

test('tên hội nghị từ dữ liệu được thoát ký tự HTML', () => {
    const v = head({ phase: 'expired', name: '<b>"X"</b>', href: 'a"b.html', next: null });
    assert.doesNotMatch(v.h1, /<b>/);
    assert.match(v.h1, /&lt;b&gt;&quot;X&quot;&lt;\/b&gt;/);
});
