import { test, before } from 'node:test';
import assert from 'node:assert/strict';

import {
  montarAplicacao,
  navegar,
  selecionar,
  fragmentosIndisponiveis
} from '../apoio/montar-aplicacao.js';
import { CHAVES } from '../../js/modules/persistencia.js';

let app;

const titulo = () => document.querySelector('#app h1').textContent.trim();
const linkAtivo = () => document.querySelector('.nav-link[aria-current="page"]');

before(async () => {
  await montarAplicacao();
  app = document.getElementById('app');
});

test('sem hash, renderiza a pagina inicial e marca o link Inicio', () => {
  assert.equal(titulo(), 'ONG Esperança Solidária');
  assert.equal(linkAtivo().getAttribute('href'), '#/');
});

test('a troca de rota injeta o fragmento, move o foco e atualiza o menu', async () => {
  const detalhe = await navegar('#/projetos');

  assert.deepEqual(detalhe, { caminho: '/projetos', arquivo: 'paginas/projetos.html' });
  assert.equal(titulo(), 'Projetos');
  assert.equal(document.activeElement, app);
  assert.equal(linkAtivo().getAttribute('href'), '#/projetos');
  assert.equal(document.querySelectorAll('.nav-link[aria-current]').length, 1);
});

test('a rota de projetos monta um cartao por projeto a partir do template', () => {
  const cartoes = document.querySelectorAll('#lista-projetos .cartao');
  assert.equal(cartoes.length, 3);

  const primeiro = cartoes[0];
  assert.equal(primeiro.querySelector('h3').textContent, 'Reforço escolar Semear');
  assert.match(primeiro.querySelector('.cartao__imagem').src, /imagens\/projeto-educacao\.jpg$/);
  assert.match(primeiro.querySelector('.cartao__webp').srcset, /projeto-educacao\.webp$/);
  assert.notEqual(primeiro.querySelector('.cartao__imagem').alt, '');
});

test('o filtro por area reduz a lista e fica gravado nas preferencias', async () => {
  selecionar(document.getElementById('filtro-area'), 'Saude');

  const cartoes = document.querySelectorAll('#lista-projetos .cartao');
  assert.equal(cartoes.length, 1);
  assert.equal(cartoes[0].querySelector('.etiqueta').textContent, 'Saúde');
  assert.equal(JSON.parse(localStorage.getItem(CHAVES.preferencias)).filtroArea, 'Saude');

  // Ao sair e voltar, a escolha anterior e restaurada.
  await navegar('#/');
  await navegar('#/projetos');
  assert.equal(document.getElementById('filtro-area').value, 'Saude');
  assert.equal(document.querySelectorAll('#lista-projetos .cartao').length, 1);
});

test('a pagina inicial lista o resumo de todos os projetos', async () => {
  await navegar('#/');
  assert.equal(document.querySelectorAll('#resumo-projetos .resumo').length, 3);
});

test('rota desconhecida cai na pagina 404 sem marcar nenhum link', async () => {
  await navegar('#/nao-existe');
  assert.equal(titulo(), 'Página não encontrada');
  assert.equal(linkAtivo(), null);
});

test('falha ao buscar o fragmento mostra mensagem de erro no lugar do conteudo', async () => {
  fragmentosIndisponiveis.add('paginas/contato.html');
  const erroOriginal = console.error;
  console.error = () => {};

  window.location.hash = '#/contato';
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.error = erroOriginal;
  assert.equal(app.querySelector('.erro').textContent, 'Nao foi possivel carregar esta secao.');
});

test('o menu mobile fecha sozinho ao trocar de rota', async () => {
  const botao = document.getElementById('menu-toggle');
  botao.click();
  assert.equal(botao.getAttribute('aria-expanded'), 'true');

  await navegar('#/cadastro');
  assert.equal(botao.getAttribute('aria-expanded'), 'false');
  assert.equal(document.getElementById('menu').classList.contains('aberto'), false);
});

test('o tema alterna, atualiza o botao e persiste', () => {
  const botao = document.getElementById('tema-toggle');
  botao.click();

  assert.equal(document.documentElement.dataset.tema, 'escuro');
  assert.equal(botao.getAttribute('aria-pressed'), 'true');
  assert.equal(JSON.parse(localStorage.getItem(CHAVES.preferencias)).tema, 'escuro');
});
