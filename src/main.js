// src/main.js
import { loadDataset } from "./engine/dataset.js";
import { renderHome, renderTopic, renderPrintable, renderPrintables, renderSettings, renderMetabolicDashboard } from "./ui/router.js";
import { initSearch, search as performSearch } from "./engine/search.js";
import { initBottomSheet, openBottomSheet } from "./ui/bottomSheet.js";
import { initInstallPrompt } from "./ui/install.js";
import "./ui/sw-register.js";

const app = document.getElementById("app");

const state = {
  mode: "clinician", // Forzado a modo clínico solamente
  theme: localStorage.getItem("theme") || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
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

window.setFontSize = setFontSize;

// Clinical Copy Utility
window.copyClinicalText = async function(btn) {
  const box = btn.closest('.clinical-box');
  const text = box.querySelector('.copy-content').innerText;
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.innerText;
    btn.innerText = "✅";
    setTimeout(() => btn.innerText = original, 2000);
  } catch (err) {
    console.error("Error al copiar", err);
  }
};

function setMode(next) {
  // Deshabilitado: siempre modo clínico
  state.mode = "clinician";
  localStorage.setItem("mode", "clinician");
  route();
}

function toggleFavorite(id) {
  const index = state.favorites.indexOf(id);
  if (index > -1) state.favorites.splice(index, 1);
  else state.favorites.push(id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  route();
}

function updateDOM() {
  const url = new URL(location.href);
  const view = url.searchParams.get("view") || "home";
  const id = url.searchParams.get("id");

  if (view === "topic" && id) {
    app.innerHTML = renderTopic(state.dataset, id, state.mode, state.favorites.includes(id), state.theme);
  } else if (view === "print" && id) {
    app.innerHTML = renderPrintable(state.dataset, id);
  } else if (view === "printables") {
    app.innerHTML = renderPrintables(state.dataset, state.theme);
  } else if (view === "settings") {
    app.innerHTML = renderSettings(state.dataset, state.mode, state);
  } else if (view === "metabolic") {
    app.innerHTML = renderMetabolicDashboard(state.theme);
    updateMetabolicReport(); // Init report
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
    
    const searchInput = document.getElementById("topicSearch");
    if (searchInput) syncSearchState(searchInput);
  }

  document.querySelectorAll(".nav-bottom .nav-item").forEach(btn => {
    if (btn.dataset.nav === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function route() {
  if (!state.dataset) return;

  const url = new URL(location.href);
  const view = url.searchParams.get("view") || "home";
  const id = url.searchParams.get("id");

  if (view === "topic" && id) {
    localStorage.setItem("lastTopic", id);
  }

  const performRoute = () => {
    window.scrollTo(0, 0);
    updateDOM();
    applySettings();
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => performRoute());
  } else {
    performRoute();
  }
}

function nav(view, id) {
  const url = new URL(location.href);
  url.searchParams.set("view", view);
  if (id) url.searchParams.set("id", id); else url.searchParams.delete("id");
  history.pushState({}, "", url);
  route();
}

function syncSearchState(inputEl) {
  if (!inputEl) return;
  const query = inputEl.value.trim();
  const cards = Array.from(document.querySelectorAll(".grid-menu .topic-card"));
  let visible = 0;

  if (!query) {
    cards.forEach(card => {
      const id = card.dataset.id;
      let match = true;
      if (state.urgencyOnly && !(state.dataset.topicsById[id].tags || []).some(t => ['urgencia', 'crisis', 'urgencias'].includes(t))) match = false;
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
      if (state.urgencyOnly && !(state.dataset.topicsById[id].tags || []).some(t => ['urgencia', 'crisis', 'urgencias'].includes(t))) match = false;
      if (state.filterFavorites && !state.favorites.includes(id)) match = false;

      card.style.display = match ? "flex" : "none";
      if (match) visible += 1;
    });
  }

  const emptyEl = document.getElementById("topicSearchEmpty");
  if (emptyEl) emptyEl.style.display = visible === 0 ? "block" : "none";
}

// Global Event Delegation
document.addEventListener("click", (e) => {
  const navBtn = e.target.closest("[data-nav]");
  if (navBtn) {
    e.stopPropagation();
    nav(navBtn.dataset.nav, navBtn.dataset.id || null);
    return;
  }

  const shareBtn = e.target.closest("[data-share]");
  if (shareBtn) {
    const title = shareBtn.dataset.shareTitle || "Información";
    const content = shareBtn.dataset.shareContent || "";
    openBottomSheet(`
      <h2 style="margin-bottom:15px;">${title}</h2>
      <div style="font-size:1.1rem; line-height:1.6;">${content.replaceAll("\n", "<br>")}</div>
      <button class="btn primary" style="width:100%; margin-top:20px;" onclick="document.getElementById('sheetOverlay').click()">Cerrar</button>
    `);
    return;
  }


  if (e.target.closest("#favToggle")) {
    const id = new URL(location.href).searchParams.get("id");
    toggleFavorite(id);
    return;
  }

  if (e.target.closest("#btnThemeToggle")) return setTheme(state.theme === 'dark' ? 'light' : 'dark');
  if (e.target.closest("#btnThemeLight")) return setTheme('light');
  if (e.target.closest("#btnThemeDark")) return setTheme('dark');
  if (e.target.closest("#btnFontSmall")) return setFontSize('small');
  if (e.target.closest("#btnFontMedium")) return setFontSize('medium');
  if (e.target.closest("#btnFontLarge")) return setFontSize('large');

  if (e.target.closest("#btnUrgencias")) {
    state.urgencyOnly = !state.urgencyOnly;
    route(); 
    return;
  }

  if (e.target.closest("#btnFavoritos")) {
    state.filterFavorites = !state.filterFavorites;
    route();
    return;
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "topicSearch") {
    syncSearchState(e.target);
    return;
  }

  const form = e.target.closest("form[data-calc]");
  if (form) {
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
  }
});

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

// --- DASHBOARD UTILITIES ---
window.updateMetabolicReport = function() {
  const form = document.getElementById('metabolicForm');
  if (!form) return;
  const d = new FormData(form);
  const w = parseFloat(d.get('weight')) || 0;
  const h = parseFloat(d.get('height')) || 0;
  const glucose = parseFloat(d.get('glucose')) || 0;
  const waist = parseFloat(d.get('waist')) || 0;
  const ldl = parseFloat(d.get('ldl')) || 0;
  const sys = parseFloat(d.get('sys')) || 0;
  const dia = parseFloat(d.get('dia')) || 0;

  const bmi = (w > 0 && h > 0) ? (w / (h * h)).toFixed(1) : '--';
  
  let riskItems = [];
  if (bmi >= 30) riskItems.push("Obesidad (Riesgo Metabólico)");
  if (glucose >= 100) riskItems.push("Glucosa Alterada (Pre-diabetes/DM2)");
  if (sys >= 130 || dia >= 80) riskItems.push("Tensión Arterial Elevada");
  if (ldl >= 130) riskItems.push("Dislipidemia (Riesgo CV)");

  const report = `MONITOREO METABÓLICO (PWA 2026)
----------------------------------
PESO: ${w} kg | TALLA: ${h} m | IMC: ${bmi}
CINTURA: ${waist || '--'} cm
GLUCOSA: ${glucose || '--'} mg/dL
P.A.: ${sys || '--'}/${dia || '--'} mmHg
LDL: ${ldl || '--'} mg/dL

HALLAZGOS CLÍNICOS:
${riskItems.length ? '• ' + riskItems.join('\n• ') : '• Sin hallazgos de alerta inmediatos.'}

PLAN SUGERIDO: Revisión de terapia metabólica y ajuste nutricional.
`;
  const reportEl = document.getElementById('metabolicReportText');
  if (reportEl) reportEl.innerText = report;
};

window.copyMetabolicReport = async function() {
  const text = document.getElementById('metabolicReportText').innerText;
  try {
    await navigator.clipboard.writeText(text);
    alert("Nota clínica copiada al portapapeles.");
  } catch (e) { console.error(e); }
};

window.openQuickTool = function(fn) {
  // Shortcut to open a calculator in the bottom sheet
  const block = { type: 'calculator', fn: fn, title: fn.toUpperCase(), inputs: [] };
  // We need to map inputs for quick tools since they aren't in the dataset
  if (fn === 'bmi') block.inputs = [{key:'weight', label:'Peso (kg)'}, {key:'height', label:'Talla (m)'}];
  if (fn === 'hr_target') block.inputs = [{key:'age', label:'Edad'}];
  
  import("./ui/renderBlocks.js").then(m => {
    const html = m.renderBlock(state.dataset, block, state.mode);
    openBottomSheet(`
      <h2 style="margin-bottom:15px; font-family:var(--font-mono);">⚡ ACCESO_RAPIDO</h2>
      ${html}
      <button class="btn" style="width:100%; margin-top:20px;" onclick="document.getElementById('sheetOverlay').click()">CERRAR</button>
    `);
  });
};
