// src/main.js
import { loadDataset } from "./engine/dataset.js";
import { renderHome, renderTopic, renderPrintable } from "./ui/router.js";
import { initInstallPrompt } from "./ui/install.js";

// import { runCalculator } from "./engine/calculators.js"; // Descomenta si ya tienes este archivo

const app = document.getElementById("app");

const state = {
  mode: localStorage.getItem("mode") || "clinician",
  dataset: null
};

// Iniciar lógica de instalación
initInstallPrompt();

function setMode(next) {
  state.mode = next;
  localStorage.setItem("mode", next);
  route();
}

function route() {
  if (!state.dataset) return; // Esperar a que cargue

  const url = new URL(location.href);
  const view = url.searchParams.get("view") || "home";
  const id = url.searchParams.get("id");

  window.scrollTo(0, 0);

  if (view === "topic" && id) {
    app.innerHTML = renderTopic(state.dataset, id, state.mode);
  } else if (view === "print" && id) {
    app.innerHTML = renderPrintable(state.dataset, id);
    // Si es HTML nativo (no PDF), lanzamos print automático
    const p = state.dataset.printablesById[id];
    if (p && !p.url) setTimeout(() => window.print(), 500);
  } else {
    app.innerHTML = renderHome(state.dataset, state.mode);
  }
  wireHandlers();
}

function nav(view, id) {
  const url = new URL(location.href);
  url.searchParams.set("view", view);
  if (id) url.searchParams.set("id", id); else url.searchParams.delete("id");
  history.pushState({}, "", url);
  route();
}

function wireHandlers() {
  // Navegación básica
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      nav(btn.dataset.nav, btn.dataset.id || null);
    };
  });

  // Toggle Modo Médico/Paciente
  const modeBtn = document.getElementById("modeToggle");
  if (modeBtn) {
    modeBtn.onclick = () => {
      setMode(state.mode === "clinician" ? "patient" : "clinician");
    };
  }

  // Buscador de temas
  const searchInput = document.getElementById("topicSearch");
  if (searchInput) {
    searchInput.oninput = () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll(".grid-menu .card").forEach(card => {
        const title = card.querySelector("h2").textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll(".badge")).map(b => b.textContent.toLowerCase()).join(" ");
        if (title.includes(query) || tags.includes(query)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    };
  }

  // Modal "Compartir / Ver para paciente"
  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.onclick = () => {
      const overlay = document.getElementById("shareOverlay");
      const body = document.getElementById("shareBody");
      const title = btn.dataset.shareTitle;
      const content = btn.dataset.shareContent; // Viene del renderBlocks

      overlay.querySelector("h2").textContent = title;
      body.innerHTML = content.replaceAll("\n", "<br>"); // Simple format
      overlay.style.display = "flex";
    };
  });

  const closeShare = document.getElementById("shareClose");
  if (closeShare) closeShare.onclick = () => document.getElementById("shareOverlay").style.display = "none";

  // Calculadoras (Lógica Dinámica)
  document.querySelectorAll("form[data-calc]").forEach(form => {
    form.oninput = () => {
      const fn = form.dataset.calc;
      const inputs = {};
      form.querySelectorAll("input").forEach(i => inputs[i.dataset.key] = parseFloat(i.value));

      // Aquí conectamos con tu engine/calculators.js
      // Por ahora un dummy para que no falle si no tienes el archivo
      import("./engine/calculators.js")
        .then(module => {
          const res = module.runCalculator(fn, inputs);
          const out = form.querySelector("[data-output]");
          if (res.ok) {
            out.innerHTML = `<span style="font-size:1.2em; font-weight:bold; color:#0066cc">${res.text}</span>`;
          } else {
            out.innerHTML = `<span style="color:#999">${res.error || "..."}</span>`;
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
    console.log("Dataset cargado:", state.dataset);
    route();
  } catch (e) {
    app.innerHTML = `<div style="padding:20px; text-align:center">
      <h2>Error iniciando App</h2>
      <p>${e.message}</p>
      <small>Revisa la consola para más detalles</small>
    </div>`;
  }
})();