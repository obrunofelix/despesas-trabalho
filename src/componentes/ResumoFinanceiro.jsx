// Importa as dependências necessárias do React e da biblioteca de ícones Heroicons.
import React, { useMemo, useState } from 'react';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, ScaleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Função auxiliar para formatar um número para o padrão de moeda brasileiro (BRL).
const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// Componente para renderizar o valor ou um placeholder, mantendo a cor.
const ValorVisivel = ({ valor, cor, visivel }) => {
  if (visivel) {
    return <p className={`text-2xl font-bold ${cor}`}>{formatarMoeda(valor)}</p>;
  }
  // Quando não está visível, exibe o placeholder com a mesma cor que o valor teria.
  return <p className={`text-2xl font-bold ${cor}`}>R$ ●●●●●</p>;
};


// Declaração do componente funcional ResumoFinanceiro, que recebe a lista de transações como prop.
function ResumoFinanceiro({ transacoes }) {
  // Estado para controlar a visibilidade dos saldos.
  const [saldoVisivel, setSaldoVisivel] = useState(true);

  // O hook useMemo é usado para otimizar o desempenho.
  // O cálculo de receitas, despesas e saldo só será refeito se a prop `transacoes` mudar.
  const { receitas, despesas, saldo } = useMemo(() => {
    const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoes.filter((t) => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]);

  // Constante para armazenar as classes do Tailwind CSS para os cards.
  const cardStyles =
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm flex items-center space-x-4";

  // Renderização do JSX do componente.
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      {/* Cabeçalho com o título e o botão para alternar a visibilidade */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-100">Resumo Financeiro</h2>
        <button
          onClick={() => setSaldoVisivel(!saldoVisivel)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label={saldoVisivel ? "Ocultar saldos" : "Mostrar saldos"}
        >
          {saldoVisivel ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Grid com os cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* Card para exibir o total de receitas. */}
        <div className={cardStyles}>
          <ArrowUpCircleIcon className="h-12 w-12 text-emerald-500 flex-shrink-0" aria-label="Ícone de receitas" />
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Receitas</h3>
            <ValorVisivel valor={receitas} cor="text-emerald-600" visivel={saldoVisivel} />
          </div>
        </div>

        {/* Card para exibir o total de despesas. */}
        <div className={cardStyles}>
          <ArrowDownCircleIcon className="h-12 w-12 text-rose-500 flex-shrink-0" aria-label="Ícone de despesas" />
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Despesas</h3>
            <ValorVisivel valor={despesas} cor="text-rose-600" visivel={saldoVisivel} />
          </div>
        </div>

        {/* Card para exibir o saldo atual. */}
        <div className={cardStyles}>
          <ScaleIcon className="h-12 w-12 text-indigo-500 flex-shrink-0" aria-label="Ícone de saldo" />
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Atual</h3>
            <ValorVisivel valor={saldo} cor={saldo >= 0 ? 'text-indigo-600' : 'text-rose-600'} visivel={saldoVisivel} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ResumoFinanceiro;