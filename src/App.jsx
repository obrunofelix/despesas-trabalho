import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase/configuracao';
import Swal from 'sweetalert2'; // Importe o Swal aqui

// Importando nossos componentes
import FormularioTransacao from './componentes/FormularioTransacao';
import ListaTransacoes from './componentes/ListaTransacoes';
import ResumoFinanceiro from './componentes/ResumoFinanceiro';
import GraficoCategorias from './componentes/GraficoCategorias';
import { ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "transacoes"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setTransacoes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);
  
  // A função de exclusão agora mora aqui!
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
        // LÓGICA CENTRAL: Se o item a ser excluído é o mesmo que está em edição,
        // limpamos o formulário ANTES de excluir.
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicao = () => {
    setTransacaoParaEditar(null);
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1 space-y-6">
            <FormularioTransacao transacaoParaEditar={transacaoParaEditar} onCancelarEdicao={handleCancelarEdicao} />
            <GraficoCategorias transacoes={transacoes} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ResumoFinanceiro transacoes={transacoes} />
            {/* Passamos a nova função de excluir como prop */}
            <ListaTransacoes 
              transacoes={transacoes} 
              carregando={carregando}
              onSelecionarParaEditar={handleSelecionarParaEditar}
              onExcluir={handleExcluir} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;