(function () {
  "use strict";

  document.querySelectorAll(".copy-btn[data-copy-target]").forEach(function (btn) {
    var targetSelector = btn.getAttribute("data-copy-target");
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    var defaultLabel = btn.querySelector(".copy-btn__label");
    var defaultText = defaultLabel ? defaultLabel.textContent : btn.textContent;

    btn.addEventListener("click", function () {
      var text = target.textContent.trim();

      function showCopied() {
        btn.dataset.copied = "true";
        if (defaultLabel) defaultLabel.textContent = "Skopiowano";
        window.setTimeout(function () {
          btn.dataset.copied = "false";
          if (defaultLabel) defaultLabel.textContent = defaultText;
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied, function () {
          fallbackCopy(text);
          showCopied();
        });
      } else {
        fallbackCopy(text);
        showCopied();
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }
})();
