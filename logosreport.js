/*
 * LogosReport runtime (formato v1)
 *
 * Preenche um template HTML do LogosReport com dados JSON.
 * Sem dependências. Este mesmo código é usado pelo editor (prévia/impressão)
 * e embutido, legível, em cada HTML exportado.
 *
 * Vínculos suportados no template:
 *   data-bind="caminho"        -> escreve o valor (como TEXTO, nunca como HTML) no elemento
 *   data-format="moeda|data|datahora|numero"  -> formata o valor antes de escrever
 *   data-each="lista"          -> repete o primeiro filho para cada item da lista;
 *                                 os data-bind dentro dele são relativos ao item
 *
 * Uso:
 *   LogosReport.render(dados);                 // documento inteiro
 *   LogosReport.render(dados, elementoRaiz);   // só uma parte
 *   renderReport(dados);                       // atalho compatível com versões anteriores
 *
 * Esta função precisa ser autocontida: o editor a serializa com toString()
 * para embuti-la nos HTMLs exportados. Não referencie nada de fora dela.
 */
function logosReportRuntime(global) {
  "use strict";

  var VERSION = 1;
  var hasOwn = Object.prototype.hasOwnProperty;

  // Lê um valor por caminho: "ordem.cliente", "itens[0].codigo".
  // O sufixo "[]" (usado pelo editor para indicar lista) é ignorado.
  // Só enxerga propriedades próprias, para não vazar "constructor", "__proto__" etc.
  function getPath(source, path) {
    if (path == null || path === "") return undefined;
    var parts = String(path).replace(/\[\]/g, "").replace(/\[(\d+)\]/g, ".$1").split(".");
    var value = source;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "") continue;
      if (value == null || !hasOwn.call(Object(value), parts[i])) return undefined;
      value = value[parts[i]];
    }
    return value;
  }

  // Aceita 31.5, "31.50000" (API) e "1.234,56" (já em pt-BR). Retorna null se não for número.
  function toNumber(value) {
    if (typeof value === "number") return isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    var text = value.trim().replace(/^R\$\s*/, "");
    if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text) || /^-?\d+,\d+$/.test(text)) {
      return Number(text.replace(/\./g, "").replace(",", "."));
    }
    return null;
  }

  function text(value) {
    if (value == null) return "";
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  }

  // Cada formatador recebe o valor bruto e devolve texto.
  // Se o valor não puder ser interpretado, ele é mostrado como veio (nunca perde informação).
  var formatters = {
    moeda: function (value) {
      var n = toNumber(value);
      return n === null ? text(value) : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },
    numero: function (value) {
      var n = toNumber(value);
      return n === null ? text(value) : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    data: function (value) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text(value));
      return m ? m[3] + "/" + m[2] + "/" + m[1] : text(value);
    },
    datahora: function (value) {
      var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(text(value));
      if (!m) return text(value);
      return m[3] + "/" + m[2] + "/" + m[1] + (m[4] ? " " + m[4] + ":" + m[5] : "");
    }
  };

  function format(value, name) {
    if (value == null) return "";
    return name && formatters[name] ? formatters[name](value) : text(value);
  }

  // Guarda o modelo de cada lista (o primeiro filho) para poder renderizar mais de uma vez.
  var listTemplates = typeof WeakMap === "function" ? new WeakMap() : null;

  function bindScope(scope, data, missing, skipNested) {
    var nodes = Array.prototype.slice.call(scope.querySelectorAll("[data-bind]"));
    if (scope.hasAttribute && scope.hasAttribute("data-bind")) nodes.unshift(scope);
    nodes.forEach(function (node) {
      if (skipNested && node.closest("[data-each]")) return; // pertence a uma lista: será preenchido por ela
      var path = node.getAttribute("data-bind");
      var value = getPath(data, path);
      if (value === undefined) missing.push(path);
      node.textContent = format(value, node.getAttribute("data-format"));
    });
  }

  function fillLists(root, data, missing) {
    var lists = Array.prototype.slice.call(root.querySelectorAll("[data-each]"));
    lists.forEach(function (list) {
      if (list.parentElement && list.parentElement.closest("[data-each]")) return; // só um nível de lista
      var path = list.getAttribute("data-each");
      var model = listTemplates && listTemplates.get(list);
      if (!model) {
        model = list.firstElementChild ? list.firstElementChild.cloneNode(true) : null;
        if (listTemplates && model) listTemplates.set(list, model);
      }
      if (!model) return;
      var records = getPath(data, path);
      if (records === undefined) missing.push(path);
      list.textContent = "";
      if (!Array.isArray(records)) return;
      records.forEach(function (record) {
        var row = model.cloneNode(true);
        bindScope(row, record, missing, false);
        list.appendChild(row);
      });
    });
  }

  // Preenche o template. Retorna { missing: [caminhos que não existem nos dados] }.
  // Caminhos com valor null são aceitos (ficam vazios); só "undefined" conta como ausente.
  function render(data, root, options) {
    root = root || global.document;
    options = options || {};
    var missing = [];
    fillLists(root, data, missing);
    bindScope(root.documentElement || root, data, missing, true);
    var unique = missing.filter(function (p, i) { return missing.indexOf(p) === i; });
    if (unique.length && options.warn !== false && global.console) {
      global.console.warn("LogosReport: caminhos sem valor nos dados:", unique);
    }
    return { missing: unique };
  }

  global.LogosReport = { version: VERSION, getPath: getPath, formatters: formatters, format: format, render: render };
  // Atalho compatível com a primeira versão do formato.
  global.renderReport = function (data) { return render(data); };
}

logosReportRuntime(typeof window !== "undefined" ? window : globalThis);
if (typeof module !== "undefined" && module.exports) module.exports = logosReportRuntime;
