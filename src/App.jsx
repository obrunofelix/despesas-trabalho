import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase/configuracao';
import Swal from 'sweetalert2';

import ListaTransacoes from './componentes/ListaTransacoes';
import ResumoFinanceiro from './componentes/ResumoFinanceiro';
import GraficoCategorias from './componentes/GraficoCategorias';
import Filtros from './componentes/Filtros';
import ModalTransacao from './componentes/ModalTransacao';
import { ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

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

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const passaFiltroMes = filtroMes === 'todos' || t.data.startsWith(filtroMes);
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
        if (transacaoParaEditar && transacaoParaEditar.id === idParaExcluir) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Dashboard Financeiro</h1>
          </div>
        </div>
      </header>

      <div className="flex justify-end mt-4 px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => {
            setTransacaoParaEditar(null);
            setModalAberto(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Adicionar Transação
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ResumoFinanceiro transacoes={transacoes} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Coluna Esquerda: Apenas o gráfico agora */}
          <div className="lg:col-span-1 space-y-6">
            <GraficoCategorias transacoes={transacoes} />
          </div>

          {/* Coluna Direita: Filtros e Lista de Transações */}
          <div className="lg:col-span-2 space-y-6">
            <Filtros 
              transacoes={transacoes}
              setFiltroMes={setFiltroMes}
              setFiltroCategoria={setFiltroCategoria}
              setFiltroTipo={setFiltroTipo}
            />
            <ListaTransacoes 
              transacoes={transacoesFiltradas}
              carregando={carregando}
              onSelecionarParaEditar={handleSelecionarParaEditar}
              onExcluir={handleExcluir}
            />
          </div>
        </div>
      </main>

      <ModalTransacao 
        aberto={modalAberto}
        aoFechar={handleCancelarEdicao}
        transacaoParaEditar={transacaoParaEditar}
        onCancelarEdicao={handleCancelarEdicao}
      />
    </div>
  );
}

export default App;
