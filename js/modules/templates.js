// templates.js
// Responsabilidade unica: transformar dados em elementos visiveis no DOM.
// Duas estrategias convivem, cada uma no cenario em que e mais adequada:
//   1. Template Literal + map/join para marcacao estatica montada de uma vez.
//   2. <template> + cloneNode + textContent para dados dinamicos, sem parsear
//      HTML vindo de fora.

import { projetos } from '../dados/projetos.js';
import { lerPreferencias, gravarPreferencia } from './persistencia.js';
import { relativo } from './datas.js';

const ROTULO_AREA = {
  Educacao: 'Educação',
  Alimentacao: 'Alimentação',
  Saude: 'Saúde'
};

// --- Estrategia 1: interpolacao de string -----------------------------------

const resumoTemplate = (item) => `
  <li class="resumo" data-id="${item.id}">
    <strong>${item.titulo}</strong>
    <span>${ROTULO_AREA[item.area] || item.area}</span>
  </li>`;

export function renderizarResumo(lista, alvo) {
  if (!alvo) return;

  if (!lista.length) {
    alvo.innerHTML = '<li class="vazio">Nenhum projeto cadastrado.</li>';
    return;
  }

  // map transforma cada objeto em um trecho de HTML e join concatena tudo
  // em uma unica string, escrita no DOM de uma so vez.
  alvo.innerHTML = lista.map(resumoTemplate).join('');
}

// --- Estrategia 2: clonagem do elemento <template> --------------------------

export function renderizarProjetos(lista, alvo, template) {
  if (!alvo || !template) return;

  if (!lista.length) {
    alvo.innerHTML = '<li class="vazio">Nenhum projeto nesta área.</li>';
    return;
  }

  // O fragmento e montado fora da arvore renderizada: o navegador so
  // recalcula layout uma vez, no append final.
  const fragmento = document.createDocumentFragment();

  lista.forEach((item) => {
    const clone = template.content.cloneNode(true);
    const imagem = clone.querySelector('.cartao__imagem');

    clone.querySelector('.cartao').dataset.id = item.id;
    // loading antes do src: o atributo precisa existir quando a URL e
    // atribuida, senao o navegador ja inicia o download.
    imagem.loading = 'lazy';
    imagem.src = item.imagem;
    imagem.alt = item.alt;

    // Mesma imagem em WebP, oferecida ao navegador que a suporta. O JPEG do
    // <img> continua sendo o fallback.
    clone.querySelector('.cartao__webp').srcset = item.imagem.replace(/\.jpe?g$/i, '.webp');
    clone.querySelector('.etiqueta').textContent = ROTULO_AREA[item.area] || item.area;
    clone.querySelector('h3').textContent = item.titulo;
    clone.querySelector('.cartao__descricao').textContent = item.descricao;
    clone.querySelector('.cartao__meta').textContent =
      `${item.atendidos} pessoas atendidas | em atividade desde ${relativo(item.desde)}`;

    fragmento.appendChild(clone);
  });

  alvo.replaceChildren(fragmento);
}

// --- Ligacao com o roteador -------------------------------------------------

function preencherProjetos() {
  const alvo = document.getElementById('lista-projetos');
  const template = document.getElementById('tpl-projeto');
  const filtro = document.getElementById('filtro-area');

  if (!alvo) return;

  // A escolha anterior volta do localStorage assim que a rota e renderizada.
  if (filtro) {
    filtro.value = lerPreferencias().filtroArea;
  }

  const aplicar = () => {
    const area = filtro ? filtro.value : 'todos';
    if (filtro) gravarPreferencia('filtroArea', area);

    const lista = area === 'todos'
      ? projetos
      : projetos.filter((item) => item.area === area);

    renderizarProjetos(lista, alvo, template);
  };

  if (filtro) {
    filtro.addEventListener('change', aplicar);
  }

  aplicar();
}

function preencherResumo() {
  // Marcacao estatica, montada pelo proprio projeto: aqui o Template Literal
  // com map/join e a opcao mais direta.
  renderizarResumo(projetos, document.getElementById('resumo-projetos'));
}

export function iniciarTemplates() {
  // O conteudo e injetado pelo roteador, entao a montagem acontece sempre
  // que uma rota termina de renderizar.
  document.addEventListener('rota:renderizada', () => {
    preencherProjetos();
    preencherResumo();
  });
}
