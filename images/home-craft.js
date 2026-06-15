(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    if (ns.homeCraftLoaded) return;
    ns.homeCraftLoaded = true;

    function getHomeAnchorOffset() {
        var styles = window.getComputedStyle ? window.getComputedStyle(document.body) : null;
        return styles ? ns.parseCssPx(styles.getPropertyValue('--home-screen-anchor-offset'), 60) : 60;
    }

    // 1. 홈 히어로 배너 내부 해시 링크 인터랙티브 스무스 스크롤 바인딩
    function initHomeHeaderLanding() {
        var body = document.body, links = ns.qsa('#homeHero.home-landing-deck a[href*="#"]');
        if (!body || body.id !== 'tt-body-index' || !links.length) return;

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = link.getAttribute('href') || '', url = null, target = null;
                try { url = new window.URL(href, window.location.href); } catch (err) { return; }
                if (url.origin !== window.location.origin || ns.normalizePath(url.pathname) !== ns.normalizePath(window.location.pathname) || !url.hash) return;

                target = document.getElementById(url.hash.slice(1));
                if (!target) return;
                e.preventDefault();

                ns.scrollToElement(target, getHomeAnchorOffset());
                if (window.history && typeof window.history.replaceState === 'function') window.history.replaceState(null, '', url.hash);
            });
        });
    }

    // 2. 루트 카테고리 독립 페이지 풀레이아웃 어댑터 내비게이션
    function initRootCategoryPageNav() {
        var body = document.body, nav = document.getElementById('ttRootCategoryNav'), backLink = document.getElementById('ttRootCategoryBack');
        var pageBody = nav && nav.parentNode ? nav.parentNode.querySelector('.tPageBody') : null;
        var currentPath = ns.normalizePath(window.location.pathname), match = currentPath.match(/(?:^|\/)pages\/([^/]+)$/), pageSlug = match ? match[1] : '';
        var groups = nav ? ns.qsa('[data-root-category-nav]', nav) : [];
        var activeGroup = null;

        if (!body || !nav || !groups.length) return;

        groups.forEach(function (group) {
            var isMatch = group.getAttribute('data-root-category-nav') === pageSlug;
            group.hidden = !isMatch; if (isMatch) activeGroup = group;
        });

        nav.hidden = !activeGroup; if (backLink) backLink.hidden = !activeGroup;
        body.classList.toggle('is-root-category-page', !!activeGroup);

        if (!activeGroup) {
            body.removeAttribute('data-root-category-page'); if (pageBody) pageBody.hidden = false;
            return;
        }

        body.setAttribute('data-root-category-page', pageSlug);
        if (!pageBody) return;
        var hasContent = /\S/.test(pageBody.textContent || '') || !!pageBody.querySelector('img, iframe, video, table, pre, ul, ol, blockquote');
        pageBody.hidden = !hasContent;
    }

    // 3. 인덱스 화면 방명록 공간 인터랙티브 3D 그래픽 카드 아트워크 감시 (Intersection Observer)
    function initGuestbookCraftAnimation() {
        var container = document.getElementById('homeGuestbookPreview');
        if (!container || !('IntersectionObserver' in window)) return;

        var observer = new window.IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                // 방명록 아트 영역이 화면에 35% 이상 교차 진입할 때 활성 트랜지션 클래스 부여
                if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
                    container.classList.add('is-craft-active');
                } else if (!entry.isIntersecting) {
                    container.classList.remove('is-craft-active');
                }
            });
        }, { threshold: [0, 0.35, 0.7] });

        observer.observe(container);
    }

    ns.ready(function () {
        initHomeHeaderLanding(); initRootCategoryPageNav(); initGuestbookCraftAnimation();
    });
})(window, document);
