// tools/probe-overflow.js
// Dán vào console (hoặc javascript_tool) của trình duyệt: cho biết trang có tràn ngang không và phần tử nào gây ra.
(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
        .filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest('.ticker, .lp-art, .hero');
        })
        .slice(0, 8)
        .map(el => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
    return { vw, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > vw, offenders };
})()
