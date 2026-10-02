/* =====================================================
   CUSTOMIZE THIS WEBSITE HERE — edit only this block.
   ===================================================== */
const SITE_CONFIG = {
  teacherName: "Ms. Ayesha Khan",   // Full name with title, shown across the site
  studentName: "Sara",              // Who the tribute is from (or "Class 9-B")
  schoolName: "Your School",        // Shown under the teacher's name
  className: "Class 9",             // Class / section
  subject: "",                      // Optional, e.g. "English" ("" to hide)
  teacherImage: "",                 // "" = no photo. Or "assets/images/teacher.jpg"
  teacherImageAlt: "Portrait of the teacher",
  personalMessage:                  // Blank line = new paragraph. Use \n for line breaks.
`Dear Teacher,

Thank you for every lesson, every correction, every encouragement and every moment you chose to believe in us.

Some lessons end when the class ends.

The lessons you gave us will stay much longer.`,
  quote: "A great teacher can change a life with a single lesson.",
  accentColor: "#ffa600",           // Soft gold. Try "#e8a87c" (amber) or "#9fc5e8" (moonlight)
  pageTitle: "Happy Teachers' Day — {teacher}",  // {teacher} is replaced automatically

  // Show / hide sections
  showTeacherImage: true,           // Needs teacherImage to be filled in
  showSchoolInfo: true,
  showQuote: true,
  showMemories: false,
  showMusic: true,                  // Needs audioFile to be filled in
  showCreatorCredit: false,

  audioFile: "",                    // e.g. "assets/audio/music.mp3" ("" = no music control)
  memories: [                       // Up to 3, used when showMemories is true
    { image: "", title: "That First Lesson", text: "The day we realised learning could be exciting." },
    { image: "", title: "The Extra Help",     text: "Staying back to explain it one more time." },
    { image: "", title: "The Kind Words",     text: "A small encouragement that stayed with us." }
  ],
  creatorName: ""                   // Shown in footer if showCreatorCredit is true
};
/* ============= END OF CUSTOMIZATION ============= */

(() => {
  const C = SITE_CONFIG, $ = (s, p = document) => p.querySelector(s), $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const clean = v => (v || "").trim();

  /* ---------- Fill content from config ---------- */
  document.documentElement.style.setProperty("--accent", C.accentColor);
  document.title = C.pageTitle.replace("{teacher}", C.teacherName);
  const setMeta = (sel, v) => { const m = $(sel); if (m) m.content = v; };
  setMeta('meta[property="og:title"]', document.title);
  setMeta('meta[name="description"]', `A Teachers' Day tribute to ${C.teacherName}, from ${C.studentName}.`);
  setMeta('meta[property="og:description"]', $('meta[name="description"]').content);
  $$("[data-cfg]").forEach(el => el.textContent = C[el.dataset.cfg]);

  const info = [C.subject, C.className, C.schoolName].map(clean).filter(Boolean).join("  ·  ");
  $("#heroMeta").textContent = C.showSchoolInfo ? info : "";
  $("#heroMeta").hidden = !(C.showSchoolInfo && info);
  $("#portraitMeta").textContent = C.showSchoolInfo ? info : "";

  const drop = id => $(id)?.remove();
  const hasImg = C.showTeacherImage && clean(C.teacherImage);
  if (hasImg) { const i = $("#teacherImg"); i.src = C.teacherImage; i.alt = C.teacherImageAlt; $("#portrait").hidden = false; } else drop("#portrait");

  if (C.showQuote && clean(C.quote)) { $("#quoteText").textContent = C.quote; $("#quote").hidden = false; } else drop("#quote");

  const mems = C.showMemories ? C.memories.slice(0, 3) : [];
  if (mems.length) {
    $("#memories").hidden = false;
    mems.forEach(m => {
      const a = document.createElement("article"); a.className = "card r";
      if (clean(m.image)) { const im = new Image(); im.src = m.image; im.alt = m.title; im.loading = "lazy"; a.append(im); }
      const h = document.createElement("h3"), p = document.createElement("p");
      h.textContent = m.title; p.textContent = m.text; a.append(h, p); $("#memCards").append(a);
    });
  } else drop("#memories");

  // Letter: blank line = paragraph, single newline = <br>. Built with text nodes (safe).
  clean(C.personalMessage).split(/\n\s*\n/).forEach(par => {
    const p = document.createElement("p"); p.className = "hw";
    par.split("\n").forEach((ln, i) => { if (i) p.append(document.createElement("br")); p.append(ln); });
    $("#letterBody").append(p);
  });

  if (C.showCreatorCredit && clean(C.creatorName)) { const c = $("#credit"); c.textContent = `Created by ${C.creatorName}`; c.hidden = false; }

  /* ---------- Section dots + progress ---------- */
  const secs = $$("main section").filter(s => !s.hidden);
  secs.forEach(s => {
    const a = document.createElement("a"); a.href = "#" + s.id; a.setAttribute("aria-label", "Go to " + (s.querySelector("h1,h2")?.textContent || s.id));
    $(".dots").append(a);
  });
  const dots = $$(".dots a"), bar = $(".progress");
  let tick = false;
  addEventListener("scroll", () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; tick = false;
    });
  }, { passive: true });
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) dots.forEach((d, i) => d.classList.toggle("on", secs[i] === e.target));
  }), { threshold: .55 });
  secs.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const rev = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); }
  }), { threshold: .2 });
  const watch = () => $$(".r:not(.in)").forEach(el => {
    const sibs = $$(".r", el.parentElement); if (el.classList.contains("card")) el.style.setProperty("--d", sibs.indexOf(el) * .12 + "s");
    rev.observe(el);
  });

  /* ---------- Particles (canvas, ~40 dots, paused when tab hidden) ---------- */
  const cv = $("#fx"), cx = cv.getContext("2d");
  let W, H, parts = [], running = true;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; };
  const mk = () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.4 + .4) * (W / innerWidth), vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .1, a: Math.random() * .5 + .15, life: 1 });
  size(); addEventListener("resize", size);
  const base = reduce ? 0 : (innerWidth < 600 ? 28 : 55);
  for (let i = 0; i < base; i++) parts.push(mk());
  function burst(n = 40) {
    if (reduce) return;
    for (let i = 0; i < n; i++) { const p = mk(), ang = Math.random() * 6.28, sp = Math.random() * 3 + 1;
      Object.assign(p, { x: W / 2, y: H * .55, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, a: .9, life: .99, burst: 1 }); parts.push(p); }
  }
  (function loop() {
    if (running) {
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = C.accentColor;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.x += p.vx; p.y += p.vy;
        if (p.burst) { p.vx *= .97; p.vy = p.vy * .97 + .02; p.a *= .975; if (p.a < .02) { parts.splice(i, 1); continue; } }
        else if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        cx.globalAlpha = p.a; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28); cx.fill();
      }
    }
    requestAnimationFrame(loop);
  })();
  document.addEventListener("visibilitychange", () => running = !document.hidden);

  /* ---------- Mouse light + hero parallax (desktop only) ---------- */
  if (!touch && !reduce) {
    const spot = $(".spot"), hero = $("#hero");
    addEventListener("pointermove", e => {
      spot.style.setProperty("--mx", e.clientX + "px"); spot.style.setProperty("--my", e.clientY + "px");
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      hero.style.setProperty("--px", x * 10 + "px"); hero.querySelector(".display").style.transform = `translate(${x * -10}px,${y * -8}px)`;
    }, { passive: true });
    $$(".card").forEach(c => {
      c.addEventListener("pointermove", e => { if (!c.classList.contains("in")) return; const r = c.getBoundingClientRect();
        c.style.transform = `perspective(700px) rotateY(${((e.clientX - r.left) / r.width - .5) * 6}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 6}deg)`; });
      c.addEventListener("pointerleave", () => c.style.transform = "");
    });
  }

  /* ---------- Letter opening ---------- */
  const ob = $("#openLetter"), paper = $("#paper");
  ob.addEventListener("click", () => {
    ob.setAttribute("aria-expanded", "true"); ob.classList.add("gone");
    document.body.classList.add("warm"); burst(45);
    setTimeout(() => {
      paper.hidden = false;
      $$(".hw", paper).forEach((p, i) => p.style.animationDelay = (.5 + i * .9) + "s");
      paper.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      paper.tabIndex = -1; paper.focus({ preventScroll: true });
    }, reduce ? 0 : 450);
  });

  /* ---------- "One more thing" overlay ---------- */
  const veil = $("#veil"), vls = $$(".vl", veil), mb = $("#moreBtn");
  const closeVeil = () => { veil.hidden = true; document.body.style.overflow = ""; vls.forEach(v => v.classList.remove("in")); mb.focus(); };
  mb.addEventListener("click", () => {
    veil.hidden = false; document.body.style.overflow = "hidden";
    vls.forEach((v, i) => setTimeout(() => v.classList.add("in"), reduce ? 0 : 500 + i * 2200));
    setTimeout(() => burst(30), reduce ? 0 : 500 + 2 * 2200);
    $("#veilClose").focus({ preventScroll: true });
  });
  $("#veilClose").addEventListener("click", closeVeil);
  addEventListener("keydown", e => { if (e.key === "Escape" && !veil.hidden) closeVeil(); });

  /* ---------- Music (never autoplays) ---------- */
  const mBtn = $("#music"), au = $("#audio");
  if (C.showMusic && clean(C.audioFile)) {
    au.src = C.audioFile; mBtn.hidden = false;
    mBtn.addEventListener("click", () => {
      if (au.paused) au.play().then(() => { mBtn.setAttribute("aria-pressed", "true"); mBtn.setAttribute("aria-label", "Pause background music"); }).catch(() => {});
      else { au.pause(); mBtn.setAttribute("aria-pressed", "false"); mBtn.setAttribute("aria-label", "Play background music"); }
    });
  } else drop("#music"), drop("#audio");

  /* ---------- Start: short loader, then reveal ---------- */
  addEventListener("load", () => setTimeout(() => {
    document.body.classList.remove("is-loading"); watch();
  }, reduce ? 100 : 1900));
})();
