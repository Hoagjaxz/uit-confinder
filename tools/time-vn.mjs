// tools/time-vn.mjs
// Giờ Việt Nam (GMT+7) cho dữ liệu hội nghị. Hàm thuần, chỉ dùng UTC, không dùng múi giờ máy.
export const DAY = 864e5;
const HOUR = 36e5;
export const NOW = Date.UTC(2026, 9, 9); // 09/10/2026: mốc tính "Còn N ngày", dùng chung mọi công cụ sinh trang

const pad = n => String(n).padStart(2, '0');
const vnDate = iso => new Date(Date.parse(iso) + 7 * HOUR); // đọc bằng getUTC*, ra giờ ghi trên đồng hồ ở Việt Nam

export const formatVN = iso => {
    const d = vnDate(iso);
    return { time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`, date: `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}` };
};

export const daysLeft = (iso, now = NOW) => {
    const d = vnDate(iso);
    return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - now) / DAY);
};

// "YYYYMMDDTHHMMSSZ" của thời điểm iso cộng thêm `minutes` phút.
export const icsStart = (iso, minutes = 0) => new Date(Date.parse(iso) + minutes * 6e4).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

export const urgency = days => (days < 0 ? 'x' : days < 3 ? 'c' : days < 7 ? 's' : days < 30 ? 'u' : 'o');

// Mốc đang đếm ngược: hội nghị đã đóng thì mốc `closedLabel`, còn lại là mốc có hạn đầu tiên chưa qua.
export const nextDue = c => c.closed
    ? c.milestones.find(m => m.name === c.closedLabel)
    : c.milestones.find(m => m.at && daysLeft(m.at) >= 0);
