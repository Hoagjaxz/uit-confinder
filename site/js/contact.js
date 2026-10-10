// Form liên hệ: trình duyệt tự kiểm tra các trường bắt buộc; ở đây chỉ báo kết quả, chưa gửi đi đâu.
(() => {
    const form = document.getElementById('contact-form');
    const msg = document.getElementById('contact-msg');
    if (!form || !msg) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        msg.textContent = 'Cảm ơn bạn. Biểu mẫu mới chỉ kiểm tra trên trình duyệt, chưa gửi đi đâu.';
        form.reset();
    });
})();
