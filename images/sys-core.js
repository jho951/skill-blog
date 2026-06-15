(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    var slice = Array.prototype.slice;

    ns.ready = ns.ready || function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
            return;
        }

        callback();
    };

    ns.qs = ns.qs || function (selector, root) {
        return (root || document).querySelector(selector);
    };

    ns.qsa = ns.qsa || function (selector, root) {
        return slice.call((root || document).querySelectorAll(selector));
    };

    ns.isElement = ns.isElement || function (node) {
        return !!(node && node.nodeType === 1);
    };

    ns.forEachNode = ns.forEachNode || function (nodes, callback) {
        if (!nodes) return;
        Array.prototype.forEach.call(nodes, callback);
    };

    ns.normalizePath = ns.normalizePath || function (pathname) {
        return (pathname || '/').replace(/\/+$/, '').toLowerCase() || '/';
    };

    ns.normalizeSearchValue = ns.normalizeSearchValue || function (value) {
        return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    ns.slugify = ns.slugify || function (text) {
        return (text || '')
            .toLowerCase()
            .replace(/<[^>]+>/g, '')
            .replace(/[^\w\u3131-\uD79D]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';
    };

    ns.parseCssPx = ns.parseCssPx || function (value, fallback) {
        var parsed = parseFloat(value);
        return isFinite(parsed) ? parsed : fallback;
    };

    ns.prefersReducedMotion = ns.prefersReducedMotion || function () {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    ns.isDesktop = ns.isDesktop || function () {
        return window.matchMedia ? window.matchMedia('(min-width: 1024px)').matches : window.innerWidth >= 1024;
    };

    ns.requestFrame = ns.requestFrame || function (callback) {
        if (typeof window.requestAnimationFrame === 'function') {
            return window.requestAnimationFrame(callback);
        }

        return window.setTimeout(callback, 16);
    };

    ns.listenMedia = ns.listenMedia || function (query, callback) {
        var media = window.matchMedia ? window.matchMedia(query) : null;
        var handler;

        if (!media || typeof callback !== 'function') {
            return null;
        }

        handler = function (event) {
            callback(event || media);
        };

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handler);
            return function () { media.removeEventListener('change', handler); };
        }

        if (typeof media.addListener === 'function') {
            media.addListener(handler);
            return function () { media.removeListener(handler); };
        }

        return null;
    };

    ns.getStorage = ns.getStorage || function (key, fallback) {
        try {
            var value = window.localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (e) {
            return fallback;
        }
    };

    ns.setStorage = ns.setStorage || function (key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    };

    ns.setStyleVar = ns.setStyleVar || function (node, name, value) {
        if (!node || !node.style || value === undefined || value === null) return;
        node.style.setProperty(name, String(value));
    };

    ns.setExpanded = ns.setExpanded || function (toggle, expanded) {
        if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    ns.setHidden = ns.setHidden || function (node, hidden) {
        if (!node) return;
        node.hidden = !!hidden;
        node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    };

    ns.scrollToElement = ns.scrollToElement || function (target, offset, behavior) {
        if (!target || typeof window.scrollTo !== 'function') return;

        window.scrollTo({
            top: Math.max(0, target.getBoundingClientRect().top + (window.pageYOffset || window.scrollY || 0) - (offset || 0)),
            behavior: behavior || 'smooth'
        });
    };

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
