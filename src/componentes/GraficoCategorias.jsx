import React, { useMemo } from 'react';
// Importações da biblioteca de gráficos
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Precisamos "registrar" os elementos que o gráfico usará. É um passo obrigatório.
ChartJS.register(ArcElement, Tooltip, Legend, Title);

function GraficoCategorias({ transacoes }) {

  // A lógica do gráfico será memoizada com useMemo para otimização.
  // Ele só vai recalcular os dados quando a lista de transações mudar.
  const dadosDoGrafico = useMemo(() => {
    // 1. Filtrar apenas as despesas
    const despesas = transacoes.filter(t => t.tipo === 'despesa');

    // 2. Agrupar as despesas por categoria e somar os valores
    const gastosPorCategoria = despesas.reduce((acc, transacao) => {
      const { categoria, valor } = transacao;
      // Se a categoria ainda não existe no acumulador, inicializa com 0
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      // Soma o valor da transação atual à categoria correspondente
      acc[categoria] += valor;
      return acc;
    }, {}); // O {} inicial é o nosso objeto acumulador

    // 3. Preparar os dados para o formato que o Chart.js espera
    const labels = Object.keys(gastosPorCategoria); // Ex: ['Alimentação', 'Transporte', ...]
    const data = Object.values(gastosPorCategoria); // Ex: [500, 150, ...]

    return {
      labels,
      datasets: [
        {
          label: 'Despesas por Categoria',
          data,
          backgroundColor: [ // Cores para cada fatia da pizza
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360'
          ],
          borderColor: '#FFF', // Cor da borda entre as fatias
          borderWidth: 2,
        },
      ],
    };
  }, [transacoes]);

  const opcoesDoGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Posição da legenda
      },
      title: {
        display: true,
        text: 'Distribuição de Despesas',
        font: {
          size: 18,
        }
      },
    },
  };

  return (
    // Widget branco com sombra, no mesmo estilo dos outros
    <div className="bg-white rounded-lg shadow-md p-4">
      {transacoes.filter(t => t.tipo === 'despesa').length > 0 ? (
        <Pie data={dadosDoGrafico} options={opcoesDoGrafico} />
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500">Sem dados de despesas para exibir o gráfico.</p>
        </div>
      )}
    </div>
  );
}

export default GraficoCategorias;