// build.js
// Prepara a versao de producao em dist/.
//
// O que este script faz:
//   1. limpa a saida anterior
//   2. empacota e minifica o JavaScript modular em um unico arquivo
//   3. minifica o CSS, concatenando reset, design system e regras autorais
//   4. move o index.html para a raiz de dist e reescreve os caminhos
//   5. copia os fragmentos de rota, minificando o HTML
//   6. recomprime as imagens com mozjpeg e gera a versao WebP
//   7. imprime um relatorio de antes e depois

import { build } from 'esbuild';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, rm, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const SAIDA = 'dist';

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' kB';
}

async function tamanho(caminho) {
  try {
    return (await stat(caminho)).size;
  } catch {
    return 0;
  }
}

// O HTML dos fragmentos e simples: comentarios e espacos entre tags podem ser
// removidos sem risco, mas o texto visivel precisa ficar intacto.
function minificarHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n\s+/g, '\n')
    .replace(/>\s+</g, '><')
    .trim();
}

async function limpar() {
  await rm(SAIDA, { recursive: true, force: true });
  await mkdir(join(SAIDA, 'paginas'), { recursive: true });
  await mkdir(join(SAIDA, 'imagens'), { recursive: true });
}

async function empacotarJs() {
  const antes = await tamanho('js/main.js')
    + await tamanho('js/modules/router.js')
    + await tamanho('js/modules/templates.js')
    + await tamanho('js/modules/validacao.js')
    + await tamanho('js/modules/persistencia.js')
    + await tamanho('js/modules/tema.js')
    + await tamanho('js/modules/datas.js')
    + await tamanho('js/modules/menu.js')
    + await tamanho('js/modules/ancoras.js')
    + await tamanho('js/dados/projetos.js');

  await build({
    entryPoints: ['js/main.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    target: ['es2020'],
    outfile: join(SAIDA, 'app.js'),
    legalComments: 'none'
  });

  // Os caminhos de imagem vindos da fonte de dados sobem um nivel na estrutura
  // de desenvolvimento; na raiz de dist passam a ser relativos diretos.
  const pacote = await readFile(join(SAIDA, 'app.js'), 'utf8');
  await writeFile(join(SAIDA, 'app.js'), pacote.replace(/\.\.\/imagens\//g, 'imagens/'));

  return { antes, depois: await tamanho(join(SAIDA, 'app.js')) };
}

async function empacotarCss() {
  const arquivos = ['css/reset.css', 'css/design-system.css', 'css/styles.css'];
  let antes = 0;
  for (const arquivo of arquivos) antes += await tamanho(arquivo);

  await build({
    stdin: {
      contents: arquivos.map((a) => `@import "${a}";`).join('\n'),
      resolveDir: '.',
      loader: 'css'
    },
    bundle: true,
    minify: true,
    outfile: join(SAIDA, 'app.css')
  });

  return { antes, depois: await tamanho(join(SAIDA, 'app.css')) };
}

async function moverHtml() {
  const antes = await tamanho('html/index.html');
  let html = await readFile('html/index.html', 'utf8');

  // Na raiz de dist os caminhos deixam de subir um nivel: as tres folhas de
  // estilo viram app.css e os dez modulos viram app.js. O casamento nao pode
  // depender do fim de linha, que varia entre LF e CRLF conforme o sistema.
  html = html
    .replace(/[ \t]*<link rel="stylesheet" href="\.\.\/css\/[^"]+">[\r\n]*/g, '')
    .replace('</head>', '  <link rel="stylesheet" href="app.css">\n</head>')
    .replace('<script type="module" src="../js/main.js"></script>', '<script type="module" src="app.js"></script>')
    .replace(/\.\.\/imagens\//g, 'imagens/');

  // Falhar aqui e melhor do que publicar um site sem estilo.
  if (!html.includes('href="app.css"') || !html.includes('src="app.js"')) {
    throw new Error('Reescrita de caminhos falhou no index.html de producao.');
  }

  html = minificarHtml(html);
  await writeFile(join(SAIDA, 'index.html'), html);

  // 404.html na raiz faz o GitHub Pages devolver a aplicacao em vez da sua
  // propria pagina de erro quando alguem acessa um caminho inexistente.
  await writeFile(join(SAIDA, '404.html'), html);

  return { antes, depois: await tamanho(join(SAIDA, 'index.html')) };
}

async function copiarFragmentos() {
  const arquivos = await readdir('html/paginas');
  let antes = 0;
  let depois = 0;

  for (const arquivo of arquivos) {
    const origem = join('html/paginas', arquivo);
    antes += await tamanho(origem);

    const html = minificarHtml(await readFile(origem, 'utf8'))
      .replace(/\.\.\/imagens\//g, 'imagens/');

    const destino = join(SAIDA, 'paginas', arquivo);
    await writeFile(destino, html);
    depois += await tamanho(destino);
  }

  return { antes, depois };
}

async function otimizarImagens() {
  // Apenas os originais entram: os .webp de dist sao gerados aqui a partir
  // deles, entao os .webp da origem seriam duplicata.
  const arquivos = (await readdir('imagens')).filter((a) => ['.jpg', '.jpeg', '.png'].includes(extname(a).toLowerCase()));
  let antes = 0;
  let depois = 0;

  for (const arquivo of arquivos) {
    const origem = join('imagens', arquivo);
    const destino = join(SAIDA, 'imagens', arquivo);
    antes += await tamanho(origem);

    // mozjpeg comprime melhor que o codificador padrao no mesmo nivel de
    // qualidade; progressive faz a imagem aparecer por passadas.
    await sharp(origem)
      .jpeg({ quality: 72, mozjpeg: true, progressive: true })
      .toFile(destino);

    // Versao WebP para navegadores que a suportam, referenciada por <picture>
    // quando houver necessidade. Fica disponivel sem quebrar o fallback.
    await sharp(origem)
      .webp({ quality: 70 })
      .toFile(destino.replace(/\.(jpe?g|png)$/i, '.webp'));

    depois += await tamanho(destino);
  }

  return { antes, depois, total: arquivos.length };
}

async function principal() {
  console.log('Gerando build de producao em ' + SAIDA + '/\n');
  await limpar();

  const js = await empacotarJs();
  const css = await empacotarCss();
  const html = await moverHtml();
  const fragmentos = await copiarFragmentos();
  const imagens = await otimizarImagens();

  const linha = (nome, r) => {
    const reducao = r.antes ? (100 - (r.depois / r.antes) * 100).toFixed(0) : '0';
    console.log(nome.padEnd(22) + kb(r.antes).padStart(10) + ' -> ' + kb(r.depois).padStart(10) + '   -' + reducao + '%');
  };

  console.log('recurso                     antes       depois   reducao');
  console.log('-'.repeat(58));
  linha('JavaScript (10 arq.)', js);
  linha('CSS (3 arq.)', css);
  linha('index.html', html);
  linha('fragmentos de rota', fragmentos);
  linha('imagens (' + imagens.total + ' arq.)', imagens);

  const antes = js.antes + css.antes + html.antes + fragmentos.antes + imagens.antes;
  const depois = js.depois + css.depois + html.depois + fragmentos.depois + imagens.depois;
  console.log('-'.repeat(58));
  linha('total', { antes, depois });
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
