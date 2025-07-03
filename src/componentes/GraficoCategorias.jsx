import React, { useMemo, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function GraficoCategorias({ transacoes }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detecta o tema lendo a classe do <html>
  useEffect(() => {
    const checkTema = () => {
      const htmlClass = document.documentElement.classList;
      setIsDarkMode(htmlClass.contains('dark'));
    };

    checkTema();

    const observer = new MutationObserver(checkTema);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

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

  const opcoesDoGrafico = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 10,
          color: isDarkMode ? '#E2E8F0' : '#334155' // slate-200 vs slate-700
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
        color: isDarkMode ? '#E2E8F0' : '#334155',
      },
    },
  }), [isDarkMode]);

  const temDespesas = transacoes.some(t => t.tipo === 'despesa');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
      {temDespesas ? (
        <div className="relative h-[300px] sm:h-[400px]">
          <Pie data={dadosDoGrafico} options={opcoesDoGrafico} />
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20">
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Sem dados de despesas para exibir o gráfico.
          </p>
        </div>
      )}
    </div>
  );
}

export default GraficoCategorias;
