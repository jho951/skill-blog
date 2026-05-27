(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    if (ns.blogUiLoaded) return;
    ns.blogUiLoaded = true;

    function normalizeSearchValue(value) { return (value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
    function normalizePath(pathname) { return (pathname || '/').replace(/\/+$/, '').toLowerCase(); }

    // 1. 리스트 뷰 전환 제어부 (List vs Card)
    function initListViewToggle() {
        var pageList = document.getElementById('pageList');
        var buttons = typeof ns.qsa === 'function' ? ns.qsa('#pageList .view-btn[data-view]') : Array.prototype.slice.call(document.querySelectorAll('#pageList .view-btn[data-view]'));
        if (!pageList || !buttons.length) return;

        function applyView(view) {
            pageList.setAttribute('data-view', view);
            buttons.forEach(function (btn) {
                var isActive = btn.getAttribute('data-view') === view;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
            try { window.localStorage.setItem('tt:list-view', view); } catch (e) {}
        }
        var initialView = (function() { try { return window.localStorage.getItem('tt:list-view'); } catch(e) { return 'list'; } })() || 'list';
        applyView(initialView);
        buttons.forEach(function (btn) { btn.addEventListener('click', function () { applyView(btn.getAttribute('data-view')); }); });
    }

    // 2. 테크 라이트 마키 뷰포트 & 터치/마우스 드래그 가속도 물리 스크롤
    function initLatestViewport() {
        var viewport = document.getElementById('ttLatestViewport'), track = document.getElementById('ttLatestTrack');
        var prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        if (!viewport || !track || !track.children.length) return;

        // 마키 무한 롤링 모드 (홈 화면 상단 배너 피드)
        if (viewport.closest('#ttLatestFeed.latest--pagesNav')) {
            var originalSlides = typeof ns.qsa === 'function' ? ns.qsa('.latest-slide:not([data-marquee-clone="true"])', track) : Array.prototype.slice.call(track.querySelectorAll('.latest-slide:not([data-marquee-clone="true"])'));
            if (!originalSlides.length) return;
            if (!track.hasAttribute('data-marquee-ready')) {
                originalSlides.forEach(function (slide) {
                    var clone = slide.cloneNode(true);
                    clone.setAttribute('data-marquee-clone', 'true');
                    clone.setAttribute('aria-hidden', 'true');
                    track.appendChild(clone);
                });
                track.setAttribute('data-marquee-ready', 'true');
            }
            var syncMarquee = function () {
                var orig = track.querySelector('.latest-slide:not([data-marquee-clone="true"])');
                var clone = track.querySelector('.latest-slide[data-marquee-clone="true"]');
                if (!orig || !clone) return;
                var dist = Math.max(clone.offsetLeft - orig.offsetLeft, 0);
                if (!dist) return;
                track.style.setProperty('--latest-marquee-distance', dist + 'px');
                track.style.setProperty('--latest-marquee-duration', Math.max(18, Math.round(dist / 32)) + 's');
                track.classList.add('is-marquee-ready');
            };
            window.addEventListener('resize', syncMarquee);
            syncMarquee();
            return;
        }

        // 포인터 드래그 및 마우스 휠 트래킹 스크롤 (자유 캐러셀 모드)
        var pId = null, isDragging = false, startX = 0, startLeft = 0;
        viewport.setAttribute('tabindex', '0'); viewport.style.touchAction = 'pan-y';

        viewport.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            pId = e.pointerId; isDragging = true; startX = e.clientX; startLeft = viewport.scrollLeft;
            viewport.classList.add('is-dragging'); if (typeof viewport.setPointerCapture === 'function') viewport.setPointerCapture(pId);
        });
        viewport.addEventListener('pointermove', function (e) { if (isDragging) viewport.scrollLeft = startLeft - (e.clientX - startX); });
        var release = function () { isDragging = false; viewport.classList.remove('is-dragging'); if (pId !== null && typeof viewport.releasePointerCapture === 'function') viewport.releasePointerCapture(pId); };
        viewport.addEventListener('pointerup', release); viewport.addEventListener('pointercancel', release);
    }

    // 3. 실시간 인프라 기반 인메모리 필터 검색 시스템
    function initListSearch() {
        var toggle = document.getElementById('ttListSearchToggle'), panel = document.getElementById('ttListSearchPanel'), input = document.getElementById('ttListSearchInput'), clear = document.getElementById('ttListSearchClear'), meta = document.getElementById('ttListSearchMeta');
        var cards = typeof ns.qsa === 'function' ? ns.qsa('#pageList .list-card') : Array.prototype.slice.call(document.querySelectorAll('#pageList .list-card'));
        if (!toggle || !panel || !input || !cards.length) return;

        cards.forEach(function (card) {
            var t = card.querySelector('.card-title'), c = card.querySelector('.badge'), b = card.querySelector('.card-body');
            card.setAttribute('data-search', normalizeSearchValue([t ? t.textContent : '', c ? c.textContent : '', b ? b.textContent : ''].join(' ')));
        });

        toggle.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) window.requestAnimationFrame(function () { input.focus(); });
        });

        input.addEventListener('input', function () {
            var query = normalizeSearchValue(input.value), visibleCount = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '', isMatch = !query || haystack.indexOf(query) !== -1;
                card.hidden = !isMatch; if (isMatch) visibleCount += 1;
            });
            if (clear) { clear.hidden = !query; clear.disabled = !query; }
            if (meta) meta.textContent = !query ? '총 ' + cards.length + '개의 글' : '"' + query + '" 검색 결과 ' + visibleCount + '개';
        });
    }

    // 4. 동적 카테고리 서브 탭 동선 매핑
    function initListCategoryTabs() {
        var nav = document.getElementById('ttListCategoryTabs'), currentPath = normalizePath(window.location.pathname);
        if (!nav) return;
        var subcategoryMap = {
            computerscience: [{ slug: 'datastructure', label: 'DataStructure', path: '/category/computerscience/datastructure' }, { slug: 'algorithm', label: 'Algorithm', path: '/category/computerscience/algorithm' }, { slug: 'network', label: 'Network', path: '/category/computerscience/network' }, { slug: 'os', label: 'OS', path: '/category/computerscience/os' }],
            development: [{ slug: 'language', label: 'Language', path: '/category/development/language' }, { slug: 'framework', label: 'Framework', path: '/category/development/framework' }, { slug: 'infra', label: 'Infra', path: '/category/development/infra' }, { slug: 'database', label: 'Database', path: '/category/development/database' }, { slug: 'tool', label: 'Tool', path: '/category/development/tool' }]
        };
        var match = currentPath.match(/^\/category(?:\/([^/]+))?/);
        var rootSlug = match && match[1] ? match[1].toLowerCase() : '';
        var tabs = rootSlug && subcategoryMap[rootSlug] ? subcategoryMap[rootSlug] : [];

        nav.innerHTML = '';
        tabs.forEach(function (tab) {
            var link = document.createElement('a'), linkPath = normalizePath(tab.path);
            var isActive = currentPath === linkPath || currentPath.indexOf(linkPath + '/') === 0;
            link.className = 'list-subcategory-tab'; link.href = tab.path; link.textContent = tab.label;
            link.classList.toggle('is-active', isActive); if (isActive) link.setAttribute('aria-current', 'page');
            nav.appendChild(link);
        });
    }

    // 5. RSS 데이터 파싱 기반 카테고리 무작위 탐색 (Random Post Box)
    function initRandomPostBox() {
        var cache = {};
        var cards = typeof ns.qsa === 'function' ? ns.qsa('.rp4-card[data-rss][data-list]') : Array.prototype.slice.call(document.querySelectorAll('.rp4-card[data-rss][data-list]'));
        if (!cards.length) return;

        function parseFeed(text) {
            if (!window.DOMParser) return [];
            var parser = new window.DOMParser(), xml = parser.parseFromString(text, 'text/xml');
            return Array.prototype.map.call(xml.querySelectorAll('item > link'), function (node) { return (node.textContent || '').trim(); }).filter(Boolean);
        }

        function activate(card) {
            if (card.getAttribute('aria-busy') === 'true') return;
            var rssUrl = card.getAttribute('data-rss'), fallbackUrl = card.getAttribute('data-list');
            card.setAttribute('aria-busy', 'true');

            if (cache[rssUrl]) {
                var links = cache[rssUrl];
                window.location.href = links.length ? links[Math.floor(Math.random() * links.length)] : fallbackUrl;
                return;
            }

            if (!window.fetch) { window.location.href = fallbackUrl; return; }
            window.fetch(rssUrl, { credentials: 'same-origin' })
                .then(function (res) { if (!res.ok) throw new Error(); return res.text(); })
                .then(function (text) {
                    var links = parseFeed(text); cache[rssUrl] = links;
                    window.location.href = links.length ? links[Math.floor(Math.random() * links.length)] : fallbackUrl;
                })
                .catch(function () { window.location.href = fallbackUrl; });
        }

        cards.forEach(function (card) {
            card.addEventListener('click', function () { activate(card); });
            card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(card); } });
        });
    }

    // 6. 상단 유틸리티 레이어 토글
    function initHeaderPanel() {
        var header = document.getElementById('capsuleHeader'), toggle = document.getElementById('ttHeaderToggle'), panel = document.getElementById('ttHeaderPanel'), backdrop = document.getElementById('ttHeaderBackdrop');
        if (!header || !toggle || !panel) return;

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            header.classList.toggle('is-expanded', !isExpanded);
            toggle.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
            panel.hidden = isExpanded;
            if (backdrop) { backdrop.hidden = isExpanded; backdrop.classList.toggle('is-active', !isExpanded); }
        });
    }

    if (typeof ns.ready === 'function') {
        ns.ready(function () {
            initListViewToggle(); initLatestViewport(); initListSearch(); initListCategoryTabs(); initRandomPostBox(); initHeaderPanel();
        });
    }
})(window, document);