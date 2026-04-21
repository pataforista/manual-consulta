export function renderBlocks(dataset, topic, mode) {
  const blocks = (topic.blocks || []);
  return blocks.map(b => renderBlock(dataset, b, mode)).join("");
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function levelClass(level) {
  const v = String(level || "info").toLowerCase();
  if (v === "critical" || v === "danger") return "danger";
  if (v === "warning" || v === "caution") return "warning";
  return "pearl";
}

function renderTable(headers, rows) {
  const H = headers || [];
  const R = rows || [];
  return `<div style="overflow:auto;">
    <table>
      <thead><tr>${H.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>
        ${R.map(r => {
    let cells = Array.isArray(r) ? r : (r && typeof r === "object" ? Object.values(r) : [String(r)]);
    if (H.length) {
      if (cells.length < H.length) cells = cells.concat(Array(H.length - cells.length).fill(""));
      if (cells.length > H.length) cells = cells.slice(0, H.length);
    }
    return `<tr>${cells.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`;
  }).join("")}
      </tbody>
    </table>
  </div>`;
}

function renderKeyValue(data) {
  const entries = data && typeof data === "object" ? Object.entries(data) : [];
  return `<table>
    <tbody>
      ${entries.map(([k, v]) => `<tr>
        <td style="width:40%; font-weight:600;"><small>${esc(k)}</small></td>
        <td>${esc(v)}</td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function shareBtn(b) {
  // Deshabilitado: enfoque exclusivo profesional
  return "";
}

function renderSubBlocks(dataset, subBlocks, mode) {
  const arr = (subBlocks || []);
  return arr.map(sb => renderBlock(dataset, sb, mode)).join("");
}

function renderLink(url, label) {
  if (!url) return esc(label || "");
  return `<a href="${esc(url)}" target="_blank" rel="noreferrer" style="color:var(--primary-blue); font-weight:600;">${esc(label || url)}</a>`;
}

export function renderBlock(dataset, b, mode) {
  const type = b.type;
  const title = b.title ? `<h3 style="margin-top:0; font-size:1.1rem; color:var(--primary-deep)">${esc(b.title)}</h3>` : "";
  const share = shareBtn(b);

  // Didactic level badge
  let didactic = "";
  if (b.didactic_level) {
    const labels = {
      1: "L1_PRACTICO",
      2: "L2_RAZONAMIENTO",
      3: "L3_EVIDENCIA"
    };
    const labelText = labels[b.didactic_level] || `LVL_${b.didactic_level}`;
    didactic = `<span class="badge" style="background:var(--text-main); color:var(--bg-clinical); border:none; border-radius:1px; margin-bottom:8px; display:inline-block;">${labelText}</span><br>`;
  }

  if (type === "text" || type === "summary") {
    return `<div class="card" style="text-align:left; align-items:flex-start;">${didactic}${title}<p style="margin:0;">${esc(b.content || "").replaceAll("\n", "<br>")}</p>${share}</div>`;
  }

  if (type === "checklist" || type === "list") {
    const items = b.items || [];
    const listHtml = items.map(it => `<li style="margin-bottom:8px; display:flex; gap:10px;"><span style="color:var(--primary-spirit)">${type === 'checklist' ? '☑' : '•'}</span><span>${esc(it)}</span></li>`).join("");
    return `
      <div class="card" style="text-align:left; align-items:flex-start;">
        ${didactic}${title}
        <ul style="list-style:none; padding:0; margin:0; width:100%;">${listHtml}</ul>
        ${share}
      </div>`;
  }

  if (type === "table") {
    return `<div class="card" style="text-align:left; align-items:flex-start; padding:15px; overflow-x:auto;">${didactic}${title}${renderTable(b.headers, b.rows)}</div>`;
  }

  if (type === "warning" || type === "alert" || type === "danger" || type === "pearl") {
    const lvl = type === "pearl" ? "pearl" : levelClass(b.level || (type === "danger" ? "danger" : "warning"));
    const labelMapping = {
      danger: "🚩 BANDERA_ROJA",
      warning: "⚠️ ADVERTENCIA",
      pearl: "💡 PERLA_CLINICA"
    };
    const label = labelMapping[lvl] || "INFO_LOG";
    const items = b.items || [];
    const list = items.length ? `<ul style="margin:10px 0 0; padding-left:20px;">${items.map(it => `<li>${esc(it)}</li>`).join("")}</ul>` : "";
    return `<div class="clinical-box ${lvl}">
      <span class="box-title">${label}</span>
      <button class="btn-copy no-print" onclick="copyClinicalText(this)" title="Copiar al portapapeles" style="position:absolute; top:5px; right:5px; background:none; border:none; cursor:pointer; opacity:0.5; padding:5px;">📋</button>
      ${b.title ? `<strong>${esc(b.title)}</strong><br>` : ""}
      <div class="copy-content">
        <p style="margin:5px 0 0;">${esc(b.content || "").replaceAll("\n", "<br>")}</p>
        ${list}
      </div>
      ${share}
    </div>`;
  }

  if (type === "calculator") {
    const inputs = (b.inputs || []).map(inp => `
      <div style="flex:1; min-width:120px;">
        <label style="font-family:var(--font-mono); font-size:11px;">
          <span style="font-weight:700; opacity:0.8;">${esc(inp.label).toUpperCase()}</span><br>
          <input class="search-input" style="padding:10px; border-width:1px; margin-top:4px; font-size:14px;" data-key="${esc(inp.key)}" type="number" min="${inp.min ?? ""}" max="${inp.max ?? ""}" step="${inp.step ?? "any"}">
        </label>
      </div>
    `).join("");
    return `<div class="card" style="text-align:left; align-items:flex-start; background:var(--success-bg); border-color:var(--primary-spirit);">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; color:var(--text-main)">
        <span style="font-size:24px;">⚙️</span>
        <h3 style="margin:0; font-size:1rem; font-family:var(--font-mono); font-weight:800;">CALC_${esc(b.title || "TRIAL").toUpperCase()}</h3>
      </div>
      <form data-calc="${esc(b.fn)}" style="display:flex; flex-wrap:wrap; gap:15px; width:100%;">
        ${inputs}
        <div style="width:100%; padding:20px; background:var(--bg-paper); border:2px solid var(--text-main); margin-top:10px;">
          <small style="text-transform:uppercase; font-weight:800; opacity:0.6; font-family:var(--font-mono);">SYSTEM_OUTPUT</small>
          <div data-output style="padding:5px 0; font-size:1.5rem; font-weight:800; font-family:var(--font-mono);">—</div>
        </div>
      </form>
      ${share}
    </div>`;
  }

  if (type === "section") {
    const content = b.content ? `<p>${esc(b.content).replaceAll("\n", "<br>")}</p>` : "";
    const subs = b.sub_blocks ? `<div style="margin-top:15px; width:100%;">${renderSubBlocks(dataset, b.sub_blocks, mode)}</div>` : "";
    return `<div style="margin:25px 0;">${title}${content}${subs}</div>`;
  }

  if (type === "key_value") {
    return `<div class="card" style="text-align:left; align-items:flex-start;">${title}${renderKeyValue(b.data)}</div>`;
  }

  if (type === "accordion") {
    const items = b.items || [];
    return `<div style="margin:15px 0;">
      ${title}
      ${items.map(it => `<details class="card" style="margin:8px 0; display:block; text-align:left; align-items:flex-start;">
        <summary style="font-weight:700; cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
          <span>${esc(it.title || "Detalle")}</span>
          <span style="font-size:12px; opacity:0.5;">▼</span>
        </summary>
        <div style="padding-top:15px; border-top:1px solid var(--border-light); margin-top:10px;">
          ${esc(it.content || "").replaceAll("\n", "<br>")}
        </div>
      </details>`).join("")}
    </div>`;
  }

  if (type === "flowchart") {
    const steps = b.steps || [];
    return `<div style="margin:20px 0;">
      ${title}
      <div class="flowchart">
        ${steps.map((step, idx) => `<div class="flow-step">
          <div class="flow-index">${idx + 1}</div>
          <div style="flex:1">
            <div style="font-weight:700; color:var(--primary-deep);">${esc(step.title || `Paso ${idx + 1}`)}</div>
            <p style="margin:4px 0 0; font-size:0.9rem; color:var(--text-muted);">${esc(step.content || "")}</p>
          </div>
        </div>`).join("")}
      </div>
    </div>`;
  }

  if (type === "resource_link") {
    const pid = b.link_id;
    if (pid && dataset.printablesById[pid]) {
      return `<div class="card clickable" data-nav="print" data-id="${esc(pid)}" style="flex-direction:row; justify-content:space-between; align-items:center; text-align:left;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:24px;">📄</div>
          <div>
            <div style="font-weight:700;">${esc(b.label || dataset.printablesById[pid].title)}</div>
            <small style="color:var(--text-muted);">Recurso imprimible</small>
          </div>
        </div>
        <div style="font-size:18px; color:var(--primary-blue);">→</div>
      </div>`;
    }
    return "";
  }

  return `<div class="card"><p>Bloque no soportado: ${esc(type)}</p></div>`;
}

