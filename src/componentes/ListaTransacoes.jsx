// Importa as dependências necessárias do React e da biblioteca de ícones Heroicons.
import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import PainelBase from './PainelBase'; // Importa o componente base do painel.

// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Declaração do componente funcional ListaTransacoes.
function ListaTransacoes({ transacoes, carregando, onSelecionarParaEditar, onExcluir }) {
  // Estado para controlar se o painel está expandido ou recolhido.
  const [expandido, setExpandido] = useState(true);

  // Se `carregando` for true, exibe uma mensagem de carregamento.
  if (carregando) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
        Carregando...
      </div>
    );
  }

  // Renderização principal do componente.
  return (
    <PainelBase
      titulo={
        // O título agora é um botão que alterna o estado 'expandido'.
        <button onClick={() => setExpandido(!expandido)} className="flex items-center justify-between w-full text-left">
          <span>Histórico de Transações</span>
          {/* Exibe o ícone de chevron para cima ou para baixo dependendo do estado. */}
          {expandido ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
        </button>
      }
    >
      {/* Contêiner do conteúdo que será expandido/recolhido com animação. */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Renderização condicional: verifica se o array de transações está vazio. */}
        {transacoes.length === 0 ? (
          // Se estiver vazio, exibe uma mensagem informativa.
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 px-4">
            Nenhum lançamento encontrado para os filtros selecionados.
          </p>
        ) : (
          // Se houver transações, renderiza uma lista não ordenada (ul).
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {/* Mapeia o array de transações para criar um item de lista (li) para cada transação. */}
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
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-4 p-4 group hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={t.descricao}>
                      {t.descricao}
                    </p>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap gap-1">
                      <span>{t.categoria}</span>
                      <span className="mx-2">|</span>
                      <span className="text-xs">{dataFormatada}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className={`font-bold text-base ${ehReceita ? 'text-green-600' : 'text-red-600'}`}>
                      {valorFormatado}
                    </span>
                    <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onSelecionarParaEditar(t)}
                        className="p-2 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        aria-label="Editar transação"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onExcluir(t.id)}
                        className="p-2 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400"
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
    </PainelBase>
  );
}

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ListaTransacoes;
