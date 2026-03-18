(function () {
  "use strict";

  var nav = document.getElementById("navbar");
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  var revealItems = document.querySelectorAll(".reveal");

  function setMobileOpen(isOpen) {
    if (!nav || !menuToggle) {
      return;
    }

    nav.classList.toggle("mobile-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function updateNav() {
    if (!nav) {
      return;
    }

    nav.classList.toggle("scrolled", window.scrollY > 24);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMobileOpen(!nav.classList.contains("mobile-open"));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      var target = id ? document.querySelector(id) : null;

      if (!target) {
        return;
      }

      event.preventDefault();

      var navOffset = nav ? nav.offsetHeight + 18 : 0;
      var top = window.scrollY + target.getBoundingClientRect().top - navOffset;

      window.scrollTo({
        top: top,
        behavior: "smooth"
      });

      setMobileOpen(false);
    });
  });

  if (navLinks) {
    navLinks.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        setMobileOpen(false);
      }
    });
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("load", updateNav);
})();
