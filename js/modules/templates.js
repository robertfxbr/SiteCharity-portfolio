// templates.js
// Responsabilidade unica: transformar dados em elementos visiveis no DOM.
// Duas estrategias convivem, cada uma no cenario em que e mais adequada:
//   1. Template Literal + map/join para marcacao estatica montada de uma vez.
//   2. <template> + cloneNode + textContent para dados dinamicos, sem parsear
//      HTML vindo de fora.

import { servicos } from '../dados/servicos.js';

// --- Estrategia 1: interpolacao de string -----------------------------------

const cartaoTemplate = (item) => `
  <li class="cartao" data-id="${item.id}">
    <span class="etiqueta">${item.nivel}</span>
    <h2>${item.titulo}</h2>
    <p>${item.descricao}</p>
    <small>${item.horas} horas</small>
  </li>`;

export function renderizarCartoes(lista, alvo) {
  if (!alvo) return;

  if (!lista.length) {
    alvo.innerHTML = '<li class="vazio">Nenhum item encontrado.</li>';
    return;
  }

  // map transforma cada objeto em um trecho de HTML e join concatena tudo
  // em uma unica string, escrita no DOM de uma so vez.
  alvo.innerHTML = lista.map(cartaoTemplate).join('');
}

// --- Estrategia 2: clonagem do elemento <template> --------------------------

export function renderizarPorTemplate(lista, alvo, template) {
  if (!alvo || !template) return;

  if (!lista.length) {
    alvo.innerHTML = '<li class="vazio">Nenhum item encontrado.</li>';
    return;
  }

  // O fragmento e montado fora da arvore renderizada: o navegador so
  // recalcula layout uma vez, no append final.
  const fragmento = document.createDocumentFragment();

  lista.forEach((item) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.cartao').dataset.id = item.id;
    clone.querySelector('.etiqueta').textContent = item.nivel;
    clone.querySelector('h2').textContent = item.titulo;
    clone.querySelector('p').textContent = item.descricao;
    clone.querySelector('small').textContent = `${item.horas} horas`;

    fragmento.appendChild(clone);
  });

  alvo.replaceChildren(fragmento);
}

// --- Ligacao com o roteador -------------------------------------------------

function preencherHome() {
  const alvo = document.getElementById('lista-servicos');
  const template = document.getElementById('tpl-cartao');
  const filtro = document.getElementById('filtro-nivel');

  if (!alvo) return;

  const aplicar = () => {
    const nivel = filtro ? filtro.value : 'todos';
    const lista = nivel === 'todos'
      ? servicos
      : servicos.filter((item) => item.nivel === nivel);

    // O mesmo conjunto de dados alimenta as duas estrategias; aqui usamos a
    // clonagem de <template>, que dispensa parse de HTML a cada filtragem.
    renderizarPorTemplate(lista, alvo, template);
  };

  if (filtro) {
    filtro.addEventListener('change', aplicar);
  }

  aplicar();
}

function preencherSobre() {
  // Marcacao estatica, montada pelo proprio projeto: aqui o Template Literal
  // com map/join e a opcao mais direta.
  renderizarCartoes(servicos, document.getElementById('resumo-modulos'));
}

export function iniciarTemplates() {
  // O conteudo e injetado pelo roteador, entao a montagem acontece sempre
  // que uma rota termina de renderizar.
  document.addEventListener('rota:renderizada', () => {
    preencherHome();
    preencherSobre();
  });
}
