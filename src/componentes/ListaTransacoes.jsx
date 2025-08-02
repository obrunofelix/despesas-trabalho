// Importa a biblioteca React e os ícones da biblioteca Heroicons.
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Declaração do componente funcional ListaTransacoes.
// Props:
// - transacoes: um array com os objetos de transação a serem exibidos.
// - carregando: um booleano que indica se os dados ainda estão sendo carregados.
// - onSelecionarParaEditar: uma função a ser chamada quando o botão de editar é clicado.
// - onExcluir: uma função a ser chamada quando o botão de excluir é clicado.
function ListaTransacoes({ transacoes, carregando, onSelecionarParaEditar, onExcluir }) {
  // Se `carregando` for true, exibe uma mensagem de carregamento e interrompe a renderização do resto do componente.
  if (carregando) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
        Carregando...
      </div>
    );
  }

  // Renderização principal do componente.
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Cabeçalho da lista. */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-100">Histórico de Transações</h2>
      </div>

      {/* Renderização condicional: verifica se o array de transações está vazio. */}
      {transacoes.length === 0 ? (
        // Se estiver vazio, exibe uma mensagem informativa.
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          Nenhum lançamento encontrado para os filtros selecionados.
        </p>
      ) : (
        // Se houver transações, renderiza uma lista não ordenada (ul).
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {/* Mapeia o array de transações para criar um item de lista (li) para cada transação. */}
          {transacoes.map((t) => {
            // Determina se a transação é uma receita para aplicar estilos condicionais.
            const ehReceita = t.tipo === 'receita';
            // Formata o valor monetário.
            const valorFormatado = formatadorMoeda.format(t.valor);
            // Formata a data e hora para um formato legível em pt-BR.
            const dataFormatada = new Date(t.data).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <li
                key={t.id} // Chave única para cada item da lista, essencial para o React.
                className="flex items-start justify-between gap-4 p-4 group hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {/* Lado esquerdo: Descrição, categoria e data. */}
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

                {/* Lado direito: Valor e botões de ação. */}
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <span className={`font-bold text-base ${ehReceita ? 'text-green-600' : 'text-red-600'}`}>
                    {valorFormatado}
                  </span>

                  {/* Botões de editar e excluir que aparecem ao passar o mouse (em telas maiores). */}
                  <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelecionarParaEditar(t)}
                      className="p-2 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 min-w-[44px] min-h-[44px]"
                      aria-label="Editar transação"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onExcluir(t.id)}
                      className="p-2 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 min-w-[44px] min-h-[44px]"
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

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ListaTransacoes;
