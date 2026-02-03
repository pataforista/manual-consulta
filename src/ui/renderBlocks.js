export function renderBlocks(dataset, topic, mode){
  const blocks = (topic.blocks||[]).filter(b=>{
    const aud = b.audience || "both";
    if(mode==="patient") return (aud==="patient" || aud==="both");
    return true;
  });
  return blocks.map(b=>renderBlock(dataset, b, mode)).join("");
}

function esc(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function levelClass(level){
  const v = String(level||"info").toLowerCase();
  if(v==="critical" || v==="danger") return "danger";
  if(v==="warning" || v==="caution") return "caution";
  return "info";
}

function renderTable(headers, rows){
  const H = headers || [];
  const R = rows || [];
  return `<div style="overflow:auto;">
    <table style="width:100%; border-collapse:collapse;">
      <thead><tr>${H.map(h=>`<th style="border:1px solid #ddd; padding:6px; text-align:left;">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>
        ${R.map(r=>{
          let cells = Array.isArray(r) ? r : (r && typeof r==="object" ? Object.values(r) : [String(r)]);
          if(H.length){
            if(cells.length < H.length) cells = cells.concat(Array(H.length-cells.length).fill(""));
            if(cells.length > H.length) cells = cells.slice(0,H.length);
          }
          return `<tr>${cells.map(c=>`<td style="border:1px solid #ddd; padding:6px;">${esc(c)}</td>`).join("")}</tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>`;
}

function renderKeyValue(data){
  const entries = data && typeof data==="object" ? Object.entries(data) : [];
  return `<table style="width:100%; border-collapse:collapse;">
    <tbody>
      ${entries.map(([k,v])=>`<tr>
        <td style="border:1px solid #ddd; padding:6px; width:40%;"><small>${esc(k)}</small></td>
        <td style="border:1px solid #ddd; padding:6px;">${esc(v)}</td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function shareBtn(b){
  if(!b.share_variant?.content) return "";
  return `<button class="btn no-print" data-share="1" data-share-title="${esc(b.share_variant.title||"Para paciente")}" data-share-content="${esc(b.share_variant.content)}">Ver para paciente</button>`;
}

function renderSubBlocks(dataset, subBlocks, mode){
  const arr = (subBlocks||[]).filter(sb=>{
    const aud = sb.audience || "both";
    if(mode==="patient") return (aud==="patient" || aud==="both");
    return true;
  });
  return arr.map(sb=>renderBlock(dataset, sb, mode)).join("");
}

function renderLink(url, label){
  if(!url) return esc(label||"");
  return `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(label||url)}</a>`;
}

function renderBlock(dataset, b, mode){
  const type = b.type;
  const title = b.title ? `<h2>${esc(b.title)}</h2>` : "";
  const share = shareBtn(b);

  if(type==="text"){
    return `<div class="card">${title}${share}<p>${esc(b.content).replaceAll("\n","<br>")}</p></div>`;
  }

  if(type==="checklist" || type==="list"){
    const items = b.items || [];
    return `<div class="card">${title}${share}<ul>${items.map(it=>`<li>${esc(it)}</li>`).join("")}</ul></div>`;
  }

  if(type==="table"){
    return `<div class="card">${title}${renderTable(b.headers, b.rows)}</div>`;
  }

  if(type==="warning" || type==="alert"){
    const lvl = levelClass(b.level);
    const items = b.items || [];
    const list = items.length ? `<ul>${items.map(it=>`<li>${esc(it)}</li>`).join("")}</ul>` : "";
    return `<div class="card warn ${lvl}">${title}${share}<p>${esc(b.content||"").replaceAll("\n","<br>")}</p>${list}</div>`;
  }

  if(type==="calculator"){
    const inputs = (b.inputs||[]).map(inp=>`
      <label>
        <small>${esc(inp.label)} (${esc(inp.unit)})</small><br>
        <input data-key="${esc(inp.key)}" type="number" min="${inp.min ?? ""}" max="${inp.max ?? ""}" step="${inp.step ?? "any"}">
      </label>
    `).join("");
    return `<div class="card">${title}${share}
      <form data-calc="${esc(b.fn)}" class="kv">
        ${inputs}
        <div><small>Resultado</small><div data-output style="padding:8px 0;">—</div></div>
      </form>
    </div>`;
  }

  if(type==="printable_ref"){
    const p = dataset.printablesById[b.printable_id];
    const label = p ? p.title : b.printable_id;
    return `<div class="card">${title}<p>${esc(label)}</p>
      <button class="btn no-print" data-nav="print" data-id="${esc(b.printable_id)}">Imprimir</button>
    </div>`;
  }

  if(type==="section"){
    const content = b.content ? `<p>${esc(b.content).replaceAll("\n","<br>")}</p>` : "";
    const subs = b.sub_blocks ? `<div style="margin-top:8px;">${renderSubBlocks(dataset, b.sub_blocks, mode)}</div>` : "";
    return `<div class="card">${title}${share}${content}${subs}</div>`;
  }

  if(type==="key_value"){
    return `<div class="card">${title}${renderKeyValue(b.data)}</div>`;
  }

  if(type==="accordion"){
    const items = b.items || [];
    return `<div class="card">${title}
      ${items.map(it=>`<details style="margin:6px 0;">
        <summary>${esc(it.title || "Detalle")}</summary>
        <p style="margin:8px 0 0;">${esc(it.content||"").replaceAll("\n","<br>")}</p>
      </details>`).join("")}
    </div>`;
  }

  if(type==="link"){
    return `<div class="card">${title}<p>${renderLink(b.url, b.label)}</p></div>`;
  }

  if(type==="resource_link"){
    const pid = b.link_id;
    if(pid && dataset.printablesById[pid]){
      return `<div class="card">${title}<p>${esc(b.label||dataset.printablesById[pid].title)}</p>
        <button class="btn no-print" data-nav="print" data-id="${esc(pid)}">Imprimir</button>
      </div>`;
    }
    return `<div class="card">${title}<p>${esc(b.label||"Recurso")}</p></div>`;
  }

  if(type==="resource_list"){
    const items = b.items || [];
    return `<div class="card">${title}<ul>
      ${items.map(it=>`<li>
        <div>${renderLink(it.link, it.name)}</div>
        <small>${esc(it.description||"")}</small>
      </li>`).join("")}
    </ul></div>`;
  }

  return `<div class="card"><p>Bloque no soportado: ${esc(type)}</p></div>`;
}
