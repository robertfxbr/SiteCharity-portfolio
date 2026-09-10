// menu.js
// Responsabilidade unica: abrir e fechar o menu na versao mobile.

export function iniciarMenu() {
  const botao = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  if (!botao || !menu) {
    return;
  }

  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });

  // Ao trocar de rota, o menu mobile se fecha sozinho.
  document.addEventListener('rota:renderizada', () => {
    menu.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
  });
}
