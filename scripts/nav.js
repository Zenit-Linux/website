(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");

  function setScrolled() {
    if (!header) return;
    header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
  }
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.dataset.open === "true";
      nav.dataset.open = isOpen ? "false" : "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    nav.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.dataset.open = "false";
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll-reveal: fade/slide elements marked [data-reveal] into place once,
  // the first time they enter the viewport. Respects prefers-reduced-motion
  // by doing nothing (CSS already neutralizes the transition in that case).
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
