// tema.js
// Responsabilidade unica: aplicar e persistir a preferencia visual de tema.

import { lerPreferencias, gravarPreferencia } from './persistencia.js';

function aplicar(tema) {
  document.documentElement.dataset.tema = tema;
  const botao = document.getElementById('tema-toggle');
  if (botao) {
    botao.textContent = tema === 'escuro' ? 'Tema claro' : 'Tema escuro';
    botao.setAttribute('aria-pressed', String(tema === 'escuro'));
  }
}

export function iniciarTema() {
  // Restauracao no carregamento inicial, antes de qualquer rota renderizar.
  aplicar(lerPreferencias().tema);

  const botao = document.getElementById('tema-toggle');
  if (!botao) return;

  botao.addEventListener('click', () => {
    const novo = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    aplicar(novo);
    gravarPreferencia('tema', novo);
  });
}
