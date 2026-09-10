// persistencia.js
// Responsabilidade unica: falar com o localStorage. Nenhum outro modulo chama
// setItem ou getItem diretamente, entao a serializacao e o tratamento de erro
// ficam em um lugar so.

const PREFIXO = 'atividade3:';

export const CHAVES = {
  rascunho: PREFIXO + 'rascunho-contato',
  preferencias: PREFIXO + 'preferencias'
};

// O localStorage so guarda string. JSON.stringify converte objetos e arrays
// em texto na gravacao; JSON.parse desfaz a conversao na leitura.
export function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    // Modo privado ou cota estourada: a aplicacao segue funcionando, apenas
    // sem lembrar do estado.
    console.warn('Nao foi possivel gravar em ' + chave, erro);
    return false;
  }
}

export function ler(chave, padrao = null) {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) return padrao;

    const valor = JSON.parse(bruto);
    // Chave adulterada por outra aba ou versao antiga do app: se o tipo nao
    // for o esperado, devolve o padrao em vez de contaminar a interface.
    if (padrao !== null && typeof valor !== typeof padrao) return padrao;
    return valor;
  } catch (erro) {
    // JSON invalido: descarta a chave em vez de quebrar a renderizacao.
    localStorage.removeItem(chave);
    return padrao;
  }
}

export function remover(chave) {
  localStorage.removeItem(chave);
}

// Preferencias visuais sao gravadas por partes, sem apagar as demais chaves.
export function lerPreferencias() {
  return ler(CHAVES.preferencias, { tema: 'claro', filtroNivel: 'todos' });
}

export function gravarPreferencia(campo, valor) {
  const atuais = lerPreferencias();
  gravar(CHAVES.preferencias, { ...atuais, [campo]: valor });
}
