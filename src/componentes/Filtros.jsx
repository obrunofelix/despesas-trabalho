// Importa as dependências necessárias do React e da biblioteca de ícones Heroicons.
import React, { useMemo, useState } from 'react';
import { FunnelIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Define um array de objetos com predefinições de filtros de data para acesso rápido.
const presetsDeData = [
  { id: 'este_mes', texto: 'Este Mês' },
  { id: 'ultimo_mes', texto: 'Mês Passado' },
  { id: 'ultimos_3_meses', texto: 'Últimos 3 Meses' },
  { id: 'este_ano', texto: 'Este Ano' },
];

// Declaração do componente funcional Filtros, que recebe props para gerenciar o estado dos filtros.
function Filtros({ transacoes, filtros, setters, onLimparFiltros }) {
  // Desestrutura os valores e funções dos filtros e setters recebidos via props.
  const { dataInicio, dataFim, filtroCategoria, filtroTipo } = filtros;
  const { setDataInicio, setDataFim, setFiltroCategoria, setFiltroTipo } = setters;

  // Estado local para rastrear qual botão de predefinição de data está ativo.
  const [presetAtivo, setPresetAtivo] = useState(null);

  // useMemo é usado para otimizar o cálculo da lista de categorias.
  // Ele só recalcula a lista quando a prop `transacoes` mudar.
  const categorias = useMemo(() => {
    const categoriasUnicas = new Set(); // Usa um Set para evitar categorias duplicadas.
    transacoes.forEach(t => categoriasUnicas.add(t.categoria)); // Adiciona cada categoria ao Set.
    return [...categoriasUnicas].sort(); // Converte o Set para um array e o ordena.
  }, [transacoes]);

  // Função para lidar com o clique nos botões de predefinição de data.
  const handlePresetClick = (presetId) => {
    const hoje = new Date();
    let inicio = new Date();
    let fim = new Date();

    // Um switch para definir as datas de início e fim com base no ID da predefinição.
    switch (presetId) {
      case 'este_mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'ultimo_mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'ultimos_3_meses':
        inicio.setMonth(hoje.getMonth() - 3);
        fim = hoje;
        break;
      case 'este_ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = hoje;
        break;
      default:
        break;
    }

    // Atualiza o estado dos filtros de data no componente pai.
    setDataInicio(inicio.toISOString().slice(0, 10));
    setDataFim(fim.toISOString().slice(0, 10));
    // Define o preset clicado como ativo para estilização.
    setPresetAtivo(presetId);
  };

  // Função para lidar com a mudança manual das datas nos inputs.
  const handleDataManualChange = (setter, valor) => {
    setter(valor); // Atualiza a data.
    setPresetAtivo(null); // Reseta o preset ativo, já que a seleção agora é manual.
  };

  // Função para limpar todos os filtros.
  const handleLimparTudo = () => {
    onLimparFiltros(); // Chama a função de limpeza do componente pai.
    setPresetAtivo(null); // Reseta o preset ativo.
  };

  // Constantes para armazenar as classes do Tailwind CSS, facilitando a reutilização e manutenção.
  const inputStyle = "w-full p-2 bg-slate-100 text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600";
  const labelStyle = "text-sm font-medium text-slate-600 dark:text-slate-200 mb-1 block";
  const presetButtonStyle = "px-3 py-1 text-sm rounded-full cursor-pointer transition-colors";
  const presetActiveStyle = "bg-indigo-600 text-white font-semibold";
  const presetInactiveStyle = "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600";

  // Renderização do JSX do componente.
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 space-y-4">
      {/* Cabeçalho da seção de filtros com título e botão de limpar. */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-100">Filtros</h2>
        </div>
        <button
          onClick={handleLimparTudo}
          className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-semibold"
        >
          <XCircleIcon className="h-5 w-5" />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Seção com botões de predefinição de período. */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-200">Períodos Rápidos:</p>
        {/* Mapeia o array de presets para renderizar cada botão. */}
        {presetsDeData.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            // Aplica estilos diferentes se o botão estiver ativo ou não.
            className={`${presetButtonStyle} ${presetAtivo === preset.id ? presetActiveStyle : presetInactiveStyle}`}
          >
            {preset.texto}
          </button>
        ))}
      </div>

      {/* Seção com os inputs de filtro manual. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        {/* Input para a data de início. */}
        <div>
          <label htmlFor="data-inicio" className={labelStyle}>De:</label>
          <input
            type="date"
            id="data-inicio"
            value={dataInicio || ''}
            onChange={(e) => handleDataManualChange(setDataInicio, e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* Input para a data de fim. */}
        <div>
          <label htmlFor="data-fim" className={labelStyle}>Até:</label>
          <input
            type="date"
            id="data-fim"
            value={dataFim || ''}
            onChange={(e) => handleDataManualChange(setDataFim, e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* Dropdown para selecionar a categoria. */}
        <div>
          <label htmlFor="categoria" className={labelStyle}>Categoria</label>
          <select id="categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className={inputStyle}>
            <option value="todas">Todas as categorias</option>
            {/* Mapeia as categorias calculadas para criar as opções do dropdown. */}
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Dropdown para selecionar o tipo de transação. */}
        <div>
          <label htmlFor="tipo" className={labelStyle}>Tipo</label>
          <select id="tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={inputStyle}>
            <option value="todos">Receitas e Despesas</option>
            <option value="receita">Apenas Receitas</option>
            <option value="despesa">Apenas Despesas</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default Filtros;