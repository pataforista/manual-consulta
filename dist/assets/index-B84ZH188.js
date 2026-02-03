(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const k="modulepreload",j=function(r,e){return new URL(r,e).href},g={},x=function(e,t,i){let n=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),m=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));n=Promise.allSettled(t.map(d=>{if(d=j(d,i),d in g)return;g[d]=!0;const f=d.endsWith(".css"),c=f?'[rel="stylesheet"]':"";if(!!i)for(let y=o.length-1;y>=0;y--){const h=o[y];if(h.href===d&&(!f||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${c}`))return;const u=document.createElement("link");if(u.rel=f?"stylesheet":k,f||(u.as="script"),u.crossOrigin="",u.href=d,m&&u.setAttribute("nonce",m),document.head.appendChild(u),f)return new Promise((y,h)=>{u.addEventListener("load",y),u.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return n.then(o=>{for(const s of o||[])s.status==="rejected"&&a(s.reason);return e().catch(a)})},E="./dataset/manifest.json";function L(r){if(!r||typeof r!="object")return{ok:!1,error:"Topic no es objeto"};if(!r.id||!r.title)return{ok:!1,error:"Topic sin id/título"};if(!Array.isArray(r.blocks))return{ok:!1,error:"Topic sin blocks"};for(const e of r.blocks){if(!e||typeof e!="object")return{ok:!1,error:"Bloque inválido"};if(!e.type)return{ok:!1,error:"Bloque sin type"};e.id||(e.id="gen_"+Math.random().toString(36).substr(2,9))}return{ok:!0}}async function I(){const r=await fetch(E).then(i=>i.json());if(!r||!r.topics)throw new Error("Manifest inválido");const e={};for(const i of r.topics){const n=await fetch(`./${i.path}`).then(o=>o.json()),a=L(n);if(!a.ok)throw console.error(i.id,a.error,n),new Error(`Topic inválido: ${i.id} (${a.error})`);e[n.id]=n}const t={};for(const i of r.printables||[]){const n=await fetch(`./${i.path}`).then(a=>a.json());t[n.id]=n}return{manifest:r,topicsById:e,printablesById:t}}function _(r,e,t){return(e.blocks||[]).filter(n=>{const a=n.audience||"both";return t==="patient"?a==="patient"||a==="both":!0}).map(n=>w(r,n,t)).join("")}function l(r){return String(r??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function A(r){const e=String(r||"info").toLowerCase();return e==="critical"||e==="danger"?"danger":e==="warning"||e==="caution"?"caution":"info"}function B(r,e){const t=r||[],i=e||[];return`<div style="overflow:auto;">
    <table style="width:100%; border-collapse:collapse;">
      <thead><tr>${t.map(n=>`<th style="border:1px solid #ddd; padding:6px; text-align:left;">${l(n)}</th>`).join("")}</tr></thead>
      <tbody>
        ${i.map(n=>{let a=Array.isArray(n)?n:n&&typeof n=="object"?Object.values(n):[String(n)];return t.length&&(a.length<t.length&&(a=a.concat(Array(t.length-a.length).fill(""))),a.length>t.length&&(a=a.slice(0,t.length))),`<tr>${a.map(o=>`<td style="border:1px solid #ddd; padding:6px;">${l(o)}</td>`).join("")}</tr>`}).join("")}
      </tbody>
    </table>
  </div>`}function S(r){return`<table style="width:100%; border-collapse:collapse;">
    <tbody>
      ${(r&&typeof r=="object"?Object.entries(r):[]).map(([t,i])=>`<tr>
        <td style="border:1px solid #ddd; padding:6px; width:40%;"><small>${l(t)}</small></td>
        <td style="border:1px solid #ddd; padding:6px;">${l(i)}</td>
      </tr>`).join("")}
    </tbody>
  </table>`}function P(r){var e;return(e=r.share_variant)!=null&&e.content?`<button class="btn no-print" data-share="1" data-share-title="${l(r.share_variant.title||"Para paciente")}" data-share-content="${l(r.share_variant.content)}">Ver para paciente</button>`:""}function T(r,e,t){return(e||[]).filter(n=>{const a=n.audience||"both";return t==="patient"?a==="patient"||a==="both":!0}).map(n=>w(r,n,t)).join("")}function $(r,e){return r?`<a href="${l(r)}" target="_blank" rel="noreferrer">${l(e||r)}</a>`:l(e||"")}function w(r,e,t){const i=e.type,n=e.title?`<h2>${l(e.title)}</h2>`:"",a=P(e);if(i==="text")return`<div class="card">${n}${a}<p>${l(e.content).replaceAll(`
`,"<br>")}</p></div>`;if(i==="checklist"||i==="list"){const o=e.items||[];return`<div class="card">${n}${a}<ul>${o.map(s=>`<li>${l(s)}</li>`).join("")}</ul></div>`}if(i==="table")return`<div class="card">${n}${B(e.headers,e.rows)}</div>`;if(i==="warning"||i==="alert"){const o=A(e.level),s=e.items||[],m=s.length?`<ul>${s.map(d=>`<li>${l(d)}</li>`).join("")}</ul>`:"";return`<div class="card warn ${o}">${n}${a}<p>${l(e.content||"").replaceAll(`
`,"<br>")}</p>${m}</div>`}if(i==="calculator"){const o=(e.inputs||[]).map(s=>`
      <label>
        <small>${l(s.label)} (${l(s.unit)})</small><br>
        <input data-key="${l(s.key)}" type="number" min="${s.min??""}" max="${s.max??""}" step="${s.step??"any"}">
      </label>
    `).join("");return`<div class="card">${n}${a}
      <form data-calc="${l(e.fn)}" class="kv">
        ${o}
        <div><small>Resultado</small><div data-output style="padding:8px 0;">—</div></div>
      </form>
    </div>`}if(i==="printable_ref"){const o=r.printablesById[e.printable_id],s=o?o.title:e.printable_id;return`<div class="card">${n}<p>${l(s)}</p>
      <button class="btn no-print" data-nav="print" data-id="${l(e.printable_id)}">Imprimir</button>
    </div>`}if(i==="section"){const o=e.content?`<p>${l(e.content).replaceAll(`
`,"<br>")}</p>`:"",s=e.sub_blocks?`<div style="margin-top:8px;">${T(r,e.sub_blocks,t)}</div>`:"";return`<div class="card">${n}${a}${o}${s}</div>`}if(i==="key_value")return`<div class="card">${n}${S(e.data)}</div>`;if(i==="accordion"){const o=e.items||[];return`<div class="card">${n}
      ${o.map(s=>`<details style="margin:6px 0;">
        <summary>${l(s.title||"Detalle")}</summary>
        <p style="margin:8px 0 0;">${l(s.content||"").replaceAll(`
`,"<br>")}</p>
      </details>`).join("")}
    </div>`}if(i==="link")return`<div class="card">${n}<p>${$(e.url,e.label)}</p></div>`;if(i==="resource_link"){const o=e.link_id;return o&&r.printablesById[o]?`<div class="card">${n}<p>${l(e.label||r.printablesById[o].title)}</p>
        <button class="btn no-print" data-nav="print" data-id="${l(o)}">Imprimir</button>
      </div>`:`<div class="card">${n}<p>${l(e.label||"Recurso")}</p></div>`}if(i==="resource_list"){const o=e.items||[];return`<div class="card">${n}<ul>
      ${o.map(s=>`<li>
        <div>${$(s.link,s.name)}</div>
        <small>${l(s.description||"")}</small>
      </li>`).join("")}
    </ul></div>`}return`<div class="card"><p>Bloque no soportado: ${l(i)}</p></div>`}function C(r,e){var i;const t=((i=r.manifest)==null?void 0:i.topics)||[];return`
    <header>
      <div class="row" style="justify-content:space-between">
        <h1>Manual Comorbilidades</h1>
        <button id="modeToggle" class="btn ${e==="patient"?"primary":""}">
          ${e==="clinician"?"👨‍⚕️ Modo Médico":"👤 Modo Paciente"}
        </button>
      </div>
    </header>
    <main>
      <p class="welcome-text">
        ${e==="clinician"?"Seleccione un tema clínico:":"Guías informativas para su salud:"}
      </p>
      
      <div class="grid-menu">
        ${t.map(n=>{const a=r.topicsById[n.id];return!a||e==="patient"&&a.audience==="clinician"?"":`
          <div class="card clickable" data-nav="topic" data-id="${n.id}">
            <div class="row" style="align-items: flex-start;">
                <div class="topic-icon">📄</div>
                <div style="flex:1">
                    <h2 style="margin-bottom:4px">${a.title}</h2>
                    <div class="row" style="gap:4px; margin-bottom:6px">
                        ${(a.tags||[]).slice(0,3).map(o=>`<span class="badge" style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px; color:#555;">${o}</span>`).join("")}
                    </div>
                </div>
            </div>
          </div>
          `}).join("")}
      </div>
    </main>
    
    <div id="shareOverlay" class="overlay" style="display:none;">
      <div class="overlay-content">
        <h2 style="margin-top:0">Para el paciente</h2>
        <div id="shareBody" style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:15px;"></div>
        <button id="shareClose" class="btn">Cerrar</button>
      </div>
    </div>
  `}function R(r,e,t){var n,a;const i=r.topicsById[e];return i?`
    <header>
      <div class="row">
        <button class="btn" data-nav="home">← Volver</button>
        <h1 style="font-size:1.1rem; flex:1; margin-left:10px;">${i.title}</h1>
      </div>
    </header>
    <main>
      ${_(r,i,t)}
      
      <hr style="margin: 30px 0;">
      <div style="text-align:center; color:#999; font-size:0.8rem">
        Fuente: ${((n=i.meta)==null?void 0:n.source)||"N/A"} (v${((a=i.meta)==null?void 0:a.version)||"?"})
      </div>
    </main>
  `:`<main><div class="card warn danger">Error: Tema "${e}" no encontrado o no cargó correctamente.</div><button class="btn" data-nav="home">Volver</button></main>`}function O(r,e){var i;const t=(i=r.printablesById)==null?void 0:i[e];if(!t)return"<main>Imprimible no encontrado</main>";if(t.template==="pdf"||t.url)return`
      <div style="height:100vh; display:flex; flex-direction:column;">
        <header class="no-print" style="padding:10px; background:#eee; display:flex; gap:10px;">
            <button class="btn" data-nav="home">Cerrar</button>
            <button class="btn primary" onclick="document.getElementById('pdfFrame').contentWindow.print()">🖨️ Imprimir</button>
            <span style="align-self:center; font-weight:bold;">${t.title}</span>
        </header>
        <iframe id="pdfFrame" src="${t.url}" style="flex:1; border:none; width:100%;"></iframe>
      </div>
     `;if(t.template==="guide_checklist")return`
      <div class="printable-sheet" style="padding:40px; max-width:800px; margin:0 auto; font-family:sans-serif;">
        <div class="no-print" style="margin-bottom:20px;">
           <button class="btn" data-nav="home">← Volver</button>
           <button class="btn primary" onclick="window.print()">🖨️ Imprimir Guía</button>
        </div>

        <h1 style="text-align:center; border-bottom:2px solid #333; padding-bottom:10px;">${t.title}</h1>
        <p style="text-align:center; color:#666; font-style:italic;">Resumen de recomendaciones para llevar a casa.</p>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
          ${t.sections.map(n=>`
            <div style="border:1px solid #ccc; border-radius:8px; padding:15px; break-inside: avoid;">
              <h3 style="margin-top:0; color:#0066cc; border-bottom:1px solid #eee; padding-bottom:5px;">${n.title}</h3>
              <ul style="padding-left:20px;">
                ${n.items.map(a=>`<li style="margin-bottom:6px; line-height:1.4;">${a}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>

        <div style="margin-top:30px; border-top:1px solid #ccc; padding-top:10px; text-align:center; font-size:12px;">
          Recuerde: Estos son consejos generales. Consulte siempre a su médico para dudas específicas.
        </div>
      </div>
    `;if(t.headers){const n=Array(15).fill("");return`
      <div class="printable-sheet" style="padding:20px;">
        <h1 style="text-align:center; margin-bottom:20px;">${t.title}</h1>
        <table style="width:100%; border-collapse:collapse; border:1px solid #000;">
          <thead>
            <tr>${t.headers.map(a=>`<th style="border:1px solid #000; padding:8px; background:#f0f0f0;">${a}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${n.map(()=>`
              <tr>${t.headers.map(()=>'<td style="border:1px solid #000; height:30px;"></td>').join("")}</tr>
            `).join("")}
          </tbody>
        </table>
        <div class="no-print" style="margin-top:20px; text-align:center;">
          <button class="btn primary" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn" data-nav="home">Volver</button>
        </div>
      </div>
    `}return"<main>Formato desconocido</main>"}function q(){let r;const e=document.querySelector("header"),t=document.createElement("button");t.textContent="Instalar App",t.className="btn primary",t.style.display="none",t.style.marginLeft="auto",t.id="installBtn",e?(e.querySelector(".row")||e).appendChild(t):document.body.prepend(t),window.addEventListener("beforeinstallprompt",i=>{i.preventDefault(),r=i,t.style.display="inline-block",console.log("Install prompt captured"),t.onclick=async()=>{t.style.display="none",r.prompt();const{outcome:n}=await r.userChoice;console.log(`User response to the install prompt: ${n}`),r=null}}),window.addEventListener("appinstalled",()=>{t.style.display="none",r=null,console.log("PWA was installed")})}const v=document.getElementById("app"),p={mode:localStorage.getItem("mode")||"clinician",dataset:null};q();function M(r){p.mode=r,localStorage.setItem("mode",r),b()}function b(){if(!p.dataset)return;const r=new URL(location.href),e=r.searchParams.get("view")||"home",t=r.searchParams.get("id");if(window.scrollTo(0,0),e==="topic"&&t)v.innerHTML=R(p.dataset,t,p.mode);else if(e==="print"&&t){v.innerHTML=O(p.dataset,t);const i=p.dataset.printablesById[t];i&&!i.url&&setTimeout(()=>window.print(),500)}else v.innerHTML=C(p.dataset,p.mode);U()}function H(r,e){const t=new URL(location.href);t.searchParams.set("view",r),e?t.searchParams.set("id",e):t.searchParams.delete("id"),history.pushState({},"",t),b()}function U(){document.querySelectorAll("[data-nav]").forEach(t=>{t.onclick=i=>{i.stopPropagation(),H(t.dataset.nav,t.dataset.id||null)}});const r=document.getElementById("modeToggle");r&&(r.onclick=()=>{M(p.mode==="clinician"?"patient":"clinician")}),document.querySelectorAll("[data-share]").forEach(t=>{t.onclick=()=>{const i=document.getElementById("shareOverlay"),n=document.getElementById("shareBody"),a=t.dataset.shareTitle,o=t.dataset.shareContent;i.querySelector("h2").textContent=a,n.innerHTML=o.replaceAll(`
`,"<br>"),i.style.display="flex"}});const e=document.getElementById("shareClose");e&&(e.onclick=()=>document.getElementById("shareOverlay").style.display="none"),document.querySelectorAll("form[data-calc]").forEach(t=>{t.oninput=()=>{const i=t.dataset.calc,n={};t.querySelectorAll("input").forEach(a=>n[a.dataset.key]=parseFloat(a.value)),x(()=>import("./calculators-CwHHvl0w.js"),[],import.meta.url).then(a=>{const o=a.runCalculator(i,n),s=t.querySelector("[data-output]");o.ok?s.innerHTML=`<span style="font-size:1.2em; font-weight:bold; color:#0066cc">${o.text}</span>`:s.innerHTML=`<span style="color:#999">${o.error||"..."}</span>`}).catch(a=>console.log("Calculadora no cargada aún",a))}})}window.addEventListener("popstate",b);(async function(){try{p.dataset=await I(),console.log("Dataset cargado:",p.dataset),b()}catch(e){v.innerHTML=`<div style="padding:20px; text-align:center">
      <h2>Error iniciando App</h2>
      <p>${e.message}</p>
      <small>Revisa la consola para más detalles</small>
    </div>`}})();function V(r={}){const{immediate:e=!1,onNeedRefresh:t,onOfflineReady:i,onRegistered:n,onRegisteredSW:a,onRegisterError:o}=r;let s,m;const d=async(c=!0)=>{await m};async function f(){if("serviceWorker"in navigator){if(s=await x(async()=>{const{Workbox:c}=await import("./workbox-window.prod.es5-vqzQaGvo.js");return{Workbox:c}},[],import.meta.url).then(({Workbox:c})=>new c("./sw.js",{scope:"./",type:"classic"})).catch(c=>{o==null||o(c)}),!s)return;s.addEventListener("activated",c=>{(c.isUpdate||c.isExternal)&&window.location.reload()}),s.addEventListener("installed",c=>{c.isUpdate||i==null||i()}),s.register({immediate:e}).then(c=>{a?a("./sw.js",c):n==null||n(c)}).catch(c=>{o==null||o(c)})}}return m=f(),d}const W=V({onNeedRefresh(){confirm("Hay una nueva versión disponible. ¿Recargar?")&&W(!0)},onOfflineReady(){console.log("App lista para trabajar offline")}});
