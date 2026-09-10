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

## Fluxo de versionamento

Padrao GitFlow: `main` guarda as versoes publicadas, `develop` concentra o
desenvolvimento, `feature/*` isola cada funcionalidade, `release/*` prepara o
lancamento e `hotfix/*` corrige falhas a partir de `main`.

## Licenca

Distribuido sob a licenca MIT. Consulte o arquivo `LICENSE` para os termos completos.
