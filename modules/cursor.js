import { UISelectors } from './selectors.js';

export function initCursor() {
    const cursorDot = UISelectors.cursorDot;
    const cursorOutline = UISelectors.cursorOutline;
    const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (cursorDot && cursorOutline) {
        let mx = 0, my = 0; // Target mouse coordinates
        let dotX = 0, dotY = 0; // Current dot positions
        let outlineX = 0, outlineY = 0; // Current outline positions
        let hasMoved = false;
        let showCustomCursor = true;

        const disableCustomCursor = () => {
            if (showCustomCursor) {
                showCustomCursor = false;
                document.documentElement.classList.add('show-system-cursor');
            }
        };

        const enableCustomCursor = () => {
            if (!showCustomCursor && !isMobileDevice) {
                showCustomCursor = true;
                document.documentElement.classList.remove('show-system-cursor');
                outlineX = mx;
                outlineY = my;
                dotX = mx;
                dotY = my;
            }
        };

        const scrollEl = UISelectors.mainContent;
        let cachedScrollElRight = scrollEl ? scrollEl.getBoundingClientRect().right : window.innerWidth;

        // Efficient ResizeObserver removes scrollbar layout reflows on mousemove
        const edgeObserver = new ResizeObserver(() => {
            cachedScrollElRight = scrollEl
                ? scrollEl.getBoundingClientRect().right
                : window.innerWidth;
        });
        if (scrollEl) edgeObserver.observe(scrollEl);
        window.addEventListener('resize', () => {
            cachedScrollElRight = scrollEl
                ? scrollEl.getBoundingClientRect().right
                : window.innerWidth;
        }, { passive: true });

        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;

            const nearScrollbar = e.clientX >= cachedScrollElRight - 17;
            if (nearScrollbar) {
                disableCustomCursor();
            } else {
                enableCustomCursor();
            }

            if (!hasMoved) {
                dotX = mx;
                dotY = my;
                outlineX = mx;
                outlineY = my;
                hasMoved = true;
                cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
                requestAnimationFrame(() => {
                    document.documentElement.classList.add('cursor-active');
                });
            }
        }, { passive: true });

        document.addEventListener('mouseleave', disableCustomCursor);
        document.addEventListener('mouseenter', enableCustomCursor);

        // Bind cursor hover feedback to elements on startup
        document.querySelectorAll('a, button, summary, .discord-badge, #mega-trigger, .topo-node, select, input, label').forEach(el => {
            el.addEventListener('mouseover', () => {
                cursorDot.classList.add('active');
                cursorOutline.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorOutline.classList.remove('active');
            });
        });

        // Animation frame loops executing coordinate lags
        (function animLoop() {
            if (hasMoved) {
                dotX = mx;
                dotY = my;
                outlineX += (mx - outlineX) * 0.15;
                outlineY += (my - outlineY) * 0.15;

                cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animLoop);
        })();
    }
}
