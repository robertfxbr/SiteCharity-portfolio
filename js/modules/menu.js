// menu.js
// Responsabilidade unica: abrir e fechar o menu na versao mobile.

export function iniciarMenu() {
  const botao = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  if (!botao || !menu) {
    return;
  }

  // O rotulo acessivel precisa acompanhar o estado do menu: quem usa leitor
  // de tela ouvia "Abrir menu" mesmo com o menu ja aberto.
  const rotulo = botao.querySelector('.visually-hidden');

  function definirEstado(aberto) {
    menu.classList.toggle('aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    if (rotulo) {
      rotulo.textContent = aberto ? 'Fechar menu' : 'Abrir menu';
    }
  }

  botao.addEventListener('click', () => {
    definirEstado(!menu.classList.contains('aberto'));
  });

  // Ao trocar de rota, o menu mobile se fecha sozinho.
  document.addEventListener('rota:renderizada', () => {
    definirEstado(false);
  });
}
