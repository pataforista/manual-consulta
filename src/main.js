// src/main.js
import { loadDataset } from "./engine/dataset.js";
import { renderHome, renderTopic, renderPrintable, renderPrintables, renderSettings } from "./ui/router.js";
import { initSearch, search as performSearch } from "./engine/search.js";
import { initBottomSheet, openBottomSheet } from "./ui/bottomSheet.js";
import { initInstallPrompt } from "./ui/install.js";
import "./ui/sw-register.js";

const app = document.getElementById("app");

const state = {
  mode: localStorage.getItem("mode") || "clinician",
  theme: localStorage.getItem("theme") || "light",
  fontSize: localStorage.getItem("fontSize") || "medium",
  dataset: null,
  urgencyOnly: false,
  favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
  filterFavorites: false
};

function applySettings() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.className = `font-${state.fontSize}`;
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("theme", theme);
  applySettings();
  route();
}

function setFontSize(size) {
  state.fontSize = size;
  localStorage.setItem("fontSize", size);
  applySettings();
  route();
}

// Attach to window for onclick handlers in router
window.setTheme = setTheme;
window.setFontSize = setFontSize;

function setMode(next) {
  state.mode = next;
  localStorage.setItem("mode", next);
  route();
}

function toggleFavorite(id) {
  const index = state.favorites.indexOf(id);
  if (index > -1) state.favorites.splice(index, 1);
  else state.favorites.push(id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  route();
}

function route() {
  if (!state.dataset) return;

  const url = new URL(location.href);
  const view = url.searchParams.get("view") || "home";
  const id = url.searchParams.get("id");

  if (view === "topic" && id) {
    localStorage.setItem("lastTopic", id);
  }

  window.scrollTo(0, 0);

  if (view === "topic" && id) {
    app.innerHTML = renderTopic(state.dataset, id, state.mode, state.favorites.includes(id));
  } else if (view === "print" && id) {
    app.innerHTML = renderPrintable(state.dataset, id);
  } else if (view === "printables") {
    app.innerHTML = renderPrintables(state.dataset);
  } else if (view === "settings") {
    app.innerHTML = renderSettings(state.dataset, state.mode, state);
  } else {
    app.innerHTML = renderHome(state.dataset, state.mode, state);

    const lastId = localStorage.getItem("lastTopic");
    if (lastId && state.dataset.topicsById[lastId]) {
      const resumeBtn = document.getElementById("btnResume");
      if (resumeBtn) {
        resumeBtn.style.display = "flex";
        resumeBtn.onclick = () => nav("topic", lastId);
        resumeBtn.querySelector("span:last-child").textContent = state.dataset.topicsById[lastId].title;
      }
    }
  }
  wireHandlers();
  applySettings();

  document.querySelectorAll(".nav-bottom .nav-item").forEach(btn => {
    if (btn.dataset.nav === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function nav(view, id) {
  const url = new URL(location.href);
  url.searchParams.set("view", view);
  if (id) url.searchParams.set("id", id); else url.searchParams.delete("id");
  history.pushState({}, "", url);
  route();
}

function wireHandlers() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      nav(btn.dataset.nav, btn.dataset.id || null);
    };
  });

  const modeBtn = document.getElementById("modeToggle");
  if (modeBtn) {
    modeBtn.onclick = () => {
      setMode(state.mode === "clinician" ? "patient" : "clinician");
    };
  }

  const searchInput = document.getElementById("topicSearch");
  if (searchInput) {
    const cards = Array.from(document.querySelectorAll(".grid-menu .topic-card"));

    const syncSearchState = () => {
      const query = searchInput.value.trim();
      let visible = 0;

      if (!query) {
        cards.forEach(card => {
          const id = card.dataset.id;
          let match = true;
          if (state.urgencyOnly && !(dataset.topicsById[id].tags || []).some(t => ['urgencia', 'crisis', 'urgencias'].includes(t))) match = false;
          if (state.filterFavorites && !state.favorites.includes(id)) match = false;
          card.style.display = match ? "flex" : "none";
          if (match) visible += 1;
        });
      } else {
        const results = performSearch(query);
        const matchedIds = new Set(results.map(r => r.item.type === 'topic' ? r.item.id : r.item.topicId));

        cards.forEach(card => {
          const id = card.dataset.id;
          let match = matchedIds.has(id);
          if (state.urgencyOnly && !(dataset.topicsById[id].tags || []).some(t => ['urgencia', 'crisis', 'urgencias'].includes(t))) match = false;
          if (state.filterFavorites && !state.favorites.includes(id)) match = false;

          card.style.display = match ? "flex" : "none";
          if (match) visible += 1;
        });
      }

      const emptyEl = document.getElementById("topicSearchEmpty");
      if (emptyEl) emptyEl.style.display = visible === 0 ? "block" : "none";
    };

    searchInput.oninput = syncSearchState;

    const urgenciasBtn = document.getElementById("btnUrgencias");
    if (urgenciasBtn) {
      urgenciasBtn.onclick = () => {
        state.urgencyOnly = !state.urgencyOnly;
        route(); // Simple refresh to apply primary class
      };
    }

    const favoritosBtn = document.getElementById("btnFavoritos");
    if (favoritosBtn) {
      favoritosBtn.onclick = () => {
        state.filterFavorites = !state.filterFavorites;
        route();
      };
    }

    syncSearchState();
  }

  const favToggle = document.getElementById("favToggle");
  if (favToggle) {
    favToggle.onclick = () => {
      const id = new URL(location.href).searchParams.get("id");
      toggleFavorite(id);
    };
  }

  // Settings Handlers (if view is settings)
  const bThemeL = document.getElementById("btnThemeLight");
  if (bThemeL) bThemeL.onclick = () => setTheme('light');
  const bThemeD = document.getElementById("btnThemeDark");
  if (bThemeD) bThemeD.onclick = () => setTheme('dark');

  const bFontS = document.getElementById("btnFontSmall");
  if (bFontS) bFontS.onclick = () => setFontSize('small');
  const bFontM = document.getElementById("btnFontMedium");
  if (bFontM) bFontM.onclick = () => setFontSize('medium');
  const bFontL = document.getElementById("btnFontLarge");
  if (bFontL) bFontL.onclick = () => setFontSize('large');

  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.onclick = () => {
      const title = btn.dataset.shareTitle || "Información";
      const content = btn.dataset.shareContent || "";
      openBottomSheet(`
        <h2 style="margin-bottom:15px;">${title}</h2>
        <div style="font-size:1.1rem; line-height:1.6;">${content.replaceAll("\n", "<br>")}</div>
        <button class="btn primary" style="width:100%; margin-top:20px;" onclick="document.getElementById('sheetOverlay').click()">Cerrar</button>
      `);
    };
  });


  document.querySelectorAll("form[data-calc]").forEach(form => {
    form.oninput = () => {
      const fn = form.dataset.calc;
      const inputs = {};
      form.querySelectorAll("input").forEach(i => inputs[i.dataset.key] = parseFloat(i.value));

      import("./engine/calculators.js")
        .then(module => {
          const res = module.runCalculator(fn, inputs);
          const out = form.querySelector("[data-output]");
          if (res.ok) {
            out.innerHTML = `<span style="color:var(--primary-spirit)">${res.text}</span>`;
          } else {
            out.innerHTML = `<span style="color:var(--text-muted); font-size:0.9rem">${res.error || "Formato incompleto..."}</span>`;
          }
        })
        .catch(err => console.log("Calculadora no cargada aún", err));
    };
  });
}

window.addEventListener("popstate", route);

(async function init() {
  try {
    state.dataset = await loadDataset();
    initSearch(state.dataset.topicsById);
    initBottomSheet();
    applySettings();
    route();
    initInstallPrompt();
  } catch (e) {
    app.innerHTML = `<div class="clinical-box danger" style="margin:20px"><span class="box-title">ERROR DE SISTEMA</span>${e.message}</div>`;
  }
})();
