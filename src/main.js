// src/main.js
import { loadDataset } from "./engine/dataset.js";
import { renderHome, renderTopic, renderPrintable } from "./ui/router.js";
import { initInstallPrompt } from "./ui/install.js";

const app = document.getElementById("app");

const state = {
  mode: localStorage.getItem("mode") || "clinician",
  dataset: null,
  urgencyOnly: false,
  favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
  filterFavorites: false
};

// Iniciar lógica de instalación
initInstallPrompt();

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

  // Persistencia de contexto clínico
  if (view === "topic" && id) {
    localStorage.setItem("lastTopic", id);
  }

  window.scrollTo(0, 0);

  if (view === "topic" && id) {
    app.innerHTML = renderTopic(state.dataset, id, state.mode, state.favorites.includes(id));
  } else if (view === "print" && id) {
    app.innerHTML = renderPrintable(state.dataset, id);
  } else {
    app.innerHTML = renderHome(state.dataset, state.mode, state);

    // Si hay un tema previo, podríamos mostrar una opción de "Continuar revisando"
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

  // Actualizar estado de la navegación inferior
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

  // Buscador de temas (Hero Search)
  const searchInput = document.getElementById("topicSearch");
  if (searchInput) {
    const cards = Array.from(document.querySelectorAll(".grid-menu .topic-card"));

    const syncSearchState = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(card => {
        const id = card.dataset.id;
        const title = card.querySelector("h2")?.textContent?.toLowerCase() || "";
        const badges = Array.from(card.querySelectorAll(".badge")).map(b => b.textContent.toLowerCase());
        const isUrgent = card.querySelector(".urgency");

        let match = !query || title.includes(query) || badges.some(b => b.includes(query));

        // Filtro de urgencias persistente
        if (state.urgencyOnly && !isUrgent) match = false;
        if (state.filterFavorites && !state.favorites.includes(id)) match = false;

        card.style.display = match ? "flex" : "none";
        if (match) visible += 1;
      });

      const emptyEl = document.getElementById("topicSearchEmpty");
      if (emptyEl) emptyEl.style.display = visible === 0 ? "block" : "none";
    };

    searchInput.oninput = syncSearchState;

    const urgenciasBtn = document.getElementById("btnUrgencias");
    if (urgenciasBtn) {
      urgenciasBtn.onclick = () => {
        state.urgencyOnly = !state.urgencyOnly;
        urgenciasBtn.style.background = state.urgencyOnly ? "var(--danger-bg)" : "rgba(255,255,255,0.1)";
        urgenciasBtn.style.color = state.urgencyOnly ? "var(--danger)" : "white";
        syncSearchState();
      };
    }

    const favoritosBtn = document.getElementById("btnFavoritos");
    if (favoritosBtn) {
      favoritosBtn.onclick = () => {
        state.filterFavorites = !state.filterFavorites;
        favoritosBtn.style.background = state.filterFavorites ? "var(--info-bg)" : "rgba(255,255,255,0.1)";
        favoritosBtn.style.color = state.filterFavorites ? "var(--info-blue)" : "white";
        syncSearchState();
      };
    }

    syncSearchState();
  }

  // Handler para favorito en vista topic
  const favToggle = document.getElementById("favToggle");
  if (favToggle) {
    favToggle.onclick = () => {
      const id = new URL(location.href).searchParams.get("id");
      toggleFavorite(id);
    };
  }

  // Settings placeholder
  const settingsBtn = document.getElementById("btnSettings") || document.getElementById("btnTopicSettings");
  if (settingsBtn) {
    settingsBtn.onclick = () => alert("Ajustes: Próximamente podrá personalizar las fuentes y el tamaño de texto.");
  }


  // Modal "Compartir / Ver para paciente"
  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.onclick = () => {
      const overlay = document.getElementById("shareOverlay");
      const body = document.getElementById("shareBody");
      const title = btn.dataset.shareTitle;
      const content = btn.dataset.shareContent;

      overlay.querySelector("h2").textContent = title;
      body.innerHTML = content.replaceAll("\n", "<br>");
      overlay.style.display = "flex";
    };
  });

  const closeShare = document.getElementById("shareClose");
  if (closeShare) closeShare.onclick = () => document.getElementById("shareOverlay").style.display = "none";

  // Calculadoras
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
            out.innerHTML = `<span style="color:var(--primary-blue)">${res.text}</span>`;
          } else {
            out.innerHTML = `<span style="color:#999; font-size:0.9rem">${res.error || "Formato incompleto..."}</span>`;
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
    route();
  } catch (e) {
    app.innerHTML = `<div class="clinical-box danger" style="margin:20px"><span class="box-title">ERROR DE SISTEMA</span>${e.message}</div>`;
  }
})();
