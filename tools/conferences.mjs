// tools/conferences.mjs
// Dữ liệu MINH HOẠ cho 6 hội nghị trong lịch. Ngày là "hạn AoE" (ISO); giờ Việt Nam và "Còn N ngày" được tính tự động.
// Mốc "next" có chữ đếm ngược nhập tay (c.next) vì hiển thị cả giờ phút.
export const CONFERENCES = [
    {
        slug: 'icse', file: 'hoi-nghi.html', name: 'ICSE', year: '2027',
        full: 'IEEE/ACM International Conference on Software Engineering',
        core: 'CORE A*', ccf: 'CCF A', format: 'Hybrid', fields: ['Kỹ thuật phần mềm'],
        place: 'Lisbon, Bồ Đào Nha', dates: '18–24/04/2027', level: 'c', updated: '05/10/2026',
        next: { text: 'Còn 2 ngày 04:12', d: '02', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-09-25' },
            { name: 'Nộp toàn văn', date: '2026-10-10' },
            { name: 'Phản hồi phản biện (rebuttal)', date: '2026-11-20' },
            { name: 'Thông báo kết quả', date: '2026-12-15' },
            { name: 'Bản cuối (camera-ready)', date: '2027-01-20' },
            { name: 'Hội nghị diễn ra', range: '18–24/04/2027' },
        ],
    },
    {
        slug: 'fse', file: 'hoi-nghi-fse.html', name: 'FSE', year: '2027',
        full: 'ACM International Conference on the Foundations of Software Engineering',
        core: 'CORE A*', ccf: 'CCF A', format: 'Offline', fields: ['Kỹ thuật phần mềm'],
        place: 'Singapore', dates: '05–09/07/2027', level: 's', updated: '05/10/2026',
        next: { text: 'Còn 5 ngày 11:30', d: '05', h: '11', m: '30', s: '00' },
        milestones: [
            { name: 'Nộp toàn văn (đợt 1)', date: '2026-09-15' },
            { name: 'Nộp toàn văn (đợt 2)', date: '2026-10-13' },
            { name: 'Thông báo kết quả', date: '2026-12-20' },
            { name: 'Bản cuối (camera-ready)', date: '2027-02-25' },
            { name: 'Hội nghị diễn ra', range: '05–09/07/2027' },
        ],
    },
    {
        slug: 'acl', file: 'hoi-nghi-acl.html', name: 'ACL', year: '2027',
        full: 'Annual Meeting of the Association for Computational Linguistics',
        core: 'CORE A*', ccf: 'CCF A', format: 'Online', fields: ['Trí tuệ nhân tạo', 'Xử lý ngôn ngữ'],
        place: 'Trực tuyến', dates: '12–17/07/2027', level: 'u', updated: '05/10/2026',
        next: { text: 'Còn 18 ngày', d: '18', h: '04', m: '12', s: '00' },
        milestones: [
            { name: 'Nộp bài (ARR)', date: '2026-10-26' },
            { name: 'Thông báo kết quả', date: '2027-02-15' },
            { name: 'Bản cuối (camera-ready)', date: '2027-03-10' },
            { name: 'Hội nghị diễn ra', range: '12–17/07/2027' },
        ],
    },
    {
        slug: 'ase', file: 'hoi-nghi-ase.html', name: 'ASE', year: '2027',
        full: 'IEEE/ACM International Conference on Automated Software Engineering',
        core: 'CORE A', ccf: 'CCF A', format: 'Online', fields: ['Kỹ thuật phần mềm'],
        place: 'Trực tuyến', dates: '09–13/11/2027', level: 'o', updated: '05/10/2026',
        next: { text: 'Còn 41 ngày', d: '41', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-11-18' },
            { name: 'Nộp toàn văn', date: '2026-11-25' },
            { name: 'Thông báo kết quả', date: '2027-02-10' },
            { name: 'Bản cuối (camera-ready)', date: '2027-04-01' },
            { name: 'Hội nghị diễn ra', range: '09–13/11/2027' },
        ],
    },
    {
        slug: 'iclr', file: 'hoi-nghi-iclr.html', name: 'ICLR', year: '2027',
        full: 'International Conference on Learning Representations',
        core: 'CORE A*', ccf: null, format: 'Hybrid', fields: ['Trí tuệ nhân tạo'],
        place: 'Vienna, Áo', dates: '27/04–01/05/2027', level: 'o', updated: '05/10/2026',
        next: { text: 'Còn 62 ngày', d: '62', h: '04', m: '12', s: '09' },
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-12-09' },
            { name: 'Nộp toàn văn', date: '2026-12-16' },
            { name: 'Thông báo kết quả', date: '2027-02-01' },
            { name: 'Bản cuối (camera-ready)', date: '2027-03-15' },
            { name: 'Hội nghị diễn ra', range: '27/04–01/05/2027' },
        ],
    },
    {
        slug: 'neurips', file: 'hoi-nghi-neurips.html', name: 'NeurIPS', year: '2026',
        full: 'Conference on Neural Information Processing Systems',
        core: 'CORE A*', ccf: 'CCF A', format: 'Offline', fields: ['Trí tuệ nhân tạo'],
        place: 'Sydney, Úc', dates: '06–12/12/2026', level: 'x', closed: true, closedLabel: 'Nộp toàn văn', updated: '05/10/2026',
        milestones: [
            { name: 'Đăng ký tóm tắt', date: '2026-05-08' },
            { name: 'Nộp toàn văn', date: '2026-05-15' },
            { name: 'Thông báo kết quả', date: '2026-09-25' },
            { name: 'Hội nghị diễn ra', range: '06–12/12/2026' },
        ],
    },
];
