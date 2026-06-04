let ganhos = JSON.parse(localStorage.getItem("ganhos")) || [];
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let contas = JSON.parse(localStorage.getItem("contas")) || [];
let meta = Number(localStorage.getItem("meta")) || 0;

function salvarDados() {
  localStorage.setItem("ganhos", JSON.stringify(ganhos));
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("contas", JSON.stringify(contas));
  localStorage.setItem("meta", meta);
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function openTab(tab) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(tab).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });

  const map = {
    home: 0,
    transactions: 1,
    goals: 2,
    insights: 3
  };

  if (tab === "home") document.querySelectorAll(".nav-item")[0].classList.add("active");
  if (tab === "transactions") document.querySelectorAll(".nav-item")[1].classList.add("active");
  if (tab === "goals") document.querySelectorAll(".nav-item")[2].classList.add("active");
  if (tab === "insights") document.querySelectorAll(".nav-item")[3].classList.add("active");
}

function adicionarGanho() {
  const nome = document.getElementById("ganhoNome").value.trim();
  const valor = Number(document.getElementById("ganhoValor").value);

  if (!nome || !valor) {
    alert("Preencha o nome e o valor do ganho.");
    return;
  }

  ganhos.push({
    id: Date.now(),
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  document.getElementById("ganhoNome").value = "";
  document.getElementById("ganhoValor").value = "";

  salvarDados();
  atualizarTela();
}

function adicionarGasto() {
  const nome = document.getElementById("gastoNome").value.trim();
  const valor = Number(document.getElementById("gastoValor").value);

  if (!nome || !valor) {
    alert("Preencha o nome e o valor do gasto.");
    return;
  }

  gastos.push({
    id: Date.now(),
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  document.getElementById("gastoNome").value = "";
  document.getElementById("gastoValor").value = "";

  salvarDados();
  atualizarTela();
}

function adicionarConta() {
  const nome = document.getElementById("contaNome").value.trim();
  const valor = Number(document.getElementById("contaValor").value);

  if (!nome || !valor) {
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

  document.getElementById("contaNome").value = "";
  document.getElementById("contaValor").value = "";

  salvarDados();
  atualizarTela();
}

function salvarMeta() {
  const valor = Number(document.getElementById("metaInput").value);

  if (!valor) {
    alert("Digite o valor da meta.");
    return;
  }

  meta = valor;
  document.getElementById("metaInput").value = "";

  salvarDados();
  atualizarTela();
}

function excluirGanho(id) {
  ganhos = ganhos.filter(item => item.id !== id);
  salvarDados();
  atualizarTela();
}

function excluirGasto(id) {
  gastos = gastos.filter(item => item.id !== id);
  salvarDados();
  atualizarTela();
}

function excluirConta(id) {
  contas = contas.filter(item => item.id !== id);
  salvarDados();
  atualizarTela();
}

function marcarConta(id) {
  contas = contas.map(conta => {
    if (conta.id === id) {
      conta.paga = !conta.paga;
    }
    return conta;
  });

  salvarDados();
  atualizarTela();
}

function apagarTudo() {
  if (!confirm("Tem certeza que deseja apagar todos os dados?")) return;

  ganhos = [];
  gastos = [];
  contas = [];
  meta = 0;

  salvarDados();
  atualizarTela();
}

function atualizarTela() {
  const totalGanhos = ganhos.reduce((soma, item) => soma + item.valor, 0);
  const totalGastos = gastos.reduce((soma, item) => soma + item.valor, 0);
  const totalContasPendentes = contas
    .filter(conta => !conta.paga)
    .reduce((soma, item) => soma + item.valor, 0);

  const totalContasPagas = contas
    .filter(conta => conta.paga)
    .reduce((soma, item) => soma + item.valor, 0);

  const saldo = totalGanhos - totalGastos - totalContasPagas;
  const faltaGanhar = Math.max(meta - totalGanhos, 0);

  const progressoMeta = meta > 0 ? Math.min((totalGanhos / meta) * 100, 100) : 0;
  const progressoContas = contas.length > 0
    ? (contas.filter(c => c.paga).length / contas.length) * 100
    : 0;

  document.getElementById("saldoAtual").textContent = moeda(saldo);
  document.getElementById("totalGanhos").textContent = moeda(totalGanhos);
  document.getElementById("totalGastos").textContent = moeda(totalGastos);

  document.getElementById("donutTotal").textContent = moeda(totalGanhos + totalGastos);
  document.getElementById("contasPendentes").textContent = moeda(totalContasPendentes);

  document.getElementById("metaProgress").style.width = progressoMeta + "%";
  document.getElementById("goalMetaProgress").style.width = progressoMeta + "%";
  document.getElementById("metaPercent").textContent = Math.round(progressoMeta) + "%";
  document.getElementById("goalMetaPercent").textContent = Math.round(progressoMeta) + "%";

  document.getElementById("metaText").textContent =
    meta > 0
      ? `Faltam ${moeda(faltaGanhar)} para bater sua meta.`
      : "Defina uma meta para começar.";

  document.getElementById("metaAtual").textContent = moeda(meta);
  document.getElementById("metaGanho").textContent = moeda(totalGanhos);
  document.getElementById("metaFalta").textContent = moeda(faltaGanhar);

  document.getElementById("contasProgress").style.width = progressoContas + "%";
  document.getElementById("contasPercent").textContent = Math.round(progressoContas) + "%";
  document.getElementById("contasText").textContent =
    contas.length > 0
      ? `${contas.filter(c => c.paga).length} de ${contas.length} contas pagas.`
      : "Nenhuma conta cadastrada.";

  const totalMovimento = totalGanhos + totalGastos + Math.abs(saldo);

  document.getElementById("legendGanhos").textContent =
    totalMovimento ? Math.round((totalGanhos / totalMovimento) * 100) + "%" : "0%";

  document.getElementById("legendGastos").textContent =
    totalMovimento ? Math.round((totalGastos / totalMovimento) * 100) + "%" : "0%";

  document.getElementById("legendSaldo").textContent =
    totalMovimento ? Math.round((Math.abs(saldo) / totalMovimento) * 100) + "%" : "0%";

  const positivoPercent = saldo > 0 ? 100 : 20;
  document.getElementById("positivoProgress").style.width = positivoPercent + "%";
  document.getElementById("positivoStatus").textContent =
    saldo > 0 ? "100%" : "Em andamento";

  document.getElementById("maiorEntrada").textContent = moeda(
    ganhos.length ? Math.max(...ganhos.map(g => g.valor)) : 0
  );

  document.getElementById("maiorGasto").textContent = moeda(
    gastos.length ? Math.max(...gastos.map(g => g.valor)) : 0
  );

  document.getElementById("totalRegistros").textContent =
    ganhos.length + gastos.length + contas.length;

  document.getElementById("statusMes").textContent =
    saldo > 0 ? "Positivo" : saldo < 0 ? "Negativo" : "Neutro";

  document.getElementById("saldoStatus").textContent =
    saldo > 0 ? "+ mês positivo" : saldo < 0 ? "atenção ao saldo" : "controle do mês";

  renderizarListas();
}

function renderizarListas() {
  const listaTransacoes = document.getElementById("listaTransacoes");
  const ultimas = document.getElementById("ultimasMovimentacoes");
  const listaContas = document.getElementById("listaContas");

  const transacoes = [
    ...ganhos.map(g => ({ ...g, tipo: "ganho" })),
    ...gastos.map(g => ({ ...g, tipo: "gasto" }))
  ].sort((a, b) => b.id - a.id);

  listaTransacoes.innerHTML = "";
  ultimas.innerHTML = "";

  if (transacoes.length === 0) {
    listaTransacoes.innerHTML = `<p class="empty">Nenhuma transação cadastrada.</p>`;
    ultimas.innerHTML = `<p class="empty">Nenhuma movimentação ainda.</p>`;
  } else {
    transacoes.forEach(item => {
      listaTransacoes.innerHTML += `
        <div class="item">
          <div class="item-left">
            <div class="item-icon">${item.tipo === "ganho" ? "↑" : "↓"}</div>
            <div>
              <h4>${item.nome}</h4>
              <small>${item.tipo === "ganho" ? "Ganho" : "Gasto"} • ${item.data}</small>
            </div>
          </div>

          <div>
            <strong class="${item.tipo === "ganho" ? "green-text" : "red-text"}">
              ${item.tipo === "ganho" ? "+" : "-"} ${moeda(item.valor)}
            </strong>

            <div class="item-actions">
              <button onclick="${item.tipo === "ganho" ? `excluirGanho(${item.id})` : `excluirGasto(${item.id})`}">Excluir</button>
            </div>
          </div>
        </div>
      `;
    });

    transacoes.slice(0, 4).forEach(item => {
      ultimas.innerHTML += `
        <div class="item">
          <div class="item-left">
            <div class="item-icon">${item.tipo === "ganho" ? "↑" : "↓"}</div>
            <div>
              <h4>${item.nome}</h4>
              <small>${item.tipo === "ganho" ? "Ganho" : "Gasto"}</small>
            </div>
          </div>
          <strong class="${item.tipo === "ganho" ? "green-text" : "red-text"}">
            ${item.tipo === "ganho" ? "+" : "-"} ${moeda(item.valor)}
          </strong>
        </div>
      `;
    });
  }

  listaContas.innerHTML = "";

  if (contas.length === 0) {
    listaContas.innerHTML = `<p class="empty">Nenhuma conta cadastrada.</p>`;
  } else {
    contas.forEach(conta => {
      listaContas.innerHTML += `
        <div class="item">
          <div class="item-left">
            <div class="item-icon">${conta.paga ? "✓" : "!"}</div>
            <div>
              <h4>${conta.nome}</h4>
              <small>${conta.paga ? "Paga" : "Pendente"} • ${conta.data}</small>
            </div>
          </div>

          <div>
            <strong>${moeda(conta.valor)}</strong>
            <div class="item-actions">
              <button onclick="marcarConta(${conta.id})">${conta.paga ? "Reabrir" : "Pagar"}</button>
              <button onclick="excluirConta(${conta.id})">Excluir</button>
            </div>
          </div>
        </div>
      `;
    });
  }
}

atualizarTela();
