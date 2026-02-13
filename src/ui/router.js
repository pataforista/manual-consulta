// src/ui/router.js
import { renderBlocks } from "./renderBlocks.js";

// --- VISTA: HOME ---
export function renderHome(dataset, mode) {
  // Ahora leemos la lista ordenada desde el manifest
  const topicsList = dataset.manifest?.topics || [];

  return `
    <header>
      <div class="row" style="justify-content:space-between">
        <h1>Manual de Psiquiatría</h1>
        <button id="modeToggle" class="btn ${mode === 'patient' ? 'primary' : ''}">
          ${mode === 'clinician' ? '👨‍⚕️ Modo Médico' : '👤 Modo Paciente'}
        </button>
      </div>
    </header>
    <main>
      <p class="welcome-text">
        ${mode === 'clinician' ? 'Seleccione un tema clínico:' : 'Material informativo para pacientes:'}
      </p>

      <div class="search-container no-print">
        <input type="search" id="topicSearch" placeholder="🔍 Buscar tema, fármaco o etiqueta..." class="search-input" aria-label="Buscar temas">
        <small id="topicSearchCount" class="search-count"></small>
      </div>
      
      <div class="grid-menu">
        ${topicsList.map(ref => {
    // Buscamos el contenido real en topicsById para sacar el icono o titulo real
    const topicData = dataset.topicsById[ref.id];
    if (!topicData) return ''; // Si falló la carga de este topic, no lo mostramos

    // Filtro simple: Si es modo paciente y el tema es SOLO clinico, lo ocultamos
    if (mode === 'patient' && topicData.audience === 'clinician') return '';

    return `
          <button class="card clickable topic-card" data-nav="topic" data-id="${ref.id}" type="button" aria-label="Abrir tema: ${topicData.title}">
            <div class="row" style="align-items: flex-start;">
                <div class="topic-icon">📄</div>
                <div style="flex:1">
                    <h2 style="margin-bottom:4px">${topicData.title}</h2>
                    <div class="row" style="gap:4px; margin-bottom:6px">
                        ${(topicData.tags || []).slice(0, 3).map(tag =>
      `<span class="badge" style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px; color:#555;">${tag}</span>`
    ).join('')}
                    </div>
                </div>
            </div>
          </button>
          `;
  }).join('')}
      </div>
      <div id="topicSearchEmpty" class="card" style="display:none; text-align:center;">No se encontraron temas para esta búsqueda.</div>
    </main>
    
    <div id="shareOverlay" class="overlay" style="display:none;">
      <div class="overlay-content">
        <h2 style="margin-top:0">Para el paciente</h2>
        <div id="shareBody" style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:15px;"></div>
        <button id="shareClose" class="btn">Cerrar</button>
      </div>
    </div>
  `;
}

// --- VISTA: TEMA (TOPIC) ---
export function renderTopic(dataset, id, mode) {
  // Búsqueda directa por ID (O(1)) gracias a tu nueva estructura
  const topic = dataset.topicsById[id];

  if (!topic) return `<main><div class="card warn danger">Error: Tema "${id}" no encontrado o no cargó correctamente.</div><button class="btn" data-nav="home">Volver</button></main>`;

  return `
    <header>
      <div class="row">
        <button class="btn" data-nav="home">← Volver</button>
        <h1 style="font-size:1.1rem; flex:1; margin-left:10px;">${topic.title}</h1>
      </div>
    </header>
    <main>
      ${renderBlocks(dataset, topic, mode)}
      
      <hr style="margin: 30px 0;">
      <div style="text-align:center; color:#999; font-size:0.8rem">
        Fuente: ${topic.meta?.source || 'N/A'} (v${topic.meta?.version || '?'})
      </div>
    </main>
  `;
}

// --- VISTA: IMPRIMIBLE ---
export function renderPrintable(dataset, id) {
  const item = dataset.printablesById?.[id];
  if (!item) return `<main>Imprimible no encontrado</main>`;

  // 1. Caso PDF
  if (item.template === 'pdf' || item.url?.toLowerCase().endsWith('.pdf')) {
    return `
      <div style="height:100vh; display:flex; flex-direction:column;">
        <header class="no-print" style="padding:10px; background:#eee; display:flex; gap:10px;">
            <button class="btn" data-nav="home">Cerrar</button>
            <button class="btn primary" onclick="document.getElementById('pdfFrame').contentWindow.print()">🖨️ Imprimir</button>
            <span style="align-self:center; font-weight:bold;">${item.title}</span>
        </header>
        <iframe id="pdfFrame" src="${item.url}" style="flex:1; border:none; width:100%;"></iframe>
      </div>
     `;
  }

  // 2. Caso Imagen (Infografías)
  if (item.template === 'image') {
    return `
      <div class="infographic-viewer" style="min-height:100vh; display:flex; flex-direction:column; background:#f0f2f5;">
        <header class="no-print" style="padding:10px; background:#fff; border-bottom:1px solid #ddd; display:flex; gap:10px; position:sticky; top:0; z-index:100;">
            <button class="btn" data-nav="home">← Volver</button>
            <button class="btn primary" onclick="window.print()">🖨️ Imprimir</button>
            <a href="${item.url}" download="${item.id}" class="btn">💾 Descargar</a>
            <span style="align-self:center; font-weight:bold; flex:1; text-align:center;">${item.title}</span>
        </header>
        <main style="flex:1; display:flex; align-items:flex-start; justify-content:center; padding:20px;">
            <img src="${item.url}" alt="${item.title}" style="max-width:100%; height:auto; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background:#fff;">
        </main>
      </div>
    `;
  }

  // 2. Caso Guía / Checklist (NUEVO: Para tu hoja maestra)
  if (item.template === 'guide_checklist') {
    return `
      <div class="printable-sheet" style="padding:40px; max-width:800px; margin:0 auto; font-family:sans-serif;">
        <div class="no-print" style="margin-bottom:20px;">
           <button class="btn" data-nav="home">← Volver</button>
           <button class="btn primary" onclick="window.print()">🖨️ Imprimir Guía</button>
        </div>

        <h1 style="text-align:center; border-bottom:2px solid #333; padding-bottom:10px;">${item.title}</h1>
        <p style="text-align:center; color:#666; font-style:italic;">Resumen de recomendaciones para llevar a casa.</p>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
          ${item.sections.map(sec => `
            <div style="border:1px solid #ccc; border-radius:8px; padding:15px; break-inside: avoid;">
              <h3 style="margin-top:0; color:#0066cc; border-bottom:1px solid #eee; padding-bottom:5px;">${sec.title}</h3>
              <ul style="padding-left:20px;">
                ${sec.items.map(txt => `<li style="margin-bottom:6px; line-height:1.4;">${txt}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:30px; border-top:1px solid #ccc; padding-top:10px; text-align:center; font-size:12px;">
          Recuerde: Estos son consejos generales. Consulte siempre a su médico para dudas específicas.
        </div>
      </div>
    `;
  }

  // 3. Caso Tabla (Log de Presión, etc.)
  if (item.headers) {
    const rows = Array(15).fill('');
    return `
      <div class="printable-sheet" style="padding:20px;">
        <h1 style="text-align:center; margin-bottom:20px;">${item.title}</h1>
        <table style="width:100%; border-collapse:collapse; border:1px solid #000;">
          <thead>
            <tr>${item.headers.map(h => `<th style="border:1px solid #000; padding:8px; background:#f0f0f0;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(() => `
              <tr>${item.headers.map(() => `<td style="border:1px solid #000; height:30px;"></td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
        <div class="no-print" style="margin-top:20px; text-align:center;">
          <button class="btn primary" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn" data-nav="home">Volver</button>
        </div>
      </div>
    `;
  }
  return `<main>Formato desconocido</main>`;
}
