/* ABCC prototype — shared behaviour.
   Everything is local-only: no network calls, no production writes. */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.querySelector(".label").textContent = open ? "Close" : "Menu";
    });

    // Close the menu when a link is chosen or Escape is pressed.
    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.querySelector(".label").textContent = "Menu";
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("open")) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.querySelector(".label").textContent = "Menu";
        navToggle.focus();
      }
    });
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach((tabset) => {
    const tabs = Array.from(tabset.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) =>
      document.getElementById(tab.getAttribute("aria-controls"))
    );

    function selectTab(tab, focus) {
      tabs.forEach((t, i) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(tab, false));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
  });

  /* ---------- Accordions ---------- */
  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- Lesson progress (localStorage only) ---------- */
  const LESSON_KEY = "abcc-prototype-lesson-1.3";
  const completeBtn = document.getElementById("mark-complete");
  const resetBtn = document.getElementById("reset-progress");
  const stateLabel = document.getElementById("lesson-state-label");

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(LESSON_KEY)) || { status: "in-progress" };
    } catch {
      return { status: "in-progress" };
    }
  }
  function writeState(state) {
    try {
      localStorage.setItem(LESSON_KEY, JSON.stringify(state));
    } catch { /* storage unavailable — state simply will not persist */ }
  }
  function renderState() {
    if (!stateLabel) return;
    const state = readState();
    const done = state.status === "complete";
    stateLabel.textContent = done ? "Marked as read" : "In progress";
    if (completeBtn) completeBtn.textContent = done ? "Lesson marked as read ✓" : "Mark lesson as read";
  }
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      const state = readState();
      writeState({ ...state, status: state.status === "complete" ? "in-progress" : "complete" });
      renderState();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(LESSON_KEY);
      renderState();
    });
  }
  renderState();

  /* ---------- Reading progress bar ---------- */
  const bar = document.getElementById("read-progress");
  if (bar) {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      bar.style.width = pct + "%";
    };
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Back to top ---------- */
  const backTop = document.getElementById("back-top");
  if (backTop) {
    document.addEventListener("scroll", () => {
      backTop.classList.toggle("show", document.documentElement.scrollTop > 600);
    }, { passive: true });
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
