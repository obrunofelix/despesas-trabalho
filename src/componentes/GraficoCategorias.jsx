import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function GraficoCategorias({ transacoes }) {
  const dadosDoGrafico = useMemo(() => {
    const despesas = transacoes.filter(t => t.tipo === 'despesa');

    const gastosPorCategoria = despesas.reduce((acc, transacao) => {
      const { categoria, valor } = transacao;
      acc[categoria] = (acc[categoria] || 0) + valor;
      return acc;
    }, {});

    const labels = Object.keys(gastosPorCategoria);
    const data = Object.values(gastosPorCategoria);

    return {
      labels,
      datasets: [
        {
          label: 'Despesas por Categoria',
          data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360'
          ],
          borderColor: '#FFF',
          borderWidth: 2,
        },
      ],
    };
  }, [transacoes]);

  const opcoesDoGrafico = {
    responsive: true,
    maintainAspectRatio: false, // Permite o gráfico ocupar altura personalizada
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 10,
        }
      },
      title: {
        display: true,
        text: 'Distribuição de Despesas',
        font: {
          size: 18,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
  };

  const temDespesas = transacoes.some(t => t.tipo === 'despesa');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {temDespesas ? (
        <div className="relative h-[300px] sm:h-[400px]">
          <Pie data={dadosDoGrafico} options={opcoesDoGrafico} />
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20">
          <p className="text-slate-500 text-sm sm:text-base">
            Sem dados de despesas para exibir o gráfico.
          </p>
        </div>
      )}
    </div>
  );
}

export default GraficoCategorias;
