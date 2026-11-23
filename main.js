(function () {
  "use strict";

  var T = window.I18N, C = window.COURSES, S = window.SCHEDULE;
  var CFG = window.AMIS_CONFIG || {};
  var EJ = CFG.emailjs || {};
  var LANGS = ["en", "fr", "km"];
  var LOCALE = { en: "en-GB", fr: "fr-FR", km: "km-KH" };
  var lang = "en";
  var test = { date: null, time: null };

  var emailReady = !!(window.emailjs && EJ.publicKey && EJ.serviceId && EJ.templateSchool);
  if (emailReady) window.emailjs.init({ publicKey: EJ.publicKey });

  try {
    var saved = localStorage.getItem("amis-lang");
    if (LANGS.indexOf(saved) !== -1) lang = saved;
  } catch (e) { /* storage unavailable */ }

  /* ---------- Helpers ---------- */
  function t(key) {
    var entry = T[key];
    return entry ? (entry[lang] || entry.en) : key;
  }
  function tIn(key, l) { var e = T[key]; return e ? (e[l] || e.en) : key; }
  function pick(obj) { return obj[lang] || obj.en; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function $(id) { return document.getElementById(id); }
  function allCourses() { return C.languages.concat(C.short); }
  function findCourse(id) { return allCourses().filter(function (x) { return x.id === id; })[0]; }
  function isLanguage(id) { return C.languages.some(function (x) { return x.id === id; }); }
  function courseName(id, l) { var c = findCourse(id); return c ? (c.name[l || lang] || c.name.en) : id; }
  function priceText(n) { return lang === "fr" ? n + " $" : "$" + n; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fromIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(d, l, long) {
    var opts = long ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
                    : { weekday: "short", day: "numeric", month: "short" };
    try { return new Intl.DateTimeFormat(LOCALE[l || lang], opts).format(d); }
    catch (e) { return d.toDateString(); }
  }

  /* ---------- Rendering ---------- */
  function renderCards(list, target, dark) {
    var box = $(target);
    box.innerHTML = "";
    list.forEach(function (c) {
      var card = el("article", "card");
      var g = el("div", "card__glyph" + (dark ? " card__glyph--ink" : ""), c.glyph);
      if (c.glyphLang) g.setAttribute("lang", c.glyphLang);
      g.setAttribute("aria-hidden", "true");
      card.appendChild(g);
      card.appendChild(el("h4", null, pick(c.name)));
      card.appendChild(el("p", null, pick(c.desc)));
      var meta = el("ul", "card__meta");
      [["meta_levels", pick(c.levels)], ["meta_length", pick(c.length)],
       ["meta_from", priceText(c.price) + " " + t(c.unit)]].forEach(function (row) {
        var li = el("li");
        li.appendChild(el("span", null, t(row[0])));
        li.appendChild(el("span", null, row[1]));
        meta.appendChild(li);
      });
      card.appendChild(meta);
      if (!dark) {
        var a = el("a", "card__link", t("card_test"));
        a.href = "#enroll";
        a.setAttribute("data-book-test", c.id);
        card.appendChild(a);
      }
      box.appendChild(card);
    });
    if (dark) {
      var soon = el("article", "card card--soon");
      soon.appendChild(el("h4", null, t("soon_title")));
      soon.appendChild(el("p", null, t("soon_text")));
      box.appendChild(soon);
    }
  }

  function renderSchedule() {
    var body = $("schedule-body");
    body.innerHTML = "";
    S.forEach(function (row) {
      var tr = el("tr");
      var time = el("td", "time", row.time);
      time.appendChild(el("span", "slot slot--" + row.slot, t("t_" + row.slot)));
      tr.appendChild(time);
      tr.appendChild(el("td", null, t(row.days)));
      var names = typeof row.courses === "string" ? t(row.courses)
        : row.courses.map(function (id) { return courseName(id); }).join(", ");
      tr.appendChild(el("td", null, names));
      body.appendChild(tr);
    });
  }

  function renderFees() {
    var ul = $("fee-list");
    ul.innerHTML = "";
    allCourses().forEach(function (c) {
      var li = el("li");
      var name = el("span", null, pick(c.name) + " ");
      name.appendChild(el("small", null, t(c.unit)));
      li.appendChild(name);
      li.appendChild(el("strong", null, priceText(c.price)));
      ul.appendChild(li);
    });
  }

  function renderCourseSelect() {
    var sel = $("f-course");
    var current = sel.value;
    sel.innerHTML = "";
    [["group_languages", C.languages], ["group_short", C.short]].forEach(function (grp) {
      var og = el("optgroup");
      og.label = t(grp[0]);
      grp[1].forEach(function (c) {
        var o = el("option", null, pick(c.name));
        o.value = c.id;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    if (current) sel.value = current;
  }

  /* ---------- Level test slots ---------- */
  function testDays() {
    var lt = CFG.levelTest || {};
    var times = lt.times || {};
    var want = lt.daysAhead || 6;
    var out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    for (var i = 1; out.length < want && i < 60; i++) {
      var day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      var slots = times[day.getDay()];
      if (slots && slots.length) out.push({ date: day, iso: isoDate(day), times: slots });
    }
    return out;
  }

  function chip(label, selected, onPick, sub) {
    var b = el("button", "day" + (selected ? " is-on" : ""));
    b.type = "button";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(selected));
    b.appendChild(el("span", "day__main", label));
    if (sub) b.appendChild(el("span", "day__sub", sub));
    b.addEventListener("click", onPick);
    return b;
  }

  function renderTest() {
    var days = testDays();
    if (test.date && !days.some(function (d) { return d.iso === test.date; })) test = { date: null, time: null };
    var dayBox = $("test-days"), timeBox = $("test-times");
    dayBox.innerHTML = ""; timeBox.innerHTML = "";
    days.forEach(function (d) {
      var parts = fmtDate(d.date).split(/,?\s+/);
      var main = parts.shift();
      dayBox.appendChild(chip(main, d.iso === test.date, function () {
        test.date = d.iso;
        if (d.times.indexOf(test.time) === -1) test.time = null;
        renderTest();
      }, parts.join(" ")));
    });
    var chosen = days.filter(function (d) { return d.iso === test.date; })[0];
    var times = chosen ? chosen.times : (days[0] ? days[0].times : []);
    times.forEach(function (tm) {
      var b = chip(tm, tm === test.time, function () { test.time = tm; renderTest(); });
      b.classList.add("day--time");
      if (!chosen) b.disabled = true;
      timeBox.appendChild(b);
    });
    updateTestVisibility();
  }

  function updateTestVisibility() {
    var lang_ = isLanguage($("f-course").value);
    $("test-box").hidden = !lang_;
    var booking = $("tc-book").checked;
    $("test-slots").hidden = !booking;
  }

  /* ---------- Language ---------- */
  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      n.textContent = t(n.getAttribute("data-i18n"));
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    renderCards(C.languages, "lang-cards", false);
    renderCards(C.short, "short-cards", true);
    renderSchedule();
    renderFees();
    renderCourseSelect();
    renderTest();
    $("form-error").hidden = true;
    if (lastRequest) showDone(lastRequest);
    try { localStorage.setItem("amis-lang", lang); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.dataset.lang); });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = $("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Active nav link while scrolling ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a:not(.btn)"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "courses", "schedule", "about", "contact"].forEach(function (id) {
      var s = $(id);
      if (s) io.observe(s);
    });
  }

  /* ---------- "Book a level test" links ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-book-test]");
    if (!a) return;
    var id = a.getAttribute("data-book-test");
    var sel = $("f-course");
    if (id && isLanguage(id)) sel.value = id;
    else if (!isLanguage(sel.value)) sel.value = C.languages[0].id;
    $("tc-book").checked = true;
    if (!$("done").hidden) resetForm();
    updateTestVisibility();
  });

  /* ---------- Enrollment form ---------- */
  var form = $("enroll-form");
  var lastRequest = null;

  $("f-course").addEventListener("change", updateTestVisibility);
  $("tc-book").addEventListener("change", updateTestVisibility);
  $("tc-beginner").addEventListener("change", updateTestVisibility);

  function makeRef() {
    var d = new Date();
    return "AMIS-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) +
      "-" + Math.floor(1000 + Math.random() * 9000);
  }

  function showError(key) {
    var err = $("form-error");
    err.textContent = t(key);
    err.hidden = false;
  }

  function testLabel(r, l) {
    if (!r.wantsTest) return tIn("test_none", l);
    return fmtDate(fromIso(r.testDate), l, true) + ", " + r.testTime;
  }

  function showDone(r) {
    $("done-ref").textContent = r.ref;
    var list = $("done-list");
    list.innerHTML = "";
    var rows = [["done_name", r.name], ["done_course", courseName(r.course)],
      ["done_classtime", t("t_" + r.classTime)]];
    if (r.isLanguage) rows.push(["done_test", testLabel(r, lang)]);
    rows.forEach(function (row) {
      list.appendChild(el("dt", null, t(row[0])));
      list.appendChild(el("dd", null, row[1]));
    });
    $("done-next").textContent = t(r.wantsTest ? "done_next_test" : "done_next").replace("{phone}", r.phone);
    var em = $("done-email");
    em.hidden = !r.emailSent;
    if (r.emailSent) em.textContent = t("done_email").replace("{email}", r.email);
    $("done-demo").hidden = !r.demo;
    form.hidden = true;
    $("done").hidden = false;
  }

  function resetForm() {
    form.reset();
    test = { date: null, time: null };
    lastRequest = null;
    form.querySelectorAll("[aria-invalid]").forEach(function (f) { f.removeAttribute("aria-invalid"); });
    $("form-error").hidden = true;
    $("done").hidden = true;
    form.hidden = false;
    renderTest();
  }
  $("done-again").addEventListener("click", function () { resetForm(); $("f-name").focus(); });

  function setBusy(busy) {
    var btn = $("f-submit");
    btn.disabled = busy;
    btn.textContent = t(busy ? "f_sending" : "f_submit");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    $("form-error").hidden = true;
    var f = form.elements;
    var name = f.name.value.trim(), phone = f.phone.value.trim(), email = f.email.value.trim();

    var missing = false;
    [f.name, f.phone].forEach(function (inp) {
      var empty = !inp.value.trim();
      inp.setAttribute("aria-invalid", String(empty));
      if (empty) missing = true;
    });
    if (missing) return showError("f_error");

    var emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    f.email.setAttribute("aria-invalid", String(!emailOk));
    if (!emailOk) return showError("f_err_email");

    var course = f.course.value;
    var lang_ = isLanguage(course);
    var wantsTest = lang_ && $("tc-book").checked;
    if (wantsTest && (!test.date || !test.time)) return showError("f_err_test");

    var r = {
      ref: makeRef(), name: name, phone: phone, email: email, course: course,
      classTime: f.time.value, isLanguage: lang_, wantsTest: wantsTest,
      testDate: wantsTest ? test.date : "", testTime: wantsTest ? test.time : "",
      message: f.message.value.trim(), emailSent: false, demo: !emailReady
    };

    // Spam bots fill the hidden field: pretend success, send nothing.
    if (f.website.value) { lastRequest = r; showDone(r); return; }

    if (!emailReady) { lastRequest = r; showDone(r); return; }

    var params = {
      reference: r.ref,
      student_name: r.name,
      student_phone: r.phone,
      student_email: r.email || "—",
      to_email: r.email,
      course: courseName(r.course, "en"),
      class_time: tIn("t_" + r.classTime, "en"),
      level_test: lang_ ? testLabel(r, "en") : "Not applicable",
      message: r.message || "—",
      site_language: { en: "English", fr: "French", km: "Khmer" }[lang],
      submitted_at: new Date().toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh" })
    };

    setBusy(true);
    window.emailjs.send(EJ.serviceId, EJ.templateSchool, params)
      .then(function () {
        if (!r.email || !EJ.templateStudent) return;
        return window.emailjs.send(EJ.serviceId, EJ.templateStudent, params)
          .then(function () { r.emailSent = true; }, function () { /* school got it; skip student copy */ });
      })
      .then(function () {
        setBusy(false);
        lastRequest = r;
        showDone(r);
        $("done").focus();
      }, function () {
        setBusy(false);
        showError("f_err_send");
      });
  });

  $("year").textContent = new Date().getFullYear();
  applyLang(lang);
})();
