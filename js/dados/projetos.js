// projetos.js
// Fonte de dados da aplicacao: os projetos sociais mantidos pela ONG.
// Isolada da camada de renderizacao. Amanha pode virar um fetch de API sem
// que os templates precisem mudar.

export const projetos = [
  {
    id: 1,
    titulo: 'Reforço escolar Semear',
    area: 'Educacao',
    descricao: 'Acompanhamento pedagogico para criancas de 7 a 14 anos em contraturno escolar.',
    imagem: '../imagens/projeto-educacao.jpg',
    alt: 'Criancas sentadas em sala de aula durante atividade de reforco escolar',
    atendidos: 320,
    desde: '2018-03-01'
  },
  {
    id: 2,
    titulo: 'Mesa Solidária',
    area: 'Alimentacao',
    descricao: 'Distribuicao semanal de cestas basicas e refeicoes prontas para familias cadastradas.',
    imagem: '../imagens/projeto-alimentacao.jpg',
    alt: 'Voluntarios organizando cestas de alimentos sobre uma mesa',
    atendidos: 640,
    desde: '2019-08-15'
  },
  {
    id: 3,
    titulo: 'Saúde na Comunidade',
    area: 'Saude',
    descricao: 'Mutiroes mensais de atendimento basico, aferição de pressao e orientacao preventiva.',
    imagem: '../imagens/projeto-saude.jpg',
    alt: 'Profissional de saude atendendo uma moradora em posto comunitario',
    atendidos: 280,
    desde: '2021-05-10'
  }
];
