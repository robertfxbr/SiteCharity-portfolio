// main.js
// Ponto de entrada da aplicacao: importa os modulos e inicializa cada um deles.
// Nenhuma regra de negocio vive aqui, apenas a orquestracao.

import { iniciarRotas } from './modules/router.js';
import { iniciarMenu } from './modules/menu.js';
import { iniciarValidacao } from './modules/validacao.js';
import { iniciarTemplates } from './modules/templates.js';

function iniciar() {
  iniciarMenu();
  iniciarValidacao();
  iniciarTemplates();
  iniciarRotas();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
