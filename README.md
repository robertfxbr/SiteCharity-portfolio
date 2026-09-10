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

## Fluxo de versionamento

Padrao GitFlow: `main` guarda as versoes publicadas, `develop` concentra o
desenvolvimento, `feature/*` isola cada funcionalidade, `release/*` prepara o
lancamento e `hotfix/*` corrige falhas a partir de `main`.

## Licenca

Distribuido sob a licenca MIT. Consulte o arquivo `LICENSE` para os termos completos.
