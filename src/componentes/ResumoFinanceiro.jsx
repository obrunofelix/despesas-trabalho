// Importa as dependências necessárias do React e da biblioteca de ícones Heroicons.
import React, { useMemo } from 'react';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, ScaleIcon } from '@heroicons/react/24/outline';

// Função auxiliar para formatar um número para o padrão de moeda brasileiro (BRL).
const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// Declaração do componente funcional ResumoFinanceiro, que recebe a lista de transações como prop.
function ResumoFinanceiro({ transacoes }) {
  // O hook useMemo é usado para otimizar o desempenho.
  // O cálculo de receitas, despesas e saldo só será refeito se a prop `transacoes` mudar.
  const { receitas, despesas, saldo } = useMemo(() => {
    // Calcula o total de receitas filtrando as transações do tipo 'receita' e somando seus valores.
    const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    // Calcula o total de despesas filtrando as transações do tipo 'despesa' e somando seus valores.
    const despesas = transacoes.filter((t) => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    // Retorna um objeto com os totais calculados e o saldo (receitas - despesas).
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]); // O array de dependências que dispara o recálculo.

  // Constante para armazenar as classes do Tailwind CSS, evitando repetição e facilitando a manutenção.
  const cardStyles =
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm flex items-center space-x-4";

  // Renderização do JSX do componente.
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card para exibir o total de receitas. */}
      <div className={cardStyles}>
        <ArrowUpCircleIcon className="h-12 w-12 text-emerald-500" aria-label="Ícone de receitas" />
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Receitas</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatarMoeda(receitas)}</p>
        </div>
      </div>

      {/* Card para exibir o total de despesas. */}
      <div className={cardStyles}>
        <ArrowDownCircleIcon className="h-12 w-12 text-rose-500" aria-label="Ícone de despesas" />
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Despesas</h3>
          <p className="text-2xl font-bold text-rose-600">{formatarMoeda(despesas)}</p>
        </div>
      </div>

      {/* Card para exibir o saldo atual. */}
      <div className={cardStyles}>
        <ScaleIcon className="h-12 w-12 text-indigo-500" aria-label="Ícone de saldo" />
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Atual</h3>
          {/* A cor do texto do saldo muda condicionalmente: azul para positivo/zero, vermelho para negativo. */}
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ResumoFinanceiro;
