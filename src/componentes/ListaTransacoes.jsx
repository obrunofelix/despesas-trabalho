import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
        <h2 className="text-lg font-bold text-slate-700">Histórico</h2>
      </div>
      <div className="p-4">
        {transacoes.length === 0 ? (
          <p className="text-center text-slate-500 py-4">
            Nenhum lançamento ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {transacoes.map((t) => {
              const ehReceita = t.tipo === 'receita';
              const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(t.valor);

              return (
                <li
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b border-slate-100 pb-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {t.descricao}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {t.categoria}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(t.data).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span
                      className={`font-bold text-sm ${
                        ehReceita ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {valorFormatado}
                    </span>

                    <div className="flex gap-2 justify-end sm:justify-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}

export default ListaTransacoes;
