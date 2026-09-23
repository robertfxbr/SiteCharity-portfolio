// mascaras.js
// Responsabilidade unica: formatar a entrada de campos com padrao fixo
// enquanto o usuario digita, para que o valor case com o atributo pattern
// declarado no HTML.
//
// A mascara e aplicada por delegacao, porque os formularios sao injetados
// pelo roteador. Ela nunca bloqueia a digitacao: apenas descarta o que nao e
// digito e insere a pontuacao na posicao correta.

function somenteDigitos(valor) {
  return valor.replace(/\D/g, '');
}

export function mascaraCpf(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function mascaraCep(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, '$1-$2');
}

// Aceita fixo com 10 digitos e celular com 11.
export function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const MASCARAS = {
  cpf: mascaraCpf,
  cep: mascaraCep,
  telefone: mascaraTelefone
};

export function iniciarMascaras() {
  document.addEventListener('input', (evento) => {
    const campo = evento.target;
    const mascara = MASCARAS[campo.name];
    if (!mascara || !campo.form) return;

    const formatado = mascara(campo.value);
    if (formatado === campo.value) return;

    // Preserva a posicao do cursor quando a edicao nao e no fim do campo.
    const fim = campo.selectionStart === campo.value.length;
    campo.value = formatado;
    if (!fim) {
      const posicao = Math.min(campo.selectionStart, formatado.length);
      campo.setSelectionRange(posicao, posicao);
    }
  });
}
