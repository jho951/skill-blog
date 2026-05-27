(function (window, document) {
    'use strict';
    var ns = (window.__ttSkin = window.__ttSkin || {});
    if (ns.articleUtilsLoaded) return;
    ns.articleUtilsLoaded = true;

    function slugify(text) { return (text || '').toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\w\u3131-\uD79D]+/g, '-').replace(/^-+|-+$/g, '') || 'section'; }

    // 본문 전용 자동 목차(TOC) 추적기 생성 빌더
    function initArticleToc() {
        var toc = document.getElementById('ttArticleToc'), nav = document.getElementById('ttArticleTocNav'), content = document.getElementById('ttPostContent');
        if (!toc || !nav || !content) return;
        var headings = typeof ns.qsa === 'function' ? ns.qsa('h2, h3', content) : Array.prototype.slice.call(content.querySelectorAll('h2, h3'));
        if (!headings.length) { toc.hidden = true; return; }

        var usedIds = {}, links = [], fragment = document.createDocumentFragment();
        headings.forEach(function (heading) {
            var baseId = heading.id || slugify(heading.textContent), nextId = baseId, index = 2;
            while (usedIds[nextId] || (document.getElementById(nextId) && document.getElementById(nextId) !== heading)) { nextId = baseId + '-' + index; index++; }
            usedIds[nextId] = true; heading.id = nextId;

            var link = document.createElement('a'); link.className = 'article-toc-link lvl-' + heading.tagName.slice(1); link.href = '#' + nextId; link.textContent = heading.textContent.trim(); link.dataset.targetId = nextId;
            fragment.appendChild(link); links.push(link);
        });
        nav.innerHTML = ''; nav.appendChild(fragment); toc.hidden = false;

        function syncActive() {
            var currentId = headings[0].id;
            headings.forEach(function (h) { if (h.getBoundingClientRect().top <= 160) currentId = h.id; });
            links.forEach(function (link) {
                var isActive = link.dataset.targetId === currentId; link.classList.toggle('is-active', isActive);
                if (isActive) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
            });
        }

        nav.addEventListener('click', function (e) {
            var target = e.target; if (!target || !target.classList.contains('article-toc-link')) return;
            var heading = document.getElementById(target.dataset.targetId); if (!heading) return;
            e.preventDefault();
            if (typeof window.scrollTo === 'function') window.scrollTo({ top: (window.pageYOffset || window.scrollY) + heading.getBoundingClientRect().top - 80, behavior: 'smooth' });
        });

        window.addEventListener('scroll', syncActive, { passive: true });
        syncActive();
    }

    // 데스크탑 전용 사이드바 영역 댓글 폼 컴포넌트 이주 가드
    function initCommentDock() {
        var bottom = document.getElementById('ttArticleCommentBottom'), slot = document.getElementById('ttArticleCommentFormSlot');
        if (!bottom || !slot) return;
        var container = bottom.querySelector('.tt-comment-cont'); if (!container) return;
        var form = container.querySelector('form'); if (!form) return;

        var anchor = document.createComment('tt-comment-form-anchor'), replyBlock = container.querySelector('.tt-area-reply');
        container.insertBefore(anchor, replyBlock || null);

        function syncPlacement() {
            var isDesktop = typeof ns.isDesktop === 'function' ? ns.isDesktop() : window.matchMedia('(min-width: 1024px)').matches;
            if (isDesktop) {
                if (!slot.contains(form)) slot.appendChild(form); container.classList.add('is-form-docked');
            } else {
                if (anchor.parentNode === container) container.insertBefore(form, anchor.nextSibling);
                container.classList.remove('is-form-docked');
            }
        }
        if (typeof ns.listenMedia === 'function') ns.listenMedia('(min-width: 1024px)', syncPlacement);
        syncPlacement();
    }

    if (typeof ns.ready === 'function') {
        ns.ready(function () { initArticleToc(); initCommentDock(); });
    }
})(window, document);