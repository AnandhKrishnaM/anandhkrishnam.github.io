/* ═══════════════════════════════════════════════════════════════════════════
   Site behaviour — no dependencies.
     theme toggle · mobile menu · reading progress · ⌘K search
     footnotes → sidenotes · theorem numbering & [](#id) references
     table-of-contents scrollspy · code copy buttons · list filters
     equation of the day · lensing-grid hero art · MathJax kick-off
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var wide = function (px) { return window.matchMedia("(min-width: " + px + "px)").matches; };
  root.classList.add("js");

  // The previous version of this site installed an offline service worker;
  // this site uses none, so remove any that is still registered.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
  }

  /* ── theme ─────────────────────────────────────────────────────────── */
  function syncThemeColor() {
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  }
  function setTheme(t, persist) {
    root.setAttribute("data-theme", t);
    if (persist) { try { localStorage.setItem("theme", t); } catch (e) {} }
    syncThemeColor();
  }
  var toggle = $("#theme-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    var stored = null; try { stored = localStorage.getItem("theme"); } catch (err) {}
    if (!stored) setTheme(e.matches ? "dark" : "light", false);
  });
  syncThemeColor();

  /* ── mobile menu ───────────────────────────────────────────────────── */
  var menuBtn = $("#menu-toggle"), nav = $("#mainnav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  var article = $(".article");

  /* ── reading progress ──────────────────────────────────────────────── */
  var bar = $("#progress");
  if (bar && article) {
    var onScroll = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (article) {
    footnotesToSidenotes(article);
    numberCallouts(article);
    wireSidenotes(article);
    codeBlocks(article);
    tableOfContents();
  }
  equationOfTheDay();
  lensArt();
  bannerVideo();
  lightbox();
  listFilters();
  searchPalette();
  typesetMath();

  /* ── footnotes [^1] → margin notes ─────────────────────────────────── */
  function footnotesToSidenotes(art) {
    if (!art.hasAttribute("data-sidenotes")) return;
    var section = $(".footnotes", art);
    if (!section) return;
    var all = true;
    $$("sup[id^='fnref']", art).forEach(function (sup) {
      var a = $("a", sup);
      var id = a && decodeURIComponent((a.getAttribute("href") || "").slice(1));
      var li = id && document.getElementById(id);
      if (!li) { all = false; return; }
      var clone = li.cloneNode(true);
      $$(".footnote-backref", clone).forEach(function (b) { b.remove(); });
      var wrap = document.createElement("span");
      wrap.className = "sn";
      wrap.innerHTML = '<button type="button" class="sn-ref" aria-label="Show note"></button><span class="sidenote" role="note"></span>';
      wrap.lastChild.innerHTML = clone.innerHTML.trim();
      sup.replaceWith(wrap);
    });
    if (all) section.classList.add("converted");
  }

  /* ── sidenote toggles (narrow screens) & highlight (wide) ──────────── */
  function wireSidenotes(art) {
    art.addEventListener("click", function (e) {
      var btn = e.target.closest(".sn-ref, .mn-ref");
      if (!btn || wide(1001)) return;
      btn.parentElement.classList.toggle("open");
    });
    $$(".sn", art).forEach(function (sn) {
      var ref = $(".sn-ref", sn);
      if (!ref) return;
      ref.addEventListener("mouseenter", function () { sn.classList.add("hl"); });
      ref.addEventListener("mouseleave", function () { sn.classList.remove("hl"); });
    });
  }

  /* ── theorem numbering and cross references ────────────────────────── */
  function numberCallouts(art) {
    var chapter = art.getAttribute("data-chapter");
    var counters = {}, labels = {};
    $$(".callout[data-counter]", art).forEach(function (el) {
      var c = el.getAttribute("data-counter");
      counters[c] = (counters[c] || 0) + 1;
      var num = (chapter ? chapter + "." : "") + counters[c];
      var slot = $(".callout-num", el);
      if (slot) slot.textContent = num;
      if (el.id) labels[el.id] = el.getAttribute("data-label") + " " + num;
    });
    $$(".callout[id]:not([data-counter])", art).forEach(function (el) {
      labels[el.id] = el.getAttribute("data-label");
    });
    // [](#thm:gb) → "Theorem 2";  [](#some-heading) → the heading's text
    $$("a[href^='#']", art).forEach(function (a) {
      if (a.textContent.trim() || a.children.length) return;
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      var target = document.getElementById(id);
      if (labels[id]) a.textContent = labels[id];
      else if (target && /^H[1-6]$/.test(target.tagName)) a.textContent = target.textContent.replace(/#$/, "").trim();
      else return;
      a.classList.add("xref");
    });
  }

  /* ── code blocks: language label + copy button ─────────────────────── */
  function codeBlocks(art) {
    $$(".prose .highlight, .prose > pre:not(.mermaid)", art).forEach(function (block) {
      var code = $("code", block);
      if (!code) return;
      var lang = code.getAttribute("data-lang");
      if (lang) {
        var l = document.createElement("span");
        l.className = "code-lang"; l.textContent = lang;
        block.appendChild(l);
      }
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(code.innerText.replace(/\n$/, "")).then(function () {
          btn.textContent = "Copied"; btn.classList.add("done");
          setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1400);
        });
      });
      block.appendChild(btn);
    });
  }

  /* ── table of contents: open on wide screens, track the current heading ─ */
  function tableOfContents() {
    var toc = $("[data-toc]");
    if (!toc) return;
    if (wide(1281)) toc.open = true;
    var links = $$("a[href^='#']", toc);
    var map = {};
    links.forEach(function (a) { map[decodeURIComponent(a.getAttribute("href").slice(1))] = a; });
    var heads = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!heads.length || !("IntersectionObserver" in window)) return;
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = null;
      for (var i = 0; i < heads.length; i++) {
        if (visible[heads[i].id]) { current = heads[i]; break; }
        if (heads[i].getBoundingClientRect().top < 120) current = heads[i];
      }
      links.forEach(function (a) { a.classList.remove("current"); });
      if (current && map[current.id]) map[current.id].classList.add("current");
    }, { rootMargin: "-70px 0px -55% 0px" });
    heads.forEach(function (h) { io.observe(h); });
  }

  /* ── equation of the day ───────────────────────────────────────────── */
  function equationOfTheDay() {
    var items = $$(".eq-item");
    if (items.length < 2) return;
    var i = Math.floor(Date.now() / 864e5) % items.length;
    var show = function (k) {
      i = (k + items.length) % items.length;
      items.forEach(function (el, j) { el.hidden = j !== i; });
    };
    show(i);
    $$("[data-eq-step]").forEach(function (b) {
      b.addEventListener("click", function () { show(i + parseInt(b.getAttribute("data-eq-step"), 10)); });
    });
  }

  /* ── hero: a flat grid bent by a point mass ────────────────────────── */
  function lensArt() {
    var svg = $("#hero-lens");
    if (!svg) return;
    var W = 1200, H = 420, step = 38, cx = W * 0.74, cy = H * 0.48, M = 4200;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var warp = function (x, y) {
      var dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy) || 1;
      var d = Math.min(M / (r + 40), 0.82 * r);
      return [x - dx / r * d, y - dy / r * d];
    };
    var path = function (pts) {
      return "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L");
    };
    var out = "";
    for (var y = -step; y <= H + step; y += step) {
      var row = []; for (var x = -40; x <= W + 40; x += 10) row.push(warp(x, y));
      out += '<path d="' + path(row) + '"/>';
    }
    for (var x2 = -step; x2 <= W + step; x2 += step) {
      var col = []; for (var y2 = -40; y2 <= H + 40; y2 += 10) col.push(warp(x2, y2));
      out += '<path d="' + path(col) + '"/>';
    }
    svg.innerHTML = out + '<circle cx="' + cx + '" cy="' + cy + '" r="4"/>';
  }

  /* ── home banner video: respect reduced motion and data saver, and only
        play while it is on screen ──────────────────────────────────────── */
  function bannerVideo() {
    var v = $(".banner video");
    if (!v) return;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator.connection && navigator.connection.saveData);
    if (still) { v.removeAttribute("autoplay"); v.pause(); v.preload = "none"; return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }).observe(v);
    }
  }

  /* ── photo galleries: full-screen viewer with arrows, Esc and swipe ── */
  function lightbox() {
    var galleries = $$("[data-lightbox]");
    if (!galleries.length) return;
    var box = document.createElement("div");
    box.className = "lightbox"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Photograph");
    box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous photograph">&lsaquo;</button>' +
      '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Next photograph">&rsaquo;</button>' +
      '<p class="lb-count" aria-live="polite"></p>';
    document.body.appendChild(box);
    var img = $(".lb-img", box), cap = $(".lb-cap", box), count = $(".lb-count", box);
    var items = [], i = 0, lastFocus = null;
    function show(k) {
      i = (k + items.length) % items.length;
      var a = items[i];
      img.src = a.href; img.alt = a.getAttribute("data-caption") || "";
      cap.textContent = a.getAttribute("data-caption") || "";
      count.textContent = (i + 1) + " / " + items.length;
      var next = items[(i + 1) % items.length]; if (next) { var pre = new Image(); pre.src = next.href; }
    }
    function open(list, k) { items = list; lastFocus = document.activeElement; box.hidden = false; document.body.style.overflow = "hidden"; show(k); $(".lb-close", box).focus(); }
    function close() { box.hidden = true; img.removeAttribute("src"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    galleries.forEach(function (g) {
      var links = $$("a", g);
      links.forEach(function (a, k) { a.addEventListener("click", function (e) { e.preventDefault(); open(links, k); }); });
    });
    $(".lb-close", box).addEventListener("click", close);
    $(".lb-prev", box).addEventListener("click", function () { show(i - 1); });
    $(".lb-next", box).addEventListener("click", function () { show(i + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") show(i + 1); else if (e.key === "ArrowLeft") show(i - 1);
    });
    var x0 = null;
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ── filter inputs on list pages ───────────────────────────────────── */
  function listFilters() {
    $$("[data-filter-input]").forEach(function (input) {
      var scope = input.closest(".list-main") || input.closest(".list-shell") || document;
      input.addEventListener("input", function () {
        var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
        $$("[data-filter-text]", scope).forEach(function (el) {
          var text = el.getAttribute("data-filter-text") || el.textContent.toLowerCase();
          el.hidden = !terms.every(function (t) { return text.indexOf(t) !== -1; });
        });
        $$(".subject-group, .year-group", scope).forEach(function (g) {
          var any = $$("[data-filter-text]", g).some(function (e) { return !e.hidden; });
          g.hidden = terms.length > 0 && !any;
        });
      });
    });
  }

  /* ── ⌘K search ─────────────────────────────────────────────────────── */
  function searchPalette() {
    var pal = $("#palette");
    if (!pal) return;
    var input = $("#pal-input"), list = $("#pal-list"), scrim = $("#scrim");
    var index = null, results = [], sel = 0;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var reEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };

    function load() {
      if (index) return Promise.resolve(index);
      return fetch(pal.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (data) {
        index = data.map(function (d) {
          d._t = (d.t || "").toLowerCase(); d._x = (d.x || "").toLowerCase();
          d._g = ((d.g || "") + " " + (d.j || "") + " " + (d.k || "")).toLowerCase(); d._s = (d.s || "").toLowerCase();
          return d;
        });
        return index;
      });
    }
    function score(d, terms) {
      var s = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], hit = 0;
        if (d._t.indexOf(t) !== -1) hit += d._t.indexOf(t) === 0 ? 14 : 9;
        if (d._g.indexOf(t) !== -1) hit += 5;
        if (d._s.indexOf(t) !== -1) hit += 3;
        if (d._x.indexOf(t) !== -1) hit += 1 + Math.min(3, d._x.split(t).length - 2);
        if (!hit) return 0;
        s += hit;
      }
      return s;
    }
    function highlight(text, terms) {
      var out = esc(text);
      if (!terms.length) return out;
      return out.replace(new RegExp("(" + terms.map(function (t) { return reEsc(esc(t)); }).join("|") + ")", "gi"), "<mark>$1</mark>");
    }
    function snippet(d, terms) {
      var x = d.x || d.s || "";
      if (!terms.length) return d.s || x.slice(0, 140);
      var pos = d._x.indexOf(terms[0]);
      if (pos < 0) return d.s || x.slice(0, 140);
      var start = Math.max(0, pos - 60);
      return (start > 0 ? "…" : "") + x.slice(start, start + 170) + "…";
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      var terms = q.split(/\s+/).filter(Boolean);
      if (!terms.length) {
        results = index.filter(function (d) { return d.d; }).sort(function (a, b) { return b.d < a.d ? -1 : 1; }).slice(0, 8);
      } else {
        results = index.map(function (d) { return [score(d, terms), d]; })
          .filter(function (x) { return x[0] > 0; })
          .sort(function (a, b) { return b[0] - a[0]; })
          .slice(0, 14).map(function (x) { return x[1]; });
      }
      sel = 0;
      if (!results.length) { list.innerHTML = '<div class="pal-empty">Nothing matches “' + esc(q) + '”.</div>'; return; }
      list.innerHTML = results.map(function (d, i) {
        return '<a class="pal-item' + (i === 0 ? " sel" : "") + '" href="' + esc(d.u) + '" role="option">' +
          '<div class="pal-item-top"><span class="pal-title">' + highlight(d.t, terms) + '</span><span class="pal-kind">' + esc(d.k || "") + (d.d ? " · " + esc(d.d.slice(0, 7)) : "") + "</span></div>" +
          '<div class="pal-snip">' + highlight(snippet(d, terms), terms) + "</div></a>";
      }).join("");
    }
    function move(k) {
      var items = $$(".pal-item", list);
      if (!items.length) return;
      items[sel].classList.remove("sel");
      sel = (sel + k + items.length) % items.length;
      items[sel].classList.add("sel");
      items[sel].scrollIntoView({ block: "nearest" });
    }
    function open() {
      pal.hidden = false; scrim.hidden = false;
      input.value = ""; input.focus();
      list.innerHTML = '<div class="pal-empty">Loading…</div>';
      load().then(render).catch(function () { list.innerHTML = '<div class="pal-empty">Search index unavailable.</div>'; });
    }
    function close() { pal.hidden = true; scrim.hidden = true; }

    $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", open); });
    scrim.addEventListener("click", close);
    input.addEventListener("input", function () { if (index) render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { var it = $$(".pal-item", list)[sel]; if (it) { e.preventDefault(); window.location.href = it.href; } }
      else if (e.key === "Escape") { close(); }
    });
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? open() : close(); }
      else if (e.key === "/" && !typing && pal.hidden) { e.preventDefault(); open(); }
      else if (e.key === "Escape" && !pal.hidden) { close(); }
    });
  }

  /* ── MathJax: typeset once the DOM transforms above are done ───────── */
  function typesetMath() {
    var run = function () {
      if (!window.MathJax || !MathJax.typesetPromise) return;
      MathJax.typesetPromise().catch(function (err) { console.error("MathJax:", err); });
    };
    if (window.__mathjaxReady) run();
    else window.addEventListener("mathjax-ready", run, { once: true });
  }
})();
