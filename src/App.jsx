import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase/configuracao';
import Swal from 'sweetalert2';

// Componentes existentes
import ListaTransacoes from './componentes/ListaTransacoes';
import ResumoFinanceiro from './componentes/ResumoFinanceiro';
import GraficoCategorias from './componentes/GraficoCategorias';
import Filtros from './componentes/Filtros';
import ModalTransacao from './componentes/ModalTransacao';
import { ChartBarIcon } from '@heroicons/react/24/solid';

import PainelMetas from './componentes/PainelMetas';
import ModalMeta from './componentes/ModalMeta';

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [modalMetaAberto, setModalMetaAberto] = useState(false);
  const [metaParaEditar, setMetaParaEditar] = useState(null);

  const [filtroMes, setFiltroMes] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    const q = query(collection(db, "transacoes"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setTransacoes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const comparaMes = (dataISO, filtro) => {
    if (filtro === 'todos') return true;
    const data = new Date(dataISO);
    const [anoFiltro, mesFiltro] = filtro.split('-');
    return (
      data.getFullYear() === parseInt(anoFiltro, 10) &&
      data.getMonth() + 1 === parseInt(mesFiltro, 10)
    );
  };

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const passaFiltroMes = comparaMes(t.data, filtroMes);
      const passaFiltroCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria;
      const passaFiltroTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
      return passaFiltroMes && passaFiltroCategoria && passaFiltroTipo;
    });
  }, [transacoes, filtroMes, filtroCategoria, filtroTipo]);

  const handleExcluir = async (idParaExcluir) => {
    const resultado = await Swal.fire({
      title: 'Você tem certeza?',
      text: "Esta ação não poderá ser revertida!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        if (transacaoParaEditar?.id === idParaExcluir) {
          setTransacaoParaEditar(null);
        }
        await deleteDoc(doc(db, "transacoes", idParaExcluir));
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Transação excluída!',
          showConfirmButton: false,
          timer: 3000,
        });
      } catch (error) {
        console.error("Erro ao excluir: ", error);
        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a transação.', 'error');
      }
    }
  };

  const handleSelecionarParaEditar = (transacao) => {
    setTransacaoParaEditar(transacao);
    setModalAberto(true);
  };

  const handleCancelarEdicao = () => {
    setTransacaoParaEditar(null);
    setModalAberto(false);
  };

  const abrirModalParaNovaTransacao = () => {
    setTransacaoParaEditar(null);
    setFiltroMes('todos');
    setFiltroCategoria('todas');
    setFiltroTipo('todos');
    setModalAberto(true);
  };

  const abrirModalNovaMeta = () => {
    setMetaParaEditar(null);
    setModalMetaAberto(true);
  };
  
  const handleSelecionarMetaParaEditar = (meta) => {
    setMetaParaEditar(meta);
    setModalMetaAberto(true);
  };
  
  const handleCancelarEdicaoMeta = () => {
    setMetaParaEditar(null);
    setModalMetaAberto(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white">Dashboard Financeiro</h1>
          </div>
        </div>
      </header>

      <div className="flex justify-end sm:justify-between items-center flex-wrap gap-2 mt-4 px-4 sm:px-6 lg:px-8">
        <button 
          onClick={abrirModalParaNovaTransacao}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm sm:text-base"
        >
          Adicionar Transação
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <ResumoFinanceiro transacoes={transacoesFiltradas} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1 md:col-span-2 space-y-6">
            <PainelMetas 
              onNovaMetaClick={abrirModalNovaMeta} 
              onSelecionarMetaParaEditar={handleSelecionarMetaParaEditar}
              transacoes={transacoes}
            />
            <GraficoCategorias transacoes={transacoesFiltradas} />
          </div>

          <div className="lg:col-span-2 md:col-span-2 space-y-6">
            <Filtros 
              transacoes={transacoes}
              setFiltroMes={setFiltroMes}
              setFiltroCategoria={setFiltroCategoria}
              setFiltroTipo={setFiltroTipo}
            />
            {carregando ? (
              <div className="bg-white rounded-lg shadow-md p-4 text-center text-slate-500 flex justify-center items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Carregando...</span>
              </div>
            ) : (
              <ListaTransacoes 
                transacoes={transacoesFiltradas}
                carregando={carregando}
                onSelecionarParaEditar={handleSelecionarParaEditar}
                onExcluir={handleExcluir}
              />
            )}
          </div>
        </div>
      </main>

      <ModalTransacao 
        aberto={modalAberto}
        aoFechar={handleCancelarEdicao}
        transacaoParaEditar={transacaoParaEditar}
        onCancelarEdicao={handleCancelarEdicao}
      />
      
      <ModalMeta 
        aberto={modalMetaAberto}
        aoFechar={handleCancelarEdicaoMeta}
        metaParaEditar={metaParaEditar}
      />
    </div>
  );
}

export default App;