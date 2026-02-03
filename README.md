# Manual de Comorbilidades — PWA (simple)

Objetivo:
- Motor (app) separado de Dataset (JSON).
- Modo Clínico / Paciente + botón "Ver para paciente" por bloque.
- Imprimibles básicos (registro PA, checklist sueño).
- Calculadora IMC (función pura en motor).

## Correr local
1) `npm i`
2) `npm run dev`

## Construir
`npm run build` y `npm run preview`

## Actualizaciones de dataset
Por ahora, el demo usa el dataset local (`/dataset/manifest.json`).
La ruta `engine/updates.js` ya está lista para apuntar a un `REMOTE_MANIFEST_URL` cuando quieras publicar updates.


## PDFs (printables tipo PDF)

- Sube tus PDFs a `public/pdfs/`.
- Crea un printable JSON con `template: "pdf"` y `pdf.url: "./pdfs/<archivo>.pdf"`.
- La vista de impresión abre el PDF en un visor embebido y ofrece botón de abrir/imprimir.

Ejemplo: `dataset/printables/sample_pdf_printable.json`.
