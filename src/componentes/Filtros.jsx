// Em: src/componentes/Filtros.jsx

import React, { useMemo } from 'react';

function Filtros({ transacoes, setFiltroMes, setFiltroCategoria, setFiltroTipo }) {

  // useMemo para otimizar e só recalcular as opções quando as transações mudarem
  const { meses, categorias } = useMemo(() => {
    const mesesUnicos = new Set();
    const categoriasUnicas = new Set();

    transacoes.forEach(t => {
      // Formata a data para "YYYY-MM" para agrupar por mês
      const mes = t.data.slice(0, 7); // Ex: "2025-06"
      mesesUnicos.add(mes);
      categoriasUnicas.add(t.categoria);
    });

    // Converte os Sets para arrays e os ordena
    return {
      meses: [...mesesUnicos].sort().reverse(),
      categorias: [...categoriasUnicas].sort()
    };
  }, [transacoes]);

  const formatarNomeDoMes = (mes) => {
    const [ano, mesNum] = mes.split('-');
    const data = new Date(ano, mesNum - 1);
    return data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const inputStyle = "w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Filtros</h2>
      
      {/* Filtro por Mês */}
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Mês</label>
        <select onChange={(e) => setFiltroMes(e.target.value)} className={inputStyle}>
          <option value="todos">Todos os meses</option>
          {meses.map(mes => (
            <option key={mes} value={mes}>{formatarNomeDoMes(mes)}</option>
          ))}
        </select>
      </div>

      {/* Filtro por Categoria */}
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Categoria</label>
        <select onChange={(e) => setFiltroCategoria(e.target.value)} className={inputStyle}>
          <option value="todas">Todas as categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Filtro por Tipo */}
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Tipo</label>
        <select onChange={(e) => setFiltroTipo(e.target.value)} className={inputStyle}>
          <option value="todos">Receitas e Despesas</option>
          <option value="receita">Apenas Receitas</option>
          <option value="despesa">Apenas Despesas</option>
        </select>
      </div>
    </div>
  );
}

export default Filtros;