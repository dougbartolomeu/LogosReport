// Utilitários de teste: abre o editor em jsdom, sem navegador.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");

function loadEditor() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  const saved = []; // arquivos "baixados" pelo editor
  w.URL.createObjectURL = blob => { saved.push(blob); return "blob:teste"; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {};
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  w.eval(fs.readFileSync(path.join(root, "logosreport.js"), "utf8"));
  w.eval(fs.readFileSync(path.join(root, "app.js"), "utf8"));
  const $ = selector => w.document.querySelector(selector);
  const $$ = selector => [...w.document.querySelectorAll(selector)];
  const change = (element, value) => { if (value !== undefined) element.value = value; element.dispatchEvent(new w.Event("change", { bubbles: true })); };
  const lastSaved = () => saved[saved.length - 1];
  return { w, $, $$, change, saved, lastSaved };
}

// Executa um HTML exportado (scripts incluídos) e devolve a janela dele.
function runExported(html) { return new JSDOM(html, { runScripts: "dangerously" }).window; }

function sampleOs() { return fs.readFileSync(path.join(root, "samples", "os.json"), "utf8"); }

module.exports = { loadEditor, runExported, sampleOs, root };
