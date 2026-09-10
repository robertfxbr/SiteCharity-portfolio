// ancoras.js
// Responsabilidade unica: tratar links internos de ancora dentro de uma SPA
// que roteia por hash.
//
// Problema que este modulo resolve: um link comum como href="#doacoes" altera
// o hash da URL, e o roteador interpreta isso como uma rota inexistente,
// levando o usuario para a pagina 404. Sem tratamento, o link "Pular para o
// conteudo" exigido pelo criterio 2.4.1 do WCAG quebraria a navegacao.

function focar(alvo) {
  // Elementos estruturais nao sao focaveis por padrao. O tabindex negativo
  // permite foco por script sem inserir o elemento na ordem de tabulacao.
  if (!alvo.hasAttribute('tabindex')) {
    alvo.setAttribute('tabindex', '-1');
  }

  alvo.focus({ preventScroll: true });
  alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function iniciarAncoras() {
  // Delegacao: os links de ancora vivem dentro dos fragmentos injetados pelo
  // roteador, entao nao existem quando este modulo e inicializado.
  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Rotas comecam com #/ e continuam sendo tratadas pelo roteador.
    if (href === '#' || href.startsWith('#/')) return;

    const alvo = document.getElementById(href.slice(1));
    if (!alvo) return;

    // Impede que o hash mude e dispare o roteador.
    evento.preventDefault();
    focar(alvo);
  });
}
