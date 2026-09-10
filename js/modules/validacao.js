// validacao.js
// Responsabilidade unica: verificar a consistencia do formulario de contato,
// notificar visualmente o resultado e manter o rascunho no localStorage.
// Os ouvintes usam delegacao, porque o formulario e injetado pelo roteador
// depois que o main.js ja executou.


// Expressoes regulares usadas nos criterios de formato.
// Nome: apenas letras (inclusive acentuadas), espacos, apostrofo, ponto e
// hifen, com no minimo 3 caracteres. Bloqueia numeros e simbolos.
const PADRAO_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'.-]{2,}$/;
// E-mail: texto sem espacos, arroba obrigatorio, dominio com ponto e
// extensao de pelo menos duas letras.
const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// So valida por digitacao depois da primeira tentativa de envio, para nao
// acusar campo invalido enquanto o usuario ainda esta preenchendo.
let jaTentouEnviar = false;

// Cada campo tem uma cadeia de criterios avaliados em ordem: preenchimento,
// depois formato, depois tamanho. A primeira falha interrompe a cadeia, entao
// o usuario recebe uma mensagem por vez, a mais relevante.
const REGRAS = {
  nome: [
    { teste: (v) => v.trim() !== '', mensagem: 'O campo nome esta vazio.' },
    { teste: (v) => PADRAO_NOME.test(v.trim()), mensagem: 'Use apenas letras, com ao menos 3 caracteres.' }
  ],
  email: [
    { teste: (v) => v.trim() !== '', mensagem: 'O campo e-mail esta vazio.' },
    { teste: (v) => PADRAO_EMAIL.test(v.trim()), mensagem: 'Formato invalido. Exemplo: nome@dominio.com' }
  ],
  mensagem: [
    { teste: (v) => v.trim() !== '', mensagem: 'Escreva sua mensagem.' },
    { teste: (v) => v.trim().length >= 10, mensagem: 'A mensagem precisa de ao menos 10 caracteres.' },
    { teste: (v) => v.trim().length <= 500, mensagem: 'Limite de 500 caracteres excedido.' }
  ]
};

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

function validarCampo(campo) {
  const cadeia = REGRAS[campo.name];
  if (!cadeia) return true;

  const falha = cadeia.find((regra) => !regra.teste(campo.value));
  definirEstado(campo, falha ? falha.mensagem : '');
  return !falha;
}

function validarFormulario(form) {
  return Object.keys(REGRAS)
    .map((nome) => validarCampo(form.elements[nome]))
    .every(Boolean);
}

function limparEstados(form) {
  form.querySelectorAll('.campo').forEach((bloco) => {
    bloco.classList.remove('invalido', 'valido');
    const erro = bloco.querySelector('.erro');
    if (erro) erro.textContent = '';
  });
}

export function iniciarValidacao() {
  // input: salva o rascunho a cada digitacao e revalida o campo alterado.
  document.addEventListener('input', (evento) => {
    const campo = evento.target;
    const form = campo.form;
    if (!form || form.id !== 'form-contato') return;

    if (jaTentouEnviar) {
      validarCampo(campo);
    }
  });

  // submit: intercepta o envio nativo e decide o que acontece.
  document.addEventListener('submit', (evento) => {
    const form = evento.target;
    if (form.id !== 'form-contato') return;

    // Impede o recarregamento padrao, que encerraria a SPA.
    evento.preventDefault();
    jaTentouEnviar = true;

    const feedback = document.getElementById('feedback');

    if (!validarFormulario(form)) {
      if (feedback) feedback.textContent = '';
      const primeiroInvalido = form.querySelector('.campo.invalido input, .campo.invalido textarea');
      if (primeiroInvalido) primeiroInvalido.focus();
      return;
    }

    if (feedback) feedback.textContent = 'Mensagem enviada com sucesso.';
    form.reset();
    limparEstados(form);
    jaTentouEnviar = false;
  });

}
