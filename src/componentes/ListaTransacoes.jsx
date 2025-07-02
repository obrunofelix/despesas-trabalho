import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// ✨ Criamos a instância do formatador fora do componente.
// Ele é criado apenas uma vez e reutilizado, melhorando a performance.
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function ListaTransacoes({ transacoes, carregando, onSelecionarParaEditar, onExcluir }) {
  if (carregando) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 text-center text-slate-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-700">Histórico de Transações</h2>
      </div>
      
      {transacoes.length === 0 ? (
        <p className="text-center text-slate-500 py-8">
          Nenhum lançamento encontrado para os filtros selecionados.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transacoes.map((t) => {
            const ehReceita = t.tipo === 'receita';
            const valorFormatado = formatadorMoeda.format(t.valor);
            const dataFormatada = new Date(t.data).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <li key={t.id} className="flex items-center justify-between gap-4 p-4 group hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate" title={t.descricao}>
                    {t.descricao}
                  </p>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <span>{t.categoria}</span>
                    <span className="mx-2">|</span>
                    <span className="text-xs">{dataFormatada}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`font-bold text-base ${ehReceita ? 'text-green-600' : 'text-red-600'}`}>
                    {valorFormatado}
                  </span>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelecionarParaEditar(t)}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                      aria-label="Editar transação"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onExcluir(t.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      aria-label="Excluir transação"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListaTransacoes;