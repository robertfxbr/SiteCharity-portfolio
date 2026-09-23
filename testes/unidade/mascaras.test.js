import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { mascaraCpf, mascaraCep, mascaraTelefone } from '../../js/modules/mascaras.js';

describe('mascaraCpf', () => {
  test('formata o CPF completo', () => {
    assert.equal(mascaraCpf('52998224725'), '529.982.247-25');
  });

  test('formata progressivamente durante a digitacao', () => {
    assert.equal(mascaraCpf('529'), '529');
    assert.equal(mascaraCpf('5299'), '529.9');
    assert.equal(mascaraCpf('5299822'), '529.982.2');
    assert.equal(mascaraCpf('5299822472'), '529.982.247-2');
  });

  test('descarta nao digitos e o que passar de 11 digitos', () => {
    assert.equal(mascaraCpf('529.982.247-25'), '529.982.247-25');
    assert.equal(mascaraCpf('abc529982247259999'), '529.982.247-25');
  });
});

describe('mascaraTelefone', () => {
  test('formata fixo com 10 digitos', () => {
    assert.equal(mascaraTelefone('1134567890'), '(11) 3456-7890');
  });

  test('formata celular com 11 digitos', () => {
    assert.equal(mascaraTelefone('11987654321'), '(11) 98765-4321');
  });

  test('formata progressivamente durante a digitacao', () => {
    assert.equal(mascaraTelefone('11'), '11');
    assert.equal(mascaraTelefone('119'), '(11) 9');
    assert.equal(mascaraTelefone('1198765'), '(11) 9876-5');
  });

  test('corta no 11o digito', () => {
    assert.equal(mascaraTelefone('119876543210000'), '(11) 98765-4321');
  });
});

describe('mascaraCep', () => {
  test('formata o CEP completo e parcial', () => {
    assert.equal(mascaraCep('01310100'), '01310-100');
    assert.equal(mascaraCep('01310'), '01310');
    assert.equal(mascaraCep('013101'), '01310-1');
  });

  test('descarta nao digitos e o que passar de 8 digitos', () => {
    assert.equal(mascaraCep('01.310-100 99'), '01310-100');
  });
});
