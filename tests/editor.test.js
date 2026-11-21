const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { loadEditor, runExported, sampleOs, root } = require("./helpers");

const semNbsp = s => s.replace(/ /g, " ");

test("a exportação gera um HTML cujo script executa e define LogosReport/renderReport", async () => {
  const ed = loadEditor();
  ed.$("#export-button").click();
  const html = await ed.lastSaved().text();
  const w = runExported(html);
  assert.equal(typeof w.renderReport, "function");
  assert.equal(typeof w.LogosReport.render, "function");
  assert.ok(w.document.querySelector("main.lr-report[data-lr-version='1']"));
});

test("a exportação NÃO embute os dados por padrão (evita vazar dados reais)", async () => {
  const ed = loadEditor();
  ed.$("#export-button").click();
  const html = await ed.lastSaved().text();
  assert.ok(!html.includes('<script type="application/json" id="logosreport-sample-data">'));
  assert.ok(!html.includes("COMREES MÁQUINAS"), "dados do exemplo não aparecem no arquivo");
});

test("com a caixa marcada, os dados vão junto e o template já abre preenchido", async () => {
  const ed = loadEditor();
  ed.$("#include-sample").checked = true; ed.change(ed.$("#include-sample"));
  ed.$("#export-button").click();
  const w = runExported(await ed.lastSaved().text());
  const texto = w.document.querySelector("main").textContent;
  assert.ok(texto.includes("ORDEM DE SERVIÇO") && texto.includes("ROLAMENTO 6203"));
});

test("renderReport(dados) preenche o template exportado e escapa o conteúdo", async () => {
  const ed = loadEditor();
  ed.$("#export-button").click();
  const w = runExported(await ed.lastSaved().text());
  const r = w.renderReport({ ordem: { cliente: "<img src=x onerror=alert(1)> O'Brien \"Q\"" }, itens_vendidos: [{ codigo: "1", servico: "Peça", quantidade: "1", valor: "2", desconto: "0", total: "2" }] });
  assert.equal(w.document.querySelector("img"), null);
  assert.ok(w.document.querySelector("main").textContent.includes("O'Brien \"Q\""));
  assert.ok(r.missing.includes("empresa.cnpj"), "avisa quais caminhos não existem nos dados");
  assert.equal(w.document.querySelectorAll(".lr-table tbody tr").length, 1);
});

test("o template exportado é HTML legível: vínculos declarados e CSS personalizável", async () => {
  const ed = loadEditor();
  ed.$("#custom-css").value = ".lr-report{--lr-font:Georgia}</style><script>alert(1)</script>";
  ed.$("#custom-css").dispatchEvent(new ed.w.Event("input", { bubbles: true }));
  ed.$("#export-button").click();
  const html = await ed.lastSaved().text();
  assert.ok(html.includes('data-bind="ordem.cliente"'));
  assert.ok(html.includes('data-each="itens_vendidos"'));
  assert.ok(html.includes('id="logosreport-custom"'));
  const w = runExported(html);
  assert.ok(w.document.getElementById("logosreport-custom").textContent.includes("--lr-font:Georgia"));
  // O "</style>" escrito no CSS do usuário não pode fechar o bloco e criar um <script> no <head>.
  assert.equal(w.document.querySelectorAll("head script").length, 0);
});

test("alinhamento à direita usa justify-content (editor e template)", async () => {
  const ed = loadEditor();
  const cnpj = ed.$$("[data-cell-id]").find(c => c.textContent.includes("CNPJ"));
  assert.match(cnpj.getAttribute("style"), /justify-content:flex-end/);
  ed.$("#export-button").click();
  const w = runExported(await ed.lastSaved().text());
  const cel = [...w.document.querySelectorAll(".lr-cell")].find(c => c.textContent.includes("CNPJ"));
  assert.match(cel.getAttribute("style"), /justify-content:flex-end/);
});

test("formato 'moeda' num campo aplica-se ao dado real da API (samples/os.json)", async () => {
  const ed = loadEditor();
  ed.$("#json-input").value = sampleOs(); ed.$("#apply-json").click();
  ed.$('[data-field-path="total_ordem"]').click(); // adiciona o campo e o seleciona
  ed.change(ed.$("#prop-format"), "moeda");
  ed.$("#include-sample").checked = true; ed.change(ed.$("#include-sample"));
  ed.$("#export-button").click();
  const w = runExported(await ed.lastSaved().text());
  assert.ok(semNbsp(w.document.querySelector("main").textContent).includes("R$ 383,50"));
});

test("tabela ligada a uma lista do JSON gera data-each e renderiza uma linha por item", async () => {
  const ed = loadEditor();
  ed.$("#json-input").value = sampleOs(); ed.$("#apply-json").click();
  ed.$('[data-add="table"]').click();
  ed.change(ed.$("#prop-path"), "itens");
  ed.$("#include-sample").checked = true; ed.change(ed.$("#include-sample"));
  ed.$("#export-button").click();
  const html = await ed.lastSaved().text();
  assert.ok(html.includes('data-each="itens"'));
  const w = runExported(html);
  const linhas = [...w.document.querySelectorAll('.lr-table tbody[data-each="itens"] tr')];
  assert.equal(linhas.length, 2);
  assert.ok(linhas[0].textContent.includes("ROLAMENTO 6203"));
});

test("prévia usa o mesmo template exportado, num iframe isolado", () => {
  const ed = loadEditor();
  ed.$("#preview-button").click();
  const frame = ed.$("#preview-content iframe");
  assert.ok(frame && frame.getAttribute("sandbox") === "allow-scripts", "iframe sem same-origin");
  assert.ok(frame.srcdoc.includes("logosreport-sample-data") && frame.srcdoc.includes('data-bind="ordem.cliente"'));
});

test("impressão abre o template com os dados e chama print()", () => {
  const ed = loadEditor();
  let escrito = "";
  ed.w.open = () => ({ document: { write: html => { escrito += html; }, close() {} } });
  ed.$("#print-button").click();
  assert.ok(escrito.includes("window.print()") && escrito.includes("logosreport-sample-data"));
});

test("salvar e reabrir modelo (.json e HTML exportado) restaura linhas, CSS e página", async () => {
  const ed = loadEditor();
  ed.$("#custom-css").value = ".lr-report{--lr-color:#222}"; ed.$("#custom-css").dispatchEvent(new ed.w.Event("input", { bubbles: true }));
  ed.change(ed.$("#orientation"), "landscape");
  const linhasOriginais = ed.$$(".report-row").length;
  ed.$("#save-model").click();
  const json = await ed.lastSaved().text();
  ed.$("#export-button").click();
  const htmlExportado = await ed.lastSaved().text();

  const abrir = async (nome, conteudo) => {
    const input = ed.$("#model-file");
    Object.defineProperty(input, "files", { value: [{ name: nome, text: async () => conteudo }], configurable: true });
    ed.change(input);
    await new Promise(r => setTimeout(r, 20));
  };
  for (const [nome, conteudo] of [["m.json", json], ["m.html", htmlExportado]]) {
    ed.$("#add-row").click(); ed.$("#custom-css").value = ""; ed.change(ed.$("#orientation"), "portrait");
    await abrir(nome, conteudo);
    assert.equal(ed.$$(".report-row").length, linhasOriginais, nome + ": linhas restauradas");
    assert.equal(ed.$("#orientation").value, "landscape", nome + ": orientação");
    assert.equal(ed.$("#custom-css").value, ".lr-report{--lr-color:#222}", nome + ": CSS próprio");
  }
});

test("abrir modelo inválido ou hostil não quebra nem injeta valores", async () => {
  const ed = loadEditor();
  const abrir = async conteudo => {
    const input = ed.$("#model-file");
    Object.defineProperty(input, "files", { value: [{ name: "x.json", text: async () => conteudo }], configurable: true });
    ed.change(input); await new Promise(r => setTimeout(r, 20));
  };
  await abrir('{"rows":"nada"}');
  assert.match(ed.$("#toast").textContent, /Não foi possível abrir o modelo/);
  await abrir(JSON.stringify({ page: "A4;}body{display:none", orientation: "x", rows: [[{ type: "field", width: "abc", align: "javascript:", path: "a.b", fontSize: 9999, format: "evil" }, { type: "script" }]] }));
  ed.$("#export-button").click();
  const html = await ed.lastSaved().text();
  assert.ok(!html.includes("display:none"), "página inválida volta para A4");
  assert.match(html, /size:A4 portrait/);
  assert.ok(!html.includes("evil") && !html.includes("javascript:"));
  assert.match(html, /font-size:48px/, "fonte limitada ao máximo");
});

test("mover linha: faixa desce uma posição e a última linha é ignorada sem erro", () => {
  const ed = loadEditor();
  const textos = () => ed.$$(".report-row").map(r => r.textContent.replace(/\s+/g, " ").trim().slice(0, 30));
  const antes = textos(), idx = antes.findIndex(t => t.startsWith("DEFEITO MENCIONADO"));
  ed.$$(".report-row")[idx].querySelector(".report-cell").click();
  ed.$('[data-move="down"]').click();
  const depois = textos();
  assert.equal(depois.length, antes.length);
  assert.ok(depois[idx + 1].startsWith("DEFEITO MENCIONADO"));
  ed.$$(".report-row").at(-1).querySelector(".report-cell").click();
  assert.doesNotThrow(() => ed.$('[data-move="down"]').click());
});

test("o exemplo embutido não contém telefones soltos (só números fictícios formatados)", () => {
  // Verificação genérica: não guarda nenhum dado real no teste. Telefone/CPF/CNPJ sem formatação
  // (10 a 14 dígitos seguidos) indica dado copiado de um sistema real e deve ser anonimizado.
  const codigo = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.equal(codigo.match(/\b\d{10,14}\b/g), null);
});
