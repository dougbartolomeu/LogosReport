# Formato de template do LogosReport (v1)

Este documento é o **contrato** do LogosReport. O editor gera arquivos nesse formato, mas qualquer
sistema (ou pessoa) pode criar, editar e consumir templates sem usar o editor.

Um template é um arquivo HTML comum: a **estrutura** do relatório, sem dados. Os dados (JSON) são
aplicados por um runtime pequeno e sem dependências.

## Vínculos

| Atributo | Onde | Efeito |
| --- | --- | --- |
| `data-bind="caminho"` | qualquer elemento | escreve o valor como **texto** no elemento |
| `data-format="nome"` | junto de `data-bind` | formata o valor antes de escrever |
| `data-each="lista"` | elemento pai das linhas repetidas | repete o **primeiro filho** para cada item da lista |

Dentro de um `data-each`, os `data-bind` são **relativos ao item**.

```html
<span class="lr-label">Cliente:</span>
<span class="lr-value" data-bind="cliente.nome"></span>

<table class="lr-table">
  <thead><tr><th>Descrição</th><th>Total</th></tr></thead>
  <tbody data-each="itens">
    <tr><td data-bind="descricao"></td><td data-bind="valor_total" data-format="moeda"></td></tr>
  </tbody>
</table>
```

## Caminhos

- `a.b.c` — propriedades aninhadas.
- `lista[0].campo` — índice de lista.
- O sufixo `[]` (`itens[]`) é aceito e ignorado; o editor o usa para marcar listas.
- Só propriedades **próprias** são lidas: `constructor`, `__proto__` etc. resultam em "ausente".
- Valor `null` → o elemento fica vazio (não é erro). Valor `undefined` (caminho inexistente) → elemento
  vazio **e** o caminho é listado em `missing` no retorno de `render`.
- Objetos e listas usados num `data-bind` são escritos como JSON.

## Formatadores (`data-format`)

| Nome | Entrada | Saída |
| --- | --- | --- |
| `moeda` | `31.5`, `"31.50000"`, `"R$ 15,75"` | `R$ 31,50` |
| `numero` | `2`, `"2.00000"` | `2,00` |
| `data` | `"2026-11-05T08:30:00"` | `05/11/2026` |
| `datahora` | `"2026-11-05T08:30:00"` | `05/11/2026 08:30` |

Se o valor não puder ser interpretado, ele é mostrado **como veio** (nunca some informação).
Formatador desconhecido = sem formatação. Para novos formatos: `LogosReport.formatters.meu = v => ...`
antes de chamar `render`.

## Runtime

```js
LogosReport.render(dados);                   // documento inteiro
LogosReport.render(dados, elementoRaiz);     // só uma parte
LogosReport.render(dados, document, { warn: false }); // sem console.warn
// retorna { missing: ["caminhos", "sem", "valor"] }

renderReport(dados);                         // atalho (compatível com o formato antigo)
```

- Pode ser chamado várias vezes com dados diferentes: o modelo da linha de cada `data-each` é preservado.
- Se o HTML for aberto sozinho, ele se preenche com `window.REPORT_DATA` (se existir) ou com o bloco
  `<script type="application/json" id="logosreport-sample-data">` (se o template foi exportado com dados de exemplo).
- Uso típico em um sistema: carregar o template em um `iframe` da **mesma origem** e chamar
  `iframe.contentWindow.renderReport(dados)`; ou carregar o HTML como texto, inserir `<main class="lr-report">`
  e chamar `LogosReport.render(dados, elemento)`.
- O código do runtime está em `logosreport.js` e é embutido, legível, em todo HTML exportado
  (`<script id="logosreport-runtime">`).

## Estrutura do arquivo exportado

```
<html data-logosreport="1">
  <style id="logosreport-base">     CSS do template (classes lr-*, variáveis --lr-*). Regerado pelo editor.
  <style id="logosreport-custom">   SEU CSS. Vem do campo "CSS personalizado" do editor.
  <main class="lr-report" data-lr-version="1">   as linhas (.lr-row) e células (.lr-cell)
  <script id="logosreport-model">   modelo do editor (JSON). Permite reabrir o HTML no editor.
  <script id="logosreport-sample-data">  (opcional) dados de exemplo
  <script id="logosreport-runtime">      runtime
```

### Como personalizar sem perder a edição

O editor **regenera** o HTML a partir do modelo. Edições feitas à mão na estrutura (`<main>`) não
voltam ao editor. Por isso:

- **Aparência:** use o campo *CSS personalizado* do editor (ou o bloco `logosreport-custom`).
  Variáveis disponíveis: `--lr-font`, `--lr-color`, `--lr-section-bg`, `--lr-border`, `--lr-box-border`,
  `--lr-divider`, `--lr-th-border`.
- **Estrutura:** edite no editor e salve o modelo (`.json`) ou reabra o HTML exportado.
- Se você editar a estrutura à mão, trate o HTML como arquivo seu e não o reabra no editor.

## Segurança

- O runtime escreve valores com `textContent`: dado vindo do JSON **nunca** vira HTML.
- O **template** é código confiável (contém scripts). Não carregue templates de origem desconhecida
  no mesmo contexto do seu sistema.
- Dados reais podem acabar dentro do arquivo se você exportar com *Incluir os dados de exemplo*.
  Por padrão isso fica desmarcado.

## Versionamento

`data-lr-version` indica a versão do formato. Mudanças que quebrem o contrato incrementam a versão;
`renderReport(dados)` será mantido enquanto possível.
