/* ─────────────────────────────────────────
   MISSÃO FINANCEIRA — script.js
───────────────────────────────────────── */

// ── ESTADO ──────────────────────────────
const STORAGE_KEY = 'missaoFinanceira_v1';

function estadoInicial() {
  return {
    meta: 0,
    ganhos: [],   // { id, nome, valor }
    gastos: [],   // { id, nome, valor }
    contas: [],   // { id, nome, valor, paga }
  };
}

function carregar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : estadoInicial();
  } catch { return estadoInicial(); }
}

function salvar(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = carregar();

// ── HELPERS ─────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function fmt(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function soma(arr) {
  return arr.reduce((acc, item) => acc + item.valor, 0);
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// ── TOAST ───────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── RENDER ──────────────────────────────
function render() {
  const totalGanhos = soma(state.ganhos);
  const totalGastos = soma(state.gastos);
  const saldo = totalGanhos - totalGastos;

  const contasTotal = soma(state.contas);
  const contasPagas = state.contas.filter(c => c.paga).reduce((a, c) => a + c.valor, 0);
  const contasPendentes = contasTotal - contasPagas;
  const pctContas = contasTotal > 0 ? clamp((contasPagas / contasTotal) * 100, 0, 100) : 0;

  const pctMeta = state.meta > 0 ? clamp((totalGanhos / state.meta) * 100, 0, 100) : 0;
  const faltaMeta = state.meta > 0 ? Math.max(state.meta - totalGanhos, 0) : 0;

  // Saldo
  document.getElementById('saldoAtual').textContent = fmt(saldo);
  document.getElementById('saldoAtual').style.color =
    saldo > 0 ? 'var(--green)' : saldo < 0 ? 'var(--red)' : 'var(--text)';
  document.getElementById('totalGanhos').textContent = fmt(totalGanhos);
  document.getElementById('totalGastos').textContent = fmt(totalGastos);

  // Meta
  document.getElementById('metaValor').textContent = fmt(state.meta);
  document.getElementById('metaPercent').textContent = pctMeta.toFixed(0) + '%';
  document.getElementById('progressMeta').style.width = pctMeta + '%';
  if (state.meta > 0) {
    document.getElementById('metaFalta').textContent =
      faltaMeta > 0 ? `Falta ${fmt(faltaMeta)} para a meta` : '🏆 Meta atingida!';
  } else {
    document.getElementById('metaFalta').textContent = 'Defina uma meta';
  }

  // Contas
  document.getElementById('totalContasValor').textContent = fmt(contasTotal);
  document.getElementById('contasFalta').textContent = `${fmt(contasPendentes)} pendentes`;
  document.getElementById('contasPercent').textContent = pctContas.toFixed(0) + '%';
  document.getElementById('progressContas').style.width = pctContas + '%';

  // Listas
  renderList('listGanhos', state.ganhos, 'ganho');
  renderList('listGastos', state.gastos, 'gasto');
  renderContas();
}

function renderList(containerId, items, tipo) {
  const el = document.getElementById(containerId);
  if (items.length === 0) {
    el.innerHTML = `<div class="empty">Nenhum registro ainda.</div>`;
    return;
  }
  const cls = tipo === 'ganho' ? 'val-green' : 'val-red';
  const prefix = tipo === 'ganho' ? '+' : '-';
  el.innerHTML = items.map(item => `
    <div class="list-item" data-id="${item.id}">
      <div class="list-item-info">
        <div class="list-item-name">${escHTML(item.nome)}</div>
        <div class="list-item-val ${cls}">${prefix} ${fmt(item.valor)}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-del" data-tipo="${tipo}" data-id="${item.id}" title="Remover">✕</button>
      </div>
    </div>
  `).join('');
}

function renderContas() {
  const el = document.getElementById('listContas');
  if (state.contas.length === 0) {
    el.innerHTML = `<div class="empty">Nenhuma conta cadastrada.</div>`;
    return;
  }
  el.innerHTML = state.contas.map(c => `
    <div class="list-item ${c.paga ? 'paga' : ''}" data-id="${c.id}">
      <input type="checkbox" class="check-conta" data-id="${c.id}" ${c.paga ? 'checked' : ''} />
      <div class="list-item-info">
        <div class="list-item-name">${escHTML(c.nome)}</div>
        <div class="list-item-val val-red">${fmt(c.valor)}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-del" data-tipo="conta" data-id="${c.id}" title="Remover">✕</button>
      </div>
    </div>
  `).join('');
}

function escHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// ── FORMULÁRIOS ─────────────────────────
function toggleForm(formId) {
  const el = document.getElementById(formId);
  el.classList.toggle('hidden');
}

function hideForm(formId) {
  document.getElementById(formId).classList.add('hidden');
}

function getInput(id, clear = false) {
  const el = document.getElementById(id);
  const val = el.value.trim();
  if (clear) el.value = '';
  return val;
}

function validar(nome, valor) {
  if (!nome) { showToast('⚠️ Informe uma descrição.'); return false; }
  if (!valor || isNaN(valor) || Number(valor) <= 0) {
    showToast('⚠️ Informe um valor válido.');
    return false;
  }
  return true;
}

// ── EVENTOS ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Meta
  document.getElementById('btnEditMeta').addEventListener('click', () => {
    toggleForm('formMeta');
    if (!document.getElementById('formMeta').classList.contains('hidden')) {
      document.getElementById('inputMeta').value = state.meta || '';
      document.getElementById('inputMeta').focus();
    }
  });

  document.getElementById('btnSalvarMeta').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('inputMeta').value);
    if (!val || val <= 0) { showToast('⚠️ Informe um valor de meta válido.'); return; }
    state.meta = val;
    salvar(state);
    hideForm('formMeta');
    render();
    showToast('✔ Meta atualizada!');
  });

  // Ganho
  document.getElementById('btnAddGanho').addEventListener('click', () => {
    toggleForm('formGanho');
    if (!document.getElementById('formGanho').classList.contains('hidden'))
      document.getElementById('inputGanhoNome').focus();
  });

  document.getElementById('btnSalvarGanho').addEventListener('click', () => {
    const nome = getInput('inputGanhoNome');
    const valor = parseFloat(getInput('inputGanhoValor'));
    if (!validar(nome, valor)) return;
    state.ganhos.push({ id: uid(), nome, valor });
    getInput('inputGanhoNome', true);
    getInput('inputGanhoValor', true);
    salvar(state);
    render();
    showToast('✔ Ganho registrado!');
  });

  // Gasto
  document.getElementById('btnAddGasto').addEventListener('click', () => {
    toggleForm('formGasto');
    if (!document.getElementById('formGasto').classList.contains('hidden'))
      document.getElementById('inputGastoNome').focus();
  });

  document.getElementById('btnSalvarGasto').addEventListener('click', () => {
    const nome = getInput('inputGastoNome');
    const valor = parseFloat(getInput('inputGastoValor'));
    if (!validar(nome, valor)) return;
    state.gastos.push({ id: uid(), nome, valor });
    getInput('inputGastoNome', true);
    getInput('inputGastoValor', true);
    salvar(state);
    render();
    showToast('✔ Gasto registrado!');
  });

  // Conta
  document.getElementById('btnAddConta').addEventListener('click', () => {
    toggleForm('formConta');
    if (!document.getElementById('formConta').classList.contains('hidden'))
      document.getElementById('inputContaNome').focus();
  });

  document.getElementById('btnSalvarConta').addEventListener('click', () => {
    const nome = getInput('inputContaNome');
    const valor = parseFloat(getInput('inputContaValor'));
    if (!validar(nome, valor)) return;
    state.contas.push({ id: uid(), nome, valor, paga: false });
    getInput('inputContaNome', true);
    getInput('inputContaValor', true);
    salvar(state);
    render();
    showToast('✔ Conta adicionada!');
  });

  // Delegação: deletar itens e marcar conta paga
  document.addEventListener('click', e => {
    const del = e.target.closest('.btn-del');
    if (del) {
      const { tipo, id } = del.dataset;
      if (tipo === 'ganho')  state.ganhos  = state.ganhos.filter(x => x.id !== id);
      if (tipo === 'gasto')  state.gastos  = state.gastos.filter(x => x.id !== id);
      if (tipo === 'conta')  state.contas  = state.contas.filter(x => x.id !== id);
      salvar(state);
      render();
      showToast('🗑 Removido.');
    }
  });

  document.addEventListener('change', e => {
    if (e.target.classList.contains('check-conta')) {
      const id = e.target.dataset.id;
      const conta = state.contas.find(c => c.id === id);
      if (conta) {
        conta.paga = e.target.checked;
        salvar(state);
        render();
        showToast(conta.paga ? '✔ Conta marcada como paga!' : 'Conta desmarcada.');
      }
    }
  });

  // Enter nos inputs
  ['inputMeta'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btnSalvarMeta').click();
    });
  });
  ['inputGanhoNome','inputGanhoValor'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btnSalvarGanho').click();
    });
  });
  ['inputGastoNome','inputGastoValor'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btnSalvarGasto').click();
    });
  });
  ['inputContaNome','inputContaValor'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btnSalvarConta').click();
    });
  });

  // Reset
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.remove('hidden');
  });
  document.getElementById('btnCancelarReset').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('hidden');
  });
  document.getElementById('btnConfirmarReset').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state = estadoInicial();
    document.getElementById('modalOverlay').classList.add('hidden');
    // Fechar todos os forms
    ['formMeta','formGanho','formGasto','formConta'].forEach(id => hideForm(id));
    render();
    showToast('🗑 Dados apagados.');
  });

  // Render inicial
  render();
});
