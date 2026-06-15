(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    var HIDE_SELECTOR = [
        '#bnr',
        '#ttTopAd',
        '#ttBackdropAdSlotArticle',
        '#ttBackdropAdSlotList',
        '.tt-backdrop-ad-shell',
        '.tt-backdrop-ad-center',
        '.backdrop-ad-slot',
        '.google-auto-placed',
        'ins.adsbygoogle',
        'iframe[id^="google_ads_iframe"]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="googlesyndication.com"]',
        '[data-crto-id]',
        'a[href*="cat.jp2.as.criteo.com"]',
        'a[href*="adclick.g.doubleclick.net"]'
    ].join(', ');
    var SIGNAL_SELECTOR = [
        '[data-crto-id]',
        'a[href*="cat.jp2.as.criteo.com"]',
        'a[href*="adclick.g.doubleclick.net"]',
        'iframe[id^="google_ads_iframe"]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="googlesyndication.com"]',
        'ins.adsbygoogle',
        'script[src*="criteo.com"]',
        'script[src*="doubleclick.net"]',
        'script[src*="googlesyndication.com"]'
    ].join(', ');
    var ROOT_SELECTOR = [
        '#bnr',
        '#ttTopAd',
        '#ttBackdropAdSlotArticle',
        '#ttBackdropAdSlotList',
        '.tt-backdrop-ad-shell',
        '.tt-backdrop-ad-center',
        '.backdrop-ad-slot',
        '.google-auto-placed',
        '.ad-wrapper',
        'ins.adsbygoogle'
    ].join(', ');
    var URL_PATTERNS = [/criteo\.com/i, /doubleclick\.net/i, /googlesyndication\.com/i, /googleadservices\.com/i, /googletagservices\.com/i];

    if (ns.adGuardLoaded) return;
    ns.adGuardLoaded = true;

    function matchesAdUrl(value) { return !value ? false : URL_PATTERNS.some(function (p) { return p.test(value); }); }

    function ensureHideStyle() {
        if (document.getElementById('ttAdGuardStyle')) return;
        var style = document.createElement('style');
        style.id = 'ttAdGuardStyle';
        style.textContent = HIDE_SELECTOR + '{display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important;}';
        (document.head || document.documentElement).appendChild(style);
    }

    function hasAdSignals(node) {
        if (!ns.isElement(node)) return false;
        if (node.id === 'bnr' || (node.matches && node.matches(HIDE_SELECTOR))) return true;
        if (node.hasAttribute('data-crto-id') || matchesAdUrl(node.getAttribute('src')) || matchesAdUrl(node.getAttribute('href'))) return true;
        return !!(node.querySelector && node.querySelector(SIGNAL_SELECTOR));
    }

    function removeAdNode(node) {
        if (!ns.isElement(node)) return;
        var current = node, root = node;
        while (current && current !== document.body && current !== document.documentElement) {
            if ((current.matches && current.matches(ROOT_SELECTOR)) || current.id === 'bnr') { root = current; break; }
            current = current.parentElement;
        }
        if (!ns.isElement(root) || root.dataset.ttAdGuardRemoved === 'true') return;
        root.dataset.ttAdGuardRemoved = 'true';
        root.hidden = true;
        root.setAttribute('aria-hidden', 'true');
        root.style.setProperty('display', 'none', 'important');
        if (root.parentNode) root.parentNode.removeChild(root);
    }

    function scan(root) {
        if (!root) return;
        if (ns.isElement(root) && hasAdSignals(root)) { removeAdNode(root); return; }
        if (!root.querySelectorAll) return;
        ns.qsa(HIDE_SELECTOR, root).forEach(removeAdNode);
        ns.qsa(SIGNAL_SELECTOR, root).forEach(removeAdNode);
    }

    ensureHideStyle();
    scan(document);

    if ('MutationObserver' in window && document.documentElement) {
        var observer = new window.MutationObserver(function (mutations) {
            mutations.forEach(function (m) { ns.forEachNode(m.addedNodes, scan); });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
})(window, document);
