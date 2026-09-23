import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  cpfValido,
  idade,
  primeiraFalha,
  REGRAS_CONTATO,
  REGRAS_CADASTRO
} from '../../js/modules/validacao.js';

// Data fixa para que o resultado nao dependa do dia em que o teste roda.
const HOJE = new Date('2026-09-23T12:00:00');

describe('cpfValido', () => {
  test('aceita CPF valido com e sem pontuacao', () => {
    assert.equal(cpfValido('529.982.247-25'), true);
    assert.equal(cpfValido('52998224725'), true);
    assert.equal(cpfValido('111.444.777-35'), true);
  });

  test('aceita CPF cujo primeiro digito vem de resto 10, convertido em 0', () => {
    assert.equal(cpfValido('100.000.001-08'), true);
  });

  test('recusa CPF com o primeiro digito verificador errado', () => {
    assert.equal(cpfValido('529.982.247-35'), false);
  });

  test('recusa CPF com o segundo digito verificador errado', () => {
    assert.equal(cpfValido('529.982.247-24'), false);
  });

  test('recusa sequencias de digitos repetidos, mesmo que o calculo feche', () => {
    for (let d = 0; d <= 9; d += 1) {
      assert.equal(cpfValido(String(d).repeat(11)), false, 'digito ' + d);
    }
  });

  test('recusa quantidade de digitos diferente de 11', () => {
    assert.equal(cpfValido(''), false);
    assert.equal(cpfValido('529.982.247-2'), false);
    assert.equal(cpfValido('529.982.247-255'), false);
  });
});

describe('idade', () => {
  test('conta o ano completo no dia do aniversario', () => {
    assert.equal(idade('2010-09-23', HOJE), 16);
  });

  test('desconta um ano na vespera do aniversario', () => {
    assert.equal(idade('2010-09-24', HOJE), 15);
  });

  test('desconta um ano quando o mes do aniversario ainda nao chegou', () => {
    assert.equal(idade('2010-10-01', HOJE), 15);
  });

  test('nao desconta quando o mes do aniversario ja passou', () => {
    assert.equal(idade('2010-08-31', HOJE), 16);
  });

  test('devolve NaN para valor vazio ou data invalida', () => {
    assert.ok(Number.isNaN(idade('', HOJE)));
    assert.ok(Number.isNaN(idade('2010-13-45', HOJE)));
    assert.ok(Number.isNaN(idade('abc', HOJE)));
  });

  test('usa a data atual quando a referencia nao e informada', () => {
    const ano = new Date().getFullYear();
    assert.equal(idade((ano - 30) + '-01-01'), 30);
  });
});

describe('cadeia de regras do cadastro', () => {
  const falha = (campo, valor) => primeiraFalha(REGRAS_CADASTRO[campo], valor);
  const ano = new Date().getFullYear();

  test('a primeira falha interrompe a cadeia', () => {
    assert.equal(falha('cpf', ''), 'Informe o CPF.');
    assert.equal(falha('cpf', '123.456'), 'O CPF precisa ter 11 dígitos.');
    assert.equal(falha('cpf', '111.111.111-11'), 'CPF inválido: os dígitos verificadores não conferem.');
    assert.equal(falha('cpf', '529.982.247-25'), '');
  });

  test('nome completo exige letras e sobrenome', () => {
    assert.equal(falha('nomeCompleto', '   '), 'Informe o nome completo.');
    assert.equal(falha('nomeCompleto', 'Jo4o'), 'Use apenas letras, com ao menos 3 caracteres.');
    assert.equal(falha('nomeCompleto', 'Joana'), 'Informe nome e sobrenome.');
    assert.equal(falha('nomeCompleto', "Joana D'Arc Conceição"), '');
  });

  test('nascimento aplica os limites de 16 e 110 anos', () => {
    assert.equal(falha('nascimento', ''), 'Informe a data de nascimento.');
    assert.equal(falha('nascimento', 'x'), 'Data inválida.');
    assert.equal(falha('nascimento', (ano - 10) + '-01-01'), 'É necessário ter ao menos 16 anos para se voluntariar.');
    assert.equal(falha('nascimento', (ano - 120) + '-01-01'), 'Confira o ano informado.');
    assert.equal(falha('nascimento', (ano - 30) + '-01-01'), '');
  });

  test('telefone aceita 10 ou 11 digitos', () => {
    assert.equal(falha('telefone', '(11) 3456-7890'), '');
    assert.equal(falha('telefone', '(11) 98765-4321'), '');
    assert.equal(falha('telefone', '(11) 9876-543'), 'Informe DDD e número, com 10 ou 11 dígitos.');
  });

  test('CEP exige 8 digitos', () => {
    assert.equal(falha('cep', '01310-100'), '');
    assert.equal(falha('cep', '01310-10'), 'O CEP precisa ter 8 dígitos.');
  });

  test('estado exige selecao', () => {
    assert.equal(falha('estado', ''), 'Selecione o estado.');
    assert.equal(falha('estado', 'SP'), '');
  });
});

describe('cadeia de regras do contato', () => {
  const falha = (campo, valor) => primeiraFalha(REGRAS_CONTATO[campo], valor);

  test('e-mail exige arroba, dominio e extensao', () => {
    assert.equal(falha('email', ''), 'O campo e-mail está vazio.');
    assert.equal(falha('email', 'nome@dominio'), 'Formato inválido. Exemplo: nome@dominio.com');
    assert.equal(falha('email', 'nome @dominio.com'), 'Formato inválido. Exemplo: nome@dominio.com');
    assert.equal(falha('email', 'nome@dominio.com.br'), '');
  });

  test('mensagem fica entre 10 e 500 caracteres, sem contar espacos das pontas', () => {
    assert.equal(falha('mensagem', '   '), 'Escreva sua mensagem.');
    assert.equal(falha('mensagem', '  curta   '), 'Escreva ao menos 10 caracteres.');
    assert.equal(falha('mensagem', 'a'.repeat(10)), '');
    assert.equal(falha('mensagem', 'a'.repeat(500)), '');
    assert.equal(falha('mensagem', 'a'.repeat(501)), 'Limite de 500 caracteres excedido.');
  });
});
