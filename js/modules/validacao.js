// validacao.js
// Responsabilidade unica: verificar a consistencia dos formularios, notificar
// visualmente o resultado e manter o rascunho no localStorage.
// Os ouvintes usam delegacao, porque os formularios sao injetados pelo
// roteador depois que o main.js ja executou.

import { gravar, ler, remover, CHAVES } from './persistencia.js';
import { relativo } from './datas.js';

// Nome: apenas letras (inclusive acentuadas), espacos, apostrofo, ponto e
// hifen, com no minimo 3 caracteres. Bloqueia numeros e simbolos.
const PADRAO_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'.-]{2,}$/;
// E-mail: texto sem espacos, arroba obrigatorio, dominio com ponto e
// extensao de pelo menos duas letras.
const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

function digitos(valor) {
  return valor.replace(/\D/g, '');
}

// Validacao real de CPF: alem do formato, confere os dois digitos
// verificadores. Sem isso, 111.111.111-11 passaria por ter 11 numeros.
function cpfValido(valor) {
  const numeros = digitos(valor);
  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  const calcular = (quantidade) => {
    let soma = 0;
    for (let i = 0; i < quantidade; i += 1) {
      soma += Number(numeros[i]) * (quantidade + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcular(9) === Number(numeros[9]) && calcular(10) === Number(numeros[10]);
}

function idade(dataIso) {
  if (!dataIso) return NaN;
  const nascimento = new Date(dataIso + 'T00:00:00');
  if (Number.isNaN(nascimento.getTime())) return NaN;

  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) anos -= 1;
  return anos;
}

// Cada campo tem uma cadeia de criterios avaliados em ordem: preenchimento,
// depois formato, depois regra de negocio. A primeira falha interrompe a
// cadeia, entao o usuario recebe uma mensagem por vez, a mais relevante.
const REGRAS_CONTATO = {
  nome: [
    { teste: (v) => v.trim() !== '', mensagem: 'O campo nome está vazio.' },
    { teste: (v) => PADRAO_NOME.test(v.trim()), mensagem: 'Use apenas letras, com ao menos 3 caracteres.' }
  ],
  email: [
    { teste: (v) => v.trim() !== '', mensagem: 'O campo e-mail está vazio.' },
    { teste: (v) => PADRAO_EMAIL.test(v.trim()), mensagem: 'Formato inválido. Exemplo: nome@dominio.com' }
  ],
  mensagem: [
    { teste: (v) => v.trim() !== '', mensagem: 'Escreva sua mensagem.' },
    { teste: (v) => v.trim().length >= 10, mensagem: 'Escreva ao menos 10 caracteres.' },
    { teste: (v) => v.trim().length <= 500, mensagem: 'Limite de 500 caracteres excedido.' }
  ]
};

const REGRAS_CADASTRO = {
  nomeCompleto: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o nome completo.' },
    { teste: (v) => PADRAO_NOME.test(v.trim()), mensagem: 'Use apenas letras, com ao menos 3 caracteres.' },
    { teste: (v) => v.trim().split(/\s+/).length >= 2, mensagem: 'Informe nome e sobrenome.' }
  ],
  cpf: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o CPF.' },
    { teste: (v) => digitos(v).length === 11, mensagem: 'O CPF precisa ter 11 dígitos.' },
    { teste: (v) => cpfValido(v), mensagem: 'CPF inválido: os dígitos verificadores não conferem.' }
  ],
  nascimento: [
    { teste: (v) => v !== '', mensagem: 'Informe a data de nascimento.' },
    { teste: (v) => !Number.isNaN(idade(v)), mensagem: 'Data inválida.' },
    { teste: (v) => idade(v) >= 16, mensagem: 'É necessário ter ao menos 16 anos para se voluntariar.' },
    { teste: (v) => idade(v) <= 110, mensagem: 'Confira o ano informado.' }
  ],
  email: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o e-mail.' },
    { teste: (v) => PADRAO_EMAIL.test(v.trim()), mensagem: 'Formato inválido. Exemplo: nome@dominio.com' }
  ],
  telefone: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o telefone.' },
    { teste: (v) => [10, 11].includes(digitos(v).length), mensagem: 'Informe DDD e número, com 10 ou 11 dígitos.' }
  ],
  cep: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o CEP.' },
    { teste: (v) => digitos(v).length === 8, mensagem: 'O CEP precisa ter 8 dígitos.' }
  ],
  endereco: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe o endereço.' },
    { teste: (v) => v.trim().length >= 5, mensagem: 'Informe rua e número.' }
  ],
  cidade: [
    { teste: (v) => v.trim() !== '', mensagem: 'Informe a cidade.' },
    { teste: (v) => PADRAO_NOME.test(v.trim()), mensagem: 'Use apenas letras.' }
  ],
  estado: [
    { teste: (v) => v !== '', mensagem: 'Selecione o estado.' }
  ]
};

const FORMULARIOS = {
  'form-contato': {
    regras: REGRAS_CONTATO,
    chave: CHAVES.rascunho,
    feedback: 'feedback',
    sucesso: 'Mensagem enviada. A nossa equipe entra em contato em breve.'
  },
  'form-cadastro': {
    regras: REGRAS_CADASTRO,
    chave: CHAVES.rascunhoCadastro,
    feedback: 'feedback-cadastro',
    sucesso: 'Cadastro enviado. Você receberá o convite para a formação inicial por e-mail.'
  }
};

// So valida por digitacao depois da primeira tentativa de envio de cada
// formulario, para nao acusar campo invalido durante o preenchimento.
const jaTentouEnviar = new Set();

// Notificacao visual: alterna as classes de estado no bloco do campo, escreve
// a mensagem e espelha o resultado para a arvore de acessibilidade.
function definirEstado(campo, mensagem) {
  const bloco = campo.closest('.campo');
  const alvo = bloco ? bloco.querySelector('.erro') : null;
  const invalido = Boolean(mensagem);

  if (bloco) {
    bloco.classList.toggle('invalido', invalido);
    bloco.classList.toggle('valido', !invalido && campo.value.trim() !== '');
  }
  if (alvo) {
    // textContent, e nao innerHTML: o valor exibido pode conter marcacao.
    alvo.textContent = mensagem;
  }
  campo.setAttribute('aria-invalid', String(invalido));
}

function validarCampo(campo, regras) {
  const cadeia = regras[campo.name];
  if (!cadeia) return true;

  const falha = cadeia.find((regra) => !regra.teste(campo.value));
  definirEstado(campo, falha ? falha.mensagem : '');
  return !falha;
}

function validarFormulario(form, regras) {
  return Object.keys(regras)
    .map((nome) => validarCampo(form.elements[nome], regras))
    .every(Boolean);
}

function limparEstados(form) {
  form.querySelectorAll('.campo').forEach((bloco) => {
    bloco.classList.remove('invalido', 'valido');
    const erro = bloco.querySelector('.erro');
    if (erro) erro.textContent = '';
  });
}

function coletar(form, regras) {
  const dados = {};
  Object.keys(regras).forEach((nome) => {
    if (form.elements[nome]) dados[nome] = form.elements[nome].value;
  });
  return dados;
}

// Restaura o rascunho de qualquer formulario conhecido presente na rota atual.
function restaurar() {
  Object.entries(FORMULARIOS).forEach(([id, config]) => {
    const form = document.getElementById(id);
    const rascunho = ler(config.chave);
    if (!form || !rascunho || !rascunho.campos) return;

    Object.entries(rascunho.campos).forEach(([nome, valor]) => {
      if (form.elements[nome]) form.elements[nome].value = valor;
    });

    const aviso = document.getElementById(config.feedback);
    if (aviso) {
      // relativo() vem do modulo que encapsula o Day.js.
      aviso.textContent = 'Rascunho recuperado, salvo ' + relativo(rascunho.salvoEm) + '.';
    }
  });
}

function configuracaoDe(form) {
  return form && FORMULARIOS[form.id] ? FORMULARIOS[form.id] : null;
}

export function iniciarValidacao() {
  // input: salva o rascunho a cada digitacao e revalida o campo alterado.
  document.addEventListener('input', (evento) => {
    const campo = evento.target;
    const form = campo.form;
    const config = configuracaoDe(form);
    if (!config) return;

    if (jaTentouEnviar.has(form.id)) {
      validarCampo(campo, config.regras);
    }
    gravar(config.chave, { campos: coletar(form, config.regras), salvoEm: Date.now() });
  });

  // change cobre select e campo de data, que nem sempre emitem input.
  document.addEventListener('change', (evento) => {
    const campo = evento.target;
    const form = campo.form;
    const config = configuracaoDe(form);
    if (!config || !jaTentouEnviar.has(form.id)) return;

    validarCampo(campo, config.regras);
  });

  // submit: intercepta o envio nativo e decide o que acontece.
  document.addEventListener('submit', (evento) => {
    const form = evento.target;
    const config = configuracaoDe(form);
    if (!config) return;

    // Impede o recarregamento padrao, que encerraria a SPA.
    evento.preventDefault();
    jaTentouEnviar.add(form.id);

    const feedback = document.getElementById(config.feedback);

    if (!validarFormulario(form, config.regras)) {
      if (feedback) feedback.textContent = '';
      const primeiroInvalido = form.querySelector('.campo.invalido input, .campo.invalido select, .campo.invalido textarea');
      if (primeiroInvalido) primeiroInvalido.focus();
      return;
    }

    if (feedback) feedback.textContent = config.sucesso;
    form.reset();
    limparEstados(form);
    remover(config.chave);
    jaTentouEnviar.delete(form.id);
  });

  // Os formularios so existem apos a rota correspondente ser renderizada.
  document.addEventListener('rota:renderizada', restaurar);
}
