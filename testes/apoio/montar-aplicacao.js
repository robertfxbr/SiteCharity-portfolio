// montar-aplicacao.js
// Sobe a aplicacao inteira dentro do jsdom: carrega o html/index.html real,
// expoe window e document como globais (os modulos acessam ambos direto) e
// troca o fetch por leitura dos fragmentos em disco.
//
// Os modulos guardam estado proprio (cache do roteador, formularios ja
// submetidos), entao cada arquivo de teste monta a aplicacao uma unica vez.
// O node --test roda cada arquivo em processo separado.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

import { criarArmazenamento } from './armazenamento-falso.js';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));

// Fragmentos que devem falhar no fetch, para exercitar o tratamento de erro.
export const fragmentosIndisponiveis = new Set();

async function fetchFalso(arquivo) {
  if (fragmentosIndisponiveis.has(arquivo)) {
    return { ok: false, status: 500, text: async () => '' };
  }
  try {
    const html = await readFile(join(RAIZ, 'html', arquivo), 'utf8');
    return { ok: true, status: 200, text: async () => html };
  } catch {
    return { ok: false, status: 404, text: async () => '' };
  }
}

export async function montarAplicacao({ hash = '', armazenamento = {} } = {}) {
  const html = await readFile(join(RAIZ, 'html/index.html'), 'utf8');

  const dom = new JSDOM(html, {
    url: 'http://localhost/html/index.html' + hash,
    pretendToBeVisual: true
  });
  const { window } = dom;

  // APIs de rolagem nao existem no jsdom.
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = function () {};

  const localStorage = criarArmazenamento(armazenamento);
  Object.defineProperty(window, 'localStorage', { value: localStorage, configurable: true });

  Object.assign(globalThis, {
    window,
    document: window.document,
    location: window.location,
    localStorage,
    CustomEvent: window.CustomEvent,
    fetch: fetchFalso
  });

  // O Day.js vem da CDN e nao carrega aqui: o modulo de datas avisa e usa o
  // fallback nativo, que e o comportamento esperado sem rede.
  const avisoOriginal = console.warn;
  console.warn = () => {};

  const primeiraRota = proximaRota();
  await import('../../js/main.js');
  await primeiraRota;

  console.warn = avisoOriginal;
  return window;
}

// Resolve quando o roteador terminar de injetar o proximo fragmento.
export function proximaRota() {
  return new Promise((resolve) => {
    document.addEventListener('rota:renderizada', (evento) => resolve(evento.detail), { once: true });
  });
}

export async function navegar(hash) {
  const renderizada = proximaRota();
  window.location.hash = hash;
  return renderizada;
}

// Simula a digitacao: troca o valor e dispara o evento que a aplicacao escuta.
export function digitar(campo, valor) {
  campo.value = valor;
  campo.dispatchEvent(new window.Event('input', { bubbles: true }));
}

// Na escolha de uma opcao o navegador dispara input e depois change.
export function selecionar(campo, valor) {
  campo.value = valor;
  campo.dispatchEvent(new window.Event('input', { bubbles: true }));
  campo.dispatchEvent(new window.Event('change', { bubbles: true }));
}

export function enviar(form) {
  form.querySelector('[type="submit"]').click();
}
