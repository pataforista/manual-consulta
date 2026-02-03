import fs from "fs";
import path from "path";

// Escanea public/pdfs y genera dataset/printables/pdfs_index.generated.json
// Uso: node tools/build_pdfs_index.mjs

const dir = path.resolve("public/pdfs");
const out = path.resolve("dataset/printables/pdfs_index.generated.json");

if(!fs.existsSync(dir)){
  console.error("No existe:", dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".pdf"));

const printables = files.map(f => {
  const base = path.basename(f, ".pdf");
  return {
    id: `${base}_pdf`,
    title: base.replaceAll("_", " "),
    format: "a4",
    template: "pdf",
    pdf: { url: `./pdfs/${f}` }
  };
});

fs.writeFileSync(out, JSON.stringify({ printables }, null, 2), "utf-8");
console.log("OK:", out, "items:", printables.length);
