import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFTV0O2H97bdc_R7izGs9cHxZa4EN31_A",
  authDomain: "missao-financeira.firebaseapp.com",
  projectId: "missao-financeira",
  storageBucket: "missao-financeira.firebasestorage.app",
  messagingSenderId: "326634668920",
  appId: "1:326634668920:web:409e8cd90dea68a27f7e8d",
  measurementId: "G-16EG9EJ4RQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const documentoRef = doc(db, "dadosFinanceiros", "dener");

let ganhos = [];
let gastos = [];
let contas = [];
let meta = 0;

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function pegar(id) {
  return document.getElementById(id);
}

function escrever(id, texto) {
  const elemento = pegar(id);
  if (elemento) elemento.textContent = texto;
}

function progresso(id, valor) {
  const elemento = pegar(id);
  if (elemento) {
    elemento.style.width = `${Math.max(0, Math.min(valor, 100))}%`;
  }
}

async function carregarDados() {
  try {
    const snapshot = await getDoc(documentoRef);

    if (snapshot.exists()) {
      const dados = snapshot.data();

      ganhos = dados.ganhos || [];
      gastos = dados.gastos || [];
      contas = dados.contas || [];
      meta = dados.meta || 0;
    } else {
      ganhos = JSON.parse(localStorage.getItem("ganhosMissao")) || [];
      gastos = JSON.parse(localStorage.getItem("gastosMissao")) || [];
      contas = JSON.parse(localStorage.getItem("contasMissao")) || [];
      meta = Number(localStorage.getItem("metaMissao")) || 0;

      await salvarDados();
    }

    atualizarTela();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados do Firebase.");
  }
}

async function salvarDados() {
  try {
    await setDoc(documentoRef, {
      ganhos,
      gastos,
      contas,
      meta,
      atualizadoEm: new Date().toISOString()
    });
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    alert("Erro ao salvar no Firebase.");
  }
}

function openTab(tab, botao = null) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const tela = pegar(tab);
  if (tela) tela.classList.add("active");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  if (botao) {
    botao.classList.add("active");
    return;
  }

  const navItems = document.querySelectorAll(".nav-item");

  const navMap = {
    home: 0,
    transactions: 1,
    goals: 2,
    insights: 3
  };

  if (tab === "bills") return;

  if (navItems[navMap[tab]]) {
    navItems[navMap[tab]].classList.add("active");
  }
}

async function adicionarGanho() {
  const nomeInput = pegar("ganhoNome");
  const valorInput = pegar("ganhoValor");

  const nome = nomeInput ? nomeInput.value.trim() : "";
  const valor = valorInput ? Number(valorInput.value) : 0;

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor do ganho.");
    return;
  }

  ganhos.push({
    id: Date.now(),
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  await salvarDados();
  atualizarTela();
}

async function adicionarGasto() {
  const nomeInput = pegar("gastoNome");
  const valorInput = pegar("gastoValor");

  const nome = nomeInput ? nomeInput.value.trim() : "";
  const valor = valorInput ? Number(valorInput.value) : 0;

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor do gasto.");
    return;
  }

  gastos.push({
    id: Date.now(),
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  await salvarDados();
  atualizarTela();
}

async function adicionarConta() {
  const nomeInput = pegar("contaNome");
  const valorInput = pegar("contaValor");

  const nome = nomeInput ? nomeInput.value.trim() : "";
  const valor = valorInput ? Number(valorInput.value) : 0;

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor da conta.");
    return;
  }

  contas.push({
    id: Date.now(),
    nome,
    valor,
    paga: false,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  await salvarDados();
  atualizarTela();
}

async function salvarMeta() {
  const metaInput = pegar("metaInput");
  const valor = metaInput ? Number(metaInput.value) : 0;

  if (valor <= 0) {
    alert("Digite uma meta válida.");
    return;
  }

  meta = valor;
  metaInput.value = "";

  await salvarDados();
  atualizarTela();
}

async function excluirGanho(id) {
  ganhos = ganhos.filter((item) => item.id !== id);
  await salvarDados();
  atualizarTela();
}

async function excluirGasto(id) {
  gastos = gastos.filter((item) => item.id !== id);
  await salvarDados();
  atualizarTela();
}

async function excluirConta(id) {
  contas = contas.filter((item) => item.id !== id);
  await salvarDados();
  atualizarTela();
}

async function marcarConta(id) {
  contas = contas.map((conta) => {
    if (conta.id === id) {
      return {
        ...conta,
        paga: !conta.paga
      };
    }

    return conta;
  });

  await salvarDados();
  atualizarTela();
}

async function apagarTudo() {
  const confirmar = confirm("Tem certeza que deseja apagar todos os dados?");

  if (!confirmar) return;

  ganhos = [];
  gastos = [];
  contas = [];
  meta = 0;

  await salvarDados();
  atualizarTela();
}

function calcularDados() {
  const totalGanhos = ganhos.reduce((soma, item) => soma + Number(item.valor), 0);
  const totalGastos = gastos.reduce((soma, item) => soma + Number(item.valor), 0);

  const contasPagas = contas.filter((conta) => conta.paga);
  const contasPendentes = contas.filter((conta) => !conta.paga);

  const totalContasPagas = contasPagas.reduce((soma, item) => soma + Number(item.valor), 0);
  const totalContasPendentes = contasPendentes.reduce((soma, item) => soma + Number(item.valor), 0);

  const saldo = totalGanhos - totalGastos - totalContasPagas;
  const faltaGanhar = Math.max(meta - totalGanhos, 0);

  const progressoMeta = meta > 0 ? Math.min((totalGanhos / meta) * 100, 100) : 0;
  const progressoContas = contas.length > 0 ? (contasPagas.length / contas.length) * 100 : 0;

  return {
    totalGanhos,
    totalGastos,
    contasPagas,
    contasPendentes,
    totalContasPagas,
    totalContasPendentes,
    saldo,
    faltaGanhar,
    progressoMeta,
    progressoContas
  };
}

function atualizarTela() {
  const dados = calcularDados();

  escrever("saldoAtual", moeda(dados.saldo));
  escrever("totalGanhos", moeda(dados.totalGanhos));
  escrever("totalGastos", moeda(dados.totalGastos));
  escrever("contasPendentes", moeda(dados.totalContasPendentes));
  escrever("donutTotal", moeda(dados.totalGanhos + dados.totalGastos));

  escrever("metaPercent", `${Math.round(dados.progressoMeta)}%`);
  escrever("goalMetaPercent", `${Math.round(dados.progressoMeta)}%`);
  escrever("contasPercent", `${Math.round(dados.progressoContas)}%`);

  progresso("metaProgress", dados.progressoMeta);
  progresso("goalMetaProgress", dados.progressoMeta);
  progresso("contasProgress", dados.progressoContas);

  escrever(
    "metaText",
    meta > 0
      ? `Faltam ${moeda(dados.faltaGanhar)} para bater sua meta.`
      : "Defina uma meta para começar."
  );

  escrever("metaAtual", moeda(meta));
  escrever("metaGanho", moeda(dados.totalGanhos));
  escrever("metaFalta", moeda(dados.faltaGanhar));

  escrever(
    "contasText",
    contas.length > 0
      ? `${dados.contasPagas.length} de ${contas.length} contas pagas.`
      : "Nenhuma conta cadastrada."
  );

  const totalMovimento = dados.totalGanhos + dados.totalGastos + Math.abs(dados.saldo);

  escrever(
    "legendGanhos",
    totalMovimento > 0
      ? `${Math.round((dados.totalGanhos / totalMovimento) * 100)}%`
      : "0%"
  );

  escrever(
    "legendGastos",
    totalMovimento > 0
      ? `${Math.round((dados.totalGastos / totalMovimento) * 100)}%`
      : "0%"
  );

  escrever(
    "legendSaldo",
    totalMovimento > 0
      ? `${Math.round((Math.abs(dados.saldo) / totalMovimento) * 100)}%`
      : "0%"
  );

  const positivoPercent = dados.saldo > 0 ? 100 : dados.totalGanhos > 0 ? 45 : 0;

  escrever("positivoStatus", dados.saldo > 0 ? "100%" : `${positivoPercent}%`);
  progresso("positivoProgress", positivoPercent);

  escrever(
    "maiorEntrada",
    moeda(ganhos.length ? Math.max(...ganhos.map((item) => Number(item.valor))) : 0)
  );

  escrever(
    "maiorGasto",
    moeda(gastos.length ? Math.max(...gastos.map((item) => Number(item.valor))) : 0)
  );

  escrever("totalRegistros", ganhos.length + gastos.length + contas.length);

  escrever(
    "statusMes",
    dados.saldo > 0 ? "Positivo" : dados.saldo < 0 ? "Negativo" : "Neutro"
  );

  escrever(
    "saldoStatus",
    dados.saldo > 0 ? "+ mês positivo" : dados.saldo < 0 ? "atenção ao saldo" : "controle do mês"
  );

  atualizarListas();
}

function atualizarListas() {
  const listaTransacoes = pegar("listaTransacoes");
  const ultimasMovimentacoes = pegar("ultimasMovimentacoes");
  const listaContas = pegar("listaContas");

  const transacoes = [
    ...ganhos.map((item) => ({ ...item, tipo: "ganho" })),
    ...gastos.map((item) => ({ ...item, tipo: "gasto" }))
  ].sort((a, b) => b.id - a.id);

  if (listaTransacoes) {
    if (transacoes.length === 0) {
      listaTransacoes.innerHTML = `<p class="empty">Nenhuma transação cadastrada.</p>`;
    } else {
      listaTransacoes.innerHTML = transacoes
        .map((item) => criarItemTransacao(item, true))
        .join("");
    }
  }

  if (ultimasMovimentacoes) {
    if (transacoes.length === 0) {
      ultimasMovimentacoes.innerHTML = `<p class="empty">Nenhuma movimentação ainda.</p>`;
    } else {
      ultimasMovimentacoes.innerHTML = transacoes
        .slice(0, 4)
        .map((item) => criarItemTransacao(item, false))
        .join("");
    }
  }

  if (listaContas) {
    if (contas.length === 0) {
      listaContas.innerHTML = `<p class="empty">Nenhuma conta cadastrada.</p>`;
    } else {
      listaContas.innerHTML = contas
        .map((conta) => criarItemConta(conta))
        .join("");
    }
  }
}

function criarItemTransacao(item, mostrarExcluir) {
  const positivo = item.tipo === "ganho";
  const classe = positivo ? "green-text" : "red-text";
  const sinal = positivo ? "+" : "-";
  const funcao = positivo ? "excluirGanho" : "excluirGasto";

  return `
    <div class="item">
      <div class="item-left">
        <div class="item-icon ${positivo ? "income-icon" : "expense-icon"}"></div>
        <div>
          <h4>${item.nome}</h4>
          <small>${positivo ? "Ganho" : "Gasto"} • ${item.data}</small>
        </div>
      </div>

      <div>
        <strong class="${classe}">${sinal} ${moeda(item.valor)}</strong>
        ${
          mostrarExcluir
            ? `<div class="item-actions">
                <button type="button" onclick="${funcao}(${item.id})">Excluir</button>
              </div>`
            : ""
        }
      </div>
    </div>
  `;
}

function criarItemConta(conta) {
  return `
    <div class="item">
      <div class="item-left">
        <div class="item-icon bill-icon"></div>
        <div>
          <h4>${conta.nome}</h4>
          <small>${conta.paga ? "Paga" : "Pendente"} • ${conta.data}</small>
        </div>
      </div>

      <div>
        <strong>${moeda(conta.valor)}</strong>
        <div class="item-actions">
          <button type="button" onclick="marcarConta(${conta.id})">
            ${conta.paga ? "Reabrir" : "Pagar"}
          </button>
          <button type="button" onclick="excluirConta(${conta.id})">Excluir</button>
        </div>
      </div>
    </div>
  `;
}

function iniciarSplash() {
  const splash = pegar("splashScreen");

  setTimeout(() => {
    if (splash) {
      splash.classList.add("hide");
    }
  }, 1800);
}

window.openTab = openTab;
window.adicionarGanho = adicionarGanho;
window.adicionarGasto = adicionarGasto;
window.adicionarConta = adicionarConta;
window.salvarMeta = salvarMeta;
window.excluirGanho = excluirGanho;
window.excluirGasto = excluirGasto;
window.excluirConta = excluirConta;
window.marcarConta = marcarConta;
window.apagarTudo = apagarTudo;

document.addEventListener("DOMContentLoaded", () => {
  iniciarSplash();
  carregarDados();
});
