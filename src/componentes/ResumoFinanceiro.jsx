import React, { useMemo } from 'react';
// Importando ícones para um visual mais profissional
import { ArrowUpCircleIcon, ArrowDownCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

function ResumoFinanceiro({ transacoes }) {
  const { receitas, despesas, saldo } = useMemo(() => {
    const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoes.filter((t) => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const saldo = receitas - despesas;
    return { receitas, despesas, saldo };
  }, [transacoes]);

  // Objeto para estilização dos cards
  const cardStyles = "bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card de Receitas */}
      <div className={cardStyles}>
        <ArrowUpCircleIcon className="h-12 w-12 text-emerald-500" />
        <div>
          <h3 className="text-sm font-medium text-slate-500">Total de Receitas</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatarMoeda(receitas)}</p>
        </div>
      </div>

      {/* Card de Despesas */}
      <div className={cardStyles}>
        <ArrowDownCircleIcon className="h-12 w-12 text-rose-500" />
        <div>
          <h3 className="text-sm font-medium text-slate-500">Total de Despesas</h3>
          <p className="text-2xl font-bold text-rose-600">{formatarMoeda(despesas)}</p>
        </div>
      </div>

      {/* Card de Saldo */}
      <div className={cardStyles}>
        <BanknotesIcon className="h-12 w-12 text-indigo-500" />
        <div>
          <h3 className="text-sm font-medium text-slate-500">Saldo Atual</h3>
          <p className="text-2xl font-bold text-indigo-600">{formatarMoeda(saldo)}</p>
        </div>
      </div>
    </div>
  );
}

export default ResumoFinanceiro;