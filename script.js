let ganhos = JSON.parse(localStorage.getItem("ganhosMissao")) || [];
let gastos = JSON.parse(localStorage.getItem("gastosMissao")) || [];
let contas = JSON.parse(localStorage.getItem("contasMissao")) || [];
let meta = Number(localStorage.getItem("metaMissao")) || 0;

function salvarDados() {
  localStorage.setItem("ganhosMissao", JSON.stringify(ganhos));
  localStorage.setItem("gastosMissao", JSON.stringify(gastos));
  localStorage.setItem("contasMissao", JSON.stringify(contas));
  localStorage.setItem("metaMissao", String(meta));
}

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
  const el = pegar(id);
  if (el) el.textContent = texto;
}

function largura(id, valor) {
  const el = pegar(id);
  if (el) el.style.width = valor + "%";
}

function openTab(tab) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const tela = pegar(tab);
  if (tela) tela.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });
}

function adicionarGanho() {
  const nomeInput = pegar("ganhoNome");
  const valorInput = pegar("ganhoValor");

  const nome = nomeInput.value.trim();
  const valor = Number(valorInput.value);

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor do ganho.");
    return;
  }

  ganhos.push({
    id: Date.now(),
    nome: nome,
    valor: valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  salvarDados();
  atualizarTela();
  alert("Ganho salvo!");
}

function adicionarGasto() {
  const nomeInput = pegar("gastoNome");
  const valorInput = pegar("gastoValor");

  const nome = nomeInput.value.trim();
  const valor = Number(valorInput.value);

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor do gasto.");
    return;
  }

  gastos.push({
    id: Date.now(),
    nome: nome,
    valor: valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  salvarDados();
  atualizarTela();
  alert("Gasto salvo!");
}

function adicionarConta() {
  const nomeInput = pegar("contaNome");
  const valorInput = pegar("contaValor");

  const nome = nomeInput.value.trim();
  const valor = Number(valorInput.value);

  if (!nome || valor <= 0) {
    alert("Preencha o nome e o valor da conta.");
    return;
  }

  contas.push({
    id: Date.now(),
    nome: nome,
    valor: valor,
    paga: false,
    data: new Date().toLocaleDateString("pt-BR")
  });

  nomeInput.value = "";
  valorInput.value = "";

  salvarDados();
  atualizarTela();
  alert("Conta salva!");
}

function salvarMeta() {
  const metaInput = pegar("metaInput");
  const valor = Number(metaInput.value);

  if (valor <= 0) {
    alert("Digite uma meta válida.");
    return;
  }

  meta = valor;
  metaInput.value = "";

  salvarDados();
  atualizarTela();
  alert("Meta salva!");
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
      return {
        ...conta,
        paga: !conta.paga
      };
    }

    return conta;
  });

  salvarDados();
  atualizarTela();
}

function apagarTudo() {
  const confirmar = confirm("Tem certeza que deseja apagar todos os dados?");

  if (!confirmar) return;

  ganhos = [];
  gastos = [];
  contas = [];
  meta = 0;

  salvarDados();
  atualizarTela();
}

function atualizarTela() {
  const totalGanhos = ganhos.reduce((soma, item) => soma + Number(item.valor), 0);
  const totalGastos = gastos.reduce((soma, item) => soma + Number(item.valor), 0);

  const contasPagas = contas.filter(conta => conta.paga);
  const contasPendentes = contas.filter(conta => !conta.paga);

  const totalContasPagas = contasPagas.reduce((soma, item) => soma + Number(item.valor), 0);
  const totalContasPendentes = contasPendentes.reduce((soma, item) => soma + Number(item.valor), 0);

  const saldo = totalGanhos - totalGastos - totalContasPagas;
  const faltaGanhar = Math.max(meta - totalGanhos, 0);

  const progressoMeta = meta > 0 ? Math.min((totalGanhos / meta) * 100, 100) : 0;
  const progressoContas = contas.length > 0 ? Math.round((contasPagas.length / contas.length) * 100) : 0;

  escrever("saldoAtual", moeda(saldo));
  escrever("totalGanhos", moeda(totalGanhos));
  escrever("totalGastos", moeda(totalGastos));
  escrever("contasPendentes", moeda(totalContasPendentes));
  escrever("donutTotal", moeda(totalGanhos + totalGastos));
  escrever("metaPercent", Math.round(progressoMeta) + "%");
  escrever("goalMetaPercent", Math.round(progressoMeta) + "%");
  escrever("contasPercent", progressoContas + "%");

  largura("metaProgress", progressoMeta);
  largura("goalMetaProgress", progressoMeta);
  largura("contasProgress", progressoContas);

  escrever("metaText", meta > 0 ? `Faltam ${moeda(faltaGanhar)} para bater sua meta.` : "Defina uma meta para começar.");
  escrever("metaAtual", moeda(meta));
  escrever("metaGanho", moeda(totalGanhos));
  escrever("metaFalta", moeda(faltaGanhar));

  escrever("contasText", contas.length > 0 ? `${contasPagas.length} de ${contas.length} contas pagas.` : "Nenhuma conta cadastrada.");

  escrever("maiorEntrada", moeda(ganhos.length ? Math.max(...ganhos.map(item => item.valor)) : 0));
  escrever("maiorGasto", moeda(gastos.length ? Math.max(...gastos.map(item => item.valor)) : 0));
  escrever("totalRegistros", ganhos.length + gastos.length + contas.length);
  escrever("statusMes", saldo > 0 ? "Positivo" : saldo < 0 ? "Negativo" : "Neutro");
  escrever("saldoStatus", saldo > 0 ? "+ mês positivo" : saldo < 0 ? "atenção ao saldo" : "controle do mês");

  atualizarListas();
}

function atualizarListas() {
  const listaTransacoes = pegar("listaTransacoes");
  const ultimasMovimentacoes = pegar("ultimasMovimentacoes");
  const listaContas = pegar("listaContas");

  const transacoes = [
    ...ganhos.map(item => ({ ...item, tipo: "ganho" })),
    ...gastos.map(item => ({ ...item, tipo: "gasto" }))
  ].sort((a, b) => b.id - a.id);

  if (listaTransacoes) {
    if (transacoes.length === 0) {
      listaTransacoes.innerHTML = `<p class="empty">Nenhuma transação cadastrada.</p>`;
    } else {
      listaTransacoes.innerHTML = transacoes.map(item => {
        const positivo = item.tipo === "ganho";
        const classe = positivo ? "green-text" : "red-text";
        const sinal = positivo ? "+" : "-";
        const funcao = positivo ? "excluirGanho" : "excluirGasto";

        return `
          <div class="item">
            <div class="item-left">
              <div class="item-icon">${positivo ? "↑" : "↓"}</div>
              <div>
                <h4>${item.nome}</h4>
                <small>${positivo ? "Ganho" : "Gasto"} • ${item.data}</small>
              </div>
            </div>

            <div>
              <strong class="${classe}">${sinal} ${moeda(item.valor)}</strong>
              <div class="item-actions">
                <button onclick="${funcao}(${item.id})">Excluir</button>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  if (ultimasMovimentacoes) {
    if (transacoes.length === 0) {
      ultimasMovimentacoes.innerHTML = `<p class="empty">Nenhuma movimentação ainda.</p>`;
    } else {
      ultimasMovimentacoes.innerHTML = transacoes.slice(0, 4).map(item => {
        const positivo = item.tipo === "ganho";
        const classe = positivo ? "green-text" : "red-text";
        const sinal = positivo ? "+" : "-";

        return `
          <div class="item">
            <div class="item-left">
              <div class="item-icon">${positivo ? "↑" : "↓"}</div>
              <div>
                <h4>${item.nome}</h4>
                <small>${positivo ? "Ganho" : "Gasto"}</small>
              </div>
            </div>

            <strong class="${classe}">${sinal} ${moeda(item.valor)}</strong>
          </div>
        `;
      }).join("");
    }
  }

  if (listaContas) {
    if (contas.length === 0) {
      listaContas.innerHTML = `<p class="empty">Nenhuma conta cadastrada.</p>`;
    } else {
      listaContas.innerHTML = contas.map(conta => {
        return `
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
      }).join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", atualizarTela);


window.addEventListener("load", function () {
  const splash = document.getElementById("splashScreen");

  setTimeout(function () {
    if (splash) {
      splash.classList.add("hide");
    }
  }, 2200);
});
