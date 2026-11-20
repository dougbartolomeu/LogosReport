# LogosReport

Editor visual independente para desenhar modelos de relatório com base em dados JSON. O alpha começa com uma estrutura de Ordem de Serviço COMREES inspirada no PDF de referência.

## Abrir

Abra index.html em um navegador. O exemplo já vem preenchido. Para usar outro conjunto de dados, cole ou carregue um JSON e clique em Aplicar.

## Modelar

- Arraste qualquer campo detectado para a página ou para uma linha já existente.
- Cada componente ocupa uma coluna; selecione a coluna e ajuste a largura em porcentagem.
- Arraste a alça na borda direita para redimensionar a coluna e a alça inferior para ajustar a altura.
- Use Nova linha para criar uma linha vazia.
- A área A4 tem rolagem própria para editar a página em escala real.
- Passe o mouse sobre um elemento e use a lixeira para removê-lo.
- Em tabelas, cada coluna tem uma propriedade de origem e um cabeçalho editável separado. Renomear o cabeçalho não altera o vínculo com os dados.
- Títulos de seção, caixas de observação e tabelas são componentes independentes.
- A prévia usa o JSON de exemplo atual.

## Usar no sistema

Exportar HTML gera um modelo independente com window.renderReport(dados). O sistema pode carregar o HTML em um iframe da mesma origem e chamar iframe.contentWindow.renderReport(jsonDaOs); o modelo é preenchido com os dados da OS atual e pode ser impresso pelo navegador.

## Limites desta alpha

O JSON de exemplo incluído é fictício e serve para apresentar a estrutura visual da OS. O JSON real da API ainda precisa ser aplicado para validar e ajustar os caminhos dos campos. O editor já organiza múltiplos objetos por linha e ajusta larguras, mas ainda não salva projetos, não tem arrastar e soltar para reordenar linhas e não possui regras condicionais nem paginação avançada.
