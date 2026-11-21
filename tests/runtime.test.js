const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const runtime = require("../logosreport.js");

function ambiente(html) {
  const dom = new JSDOM(html);
  const w = dom.window;
  runtime(w);
  w.console.warn = () => {};
  return w;
}

test("getPath: pontos, índices e sufixo [] da lista", () => {
  const w = ambiente("<body></body>");
  const dados = { a: { b: "x" }, lista: [{ c: 1 }, { c: 2 }], nulo: null };
  assert.equal(w.LogosReport.getPath(dados, "a.b"), "x");
  assert.equal(w.LogosReport.getPath(dados, "lista[1].c"), 2);
  assert.equal(w.LogosReport.getPath(dados, "lista[]").length, 2);
  assert.equal(w.LogosReport.getPath(dados, "nulo"), null);
  assert.equal(w.LogosReport.getPath(dados, "nao.existe"), undefined);
  assert.equal(w.LogosReport.getPath(dados, ""), undefined);
});

test("getPath: não vaza propriedades herdadas (constructor, __proto__)", () => {
  const w = ambiente("<body></body>");
  assert.equal(w.LogosReport.getPath({}, "constructor"), undefined);
  assert.equal(w.LogosReport.getPath({}, "__proto__"), undefined);
  assert.equal(w.LogosReport.getPath({ a: 1 }, "a.toString"), undefined);
});

test("formatadores: moeda, número, data e data/hora", () => {
  const f = ambiente("<body></body>").LogosReport.formatters;
  const sem = s => s.replace(/ /g, " ");
  assert.equal(sem(f.moeda("31.50000")), "R$ 31,50");
  assert.equal(sem(f.moeda(1234.5)), "R$ 1.234,50");
  assert.equal(sem(f.moeda("R$ 15,75")), "R$ 15,75");
  assert.equal(f.moeda("sem valor"), "sem valor", "valor que não é número aparece como veio");
  assert.equal(f.numero("2.00000"), "2,00");
  assert.equal(f.data("2026-11-05T08:30:00"), "05/11/2026");
  assert.equal(f.datahora("2026-11-05T08:30:00"), "05/11/2026 08:30");
  assert.equal(f.datahora("2026-11-05"), "05/11/2026");
  assert.equal(f.data("05/11/2026"), "05/11/2026", "texto que não é ISO fica como está");
});

const TEMPLATE = `<body>
  <span id="nome" data-bind="cliente.nome"></span>
  <span id="total" data-bind="total" data-format="moeda"></span>
  <span id="nulo" data-bind="obs"></span>
  <table><tbody data-each="itens"><tr><td data-bind="descricao"></td><td data-bind="valor" data-format="moeda"></td></tr></tbody></table>
</body>`;

test("render: preenche vínculos, formata e repete linhas da lista", () => {
  const w = ambiente(TEMPLATE);
  const r = w.LogosReport.render({ cliente: { nome: "Clube Exemplo" }, total: "383.5", obs: null, itens: [{ descricao: "A", valor: 1 }, { descricao: "B", valor: 2 }] });
  const d = w.document;
  assert.equal(d.getElementById("nome").textContent, "Clube Exemplo");
  assert.match(d.getElementById("total").textContent.replace(/ /g, " "), /R\$ 383,50/);
  assert.equal(d.querySelectorAll("tbody tr").length, 2);
  assert.deepEqual(r.missing, [], "valor null não conta como ausente");
});

test("render: valores viram TEXTO, nunca HTML", () => {
  const w = ambiente(TEMPLATE);
  w.LogosReport.render({ cliente: { nome: '<img src=x onerror="alert(1)"> O\'Brien' }, itens: [{ descricao: "<b>x</b>" }] });
  assert.equal(w.document.querySelector("img"), null);
  assert.equal(w.document.querySelector("tbody b"), null);
  assert.ok(w.document.getElementById("nome").textContent.includes("<img"));
});

test("render: pode rodar de novo com outros dados (lista encolhe e cresce)", () => {
  const w = ambiente(TEMPLATE);
  w.LogosReport.render({ itens: [{ descricao: "A" }, { descricao: "B" }, { descricao: "C" }] });
  assert.equal(w.document.querySelectorAll("tbody tr").length, 3);
  w.LogosReport.render({ itens: [{ descricao: "Z" }] });
  assert.equal(w.document.querySelectorAll("tbody tr").length, 1);
  w.LogosReport.render({ itens: [] });
  assert.equal(w.document.querySelectorAll("tbody tr").length, 0);
  w.LogosReport.render({ itens: [{ descricao: "A" }, { descricao: "B" }] });
  assert.equal(w.document.querySelectorAll("tbody tr").length, 2, "o modelo da linha foi preservado");
});

test("render: informa os caminhos que não existem nos dados", () => {
  const w = ambiente(TEMPLATE);
  const r = w.LogosReport.render({ cliente: {} });
  assert.ok(r.missing.includes("cliente.nome"));
  assert.ok(r.missing.includes("itens"));
});

test("renderReport continua existindo (compatível com a versão 1 do contrato)", () => {
  const w = ambiente(TEMPLATE);
  assert.equal(typeof w.renderReport, "function");
  w.renderReport({ cliente: { nome: "Ok" } });
  assert.equal(w.document.getElementById("nome").textContent, "Ok");
});
