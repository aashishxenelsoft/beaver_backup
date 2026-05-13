/**
 * Static includes loader + mobile nav toggle.
 * WordPress: remove fetch logic; use get_header() / get_footer() and wp_nav_menu() instead.
 */

(function () {
  "use strict";

  function warnFileProtocol() {
    if (location.protocol === "file:") {
      console.warn(
        "[Beaver Energy] Includes use fetch(). Run a local server (e.g. npx serve) so header/footer load on every page."
      );
    }
  }

  async function injectPartial(url, mount) {
    if (!mount || !url) return false;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      mount.outerHTML = (await res.text()).trim();
      return true;
    } catch {
      mount.remove();
      return false;
    }
  }

  function setActiveNav() {
    var current = document.body.getAttribute("data-nav") || "";
    document.querySelectorAll("[data-nav-slug]").forEach(function (link) {
      link.removeAttribute("aria-current");
      link.classList.remove("is-active");
      if (link.getAttribute("data-nav-slug") === current) {
        link.setAttribute("aria-current", "page");
        link.classList.add("is-active");
      }
    });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".site-nav__toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 767px)").matches) setOpen(false);
      });
    });
  }

  async function init() {
    warnFileProtocol();

    var headerMount = document.getElementById("site-include-header");
    var footerMount = document.getElementById("site-include-footer");
    var headerUrl = document.body.getAttribute("data-include-header");
    var footerUrl = document.body.getAttribute("data-include-footer");

    await injectPartial(headerUrl, headerMount);
    await injectPartial(footerUrl, footerMount);

    setActiveNav();
    initNavToggle();

    var yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
