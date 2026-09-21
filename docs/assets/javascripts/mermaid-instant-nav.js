/*
 * mermaid.min.js and the mkdocs-mermaid-zoom plugin's own script both render/enhance
 * diagrams only on `DOMContentLoaded`. That event fires once, on the very first page
 * load. With `navigation.instant` enabled, clicking a nav link swaps in new page
 * content via AJAX without a full reload, so `DOMContentLoaded` never fires again —
 * diagrams on any page reached that way never get rendered or zoom-enabled.
 *
 * Material exposes `document$`, an observable that emits on every page view,
 * instant-navigation or not. Re-running mermaid and re-applying the click-to-zoom
 * lightbox on each emission keeps every page's diagrams working, not just the first.
 */
(function () {
  const enhance = (container) => {
    if (container.dataset.enhanced) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    container.dataset.enhanced = 'true';
    container.style.cursor = 'zoom-in';
    container.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const currentSvg = container.querySelector('svg');
        if (currentSvg) openLightbox(currentSvg);
      },
      true,
    );
  };

  const openLightbox = (svg) => {
    if (document.querySelector('.mermaid-lightbox-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'mermaid-lightbox-overlay';

    const clonedSvg = svg.cloneNode(true);
    clonedSvg.classList.add('mermaid-lightbox-svg');
    clonedSvg.style.maxWidth = '90%';
    clonedSvg.style.maxHeight = '90%';
    clonedSvg.style.cursor = 'grab';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mermaid-lightbox-close';
    closeBtn.innerHTML = '&times;';

    overlay.append(clonedSvg, closeBtn);
    document.body.appendChild(overlay);
    addPanZoom(overlay, clonedSvg);

    const closeLightbox = () => {
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
    };
    const onKeydown = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };

    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    clonedSvg.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', onKeydown);
  };

  const addPanZoom = (overlay, svg) => {
    let scale = 1;
    let pointX = 0;
    let pointY = 0;
    let isDragging = false;
    let startPos = { x: 0, y: 0 };

    svg.style.transformOrigin = 'center';
    svg.style.transition = 'transform 0.1s ease-out';

    const setTransform = () => {
      svg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    };

    svg.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
      startPos = { x: e.clientX - pointX, y: e.clientY - pointY };
      svg.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      pointX = e.clientX - startPos.x;
      pointY = e.clientY - startPos.y;
      setTransform();
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      svg.style.cursor = 'grab';
    });
    overlay.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        scale = Math.max(0.2, Math.min(10, scale + delta));
        setTransform();
      },
      { passive: false },
    );
  };

  const scanAndEnhance = () => {
    document.querySelectorAll('.mermaid').forEach(enhance);
  };

  if (typeof document$ === 'undefined') return;

  document$.subscribe(() => {
    if (typeof mermaid === 'undefined') return;

    // Re-render any not-yet-processed diagrams on the newly swapped-in page.
    Promise.resolve(mermaid.run({ querySelector: '.mermaid' }))
      .catch(() => {})
      .finally(() => {
        // Diagrams render asynchronously; poll briefly to catch stragglers,
        // mirroring the retry loop the bundled mermaid-zoom.js uses on first load.
        let attempts = 0;
        const retry = () => {
          scanAndEnhance();
          if (++attempts < 10) setTimeout(retry, 200);
        };
        retry();
      });
  });
})();