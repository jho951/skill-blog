(function (window, document) {
    'use strict';

    var ns = (window.__ttSkin = window.__ttSkin || {});
    var slice = Array.prototype.slice;

    if (ns.themeLoaded) {
        return;
    }

    ns.themeLoaded = true;

    function ready(callback) {
        if (typeof ns.ready === 'function') {
            ns.ready(callback);
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
            return;
        }

        callback();
    }

    function qsa(selector, root) {
        if (typeof ns.qsa === 'function') {
            return ns.qsa(selector, root);
        }

        return slice.call((root || document).querySelectorAll(selector));
    }

    function prefersReducedMotion() {
        return !!(
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
    }

    function setVar(node, name, value) {
        if (value !== undefined && value !== null) {
            node.style.setProperty(name, String(value));
        }
    }

    function setMotionProfile(node, stageId, order) {
        setVar(node, '--motion-order', order);

        if (node.classList.contains('section-intro')) {
            setVar(node, '--motion-y', '18px');
            setVar(node, '--motion-blur', '8px');
            setVar(node, '--motion-delay-base', '0ms');
            return;
        }

        if (stageId === 'homeHero') {
            setVar(node, '--motion-y', node.classList.contains('home-landing-deck__link') ? '26px' : '18px');
            setVar(node, '--motion-blur', '12px');
            setVar(node, '--motion-delay-step', '85ms');
            return;
        }

        if (stageId === 'homeProjects') {
            setVar(node, '--motion-y', '34px');
            setVar(node, '--motion-blur', '16px');
            setVar(node, '--motion-delay-step', '120ms');
            return;
        }

        if (stageId === 'homeAwards') {
            setVar(node, '--motion-y', '26px');
            setVar(node, '--motion-blur', '12px');
            setVar(node, '--motion-delay-step', '130ms');
            return;
        }

        if (stageId === 'homeCategoryHub') {
            setVar(node, '--motion-delay-step', '130ms');
            return;
        }

        if (stageId === 'homeCategoryStack') {
            setVar(node, '--motion-y', '28px');
            setVar(node, '--motion-x', order % 2 ? '56px' : '-56px');
            setVar(node, '--motion-rotate', order % 2 ? '1.2deg' : '-1.2deg');
            setVar(node, '--motion-origin', order % 2 ? '100% 50%' : '0% 50%');
            setVar(node, '--motion-delay-step', '120ms');
            return;
        }

        if (stageId === 'homeGuestbookPreview') {
            setVar(node, '--motion-y', '22px');
            setVar(node, '--motion-blur', '10px');
            return;
        }

        setVar(node, '--motion-y', '24px');
        setVar(node, '--motion-blur', '10px');
    }

    function armUnit(node, stageId, order) {
        if (!node || node.nodeType !== 1) {
            return;
        }

        node.classList.add('home-motion-unit', 'is-armed');
        setMotionProfile(node, stageId, order);
    }

    function revealStage(stage) {
        if (!stage || stage.dataset.motionVisible === 'true') {
            return;
        }

        stage.dataset.motionVisible = 'true';
        stage.classList.add('is-visible');

        qsa('.home-motion-unit', stage).forEach(function (unit) {
            unit.classList.add('is-visible');
        });
    }

    function armStage(config) {
        var stage = document.querySelector(config.selector);
        var order = 0;

        if (!stage || stage.dataset.motionReady === 'true') {
            return null;
        }

        stage.dataset.motionReady = 'true';
        stage.classList.add('home-motion-stage', 'is-armed');

        if (config.motion) {
            stage.setAttribute('data-motion', config.motion);
        }

        config.units.forEach(function (selector) {
            qsa(selector, stage).forEach(function (node) {
                armUnit(node, stage.id || '', order);
                order += 1;
            });
        });

        return stage;
    }

    function initHomeMotion() {
        var pageHome = document.getElementById('pageHome');
        var stages;
        var observer;

        if (!pageHome) {
            return;
        }

        stages = [
            armStage({
                selector: '#homeHero',
                motion: 'hero',
                units: ['.home-landing-deck__copy', '.home-landing-deck__link'],
            }),
            armStage({
                selector: '#homeProjects',
                motion: 'projects',
                units: ['.section-intro', '.project-card'],
            }),
            armStage({
                selector: '#homeAbout',
                motion: 'about',
                units: ['.section-intro', '.about-highlight-card', '.about-metric'],
            }),
            armStage({
                selector: '#homeAwards',
                motion: 'awards',
                units: ['.section-intro', '.award-item'],
            }),
            armStage({
                selector: '#ttLatestFeed',
                motion: 'latest',
                units: ['.section-intro', '.latest-slide'],
            }),
            armStage({
                selector: '#homeCategoryHub',
                motion: 'category-mobile',
                units: ['.section-intro', '.catHubGroup'],
            }),
            armStage({
                selector: '#homeCategoryStack',
                motion: 'category-stack',
                units: ['.section-intro', '.catStackItem'],
            }),
            armStage({
                selector: '#homeExplore',
                motion: 'explore',
                units: ['.section-intro', '.rp4-card'],
            }),
            armStage({
                selector: '#homeGuestbookPreview',
                motion: 'guestbook',
                units: ['.craft-stage-observer', '.craft-info'],
            }),
            armStage({
                selector: '#homeContact',
                motion: 'contact',
                units: ['.news-title', '.news-desc', '.news-card'],
            }),
            armStage({
                selector: '#ttSubscribePromo',
                motion: 'subscribe',
                units: ['.subscribePromo__mock', '.subscribePromo__copy', '.subscribePromo__inner'],
            }),
        ].filter(Boolean);

        if (!stages.length) {
            return;
        }

        if (prefersReducedMotion() || typeof window.IntersectionObserver !== 'function') {
            window.requestAnimationFrame(function () {
                stages.forEach(revealStage);
            });
            return;
        }

        observer = new window.IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
                        return;
                    }

                    revealStage(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -14% 0px',
                threshold: [0, 0.16, 0.32],
            },
        );

        stages.forEach(function (stage) {
            observer.observe(stage);
        });
    }

    function formatCount(value, suffix) {
        return String(Math.round(value)) + (suffix || '');
    }

    function animateMetric(valueNode) {
        var parent = valueNode.closest ? valueNode.closest('.about-metric') : valueNode.parentNode;
        var target = Number(valueNode.getAttribute('data-count-to'));
        var suffix = valueNode.getAttribute('data-count-suffix') || '';
        var duration = 980;
        var startedAt = null;

        if (!isFinite(target) || valueNode.dataset.countReady === 'true') {
            return;
        }

        valueNode.dataset.countReady = 'true';

        if (parent && parent.classList) {
            parent.classList.add('is-counting');
        }

        if (prefersReducedMotion() || typeof window.requestAnimationFrame !== 'function') {
            valueNode.textContent = formatCount(target, suffix);
            if (parent && parent.classList) {
                parent.classList.remove('is-counting');
                parent.classList.add('is-counted');
            }
            return;
        }

        function tick(timestamp) {
            var progress;
            var eased;

            if (startedAt === null) {
                startedAt = timestamp;
            }

            progress = Math.min((timestamp - startedAt) / duration, 1);
            eased = 1 - Math.pow(1 - progress, 3);
            valueNode.textContent = formatCount(target * eased, suffix);

            if (progress < 1) {
                window.requestAnimationFrame(tick);
                return;
            }

            valueNode.textContent = formatCount(target, suffix);

            if (parent && parent.classList) {
                parent.classList.remove('is-counting');
                parent.classList.add('is-counted');
            }
        }

        window.requestAnimationFrame(tick);
    }

    function initMetricCounters() {
        var values = qsa('[data-count-to]');
        var observer;

        if (!values.length) {
            return;
        }

        if (prefersReducedMotion() || typeof window.IntersectionObserver !== 'function') {
            values.forEach(animateMetric);
            return;
        }

        observer = new window.IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
                        return;
                    }

                    animateMetric(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: '0px 0px -18% 0px',
                threshold: [0.2],
            },
        );

        values.forEach(function (value) {
            observer.observe(value);
        });
    }

    ns.sanitizeGuestbookPreviewInfo = function () {
        var preview = document.getElementById('homeGuestbookPreview');

        if (!preview || preview.dataset.sanitized === 'true') {
            return;
        }

        preview.dataset.sanitized = 'true';

        qsa('.craft-scene input, .craft-scene button, .craft-scene a, .craft-scene [tabindex]', preview).forEach(
            function (node) {
                node.setAttribute('tabindex', '-1');
                node.setAttribute('aria-hidden', 'true');
            },
        );
    };

    ready(function () {
        document.documentElement.classList.add('js-enabled');
        ns.sanitizeGuestbookPreviewInfo();
        initHomeMotion();
        initMetricCounters();
    });
})(window, document);
