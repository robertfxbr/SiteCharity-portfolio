// servicos.js
// Fonte de dados da aplicacao. Isolada da camada de renderizacao: amanha
// pode virar um fetch de API sem que os templates precisem mudar.

export const servicos = [
  {
    id: 1,
    titulo: 'Estrutura',
    descricao: 'HTML dividido em um documento base e fragmentos carregados sob demanda.',
    nivel: 'Basico',
    horas: 8
  },
  {
    id: 2,
    titulo: 'Apresentacao',
    descricao: 'CSS separado em reset e folha autoral, sem estilos embutidos na marcacao.',
    nivel: 'Intermediario',
    horas: 12
  },
  {
    id: 3,
    titulo: 'Comportamento',
    descricao: 'JavaScript modular, com uma responsabilidade por arquivo dentro de js/modules.',
    nivel: 'Avancado',
    horas: 20
  },
  {
    id: 4,
    titulo: 'Acessibilidade',
    descricao: 'Foco gerenciado por script, rotulos associados e regiao viva para avisos.',
    nivel: 'Intermediario',
    horas: 6
  }
];
