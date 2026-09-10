# ONG Esperança Solidária

Site institucional da ONG Esperança Solidária, construido como Single Page
Application em JavaScript modular, sem framework. Apresenta a organizacao, os
projetos sociais em andamento e os canais de doacao e voluntariado.

A aplicacao usa roteamento client-side, geracao de componentes por template,
validacao de formulario, persistencia em localStorage e integracao com
biblioteca externa via CDN.

## Requisitos

- Navegador atual com suporte a ES Modules
- Qualquer servidor HTTP estatico (Python, Node ou a extensao Live Server)

O projeto usa `fetch` e `import`, ambos bloqueados no protocolo `file://`.
Abrir o `index.html` por duplo clique nao funciona.

## Instalacao e execucao

```bash
git clone <url-do-repositorio>
cd sitecharity-portfolio
python -m http.server 5500
```

Acesse `http://localhost:5500/html/index.html`.

## Estrutura

```
html/          index.html e os fragmentos de rota em /paginas
css/           reset.css (normalizacao), design-system.css (tokens) e styles.css
js/            main.js (orquestracao)
js/modules/    router, templates, validacao, persistencia, tema, datas, menu
js/dados/      projetos.js, fonte de dados em array de objetos
imagens/       fotos dos projetos e da acao social
```

## Rotas

| Hash           | Fragmento              |
|----------------|------------------------|
| `#/`           | `paginas/home.html`     |
| `#/projetos`   | `paginas/projetos.html` |
| `#/contato`    | `paginas/contato.html`  |
| qualquer outro | `paginas/404.html`     |

## Arquitetura

Quatro camadas, uma responsabilidade por arquivo e grafo de dependencias
aciclico:

- **Dados**: `js/dados/projetos.js`, sem conhecimento de DOM
- **Infraestrutura**: `persistencia.js` (unico que acessa localStorage) e
  `datas.js` (unico que acessa a biblioteca externa)
- **Interface**: `router.js`, `templates.js`, `validacao.js`, `menu.js`, `tema.js`
- **Orquestracao**: `main.js`, que apenas importa e inicializa

O roteador nao importa os demais modulos. Ao terminar a injecao de um fragmento
ele emite o evento `rota:renderizada`, e quem tiver interesse escuta. Isso evita
dependencia circular entre roteamento e interface.

## Manutencao

- **Nova rota**: crie o fragmento em `html/paginas/` e registre o caminho no
  objeto `rotas` de `js/modules/router.js`
- **Novo criterio de validacao**: acrescente um objeto `{ teste, mensagem }` na
  cadeia do campo em `js/modules/validacao.js`
- **Trocar o armazenamento**: reescreva `js/modules/persistencia.js`; nenhum
  outro arquivo muda
- **Trocar a biblioteca de datas**: reescreva `js/modules/datas.js`, mantendo as
  funcoes `relativo()` e `formatar()`

## Dependencias externas

| Biblioteca | Versao  | Origem | Uso                          |
|------------|---------|--------|------------------------------|
| Day.js     | 1.11.10 | CDN    | tempo relativo do rascunho   |

Se a CDN estiver indisponivel, o modulo de datas cai em `Date` e
`toLocaleString`, e a aplicacao continua funcional.

## Acessibilidade (WCAG 2.1 nivel AA)

Medidas implementadas e o criterio que cada uma atende:

| Recurso | Criterio |
|---|---|
| Link "Pular para o conteudo", visivel ao foco | 2.4.1 Ignorar blocos |
| Indice de blocos por ancora na pagina de projetos | 2.4.1 / 2.4.5 |
| Marcos semanticos: header, nav, main e footer | 1.3.1 Informacao e relacoes |
| Um h1 por rota, hierarquia sem saltos de nivel | 1.3.1 / 2.4.6 |
| Foco movido para o conteudo a cada troca de rota | 2.4.3 Ordem de foco |
| Anel de foco proprio com `:focus-visible` | 2.4.7 Foco visivel |
| `aria-describedby` ligando campo e mensagem de erro | 3.3.1 Identificacao de erro |
| Mensagens que explicam como corrigir | 3.3.3 Sugestao de correcao |
| `aria-invalid`, `aria-expanded`, `aria-current`, `aria-pressed` | 4.1.2 Nome, funcao, valor |
| `aria-live` no conteudo e no retorno do formulario | 4.1.3 Mensagens de status |
| `width`, `height` e `alt` em todas as imagens | 1.1.1 / 1.4.10 |
| `prefers-reduced-motion` desativando animacoes | 2.3.3 Animacao por interacao |

Contrastes medidos (minimo AA: 4.5:1 para texto, 3:1 para componentes):

| Elemento | Tema claro | Tema escuro |
|---|---|---|
| Texto corrido | 12.36:1 | 9.58:1 |
| Titulos | 12.36:1 | 14.04:1 |
| Botao de doacao | 5.73:1 | 9.93:1 |
| Item ativo do menu | 7.88:1 | 9.10:1 |
| Mensagem de erro | 5.44:1 | 7.88:1 |
| Mensagem de sucesso | 6.59:1 | 8.81:1 |
| Borda de campo | 4.54:1 | 3.99:1 |
| Anel de foco | 12.36:1 | 8.62:1 |

## Build de producao

```bash
npm install
npm run build     # gera dist/
npm run preview   # serve dist/ em http://localhost:5000
```

O `build.js` executa seis etapas: empacota os dez modulos ES em um unico
`app.js` minificado, concatena e minifica as tres folhas de estilo em
`app.css`, move o `index.html` para a raiz reescrevendo os caminhos, minifica
os fragmentos de rota, recomprime as imagens com mozjpeg e gera as versoes
WebP. Se a reescrita de caminhos falhar, o build aborta em vez de publicar um
site sem estilo.

Resultado da ultima execucao:

| Recurso | Antes | Depois | Reducao |
|---|---|---|---|
| JavaScript (10 arquivos) | 19,8 kB | 7,6 kB | 61% |
| CSS (3 arquivos) | 15,3 kB | 10,1 kB | 33% |
| index.html | 2,2 kB | 1,7 kB | 25% |
| Fragmentos de rota | 6,7 kB | 5,7 kB | 14% |
| Imagens (4 arquivos) | 70,3 kB | 39,2 kB | 44% |
| **Total** | **114,3 kB** | **64,3 kB** | **44%** |

Requisicoes na primeira carga caem de 15 para 5, ja que dez modulos viram um
arquivo e tres folhas de estilo viram outra.

## Deploy

Site publicado: https://robertfxbr.github.io/SiteCharity-portfolio/

Publicado no GitHub Pages pelo workflow `.github/workflows/deploy.yml`, que
roda a cada push na `main`. O job de build gera o `dist/`, confere que os
arquivos essenciais existem e sobe o artefato; o job de deploy publica.

Como a `main` so recebe merge de `release/*` e `hotfix/*`, cada publicacao
corresponde a uma versao com tag.

O `dist/404.html` e uma copia do `index.html`: qualquer caminho desconhecido
devolve a aplicacao, que entao resolve a rota pelo hash.

## Verificacao e testes

O projeto ainda nao tem suite automatizada. A verificacao e manual e segue este
roteiro a cada alteracao relevante:

```bash
npm run build          # aborta se a reescrita de caminhos falhar
npm run preview        # serve dist/ em http://localhost:5000
```

1. Percorrer as quatro rotas e conferir o console sem erros
2. Filtrar projetos por area e recarregar: a escolha deve voltar do localStorage
3. Enviar os dois formularios vazios e conferir as mensagens por campo
4. Enviar o cadastro com CPF de digitos repetidos, que deve ser recusado
5. Navegar so pelo teclado, comecando pelo link de salto
6. Alternar o tema e recarregar: a preferencia deve persistir

Validacao externa: HTML pelo Nu Html Checker e CSS pelo Jigsaw, ambos com zero
erros na ultima execucao.

Auditoria automatizada de acessibilidade com axe-core 4.10.2, o mesmo motor
usado pelo Lighthouse, aplicando as regras wcag2a, wcag2aa, wcag21a e wcag21aa:

| Estado auditado | Violacoes | Regras aprovadas |
|---|---|---|
| Rota inicial, tema claro e escuro | 0 | 19 |
| Rota de projetos, tema claro e escuro | 0 | 21 |
| Rota de cadastro, tema claro e escuro | 0 | 23 |
| Rota de contato, tema claro e escuro | 0 | 23 |
| Cadastro com seis campos em erro | 0 | 39 |

A passada com o conjunto best-practice, mais rigoroso que a norma, tambem
retornou zero violacoes.

Auditoria automatizada cobre parte dos criterios, nao todos. O teste com leitor
de tela real foi feito a parte, com NVDA no Windows, cobrindo os tres cenarios
que dependem de codigo proprio:

1. Troca de rota: o conteudo novo e anunciado, confirmando o foco movido para o
   main e o aria-live
2. Ancora do indice de blocos: o foco vai para a secao e a rota permanece em
   #/projetos
3. Formulario invalido: o rotulo e lido seguido da mensagem de erro, via
   aria-describedby

Registro na issue #12.

A ausencia de testes automatizados esta registrada na issue #11, com a lista dos
modulos a cobrir primeiro.

## Fluxo de versionamento

Padrao GitFlow: `main` guarda as versoes publicadas, `develop` concentra o
desenvolvimento, `feature/*` isola cada funcionalidade, `release/*` prepara o
lancamento e `hotfix/*` corrige falhas a partir de `main`.

## Licenca

Distribuido sob a licenca MIT. Consulte o arquivo `LICENSE` para os termos completos.
