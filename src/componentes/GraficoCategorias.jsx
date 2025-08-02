// Importa as dependências necessárias do React e da biblioteca de gráficos.
import React, { useMemo, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2'; // O componente de gráfico de pizza.
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'; // Módulos específicos do Chart.js.
import PainelBase from './PainelBase'; // O componente de layout base para painéis.

// Registra os módulos do Chart.js que serão utilizados no gráfico de pizza.
// Isso é necessário para que o Chart.js saiba quais elementos desenhar.
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Declaração do componente funcional GraficoCategorias.
function GraficoCategorias({ transacoes }) {
  // Estado para rastrear se o modo escuro está ativo, para ajustar as cores do gráfico.
  const [isDarkMode, setIsDarkMode] = useState(false);

  // useEffect para detectar a mudança de tema (claro/escuro) na aplicação.
  useEffect(() => {
    // Função que verifica se a classe 'dark' está presente no elemento <html>.
    const checkTema = () => {
      const htmlClass = document.documentElement.classList;
      setIsDarkMode(htmlClass.contains('dark'));
    };

    checkTema(); // Verifica o tema assim que o componente é montado.

    // MutationObserver observa mudanças nos atributos do elemento <html>.
    // Quando a classe muda, ele chama `checkTema` novamente para atualizar o estado.
    const observer = new MutationObserver(checkTema);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Função de limpeza: desconecta o observer quando o componente é desmontado para evitar vazamentos de memória.
    return () => observer.disconnect();
  }, []); // O array de dependências vazio garante que este efeito rode apenas uma vez na montagem.

  // useMemo para processar e memorizar os dados do gráfico.
  // O cálculo só é refeito se a prop `transacoes` mudar, otimizando o desempenho.
  const dadosDoGrafico = useMemo(() => {
    // Filtra apenas as transações que são do tipo 'despesa'.
    const despesas = transacoes.filter(t => t.tipo === 'despesa');

    // Usa `reduce` para agrupar as despesas por categoria e somar seus valores.
    const gastosPorCategoria = despesas.reduce((acc, transacao) => {
      const { categoria, valor } = transacao;
      acc[categoria] = (acc[categoria] || 0) + valor; // Soma o valor à categoria correspondente.
      return acc;
    }, {});

    // Extrai os nomes das categorias (labels) e os valores somados (data) do objeto.
    const labels = Object.keys(gastosPorCategoria);
    const data = Object.values(gastosPorCategoria);

    // Retorna o objeto de dados no formato esperado pelo Chart.js.
    return {
      labels,
      datasets: [
        {
          label: 'Despesas por Categoria',
          data,
          backgroundColor: [ // Paleta de cores para as fatias do gráfico.
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360'
          ],
          borderColor: '#FFF',
          borderWidth: 2,
        },
      ],
    };
  }, [transacoes]); // Dependência do useMemo.

  // useMemo para memorizar as opções de configuração do gráfico.
  // As opções são recalculadas apenas se o estado `isDarkMode` mudar.
  const opcoesDoGrafico = useMemo(() => ({
    responsive: true, // O gráfico se ajusta ao tamanho do contêiner.
    maintainAspectRatio: false, // Permite que o gráfico preencha a altura do contêiner.
    plugins: {
      legend: {
        position: 'top', // Posição da legenda.
        labels: {
          padding: 10,
          // A cor do texto da legenda muda dinamicamente com o tema.
          color: isDarkMode ? '#E2E8F0' : '#334155',
        },
      },
      title: {
        display: false, // Oculta o título padrão do gráfico, pois já usamos o do PainelBase.
      },
    },
  }), [isDarkMode]); // Dependência do useMemo.

  // Verifica se existe pelo menos uma despesa para decidir se o gráfico deve ser renderizado.
  const temDespesas = transacoes.some(t => t.tipo === 'despesa');

  // Renderização do JSX do componente.
  return (
    <PainelBase titulo="Distribuição de Despesas">
      {/* Renderização condicional. */}
      {temDespesas ? (
        // Se houver despesas, renderiza o gráfico de pizza.
        <div className="relative h-[300px] sm:h-[400px]">
          <Pie data={dadosDoGrafico} options={opcoesDoGrafico} />
        </div>
      ) : (
        // Se não houver despesas, exibe uma mensagem informativa.
        <div className="text-center py-12 sm:py-20">
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Sem dados de despesas para exibir o gráfico.
          </p>
        </div>
      )}
    </PainelBase>
  );
}

// Exporta o componente para ser utilizado em outras partes da aplicação.
export default GraficoCategorias;
