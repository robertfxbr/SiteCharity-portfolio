// armazenamento-falso.js
// Substituto do localStorage para o Node, que nao tem Web Storage por padrao.
// Implementa so a parte da interface que a aplicacao usa.

export function criarArmazenamento(inicial = {}) {
  const dados = new Map(Object.entries(inicial));

  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => { dados.set(chave, String(valor)); },
    removeItem: (chave) => { dados.delete(chave); },
    clear: () => { dados.clear(); },
    get length() { return dados.size; }
  };
}

// Armazenamento que recusa gravacao, como no modo privado de alguns
// navegadores ou com a cota estourada.
export function criarArmazenamentoCheio() {
  const base = criarArmazenamento();
  return {
    ...base,
    setItem: () => { throw new Error('QuotaExceededError'); }
  };
}
