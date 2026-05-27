(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    var slice = Array.prototype.slice;

    // 공통 초기화 유틸 매핑 전역 노출
    ns.ready = ns.ready || function (c) { if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', c, { once: true }); } else { c(); } };
    ns.qsa = ns.qsa || function (s, r) { return slice.call((r || document).querySelectorAll(s)); };

    // 외부 링크 유입 및 프리미엄 트래킹 초기화
    if (!ns.wcsLoaded && window.wcs && typeof window.wcs_do === 'function') {
        ns.wcsLoaded = true;
        try { if (typeof window.wcs.inflow === 'function') window.wcs.inflow(window.location.hostname); window.wcs_do(); } catch (e) {}
    }

    // 보안 강화 타겟 가드
    ns.ready(function () {
        document.documentElement.classList.add('js-enabled');
        ns.qsa('a[target="_blank"]').forEach(function (link) {
            var rel = (link.getAttribute('rel') || '').toLowerCase();
            if (rel.indexOf('noopener') === -1) link.setAttribute('rel', (rel ? rel + ' ' : '') + 'noopener');
        });

        // 본문 내 미디어 파일 최적화 지연 주입
        ns.qsa('#ttPostContent img, #article-view img').forEach(function (img) {
            if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
            if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
        });
    });
})(window, document);