import React from 'react';
// As importações do firebase e Swal não são mais necessárias aqui!
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// O componente agora recebe 'onExcluir' como uma prop
function ListaTransacoes({ transacoes, carregando, onSelecionarParaEditar, onExcluir }) {
  
  if (carregando) {
    return <div className="bg-white rounded-lg shadow-md p-4 text-center text-slate-500">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-700">Histórico</h2>
      </div>
      <div className="p-4">
        {transacoes.length === 0 ? (
          <p className="text-center text-slate-500 py-4">Nenhum lançamento ainda.</p>
        ) : (
          <ul className="space-y-2">
            {transacoes.map((t) => {
              const ehReceita = t.tipo === 'receita';
              return (
                <li key={t.id} className="p-2 border-b border-slate-100 flex items-center justify-between group">
                  <div>
                    <p className="font-semibold text-slate-800">{t.descricao}</p>
                    <p className="text-sm text-slate-500">{t.categoria}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(t.data).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold ${ehReceita ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onSelecionarParaEditar(t)} className="p-1 text-slate-400 hover:text-indigo-600"><PencilSquareIcon className="h-5 w-5" /></button>
                      {/* O botão agora chama a função recebida via prop */}
                      <button onClick={() => onExcluir(t.id)} className="p-1 text-slate-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ListaTransacoes;