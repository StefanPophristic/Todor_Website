/**
 * Stacks original PNG (or other master) images on top of fast 400w previews.
 * Fades in the original when it finishes loading (loads in parallel with the preview).
 */
(function () {
  "use strict";

  function initStack(stack) {
    if (stack.dataset.pngInit === "1") {
      return;
    }
    stack.dataset.pngInit = "1";

    var png = stack.querySelector(".progressive-image__original");
    if (!png || !png.src) {
      return;
    }

    function reveal() {
      stack.classList.add("progressive-image-stack--loaded");
    }

    function onError() {
      stack.classList.add("progressive-image-stack--original-missing");
    }

    if (png.complete && png.naturalWidth > 0) {
      reveal();
    } else {
      png.addEventListener("load", reveal, { once: true });
      png.addEventListener("error", onError, { once: true });
    }
  }

  function init() {
    document.querySelectorAll(".progressive-image-stack[data-png-overlay]").forEach(initStack);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
