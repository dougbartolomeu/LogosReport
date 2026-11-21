<p align="center">
  <img src="docs/images/logosreport-logo.png" alt="LogosReport — Pensamento em forma de relatório" width="720">
</p>
# LogosReport

Editor visual para criar **templates HTML de relatório**: só a estrutura, que apresenta dados JSON.
Pensado como ferramenta de apoio para quem programa e precisa personalizar relatórios.

Sem dependências, sem build: abra `index.html` no navegador.

## Fluxo

1. Cole ou abra o JSON de dados (**Abrir dados (JSON)**) e clique em **Aplicar**.
2. Arraste campos para a página, ajuste colunas, formatos (moeda, data, número) e tabelas.
3. **Pré-visualizar** (é o mesmo HTML que será exportado) ou **Imprimir / Salvar PDF**.
4. **Exportar HTML**: template legível, com vínculos `data-bind`/`data-each`.
5. **Salvar modelo** (`.json`) / **Abrir modelo** (`.json` ou HTML exportado) para continuar depois.

## Usar o template em um sistema

```js
iframe.contentWindow.renderReport(dadosDaOs);        // iframe da mesma origem
// ou, sem iframe, com o template já inserido na página:
LogosReport.render(dadosDaOs, elementoDoRelatorio);
```

O contrato completo (atributos, caminhos, formatadores, segurança) está em
[docs/FORMATO.md](docs/FORMATO.md).

## Personalizar a aparência

Use o campo **CSS personalizado** do editor. O template usa classes `lr-*` e variáveis `--lr-*`
(fonte, cores, bordas), então o CSS do seu sistema não conflita.

## Testes

```
npm install
npm test
```

## Limites desta versão

Não há reordenação de linhas por arrastar e soltar, regras condicionais nem paginação avançada
(tabelas longas quebram entre páginas, mas isso ainda precisa de mais testes com dados reais).
Os exemplos em `samples/` são fictícios; os caminhos dos campos do modelo padrão (OS da COMREES)
ainda precisam ser validados com o JSON real da API.
