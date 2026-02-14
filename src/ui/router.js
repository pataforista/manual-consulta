// src/ui/router.js
import { renderBlocks } from "./renderBlocks.js";

// --- VISTA: HOME ---
export function renderHome(dataset, mode, state = {}) {
  const topicsList = dataset.manifest?.topics || [];
  const { urgencyOnly = false, filterFavorites = false } = state;

  return `
    <header>
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:24px;">🎐</span>
        <h1 style="color:var(--text-main)">Manual Clínico 2026</h1>
      </div>
      <button id="modeToggle" class="btn" style="padding: 4px 12px; font-size:10px;">
        ${mode === 'clinician' ? 'MED_MODE_INIT' : 'PAT_MODE_AUTH'}
      </button>
    </header>

    <div class="search-hero no-print">
      <div class="search-container">
        <input type="search" id="topicSearch" placeholder="BUSCAR_PROTOCOLO..." class="search-input" aria-label="Buscar temas">
      </div>
      <div style="margin-top:20px; display:flex; justify-content:center; gap:12px;">
        <button class="btn ${urgencyOnly ? 'primary' : ''}" id="btnUrgencias">
          🚨 URGENCIA
        </button>
        <button class="btn ${filterFavorites ? 'primary' : ''}" id="btnFavoritos">
          ⭐ FAVORITO
        </button>
      </div>
    </div>

    <main>
      <div id="btnResume" class="card clickable" style="display:none; flex-direction:row; align-items:center; gap:15px; border-style:dashed; padding:15px; margin-bottom:24px;">
        <span style="font-size:24px;">🕒</span>
        <div style="flex:1">
            <small style="font-family:var(--font-mono); font-weight:700; opacity:0.7;">MEMORIA_SISTEMA</small>
            <span style="display:block; font-weight:700; font-size:1.1rem; line-height:1.2;">—</span>
        </div>
      </div>

      <div class="grid-menu">
        ${topicsList.map(ref => {
    const topicData = dataset.topicsById[ref.id];
    if (!topicData) return '';
    if (mode === 'patient' && topicData.audience === 'clinician') return '';

    const isUrgency = (topicData.tags || []).includes('urgencia') || (topicData.tags || []).includes('crisis') || (topicData.tags || []).includes('urgencias');
    const icon = topicData.icon || (isUrgency ? '🏮' : '📜');

    return `
          <button class="card clickable topic-card" data-nav="topic" data-id="${ref.id}" type="button" aria-label="${topicData.title}" data-id="${ref.id}">
            <div class="topic-icon">${icon}</div>
            <h2 style="font-family:var(--font-main)">${topicData.title}</h2>
            <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-top:auto;">
                ${isUrgency ? '<span class="badge urgency">KRISIS</span>' : ''}
                ${(topicData.tags || []).slice(0, 2).map(tag =>
      `<span class="badge">${tag.toUpperCase()}</span>`
    ).join('')}
            </div>
            ${(state.favorites || []).includes(ref.id) ? '<span style="position:absolute; top:8px; right:8px; font-size:12px;">✦</span>' : ''}
          </button>
          `;
  }).join('')}
      </div>

      <div id="topicSearchEmpty" class="card" style="display:none; text-align:center; padding:40px; border-style:dashed;">
        <span style="font-size:40px; display:block; margin-bottom:15px;">🔍</span>
        <h3>No se encontraron resultados</h3>
        <p style="color:var(--text-muted)">Intente con otros términos o revise la ortografía.</p>
      </div>
    </main>

    <div class="nav-bottom no-print">
      <button class="nav-item active" data-nav="home">
        <span>🏠</span>
        <span>Inicio</span>
      </button>
      <button class="nav-item" onclick="document.getElementById('topicSearch').focus()">
        <span>🔍</span>
        <span>Buscar</span>
      </button>
      <button class="nav-item" data-nav="printables">
        <span>📚</span>
        <span>Recursos</span>
      </button>
      <button class="nav-item" id="btnSettings">
        <span>⚙️</span>
        <span>Ajustes</span>
      </button>
    </div>
    
    <div id="shareOverlay" class="overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center; padding:20px;">
      <div class="overlay-content" style="background:var(--bg-paper); padding:25px; border-radius:var(--radius-lg); max-width:500px; width:100%; box-shadow:var(--shadow-hover);">
        <h2 style="margin-top:0; color:var(--primary-deep)">Educación al Paciente</h2>
        <div id="shareBody" style="background:var(--bg-clinical); padding:15px; border-radius:var(--radius-md); margin-bottom:20px; max-height:60vh; overflow-y:auto; border:1px solid var(--border-light);"></div>
        <div style="display:flex; gap:10px;">
            <button id="shareClose" class="btn primary" style="flex:1">Cerrar</button>
            <button class="btn" style="flex:1" onclick="window.print()">🖨️ Imprimir</button>
        </div>
      </div>
    </div>
  `;
}

// --- VISTA: TEMA (TOPIC) ---
export function renderTopic(dataset, id, mode, isFavorite = false) {
  const topic = dataset.topicsById[id];

  if (!topic) return `<main><div class="clinical-box danger"><span class="box-title">SISTEMA_ERROR</span>Tema no encontrado en la base de datos local.</div><button class="btn" data-nav="home">◂ VOLVER_INICIO</button></main>`;

  return `
    <header>
      <button class="btn" data-nav="home" style="border:none; font-size:20px;">◂</button>
      <h1 style="flex:1; margin-left:12px; font-size:1.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topic.title.toUpperCase()}</h1>
      <div style="display:flex; gap:8px;">
          <button class="btn" id="favToggle" title="Favorito" style="font-size:18px; border:none;">${isFavorite ? '✦' : '✧'}</button>
          <button class="btn" onclick="window.print()" style="border:none; font-size:18px;">📜</button>
      </div>
    </header>
    <main>
      <div style="margin-bottom:24px; display:flex; gap:8px; flex-wrap:wrap">
        ${(topic.tags || []).map(t => `<span class="badge" style="background:var(--text-main); color:var(--bg-clinical);">${t.toUpperCase()}</span>`).join('')}
      </div>
      
      ${renderBlocks(dataset, topic, mode)}
      
      <div style="margin-top:40px; padding:30px 20px; border-top:var(--border-ink); text-align:center; color:var(--text-muted); font-family:var(--font-mono); font-size:0.75rem; letter-spacing:0.5px;">
        <p><strong>FUERZA_EVIDENCIA:</strong> ${topic.meta?.source || 'NUCLEO_INTERNO'} (REF_2026)</p>
        <p>ESTE DOCUMENTO ES DE CARÁCTER CLÍNICO. REQUIERE CRITERIO PROFESIONAL PARA SU EJECUCIÓN.</p>
      </div>
    </main>

    <div class="nav-bottom no-print">
      <button class="nav-item" data-nav="home">
        <span>🎐</span>
        <span>INICIO</span>
      </button>
      <button class="nav-item active">
        <span>📜</span>
        <span>CONTENIDO</span>
      </button>
      <button class="nav-item" id="btnTopicSettings">
        <span>⚙️</span>
        <span>OPCIONES</span>
      </button>
    </div>
  `;
}


// --- VISTA: IMPRIMIBLE ---
export function renderPrintable(dataset, id) {
  const item = dataset.printablesById?.[id];
  if (!item) return `<main>Recurso no encontrado</main>`;

  // 1. Caso PDF
  if (item.template === 'pdf' || item.url?.toLowerCase().endsWith('.pdf')) {
    return `
      <div style="height:100vh; display:flex; flex-direction:column;">
        <header class="no-print">
            <button class="btn" data-nav="home">← Volver</button>
            <h1 style="flex:1; text-align:center;">${item.title}</h1>
            <button class="btn primary" onclick="document.getElementById('pdfFrame').contentWindow.print()">🖨️</button>
        </header>
        <iframe id="pdfFrame" src="${item.url}" style="flex:1; border:none; width:100%;"></iframe>
      </div>
     `;
  }

  // 2. Caso Imagen (Infografías)
  if (item.template === 'image') {
    return `
      <div class="infographic-viewer" style="min-height:100vh; display:flex; flex-direction:column; background:var(--bg-clinical);">
        <header class="no-print">
            <button class="btn" data-nav="home">←</button>
            <h1 style="flex:1; text-align:center;">${item.title}</h1>
            <button class="btn primary" onclick="window.print()">🖨️</button>
        </header>
        <main style="flex:1; display:flex; align-items:flex-start; justify-content:center; padding:20px;">
            <img src="${item.url}" alt="${item.title}" style="max-width:100%; height:auto; border-radius:var(--radius-md); box-shadow:var(--shadow-hover); background:white;">
        </main>
      </div>
    `;
  }

  return `<main>Formato de impresión no optimizado para esta vista.</main>`;
}


