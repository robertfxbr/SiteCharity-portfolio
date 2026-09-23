import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import { criarArmazenamento, criarArmazenamentoCheio } from '../apoio/armazenamento-falso.js';
import {
  gravar,
  ler,
  remover,
  lerPreferencias,
  gravarPreferencia,
  CHAVES
} from '../../js/modules/persistencia.js';

beforeEach(() => {
  globalThis.localStorage = criarArmazenamento();
});

describe('ler', () => {
  test('devolve o padrao quando a chave esta ausente', () => {
    assert.equal(ler('inexistente'), null);
    assert.deepEqual(ler('inexistente', { a: 1 }), { a: 1 });
  });

  test('desfaz a serializacao do que foi gravado', () => {
    gravar('obj', { campos: { nome: 'Ana' }, salvoEm: 10 });
    assert.deepEqual(ler('obj'), { campos: { nome: 'Ana' }, salvoEm: 10 });
  });

  test('JSON corrompido devolve o padrao e descarta a chave', () => {
    localStorage.setItem('quebrada', '{"tema": "escuro"');
    assert.equal(ler('quebrada', 'padrao'), 'padrao');
    assert.equal(localStorage.getItem('quebrada'), null);
  });

  test('tipo divergente do padrao devolve o padrao', () => {
    localStorage.setItem(CHAVES.preferencias, '"escuro"');
    assert.deepEqual(ler(CHAVES.preferencias, { tema: 'claro' }), { tema: 'claro' });
  });

  test('sem padrao, qualquer tipo valido e aceito', () => {
    localStorage.setItem('numero', '42');
    assert.equal(ler('numero'), 42);
  });
});

describe('gravar e remover', () => {
  test('gravar devolve true e remover apaga a chave', () => {
    assert.equal(gravar('k', [1, 2]), true);
    remover('k');
    assert.equal(localStorage.getItem('k'), null);
  });

  test('falha de gravacao devolve false sem lancar erro', () => {
    globalThis.localStorage = criarArmazenamentoCheio();
    const aviso = mock.method(console, 'warn', () => {});
    assert.equal(gravar('k', 1), false);
    assert.equal(aviso.mock.callCount(), 1);
    aviso.mock.restore();
  });
});

describe('preferencias', () => {
  test('sem nada gravado, devolve os valores padrao', () => {
    assert.deepEqual(lerPreferencias(), { tema: 'claro', filtroArea: 'todos' });
  });

  test('gravar uma preferencia preserva as demais', () => {
    gravarPreferencia('tema', 'escuro');
    gravarPreferencia('filtroArea', 'Saude');
    assert.deepEqual(lerPreferencias(), { tema: 'escuro', filtroArea: 'Saude' });
  });
});
