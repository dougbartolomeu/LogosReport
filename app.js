(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const demo = {
    empresa: { nome: "COMREES REBOBINAGENS E SERVIÇOS", razao_social: "COMREES MÁQUINAS E EQUIPAMENTOS LTDA", cnpj: "33.317.931/0001-77", endereco: "Rua Ucrania, 42, Bairro Rocio, União da Vitória - PR - CEP:84600-691", telefone: "42 3522-9346", celular: "42 98431-7443" },
    ordem: { numero: "6139", data_recebimento: "05/11/2026", data_prevista: "", data_fechamento: "", cliente: "CLUBE EXEMPLO LTDA", telefone: "42 99999-0000", tipo_equipamento: "Bomba de piscina", marca: "DANCOR / WEG", modelo: "", voltagem: "", potencia: "3 CV", polos: "2", tag: "" },
    defeito_cliente: "", solucao_problema: "",
    itens_vendidos: [{ codigo: "375", servico: "ROLAMENTO 6203 ZZ C3 NSK", quantidade: "2,00", valor: "R$ 15,75", desconto: "R$ 0,00", total: "R$ 31,50" }, { codigo: "1780", servico: "SELO MEC. 3/4 T-16 SB-MG BUNA SELOBRAS", quantidade: "1,00", valor: "R$ 22,00", desconto: "R$ 0,00", total: "R$ 22,00" }],
    servicos_vendidos: [{ codigo: "3", servico: "Revisão de moto-bomba", quantidade: "1,00", valor: "R$ 180,00", desconto: "R$ 0,00", total: "R$ 180,00" }, { codigo: "27", servico: "Retirada/Instalação de bomba de Piscina", quantidade: "1,00", valor: "R$ 150,00", desconto: "R$ 0,00", total: "R$ 150,00" }],
    informacoes_adicionais: "", valor_total: "R$ 383,50"
  };
  function columnCaption(field) {
    const known = { codigo: "Código", descricao: "Descrição", servico: "Descrição", quantidade: "Quantidade", valor: "Valor", desconto: "Desconto", total: "Valor total" };
    return known[field] || String(field || "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  }
  function normalizeColumn(column) {
    if (typeof column === "string") return { field: column, label: columnCaption(column) };
    return { field: column?.field || "", label: column?.label ?? columnCaption(column?.field) };
  }
  const cell = (type, props = {}) => {
    const item = { id: makeId(), type, width: 100, align: "left", fontSize: 10, ...props };
    if (type === "table") item.columns = (item.columns || []).map(normalizeColumn);
    return item;
  };
  const row = (...cells) => ({ id: makeId(), cells });
  const state = { data: demo, page: "A4", orientation: "portrait", selected: null, selectedRow: null, rows: [
    row(cell("text", { text: "COMREES REBOBINAGENS E SERVIÇOS", width: 67, fontSize: 16, bold: true }), cell("field", { path: "empresa.cnpj", label: "CNPJ:", width: 33, align: "right", bold: true })),
    row(cell("field", { path: "empresa.razao_social", label: "Razão social:", width: 67 }), cell("field", { path: "empresa.celular", label: "Cel:", width: 33, align: "right", bold: true })),
    row(cell("field", { path: "empresa.endereco", label: "Endereço:", width: 76 }), cell("field", { path: "empresa.telefone", label: "Fone:", width: 24, align: "right", bold: true })),
    row(cell("text", { text: "ORDEM DE SERVIÇO", width: 82, fontSize: 16, bold: true, align: "center", border: true }), cell("field", { path: "ordem.numero", label: "Nº:", width: 18, fontSize: 15, bold: true, border: true, align: "right" })),
    row(cell("field", { path: "ordem.data_recebimento", label: "Data recebimento:", width: 26, bold: true }), cell("field", { path: "ordem.data_prevista", label: "Data prevista conclusão:", width: 30, bold: true }), cell("field", { path: "ordem.data_fechamento", label: "Data de fechamento / entrega:", width: 44, bold: true })),
    row(cell("field", { path: "ordem.cliente", label: "Cliente:", width: 54, bold: true }), cell("field", { path: "ordem.telefone", label: "Telefone:", width: 46, bold: true })),
    row(cell("field", { path: "ordem.tipo_equipamento", label: "Tipo de equipamento:", width: 43, bold: true }), cell("field", { path: "ordem.marca", label: "Marca:", width: 29, bold: true }), cell("field", { path: "ordem.modelo", label: "Modelo:", width: 28, bold: true })),
    row(cell("field", { path: "ordem.potencia", label: "Potência:", width: 21, bold: true }), cell("field", { path: "ordem.polos", label: "polos", width: 18, bold: true }), cell("field", { path: "ordem.voltagem", label: "Voltagem:", width: 29, bold: true }), cell("field", { path: "ordem.tag", label: "TAG / Ident:", width: 32, bold: true })),
    row(cell("section", { text: "DEFEITO MENCIONADO PELO CLIENTE" })),
    row(cell("box", { path: "defeito_cliente", width: 100, height: 34 })),
    row(cell("section", { text: "SOLUÇÃO DO PROBLEMA" })),
    row(cell("box", { path: "solucao_problema", width: 100, height: 20 })),
    row(cell("section", { text: "ITENS VENDIDOS" })),
    row(cell("table", { path: "itens_vendidos", columns: ["codigo", "servico", "quantidade", "valor", "desconto", "total"], width: 100 })),
    row(cell("section", { text: "SERVIÇOS VENDIDOS" })),
    row(cell("table", { path: "servicos_vendidos", columns: ["codigo", "servico", "quantidade", "valor", "desconto", "total"], width: 100 })),
    row(cell("section", { text: "INFORMAÇÕES ADICIONAIS" })),
    row(cell("box", { path: "informacoes_adicionais", width: 100, height: 40 })),
    row(cell("text", { text: "Valor total da O.S:", width: 72, fontSize: 16, bold: true, align: "right" }), cell("field", { path: "valor_total", label: "", width: 28, fontSize: 16, bold: true, align: "right" }))
  ] };
  function makeId() { return "c" + Math.random().toString(36).slice(2, 10); }
  function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function getPath(source, path) { return path ? path.replace(/\[\]/g, "").split(".").reduce((value, key) => value == null ? undefined : value[key], source) : undefined; }
  function collectFields(value, prefix = "", output = []) {
    if (Array.isArray(value)) {
      if (value.length) collectFields(value[0], prefix + "[]", output);
      else output.push({ path: prefix + "[]", kind: "lista vazia" });
    } else if (value && typeof value === "object") {
      const entries = Object.entries(value);
      if (!entries.length) output.push({ path: prefix || "objeto", kind: "objeto" });
      entries.forEach(([key, item]) => collectFields(item, prefix ? prefix + "." + key : key, output));
    } else output.push({ path: prefix || "valor", kind: value === null ? "nulo" : typeof value });
    return output;
  }
  function formatValue(value) { return value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); }
  function selectedCell() { for (const currentRow of state.rows) { const found = currentRow.cells.find(item => item.id === state.selected); if (found) return found; } return null; }
  function findRow(id) { return state.rows.find(item => item.id === id); }
  // A célula é um contêiner flex: text-align não move os filhos, então o alinhamento usa justify-content.
  // Faixa de seção, tabela e divisor têm layout próprio e ficam de fora.
  function flexJustify(item) {
    if (["section", "table", "divider"].includes(item.type)) return "";
    return "justify-content:" + ({ center: "center", right: "flex-end" }[item.align] || "flex-start") + ";";
  }
  function renderCell(item, data = state.data, editor = true) {
    const raw = item.type === "field" || item.type === "box" ? getPath(data, item.path) : null;
    const classes = "report-cell" + (editor && state.selected === item.id ? " selected" : "");
    const style = "flex-basis:" + Number(item.width || 100) + "%;max-width:" + Number(item.width || 100) + "%;font-size:" + Number(item.fontSize || 10) + "px;text-align:" + esc(item.align || "left") + ";" + flexJustify(item) + (item.bold ? "font-weight:700;" : "") + (item.border ? "border:1px solid #333;" : "") + (item.height && item.type === "box" ? "min-height:" + Number(item.height) + "mm;" : "") + (item.heightPx ? "min-height:" + Number(item.heightPx) + "px;" : "");
    let body = "";
    if (item.type === "field") body = (item.label ? '<span class="cell-label">' + esc(item.label) + '</span>' : "") + '<span class="cell-value ' + (raw == null ? "placeholder" : "") + '">' + esc(raw == null ? "{{" + (item.path || "campo") + "}}" : formatValue(raw)) + "</span>";
    if (item.type === "text") body = '<span class="cell-value">' + esc(item.text || "Texto") + "</span>";
    if (item.type === "section") body = '<span class="cell-value">' + esc(item.text || "Título da seção") + "</span>";
    if (item.type === "box") body = '<span class="cell-value">' + esc(raw == null ? "" : formatValue(raw)) + "</span>";
    if (item.type === "divider") body = "<hr>";
    if (item.type === "table") {
      const records = getPath(data, item.path);
      const columns = (item.columns && item.columns.length ? item.columns : (Array.isArray(records) && records[0] ? Object.keys(records[0]).map(key => ({ field: key, label: columnCaption(key) })) : [])).map(normalizeColumn);
      body = Array.isArray(records) ? '<table><thead><tr>' + columns.map(column => "<th>" + esc(column.label || columnCaption(column.field)) + "</th>").join("") + "</tr></thead><tbody>" + records.map(record => "<tr>" + columns.map(column => "<td>" + esc(formatValue(record?.[column.field])) + "</td>").join("") + "</tr>").join("") + "</tbody></table>" : '<span class="placeholder">Vincule uma lista do JSON</span>';
    }
    const actions = editor ? '<span class="cell-actions"><button type="button" class="cell-delete" data-cell-action="delete" title="Excluir elemento" aria-label="Excluir elemento"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 4.5h9M6 4.5V3h4v1.5m1.5 0-.6 8H5.1l-.6-8m3 2v4m2-4v4"/></svg></button><button type="button" data-cell-action="up" title="Mover para cima" aria-label="Mover para cima">↑</button><button type="button" data-cell-action="down" title="Mover para baixo" aria-label="Mover para baixo">↓</button></span><button type="button" class="resize-handle resize-east" data-resize="width" title="Arraste para ajustar a largura" aria-label="Ajustar largura"></button><button type="button" class="resize-handle resize-south" data-resize="height" title="Arraste para ajustar a altura" aria-label="Ajustar altura"></button>' : "";
    return '<div class="' + classes + '" data-cell-id="' + esc(item.id) + '" data-type="' + esc(item.type) + '" style="' + style + '">' + body + actions + "</div>";
  }
  function renderCanvas(data = state.data, editor = true) {
    const paper = $("#paper");
    paper.classList.toggle("print-root", !editor);
    paper.innerHTML = state.rows.map(currentRow => '<div class="report-row ' + (currentRow.cells.length ? "has-cells" : "") + '" data-row-id="' + esc(currentRow.id) + '"><div class="row-cells">' + currentRow.cells.map(item => renderCell(item, data, editor)).join("") + '</div><div class="drop-hint">Solte um campo aqui para criar uma coluna</div></div>').join("");
    paper.style.width = state.orientation === "portrait" ? "794px" : "1123px";
    paper.style.minWidth = paper.style.width;
    paper.style.minHeight = state.orientation === "portrait" ? "1123px" : "794px";
  }
  function renderFields() {
    const fields = collectFields(state.data);
    $("#field-list").innerHTML = fields.length ? fields.map(field => '<button type="button" class="field-item" draggable="true" data-field-path="' + esc(field.path) + '" title="' + esc(field.kind) + '"><span>⠿</span><span>' + esc(field.path) + '</span><span class="field-kind">' + esc(field.kind) + "</span></button>").join("") : '<p class="empty-note">Nenhum campo encontrado.</p>';
  }
  function prop(label, key, value, type = "text", options = {}) {
    const id = "prop-" + key;
    let control;
    if (type === "textarea") control = '<textarea id="' + id + '" class="property-control" data-prop="' + key + '">' + esc(value || "") + "</textarea>";
    else if (type === "select") control = '<select id="' + id + '" class="property-control" data-prop="' + key + '">' + options.values.map(option => '<option value="' + esc(option[0]) + '" ' + (String(option[0]) === String(value) ? "selected" : "") + ">" + esc(option[1]) + "</option>").join("") + "</select>";
    else control = '<input id="' + id + '" class="property-control" type="' + type + '" data-prop="' + key + '" value="' + esc(value || "") + '">';
    return '<div class="property-group"><label for="' + id + '">' + esc(label) + "</label>" + control + (options.hint ? '<p class="property-hint">' + esc(options.hint) + "</p>" : "") + "</div>";
  }
  function renderProperties() {
    const item = selectedCell(), box = $("#properties");
    if (!item) { box.innerHTML = '<div class="empty-properties"><span>↖</span><strong>Selecione um elemento</strong><small>Edite conteúdo, campo, largura e alinhamento.</small></div>'; return; }
    let html = "";
    if (item.type === "field" || item.type === "box") html += prop("Caminho no JSON", "path", item.path || "", "text", { hint: "Exemplo: ordem.cliente" });
    if (item.type === "field") html += prop("Rótulo", "label", item.label || "");
    if (["text", "section"].includes(item.type)) html += prop(item.type === "section" ? "Título da faixa" : "Texto", "text", item.text || "", "textarea");
    if (item.type === "table") {
      const lists = collectFields(state.data).filter(field => field.path.endsWith("[]"));
      html += prop("Lista no JSON", "path", item.path || "", "select", { values: [["", "Selecione uma lista"], ...lists.map(field => [field.path, field.path])] });
      const records = getPath(state.data, item.path);
      const available = Array.isArray(records) && records[0] ? Object.keys(records[0]) : [];
      if (!item.columns.length && available.length) item.columns = available.map(field => ({ field, label: columnCaption(field) }));
      html += '<div class="table-columns-heading"><span>Colunas do relatório</span><small>Cada cabeçalho mantém seu vínculo com o JSON.</small></div>';
      html += item.columns.map((column, index) => {
        const current = normalizeColumn(column);
        const fieldOptions = [["", "Selecione a propriedade"], ...available.map(field => [field, field])];
        return '<div class="table-column-editor" data-column-index="' + index + '"><label>Propriedade do JSON</label><select class="property-control" data-column-prop="field">' + fieldOptions.map(option => '<option value="' + esc(option[0]) + '" ' + (option[0] === current.field ? "selected" : "") + ">" + esc(option[1]) + "</option>").join("") + '</select><label>Descrição no relatório</label><div class="column-label-row"><input class="property-control" data-column-prop="label" value="' + esc(current.label) + '" aria-label="Descrição da coluna"><button type="button" class="column-remove" data-remove-column="' + index + '" title="Excluir coluna" aria-label="Excluir coluna">×</button></div></div>';
      }).join("");
      html += '<button type="button" class="add-column-button" id="add-table-column">＋ Adicionar coluna</button>';
    }
    if (item.type === "box") html += prop("Altura mínima (mm)", "height", item.height || 32, "number");
    if (item.type !== "section" && item.type !== "divider") html += prop("Largura da coluna (%)", "width", item.width || 100, "number", { hint: "Arraste a alça lateral ou informe de 10 a 100." });
    if (item.type !== "section" && item.type !== "divider" && item.type !== "table") html += prop("Alinhamento", "align", item.align || "left", "select", { values: [["left", "À esquerda"], ["center", "Centralizado"], ["right", "À direita"]] }) + prop("Fonte (px)", "fontSize", item.fontSize || 10, "number");
    if (["field", "text"].includes(item.type)) html += '<label class="check-row"><input data-prop="bold" type="checkbox" ' + (item.bold ? "checked" : "") + "> Texto em negrito</label>";
    html += '<div class="property-actions"><button type="button" data-move="left">← Coluna</button><button type="button" data-move="right">Coluna →</button></div><div class="property-actions"><button type="button" data-move="up">↑ Linha</button><button type="button" data-move="down">↓ Linha</button></div><div class="property-actions"><button type="button" class="danger" id="delete-cell">Excluir elemento</button><button type="button" class="danger" id="delete-row">Excluir linha</button></div>';
    box.innerHTML = html;
  }
  function render() { renderCanvas(); renderProperties(); }
  function addCell(type, path = "", rowId = null) {
    let item = cell(type, { width: type === "section" || type === "table" || type === "box" ? 100 : 33.33, path, label: path.split(".").pop()?.replace(/\[\]/g, "") || "Campo", text: type === "section" ? "Título da seção" : type === "text" ? "Texto fixo" : "", columns: [], height: 32 });
    if (type === "table") { const records = getPath(state.data, path); item.columns = Array.isArray(records) && records[0] ? Object.keys(records[0]).map(field => ({ field, label: columnCaption(field) })) : []; }
    let target = rowId ? findRow(rowId) : null;
    if (target) target.cells.push(item); else { target = row(item); state.rows.push(target); }
    state.selected = item.id; state.selectedRow = target.id; render(); return item;
  }
  function moveCell(direction) {
    const item = selectedCell(), currentRow = state.rows.find(r => r.cells.some(c => c.id === state.selected));
    if (!item || !currentRow) return;
    if (direction === "left" || direction === "right") { const i = currentRow.cells.indexOf(item), j = i + (direction === "left" ? -1 : 1); if (j >= 0 && j < currentRow.cells.length) [currentRow.cells[i], currentRow.cells[j]] = [currentRow.cells[j], currentRow.cells[i]]; }
    else {
      const i = state.rows.indexOf(currentRow), j = i + (direction === "up" ? -1 : 1);
      if (j >= 0 && j < state.rows.length) {
        if (currentRow.cells.length === 1) {
          // Linha com um único elemento: troca de posição com a vizinha (reordena a linha).
          [state.rows[i], state.rows[j]] = [state.rows[j], state.rows[i]];
          state.selectedRow = currentRow.id;
        } else {
          // Linha com várias colunas: o elemento passa para o fim da linha vizinha.
          // A referência da linha de destino é guardada antes de qualquer remoção, para o índice não deslocar.
          const targetRow = state.rows[j];
          currentRow.cells.splice(currentRow.cells.indexOf(item), 1);
          targetRow.cells.push(item);
          state.selectedRow = targetRow.id;
        }
      }
    }
    render();
  }
  function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("visible"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("visible"), 2400); }
  function applyJson() {
    try { const parsed = JSON.parse($("#json-input").value); if (!parsed || typeof parsed !== "object") throw new Error("Use um objeto ou uma lista JSON."); state.data = parsed; renderFields(); render(); $("#json-status").textContent = "JSON válido aplicado. Arraste os campos para as linhas."; $("#json-status").classList.remove("error"); }
    catch (error) { $("#json-status").textContent = "JSON inválido: " + error.message; $("#json-status").classList.add("error"); }
  }
  function safeJson(value) { return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"); }
  function exportCss() {
    return "*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#111}.report-row{display:flex;align-items:stretch;flex-wrap:wrap;min-height:17px;margin:0}.report-cell{position:relative;min-width:0;padding:2px 4px;display:flex;align-items:center;overflow-wrap:anywhere}.report-cell[data-type=section]{justify-content:center;background:#e5e5e5;border:1px solid #555!important;font-weight:700;text-align:center;min-height:17px;padding:1px 3px}.report-cell[data-type=box]{align-items:flex-start;border:1px solid #333!important;padding:4px;white-space:pre-wrap}.report-cell[data-type=table]{display:block;padding:0}.report-cell[data-type=table] table{width:100%;border-collapse:collapse}.report-cell[data-type=table] th,.report-cell[data-type=table] td{padding:2px 4px;text-align:left;vertical-align:top}.report-cell[data-type=table] th{border-bottom:1px solid #777}.cell-label{font-weight:700;margin-right:5px;white-space:nowrap}.cell-value{min-width:0}.report-cell[data-type=divider] hr{width:100%;border:0;border-top:1px solid #777}@page{size:" + state.page + " " + state.orientation + ";margin:12mm}@media screen{body{max-width:1000px;margin:25px auto;padding:0 25px}}@media print{.report-row,.report-cell{break-inside:avoid}.report-cell[data-type=table] thead{display:table-header-group}.report-cell[data-type=table] tr{break-inside:avoid}}";
  }
  function exportHtml() {
    const model = { version: 2, page: state.page, orientation: state.orientation, rows: state.rows.map(r => r.cells.map(({ id, ...item }) => item)) };
    let runtime = "const REPORT_MODEL=" + safeJson(model) + ";";
    // Escape feito com replace encadeado: evita aspas dentro de objeto literal, que quebravam a sintaxe do script exportado.
    runtime += "function renderReport(data){const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\\"/g,'&quot;').replace(/'/g,'&#39;');";
    runtime += "const get=(o,p)=>p?p.replace(/\\[\\]/g,'').split('.').reduce((v,k)=>v==null?undefined:v[k],o):undefined;const val=v=>v==null?'':typeof v==='object'?JSON.stringify(v):String(v);";
    runtime += "const cell=b=>{let v=(b.type==='field'||b.type==='box')?get(data,b.path):null,x='',font=Number(b.fontSize||10),align=b.align||'left';if(b.type==='field')x=(b.label?'<span class=\\\"cell-label\\\">'+esc(b.label)+'</span>':'')+'<span class=\\\"cell-value\\\">'+esc(val(v))+'</span>';if(b.type==='text'||b.type==='section')x='<span class=\\\"cell-value\\\">'+esc(b.text||'')+'</span>';if(b.type==='box')x='<span class=\\\"cell-value\\\">'+esc(val(v))+'</span>';if(b.type==='divider')x='<hr>';if(b.type==='table'){let a=get(data,b.path),c=(b.columns||[]).map(k=>typeof k==='string'?{field:k,label:k}:k);x=Array.isArray(a)?'<table><thead><tr>'+c.map(k=>'<th>'+esc(k.label||k.field)+'</th>').join('')+'</tr></thead><tbody>'+a.map(r=>'<tr>'+c.map(k=>'<td>'+esc(val(r?.[k.field]))+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<span>Lista indisponível</span>'}return '<div class=\\\"report-cell\\\" data-type=\\\"'+esc(b.type)+'\\\" style=\\\"flex-basis:'+Number(b.width||100)+'%;max-width:'+Number(b.width||100)+'%;font-size:'+font+'px;text-align:'+esc(align)+';'+(['section','table','divider'].includes(b.type)?'':'justify-content:'+({center:'center',right:'flex-end'}[align]||'flex-start')+';')+(b.bold?'font-weight:700;':'')+(b.border?'border:1px solid #333;':'')+(b.height&&b.type==='box'?'min-height:'+Number(b.height)+'mm;':'')+(b.heightPx?'min-height:'+Number(b.heightPx)+'px;':'')+'\\\">'+x+'</div>'};";
    runtime += "const root=document.getElementById('relatorio');root.innerHTML=REPORT_MODEL.rows.map(r=>'<div class=\\\"report-row\\\">'+r.map(cell).join('')+'</div>').join('');return root}window.renderReport=renderReport;window.REPORT_DATA=window.REPORT_DATA||" + safeJson(state.data) + ";renderReport(window.REPORT_DATA);";
    const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório</title><style>' + exportCss() + '</style></head><body><main id="relatorio"></main><script>' + runtime + '</script></body></html>';
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "LogosReport-modelo-relatorio.html"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Modelo HTML exportado com linhas e colunas.");
  }
  function openPreview() {
    $("#preview-content").innerHTML = '<div class="preview-sheet">' + state.rows.map(currentRow => '<div class="report-row">' + currentRow.cells.map(item => renderCell(item, state.data, false)).join("") + "</div>").join("") + "</div>";
    $("#preview-dialog").showModal();
  }
  function printableHtml() { return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ordem de serviço</title><style>' + exportCss() + '</style></head><body><main class="print-root">' + state.rows.map(currentRow => '<div class="report-row">' + currentRow.cells.map(item => renderCell(item, state.data, false)).join("") + "</div>").join("") + '</main><script>window.onload=()=>window.print()</script></body></html>'; }
  $("#json-input").value = JSON.stringify(demo, null, 2);
  $("#apply-json").addEventListener("click", applyJson);
  $("#json-file").addEventListener("change", async event => { const file = event.target.files?.[0]; if (file) { $("#json-input").value = await file.text(); applyJson(); event.target.value = ""; } });
  $("#field-list").addEventListener("dragstart", event => { const button = event.target.closest("[data-field-path]"); if (!button || !event.dataTransfer) return; event.dataTransfer.setData("text/plain", button.dataset.fieldPath); event.dataTransfer.setData("application/x-report-field", button.dataset.fieldPath); event.dataTransfer.effectAllowed = "copy"; button.classList.add("dragging"); });
  $("#field-list").addEventListener("dragend", event => { event.target.closest("[data-field-path]")?.classList.remove("dragging"); $("#paper").classList.remove("drag-active"); $$(".report-row.drop-target").forEach(rowEl => rowEl.classList.remove("drop-target")); });
  function draggedField(event) { const types = Array.from(event.dataTransfer?.types || []); if (types.includes("application/x-report-field")) return event.dataTransfer.getData("application/x-report-field"); if (types.includes("text/plain")) return event.dataTransfer.getData("text/plain"); return ""; }
  $("#paper").addEventListener("dragover", event => { if (draggedField(event) || Array.from(event.dataTransfer?.types || []).some(type => type === "text/plain" || type === "application/x-report-field")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; $$(".report-row.drop-target").forEach(rowEl => rowEl.classList.remove("drop-target")); event.target.closest(".report-row")?.classList.add("drop-target"); $("#paper").classList.add("drag-active"); } });
  $("#paper").addEventListener("dragenter", event => { if (Array.from(event.dataTransfer?.types || []).some(type => type === "text/plain" || type === "application/x-report-field")) { event.preventDefault(); $("#paper").classList.add("drag-active"); } });
  $("#paper").addEventListener("dragend", () => { $("#paper").classList.remove("drag-active"); $$(".report-row.drop-target").forEach(rowEl => rowEl.classList.remove("drop-target")); });
  $("#paper").addEventListener("dragleave", event => { const r = event.target.closest(".report-row"); if (r && !r.contains(event.relatedTarget)) r.classList.remove("drop-target"); });
  $("#paper").addEventListener("drop", event => { const path = draggedField(event); if (!path) return; event.preventDefault(); const targetRow = event.target.closest(".report-row"); $$(".report-row").forEach(rowEl => rowEl.classList.remove("drop-target")); $("#paper").classList.remove("drag-active"); addCell("field", path, targetRow?.dataset.rowId || null); });
  $("#field-list").addEventListener("click", event => { const button = event.target.closest("[data-field-path]"); if (button) addCell("field", button.dataset.fieldPath); });
  $$("[data-add]").forEach(button => button.addEventListener("click", () => addCell(button.dataset.add)));
  $("#add-row").addEventListener("click", () => { const blank = row(); state.rows.push(blank); state.selected = null; state.selectedRow = blank.id; render(); toast("Linha vazia adicionada. Arraste campos para ela."); });
  let resizeSession = null;
  $("#paper").addEventListener("pointerdown", event => {
    const handle = event.target.closest("[data-resize]");
    if (!handle) return;
    const cellEl = handle.closest("[data-cell-id]");
    const currentRowEl = cellEl?.closest(".report-row");
    const item = state.rows.flatMap(currentRow => currentRow.cells).find(candidate => candidate.id === cellEl?.dataset.cellId);
    if (!cellEl || !currentRowEl || !item) return;
    const siblings = [...currentRowEl.querySelectorAll(":scope > .row-cells > [data-cell-id]")];
    const nextCellEl = handle.dataset.resize === "width" ? siblings[siblings.indexOf(cellEl) + 1] : null;
    const neighbor = nextCellEl ? state.rows.flatMap(currentRow => currentRow.cells).find(candidate => candidate.id === nextCellEl.dataset.cellId) : null;
    $$(".report-cell.selected").forEach(element => element.classList.remove("selected"));
    state.selected = item.id;
    state.selectedRow = currentRowEl.dataset.rowId;
    cellEl.classList.add("selected");
    renderProperties();
    resizeSession = { mode: handle.dataset.resize, x: event.clientX, y: event.clientY, rowWidth: currentRowEl.querySelector(".row-cells").getBoundingClientRect().width, startWidth: Number(item.width || 100), item, cellEl, neighbor, nextCellEl, startNeighborWidth: neighbor ? Number(neighbor.width || 100) : 0, startHeight: cellEl.getBoundingClientRect().height };
    document.body.classList.add("resizing", "resizing-" + resizeSession.mode);
    event.preventDefault();
    event.stopPropagation();
  });
  window.addEventListener("pointermove", event => {
    if (!resizeSession) return;
    const session = resizeSession;
    if (session.mode === "width") {
      const delta = (event.clientX - session.x) / Math.max(1, session.rowWidth) * 100;
      if (session.neighbor) {
        const total = session.startWidth + session.startNeighborWidth;
        session.item.width = Math.min(total - 10, Math.max(10, session.startWidth + delta));
        session.neighbor.width = total - session.item.width;
        session.nextCellEl.style.flexBasis = session.neighbor.width + "%";
        session.nextCellEl.style.maxWidth = session.neighbor.width + "%";
      } else session.item.width = Math.min(100, Math.max(10, session.startWidth + delta));
      session.cellEl.style.flexBasis = session.item.width + "%";
      session.cellEl.style.maxWidth = session.item.width + "%";
    } else {
      session.item.heightPx = Math.min(600, Math.max(24, session.startHeight + event.clientY - session.y));
      session.cellEl.style.minHeight = session.item.heightPx + "px";
    }
    event.preventDefault();
  });
  function finishResize() {
    if (!resizeSession) return;
    resizeSession = null;
    document.body.classList.remove("resizing", "resizing-width", "resizing-height");
    renderProperties();
  }
  window.addEventListener("pointerup", finishResize);
  window.addEventListener("pointercancel", finishResize);
  $("#paper").addEventListener("click", event => { if (event.target.closest("[data-resize]")) return; const cellEl = event.target.closest("[data-cell-id]"); if (!cellEl) return; state.selected = cellEl.dataset.cellId; state.selectedRow = cellEl.closest(".report-row")?.dataset.rowId || null; const action = event.target.closest("[data-cell-action]")?.dataset.cellAction; if (action === "delete") { removeSelectedCell(); return; } if (action) moveCell(action); else render(); });
  function removeSelectedCell() { for (const currentRow of [...state.rows]) { currentRow.cells = currentRow.cells.filter(item => item.id !== state.selected); if (!currentRow.cells.length) state.rows.splice(state.rows.indexOf(currentRow), 1); } state.selected = null; state.selectedRow = null; render(); }
  $("#properties").addEventListener("input", updateProperty);
  $("#properties").addEventListener("change", updateProperty);
  function updateProperty(event) {
    const control = event.target.closest("[data-prop]"), item = selectedCell(); if (!control || !item) return;
    const key = control.dataset.prop;
    if (control.type === "checkbox") item[key] = control.checked;
    else if (key === "fontSize") item[key] = Math.max(7, Math.min(48, Number(control.value) || 10));
    else if (key === "width") item[key] = Math.max(10, Math.min(100, Number(control.value) || 100));
    else if (key === "height") item[key] = Math.max(10, Math.min(200, Number(control.value) || 32));
    else if (key === "path" && item.type === "table") {
      item.path = control.value;
      const records = getPath(state.data, item.path);
      const existing = new Map(item.columns.map(normalizeColumn).map(column => [column.field, column]));
      item.columns = Array.isArray(records) && records[0] ? Object.keys(records[0]).map(field => existing.get(field) || ({ field, label: columnCaption(field) })) : item.columns;
    } else item[key] = control.value;
    renderCanvas();
    if (event.type === "change" || control.tagName === "SELECT" || control.type === "checkbox") renderProperties();
  }
  $("#properties").addEventListener("input", updateColumnProperty);
  $("#properties").addEventListener("change", updateColumnProperty);
  function updateColumnProperty(event) {
    const control = event.target.closest("[data-column-prop]"), item = selectedCell();
    if (!control || !item || item.type !== "table") return;
    const index = Number(control.closest("[data-column-index]").dataset.columnIndex);
    const column = normalizeColumn(item.columns[index]);
    if (control.dataset.columnProp === "field") {
      const labelWasDefault = !column.label || column.label === columnCaption(column.field);
      column.field = control.value;
      if (labelWasDefault) column.label = columnCaption(column.field);
    } else column.label = control.value;
    item.columns[index] = column;
    renderCanvas();
    if (event.type === "change" || control.tagName === "SELECT") renderProperties();
  }
  $("#properties").addEventListener("click", event => {
    if (event.target.closest("#add-table-column")) {
      const item = selectedCell(), records = item && getPath(state.data, item.path);
      if (item?.type === "table") {
        const available = Array.isArray(records) && records[0] ? Object.keys(records[0]) : [];
        const used = item.columns.map(normalizeColumn).map(column => column.field);
        const field = available.find(key => !used.includes(key)) || "";
        item.columns.push({ field, label: columnCaption(field) });
        renderProperties(); renderCanvas();
      }
      return;
    }
    const removeColumn = event.target.closest("[data-remove-column]");
    if (removeColumn) {
      const item = selectedCell();
      if (item?.type === "table") { item.columns.splice(Number(removeColumn.dataset.removeColumn), 1); renderProperties(); renderCanvas(); }
      return;
    }
    if (event.target.id === "delete-cell") { for (const currentRow of [...state.rows]) { currentRow.cells = currentRow.cells.filter(item => item.id !== state.selected); if (!currentRow.cells.length) state.rows.splice(state.rows.indexOf(currentRow), 1); } state.selected = null; render(); return; }
    if (event.target.id === "delete-row") { state.rows = state.rows.filter(currentRow => currentRow.id !== state.selectedRow); state.selected = null; state.selectedRow = null; render(); return; }
    if (event.target.dataset.move) moveCell(event.target.dataset.move);
  });
  $("#page-size").addEventListener("change", event => { state.page = event.target.value; });
  $("#orientation").addEventListener("change", event => { state.orientation = event.target.value; renderCanvas(); });
  $("#export-button").addEventListener("click", exportHtml);
  $("#preview-button").addEventListener("click", openPreview);
  $("#close-preview").addEventListener("click", () => $("#preview-dialog").close());
  $("#done-preview").addEventListener("click", () => $("#preview-dialog").close());
  $("#print-button").addEventListener("click", () => { const win = window.open("", "_blank"); if (!win) { toast("Permita a abertura da janela de impressão."); return; } win.document.write(printableHtml()); win.document.close(); });
  $("#preview-dialog").addEventListener("click", event => { if (event.target === $("#preview-dialog")) $("#preview-dialog").close(); });
  renderFields(); render();
})();
