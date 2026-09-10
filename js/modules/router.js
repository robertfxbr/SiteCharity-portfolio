// router.js
// Responsabilidade unica: interceptar a navegacao por hash e injetar o
// fragmento correspondente no conteiner principal da aplicacao.

const rotas = {
  '/': 'paginas/home.html',
  '/sobre': 'paginas/sobre.html',
  '/contato': 'paginas/contato.html'
};

const conteudo = document.getElementById('app');

// Cache simples: cada fragmento e buscado no servidor apenas uma vez.
const cache = new Map();

async function carregarFragmento(arquivo) {
  if (cache.has(arquivo)) {
    return cache.get(arquivo);
  }

  const resposta = await fetch(arquivo);
  if (!resposta.ok) {
    throw new Error('Falha ao carregar ' + arquivo + ' (' + resposta.status + ')');
  }

  const html = await resposta.text();
  cache.set(arquivo, html);
  return html;
}

function marcarLinkAtivo(caminho) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const ativo = link.getAttribute('href') === '#' + caminho;
    link.classList.toggle('ativo', ativo);
    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

export async function renderizar() {
  const caminho = location.hash.slice(1) || '/';
  const arquivo = rotas[caminho] || 'paginas/404.html';

  conteudo.innerHTML = '<p class="carregando">Carregando...</p>';

  try {
    const html = await carregarFragmento(arquivo);

    // Uma unica escrita no DOM: limpa os nos anteriores e injeta o novo
    // fragmento, provocando apenas um reflow.
    conteudo.innerHTML = html;

    marcarLinkAtivo(caminho);
    conteudo.focus();
    window.scrollTo({ top: 0 });

    // Avisa os demais modulos de que ha conteudo novo no DOM.
    document.dispatchEvent(new CustomEvent('rota:renderizada', {
      detail: { caminho, arquivo }
    }));
  } catch (erro) {
    console.error(erro);
    conteudo.innerHTML = '<p class="erro">Nao foi possivel carregar esta secao.</p>';
  }
}

export function iniciarRotas() {
  window.addEventListener('hashchange', renderizar);
  renderizar();
}
