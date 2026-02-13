import fs from "fs";
import path from "path";

// Escanea public/pdfs y public/infografias
// Genera public/dataset/printables/generated_index.json
// Uso: node tools/build_pdfs_index.mjs

const scanFolders = [
  { folder: "public/pdfs", template: "pdf", extensions: [".pdf"], baseUrl: "./pdfs/" },
  { folder: "public/infografias", template: "image", extensions: [".png", ".jpg", ".jpeg", ".webp"], baseUrl: "./infografias/" }
];

const out = path.resolve("public/dataset/printables/generated_index.json");

let allPrintables = [];

scanFolders.forEach(({ folder, template, extensions, baseUrl }) => {
  const dir = path.resolve(folder);
  if (!fs.existsSync(dir)) {
    console.warn("No existe:", dir);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)));

  const printables = files.map(f => {
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    const res = {
      id: `${base}_${template}`,
      title: base.replaceAll("_", " ").replaceAll("-", " "),
      format: "a4",
      template: template,
      url: `${baseUrl}${f}`
    };
    if (template === "pdf") {
      res.pdf = { url: res.url };
    }
    return res;
  });

  allPrintables = allPrintables.concat(printables);
});

fs.writeFileSync(out, JSON.stringify({ printables: allPrintables }, null, 2), "utf-8");
console.log("OK:", out, "items:", allPrintables.length);

