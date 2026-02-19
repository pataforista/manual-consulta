/**
 * Motor de cálculos clínicos
 * Recibe: nombre de función (fn) y objeto de inputs { key: value }
 * Retorna: { ok: boolean, text: string, value?: number, error?: string }
 */

export function runCalculator(fn, inputs) {
  const safeFloat = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  // --- 1. Índice de Masa Corporal (BMI) ---
  if (fn === "bmi") {
    const w = safeFloat(inputs.weight); // kg
    const h = safeFloat(inputs.height); // m

    if (w <= 0 || h <= 0) return { ok: false, error: "Ingrese peso y altura" };

    const bmi = w / (h * h);
    const val = bmi.toFixed(1);

    let status = "";
    let color = "";

    if (bmi < 18.5) { status = "Bajo peso"; color = "#333"; }
    else if (bmi < 25) { status = "Peso normal"; color = "green"; }
    else if (bmi < 30) { status = "Sobrepeso"; color = "orange"; }
    else if (bmi < 35) { status = "Obesidad G1"; color = "red"; }
    else if (bmi < 40) { status = "Obesidad G2"; color = "darkred"; }
    else { status = "Obesidad G3"; color = "purple"; }

    return {
      ok: true,
      text: `<span style="color:${color}">${val} - ${status}</span>`,
      value: bmi
    };
  }

  // --- 2. HOMA-IR (Resistencia a la insulina) ---
  // Fórmula: (Glucosa * Insulina) / 405
  if (fn === "homa_ir") {
    const glu = safeFloat(inputs.glucose);
    const ins = safeFloat(inputs.insulin);

    if (glu <= 0 || ins <= 0) return { ok: false, error: "Faltan datos" };

    const homa = (glu * ins) / 405;
    const val = homa.toFixed(2);

    // Punto de corte general referencial > 2.5 (varía por población)
    const isHigh = homa > 2.5;
    const color = isHigh ? "red" : "green";
    const msg = isHigh ? "Posible Resistencia" : "Rango Normal";

    return {
      ok: true,
      text: `<span style="color:${color}">${val} (${msg})</span>`,
      value: homa
    };
  }
  // --- 3. Calculadora de LDL (Friedewald) ---
  // Fórmula: LDL = TC - HDL - (TG/5)
  // Nota: Válida solo si Triglicéridos < 400 mg/dL
  if (fn === "ldl_calc") {
    const tc = safeFloat(inputs.tc);
    const hdl = safeFloat(inputs.hdl);
    const tg = safeFloat(inputs.tg);

    if (tc <= 0 || hdl <= 0 || tg <= 0) return { ok: false, error: "Faltan valores" };
    if (tg >= 400) return { ok: false, error: "TG > 400: Fórmula no válida (pedir LDL directo)" };

    const ldl = tc - hdl - (tg / 5);
    const val = ldl.toFixed(0);

    let color = "green";
    if (val > 190) color = "darkred";
    else if (val > 160) color = "red";
    else if (val > 130) color = "orange";

    return {
      ok: true,
      text: `LDL Calculado: <strong style="color:${color}">${val} mg/dL</strong>`,
      value: ldl
    };
  }
  // --- 4. Presión Arterial Media (PAM) ---
  // Fórmula: (Sistólica + 2 * Diastólica) / 3
  if (fn === "map_calc") {
    const sys = safeFloat(inputs.sys);
    const dia = safeFloat(inputs.dia);

    if (sys <= 0 || dia <= 0) return { ok: false, error: "Faltan valores" };

    // Cálculo
    const map = (sys + (2 * dia)) / 3;
    const val = map.toFixed(0);

    // Interpretación rápida
    let color = "green";
    let msg = "Perfusión adecuada";

    if (val < 65) {
      color = "red";
      msg = "Hipoperfusión (Riesgo Shock)";
    } else if (val > 110) {
      color = "orange";
      msg = "Elevada";
    }

    return {
      ok: true,
      text: `PAM: <strong style="color:${color}">${val} mmHg</strong><br><small>${msg}</small>`,
      value: map
    };
  }
  // --- 5. Dosis Estimada Levotiroxina ---
  // Fórmula estándar: 1.6 a 1.8 mcg/kg/día (Peso ideal)
  if (fn === "levo_dose") {
    const w = safeFloat(inputs.weight);

    if (w <= 0) return { ok: false, error: "Ingrese peso" };

    // Rango de dosis
    const doseMin = (w * 1.6).toFixed(0);
    const doseMax = (w * 1.8).toFixed(0);

    // Redondear a la presentación comercial más cercana suele ser clínico, 
    // pero aquí damos el rango exacto.
    return {
      ok: true,
      text: `Dosis Plena Sugerida:<br><strong style="color:#0066cc">${doseMin} - ${doseMax} mcg/día</strong>`,
      value: doseMin
    };
  }
  // --- 6. Frecuencia Cardíaca de Entrenamiento (Zona Moderada) ---
  // Fórmula: 220 - Edad = FCM. Zona Moderada = 64% a 76% de FCM.
  if (fn === "hr_target") {
    const age = safeFloat(inputs.age);

    if (age <= 0 || age > 120) return { ok: false, error: "Edad inválida" };

    const maxHr = 220 - age;
    const minZone = (maxHr * 0.64).toFixed(0);
    const maxZone = (maxHr * 0.76).toFixed(0);

    return {
      ok: true,
      text: `Máximo Teórico: ${maxHr} lpm<br>Zona Objetivo: <strong style="color:#0066cc">${minZone} - ${maxZone} lpm</strong>`,
      value: maxHr
    };
  }
  // --- 7. Calculadora de Requerimiento Hídrico ---
  // Fórmula: 35ml por Kg de peso (Estándar mantenimiento)
  if (fn === "water_calc") {
    const w = safeFloat(inputs.weight);

    if (w <= 0) return { ok: false, error: "Ingrese peso" };

    const ml = w * 35;
    const liters = (ml / 1000).toFixed(1);
    const glasses = (ml / 250).toFixed(0); // Vasos de 250ml

    return {
      ok: true,
      text: `Meta Diaria: <strong style="color:#0066cc">${liters} Litros</strong><br><small>(Aprox. ${glasses} vasos de agua)</small>`,
      value: ml
    };
  }
  // --- 8. Eficiencia del Sueño ---
  // Fórmula: (Horas Dormido / Horas en Cama) * 100
  // Meta: > 85%
  if (fn === "sleep_eff") {
    const bed = safeFloat(inputs.bed_time);   // Horas totales en cama
    const sleep = safeFloat(inputs.sleep_time); // Horas reales de sueño

    if (bed <= 0 || sleep <= 0) return { ok: false, error: "Datos inválidos" };
    if (sleep > bed) return { ok: false, error: "No puede dormir más tiempo del que está en cama" };

    const eff = ((sleep / bed) * 100).toFixed(0);

    let color = "green";
    let msg = "Sueño Saludable";

    if (eff < 75) { color = "red"; msg = "Insomnio / Fragmentación"; }
    else if (eff < 85) { color = "orange"; msg = "Baja Eficiencia"; }

    return {
      ok: true,
      text: `Eficiencia: <strong style="color:${color}">${eff}%</strong><br><small>${msg}</small>`,
      value: eff
    };
  }
  // --- 9. Menopause Rating Scale (MRS) ---
  // Somático (0-16), Psicológico (0-16), Urogenital (0-12)
  if (fn === "mrs_scale") {
    const s = safeFloat(inputs.somatic);
    const p = safeFloat(inputs.psych);
    const u = safeFloat(inputs.urogen);

    const total = s + p + u;

    let severity = "";
    let color = "";

    if (total <= 4) { severity = "Asintomática / Síntomas escasos"; color = "green"; }
    else if (total <= 8) { severity = "Leve"; color = "#333"; }
    else if (total <= 16) { severity = "Moderada"; color = "orange"; }
    else { severity = "Severa"; color = "red"; }

    return {
      ok: true,
      text: `Puntaje MRS: <strong style="color:${color}">${total}</strong><br><small>Severidad estimada: ${severity}</small>`,
      value: total
    };
  }
  // --- 10. Índice Tabáquico (Paquetes-Año) ---
  if (fn === "pack_years") {
    const packs = safeFloat(inputs.packs_per_day);
    const years = safeFloat(inputs.years_smoking);

    if (packs <= 0 || years <= 0) return { ok: false, error: "Faltan datos" };

    const total = packs * years;
    const isHigh = total >= 20;
    const color = isHigh ? "red" : "#333";
    const alert = isHigh ? "<strong>Criterio p/Tamizaje TAC Pulmón</strong>" : "Bajo Riesgo Pulmonar";

    return {
      ok: true,
      text: `Índice: <strong style="color:${color}">${total} Paquetes-Año</strong><br><small>${alert}</small>`,
      value: total
    };
  }

  // --- 11. Sugerencia de Tamizaje Cáncer (Basado en USPSTF) ---
  if (fn === "cancer_screening") {
    const age = safeFloat(inputs.age);
    const sex = inputs.sex; // 'm' o 'f'

    if (age < 18) return { ok: false, error: "Solo para adultos" };

    const checks = [];
    if (age >= 21 && age <= 65 && sex === 'f') checks.push("Cervicouterino (Pap/VPH)");
    if (age >= 40) checks.push("Mama (Mastografía)");
    if (age >= 45 && age <= 75) checks.push("Colorrectal (Sangre oculta/Colonoscopia)");
    if (age >= 50 && age <= 80) checks.push("Pulmón (Si fumador >20 p-a)");
    if (age >= 55 && age <= 69 && sex === 'm') checks.push("Próstata (Decisión compartida)");

    if (checks.length === 0) return { ok: true, text: "No hay tamizaje de rutina sugerido para esta edad." };

    return {
      ok: true,
      text: `Sugerencias:<br><ul style="text-align:left; font-size:0.9rem;">${checks.map(c => `<li>${c}</li>`).join('')}</ul>`,
      value: checks.length
    };
  }

  return { ok: false, error: `Calculadora '${fn}' no encontrada` };

}