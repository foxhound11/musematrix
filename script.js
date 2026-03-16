(function () {
  "use strict";

  var nav = document.getElementById("navbar");
  var menuToggle = document.getElementById("menuToggle");
  var revealItems = document.querySelectorAll(".reveal");

  var assemblyScroll = document.querySelector(".assembly-scroll");
  var assemblyStage = document.getElementById("assemblyStage");
  var assemblyTarget = document.getElementById("assemblyTarget");
  var assemblyWordmark = document.getElementById("assemblyWordmark");
  var assemblyTrails = document.getElementById("assemblyTrails");
  var assemblySources = Array.prototype.slice.call(document.querySelectorAll(".assembly-source"));
  var targetLetters = Array.prototype.slice.call(document.querySelectorAll(".target-letter"));
  var trailItems = [];

  var assemblySeeds = assemblySources.map(function (source) {
    return source.querySelector(".seed");
  });

  var assemblyPrefixes = assemblySources.map(function (source) {
    return source.querySelector(".source-prefix");
  });

  var assemblySuffixes = assemblySources.map(function (source) {
    return source.querySelector(".source-suffix");
  });

  if (assemblyTrails) {
    assemblySources.forEach(function () {
      var trail = document.createElement("span");
      trail.className = "assembly-trail";
      assemblyTrails.appendChild(trail);
      trailItems.push(trail);
    });
  }

  var assemblyMetrics = [];
  var assemblyStart = 0;
  var assemblyEnd = 1;
  var scrollTicking = false;
  var resizeTicking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
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

  function setMobileOpen(isOpen) {
    if (!nav || !menuToggle) {
      return;
    }

    nav.classList.toggle("mobile-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
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

  function updateNav() {
    if (!nav) {
      return;
    }

    nav.classList.toggle("scrolled", window.scrollY > 24);
  }

  function resetAssemblyStyles() {
    trailItems.forEach(function (trail) {
      trail.style.width = "";
      trail.style.transform = "";
      trail.style.opacity = "";
    });

    assemblySources.forEach(function (source, index) {
      source.style.transform = "";
      source.style.opacity = "";
      source.style.backgroundColor = "";
      source.style.borderColor = "";
      source.style.boxShadow = "";

      if (assemblySeeds[index]) {
        assemblySeeds[index].style.transform = "";
        assemblySeeds[index].style.opacity = "";
        assemblySeeds[index].style.filter = "";
      }

      if (assemblyPrefixes[index]) {
        assemblyPrefixes[index].style.opacity = "";
      }

      if (assemblySuffixes[index]) {
        assemblySuffixes[index].style.opacity = "";
      }
    });

    targetLetters.forEach(function (target) {
      target.style.transform = "";
      target.style.color = "";
      target.style.backgroundColor = "";
      target.style.borderColor = "";
      target.style.boxShadow = "";
    });

    if (assemblyTarget) {
      assemblyTarget.style.transform = "";
    }

    if (assemblyWordmark) {
      assemblyWordmark.style.transform = "";
      assemblyWordmark.style.opacity = "";
      assemblyWordmark.style.color = "";
      assemblyWordmark.style.filter = "";
    }
  }

  function measureAssembly() {
    if (!assemblyScroll || !assemblyStage || assemblySources.length !== targetLetters.length) {
      return;
    }

    resetAssemblyStyles();

    assemblyStart = window.scrollY + assemblyScroll.getBoundingClientRect().top;
    assemblyEnd = assemblyStart + assemblyScroll.offsetHeight - window.innerHeight;
    var stageRect = assemblyStage.getBoundingClientRect();

    assemblyMetrics = assemblySources.map(function (source, index) {
      var seed = assemblySeeds[index];
      var target = targetLetters[index];

      if (!seed || !target) {
        return { x: 0, y: 0, scale: 1 };
      }

      var seedRect = seed.getBoundingClientRect();
      var targetRect = target.getBoundingClientRect();
      var startX = (seedRect.left + seedRect.width / 2) - stageRect.left;
      var startY = (seedRect.top + seedRect.height / 2) - stageRect.top;
      var endX = (targetRect.left + targetRect.width / 2) - stageRect.left;
      var endY = (targetRect.top + targetRect.height / 2) - stageRect.top;
      var dx = endX - startX;
      var dy = endY - startY;

      return {
        x: dx,
        y: dy,
        scale: targetRect.height / Math.max(seedRect.height, 1),
        startX: startX,
        startY: startY,
        distance: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(dy, dx) * (180 / Math.PI)
      };
    });
  }

  function updateAssembly() {
    if (!assemblyScroll || !assemblyStage || assemblyMetrics.length !== assemblySources.length) {
      return;
    }

    var denominator = Math.max(assemblyEnd - assemblyStart, 1);
    var progress = clamp((window.scrollY - assemblyStart) / denominator, 0, 1);
    var wordmarkProgress = easeInOutCubic(clamp((progress - 0.56) / 0.2, 0, 1));

    if (assemblyTarget) {
      var scale = 0.86 + progress * 0.08;
      assemblyTarget.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(3) + ")";
    }

    if (assemblyWordmark) {
      var wordmarkScale = 0.92 + wordmarkProgress * 0.06;
      assemblyWordmark.style.transform = "translate(-50%, -50%) scale(" + wordmarkScale.toFixed(3) + ")";
      assemblyWordmark.style.opacity = String(wordmarkProgress);
      assemblyWordmark.style.color = "rgba(31, 47, 72, " + (0.12 + wordmarkProgress * 0.88).toFixed(3) + ")";
      assemblyWordmark.style.filter = "blur(" + ((1 - wordmarkProgress) * 6).toFixed(2) + "px)";
    }

    assemblySources.forEach(function (source, index) {
      var metric = assemblyMetrics[index];
      var seed = assemblySeeds[index];
      var prefix = assemblyPrefixes[index];
      var suffix = assemblySuffixes[index];
      var target = targetLetters[index];
      var trail = trailItems[index];
      var start = index * 0.078;
      var end = start + 0.24;
      var local = clamp((progress - start) / (end - start), 0, 1);
      var eased = easeInOutCubic(local);
      var seedFade = local > 0.82 ? 1 - ((local - 0.82) / 0.18) : 1;
      seedFade = clamp(seedFade, 0, 1);

      source.style.transform = "translate3d(0, " + (-12 * eased).toFixed(2) + "px, 0) scale(" + (1 - eased * 0.04).toFixed(3) + ")";
      source.style.opacity = String(1 - eased * 0.4);
      source.style.backgroundColor = "rgba(255, 250, 243, " + (0.92 - eased * 0.5).toFixed(3) + ")";
      source.style.borderColor = "rgba(31, 47, 72, " + (0.12 - eased * 0.07).toFixed(3) + ")";
      source.style.boxShadow = "0 18px 52px rgba(31, 47, 72, " + (0.08 - eased * 0.05).toFixed(3) + ")";

      if (prefix) {
        prefix.style.opacity = String(1 - eased * 0.88);
      }

      if (suffix) {
        suffix.style.opacity = String(1 - eased * 0.88);
      }

      if (trail) {
        var trailProgress = clamp((local - 0.04) / 0.7, 0, 1);
        trail.style.width = metric.distance.toFixed(2) + "px";
        trail.style.transform =
          "translate(" + metric.startX.toFixed(2) + "px, " + metric.startY.toFixed(2) + "px) rotate(" + metric.angle.toFixed(2) + "deg) scaleX(" + trailProgress.toFixed(3) + ")";
        trail.style.opacity = String(trailProgress * 0.28);
      }

      if (seed) {
        var dx = metric.x * eased;
        var dy = metric.y * eased;
        var scale = 1 + (metric.scale - 1) * eased;
        seed.style.transform = "translate(" + dx.toFixed(2) + "px, " + dy.toFixed(2) + "px) scale(" + scale.toFixed(3) + ")";
        seed.style.opacity = String(seedFade);
        seed.style.filter = "drop-shadow(0 0 " + Math.round(22 * eased) + "px rgba(41, 72, 111, " + (0.22 * eased).toFixed(3) + "))";
      }

      if (target) {
        var alpha = 0.01 + eased * 0.08;
        var targetScale = 0.96 + eased * 0.02;
        var targetY = 6 - eased * 6;
        target.style.transform = "translateY(" + targetY.toFixed(2) + "px) scale(" + targetScale.toFixed(3) + ")";
        target.style.color = "rgba(31, 47, 72, " + alpha.toFixed(3) + ")";
        target.style.backgroundColor = "rgba(255, 250, 243, " + (0.18 + eased * 0.24).toFixed(3) + ")";
        target.style.borderColor = "rgba(31, 47, 72, " + (0.08 + eased * 0.08).toFixed(3) + ")";
        target.style.boxShadow = eased > 0.15
          ? "0 10px 20px rgba(41, 72, 111, " + (0.03 + eased * 0.03).toFixed(3) + ")"
          : "";
      }
    });
  }

  function onScroll() {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(function () {
      updateNav();
      updateAssembly();
      scrollTicking = false;
    });
  }

  function onResize() {
    if (resizeTicking) {
      return;
    }

    resizeTicking = true;
    window.requestAnimationFrame(function () {
      measureAssembly();
      updateAssembly();
      resizeTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  window.addEventListener("load", function () {
    measureAssembly();
    updateNav();
    updateAssembly();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      measureAssembly();
      updateAssembly();
    });
  }

  setTimeout(function () {
    measureAssembly();
    updateAssembly();
  }, 180);

  setTimeout(function () {
    measureAssembly();
    updateAssembly();
  }, 700);
})();
