// datas.js
// Responsabilidade unica: formatar datas. Encapsula a biblioteca externa
// (Day.js, carregada por CDN) para que o resto da aplicacao nunca chame
// window.dayjs diretamente. Se a CDN falhar, o fallback nativo assume e a
// aplicacao continua funcionando.

let pronto = false;

export function iniciarDatas() {
  // Verificacao defensiva: o script pode nao ter carregado (rede, bloqueio,
  // modo offline). Nesse caso o modulo apenas nao ativa os plugins.
  if (typeof window.dayjs === 'undefined') {
    console.warn('Day.js indisponivel. Usando formatacao nativa.');
    return false;
  }

  // Day.js nasce minimo: cada recurso extra e um plugin registrado no core.
  if (window.dayjs_plugin_relativeTime) {
    window.dayjs.extend(window.dayjs_plugin_relativeTime);
  }
  window.dayjs.locale('pt-br');

  pronto = true;
  return true;
}

// "ha 5 minutos" com a biblioteca; data e hora local sem ela.
export function relativo(timestamp) {
  if (pronto) {
    return window.dayjs(timestamp).fromNow();
  }
  return new Date(timestamp).toLocaleString('pt-BR');
}

export function formatar(timestamp, mascara = 'DD/MM/YYYY HH:mm') {
  if (pronto) {
    return window.dayjs(timestamp).format(mascara);
  }
  return new Date(timestamp).toLocaleString('pt-BR');
}
