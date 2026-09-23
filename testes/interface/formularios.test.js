import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  montarAplicacao,
  navegar,
  digitar,
  selecionar,
  enviar
} from '../apoio/montar-aplicacao.js';
import { CHAVES } from '../../js/modules/persistencia.js';

const ano = new Date().getFullYear();

const CADASTRO_VALIDO = {
  nomeCompleto: 'Ana Souza',
  cpf: '529.982.247-25',
  nascimento: (ano - 30) + '-05-10',
  email: 'ana@exemplo.com.br',
  telefone: '(11) 98765-4321',
  cep: '01310-100',
  endereco: 'Rua das Flores, 10',
  cidade: 'São Paulo',
  estado: 'SP'
};

const form = (id) => document.getElementById(id);
const campo = (id, nome) => form(id).elements[nome];
const erroDe = (id, nome) => campo(id, nome).closest('.campo').querySelector('.erro').textContent;

function preencher(id, dados) {
  Object.entries(dados).forEach(([nome, valor]) => {
    const alvo = campo(id, nome);
    if (alvo.tagName === 'SELECT') selecionar(alvo, valor);
    else digitar(alvo, valor);
  });
}

before(async () => {
  await montarAplicacao({ hash: '#/cadastro' });
});

describe('formulario de cadastro', () => {
  test('mascaras formatam CPF, telefone e CEP durante a digitacao', () => {
    digitar(campo('form-cadastro', 'cpf'), '52998224725');
    digitar(campo('form-cadastro', 'telefone'), '1134567890');
    digitar(campo('form-cadastro', 'cep'), '01310100');

    assert.equal(campo('form-cadastro', 'cpf').value, '529.982.247-25');
    assert.equal(campo('form-cadastro', 'telefone').value, '(11) 3456-7890');
    assert.equal(campo('form-cadastro', 'cep').value, '01310-100');
    form('form-cadastro').reset();
  });

  test('envio vazio marca cada campo, liga a mensagem e foca o primeiro invalido', () => {
    enviar(form('form-cadastro'));

    const blocos = form('form-cadastro').querySelectorAll('.campo');
    assert.equal(blocos.length, 9);
    blocos.forEach((bloco) => {
      const entrada = bloco.querySelector('input, select');
      assert.ok(bloco.classList.contains('invalido'), entrada.name);
      assert.equal(entrada.getAttribute('aria-invalid'), 'true');
      assert.notEqual(bloco.querySelector('.erro').textContent, '');
    });

    assert.equal(erroDe('form-cadastro', 'cpf'), 'Informe o CPF.');
    assert.equal(document.activeElement, campo('form-cadastro', 'nomeCompleto'));
    assert.equal(document.getElementById('feedback-cadastro').textContent, '');
  });

  test('depois da primeira tentativa, cada digitacao revalida o campo', () => {
    digitar(campo('form-cadastro', 'nomeCompleto'), 'Ana Souza');
    const bloco = campo('form-cadastro', 'nomeCompleto').closest('.campo');

    assert.ok(bloco.classList.contains('valido'));
    assert.equal(campo('form-cadastro', 'nomeCompleto').getAttribute('aria-invalid'), 'false');
  });

  test('CPF com digitos repetidos e recusado mesmo com o resto valido', () => {
    preencher('form-cadastro', { ...CADASTRO_VALIDO, cpf: '111.111.111-11' });
    enviar(form('form-cadastro'));

    assert.equal(erroDe('form-cadastro', 'cpf'), 'CPF inválido: os dígitos verificadores não conferem.');
    assert.equal(document.activeElement, campo('form-cadastro', 'cpf'));
    assert.equal(form('form-cadastro').querySelectorAll('.campo.invalido').length, 1);
  });

  test('a digitacao grava o rascunho, que volta ao reabrir a rota', async () => {
    const salvo = JSON.parse(localStorage.getItem(CHAVES.rascunhoCadastro));
    assert.equal(salvo.campos.cpf, '111.111.111-11');
    assert.equal(typeof salvo.salvoEm, 'number');

    await navegar('#/');
    await navegar('#/cadastro');

    assert.equal(campo('form-cadastro', 'nomeCompleto').value, 'Ana Souza');
    assert.equal(campo('form-cadastro', 'estado').value, 'SP');
    assert.match(document.getElementById('feedback-cadastro').textContent, /^Rascunho recuperado, salvo /);
  });

  test('envio valido mostra sucesso, limpa o formulario e apaga o rascunho', () => {
    preencher('form-cadastro', CADASTRO_VALIDO);
    enviar(form('form-cadastro'));

    assert.equal(
      document.getElementById('feedback-cadastro').textContent,
      'Cadastro enviado. Você receberá o convite para a formação inicial por e-mail.'
    );
    assert.equal(campo('form-cadastro', 'nomeCompleto').value, '');
    assert.equal(form('form-cadastro').querySelectorAll('.campo.invalido, .campo.valido').length, 0);
    assert.equal(localStorage.getItem(CHAVES.rascunhoCadastro), null);
  });
});

describe('formulario de contato', () => {
  before(async () => {
    await navegar('#/contato');
  });

  test('envio vazio acusa nome, e-mail e mensagem', () => {
    enviar(form('form-contato'));

    assert.equal(erroDe('form-contato', 'nome'), 'O campo nome está vazio.');
    assert.equal(erroDe('form-contato', 'email'), 'O campo e-mail está vazio.');
    assert.equal(erroDe('form-contato', 'mensagem'), 'Escreva sua mensagem.');
    assert.equal(document.activeElement, campo('form-contato', 'nome'));
  });

  test('envio valido mostra a confirmacao', () => {
    preencher('form-contato', {
      nome: 'Carlos Lima',
      email: 'carlos@exemplo.com',
      mensagem: 'Quero ajudar aos sabados.'
    });
    enviar(form('form-contato'));

    assert.equal(
      document.getElementById('feedback').textContent,
      'Mensagem enviada. A nossa equipe entra em contato em breve.'
    );
    assert.equal(localStorage.getItem(CHAVES.rascunho), null);
  });
});
