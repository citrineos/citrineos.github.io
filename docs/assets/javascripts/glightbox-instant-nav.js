/*
 * With `material/privacy` enabled, mkdocs-glightbox does NOT bake an `href`
 * onto its `.glightbox` anchors at build time — it relies on a per-page,
 * inline `<script>` (rendered directly into that page's HTML) to fill in
 * `href` from the rendered `<img>`'s resolved `src` once the page loads:
 *
 *   document.querySelectorAll('.glightbox').forEach((el) => {
 *     const img = el.querySelector('img');
 *     if (img && img.src) el.setAttribute('href', img.src);
 *   });
 *
 * That inline script only runs on a genuine full page load. `navigation.instant`
 * swaps in new page content by assigning `innerHTML`, and browsers never execute
 * <script> tags inserted that way — so any page reached via a nav-link click
 * (instead of a hard refresh) keeps its `.glightbox` anchors without an `href`.
 * Clicking one then does nothing, or throws "<empty> is not a valid URL" from
 * Material's own link-interception code reading the anchor's (empty) `href`.
 *
 * The plugin does call `lightbox.reload()` on every `document$` emission, so it
 * already re-scans for `.glightbox` elements on instant-navigation pages — it
 * just never gets the chance to fix up their `href` first. Doing that fix-up
 * here, on every `document$` emission, covers every page instead of only the
 * one that happened to be loaded via a full page load.
 */
(function () {
  const fixHrefs = () => {
    document.querySelectorAll('.glightbox:not([href])').forEach((el) => {
      const img = el.querySelector('img');
      if (img && img.src) el.setAttribute('href', img.src);
    });
  };

  if (typeof document$ === 'undefined') return;
  document$.subscribe(fixHrefs);
})();