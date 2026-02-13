// Dataset loader (simple, resilient)
// v0.2: acepta tipos de bloque extendidos (section, key_value, alert, etc.)

const LOCAL_MANIFEST_URL = "./dataset/manifest.json";

// En src/engine/dataset.js

function basicValidateTopic(t) {
  if (!t || typeof t !== "object") return { ok: false, error: "Topic no es objeto" };
  if (!t.id || !t.title) return { ok: false, error: "Topic sin id/título" };
  if (!Array.isArray(t.blocks)) return { ok: false, error: "Topic sin blocks" };

  // --- CAMBIO AQUÍ ---
  // Eliminamos la obligatoriedad estricta del ID por bloque
  // para agilizar la creación de contenido.
  for (const b of t.blocks) {
    if (!b || typeof b !== "object") return { ok: false, error: "Bloque inválido" };
    if (!b.type) return { ok: false, error: "Bloque sin type" };

    // Si no tiene ID, le asignamos uno temporal aleatorio para que React/DOM no se queje
    if (!b.id) {
      b.id = "gen_" + Math.random().toString(36).substr(2, 9);
    }
  }
  // -------------------

  return { ok: true };
}

export async function loadDataset() {
  const manifest = await fetch(LOCAL_MANIFEST_URL).then(r => r.json());
  if (!manifest || !manifest.topics) throw new Error("Manifest inválido");

  const topicsById = {};
  for (const ref of manifest.topics) {
    const topic = await fetch(`./${ref.path}`).then(r => r.json());
    const v = basicValidateTopic(topic);
    if (!v.ok) {
      console.error(ref.id, v.error, topic);
      throw new Error(`Topic inválido: ${ref.id} (${v.error})`);
    }
    topicsById[topic.id] = topic;
  }

  const printablesById = {};

  // 1. Cargar printables explícitos del manifest
  for (const pref of manifest.printables || []) {
    try {
      const pr = await fetch(`./${pref.path}`).then(r => r.json());
      printablesById[pr.id] = pr;
    } catch (e) {
      console.warn("Error cargando printable explícito:", pref.path, e);
    }
  }

  // 2. Cargar printables autogenerados (PDFs e Infografías)
  try {
    const gen = await fetch("./dataset/printables/generated_index.json").then(r => r.json());
    if (gen && gen.printables) {
      gen.printables.forEach(p => {
        printablesById[p.id] = p;
      });
    }
  } catch (e) {
    console.log("No se encontró índice generado de printables o está vacío.");
  }

  return { manifest, topicsById, printablesById };
}

