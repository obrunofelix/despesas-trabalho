import React, { useState, useEffect } from 'react';
// ✨ 1. Importar a função 'where' do firestore
import { collection, query, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/configuracao';
import Swal from 'sweetalert2';
import { PencilIcon, TrashIcon, ArrowPathIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexto/AuthContext.jsx'; // ✨ 2. Importar o hook de autenticação

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const RecorrenteCard = ({ regra, onEditar, onExcluir }) => {
  const proximoVencimento = `Todo dia ${regra.diaDoMes}`;
  const corValor = regra.tipo === 'receita' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${regra.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
          <ArrowPathIcon className={`h-5 w-5 ${regra.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div>
          <p className="font-bold text-slate-800">{regra.descricao}</p>
          <p className="text-sm text-slate-500">{proximoVencimento}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <p className={`font-bold ${corValor}`}>{formatadorMoeda.format(regra.valor)}</p>
        <div className="flex space-x-2">
          <button onClick={() => onEditar(regra)} className="text-slate-400 hover:text-indigo-600" title="Editar Regra">
            <PencilIcon className="h-5 w-5" />
          </button>
          <button onClick={() => onExcluir(regra.id)} className="text-slate-400 hover:text-red-600" title="Excluir Regra">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PainelRecorrentes = ({ onSelecionarParaEditar, onNovaRecorrenciaClick }) => { 
  const { usuario } = useAuth(); // ✨ 3. Obter o usuário logado
  const [recorrencias, setRecorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(true);

  useEffect(() => {
    // ✨ 4. Não buscar nada se não houver usuário
    if (!usuario) {
        setRecorrencias([]);
        setCarregando(false);
        return;
    }

    // ✨ 5. Adicionar o filtro 'where' para buscar apenas as recorrências do usuário
    const q = query(collection(db, "transacoesRecorrentes"), where("userId", "==", usuario.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setRecorrencias(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false);
    });
    return () => unsubscribe();
  }, [usuario]); // ✨ 6. Adicionar 'usuario' como dependência

  const handleExcluir = async (id) => {
    const confirmacao = await Swal.fire({
      title: 'Excluir esta regra?',
      text: 'As transações já criadas não serão afetadas, mas novas não serão geradas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'transacoesRecorrentes', id));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Regra de recorrência removida!', showConfirmButton: false, timer: 3000 });
      } catch (error) {
        console.error("Erro ao excluir regra:", error);
        Swal.fire('Erro', 'Não foi possível remover a regra.', 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <button onClick={() => setExpandido(!expandido)} className="flex items-center space-x-2 text-left">
            <h2 className="text-lg font-bold text-slate-700">Transações Recorrentes</h2>
            {expandido ? <ChevronUpIcon className="h-5 w-5 text-slate-500"/> : <ChevronDownIcon className="h-5 w-5 text-slate-500"/>}
        </button>
        <button 
          onClick={onNovaRecorrenciaClick}
          className="flex items-center space-x-2 text-sm bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nova</span>
        </button>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="divide-y divide-slate-100 p-1">
          {carregando && <p className="p-4 text-slate-500">Carregando...</p>}
          {!carregando && recorrencias.length === 0 && (
            <p className="p-4 text-center text-slate-500">Nenhuma transação recorrente configurada.</p>
          )}
          {recorrencias.map(regra => (
            <RecorrenteCard 
              key={regra.id} 
              regra={regra} 
              onEditar={onSelecionarParaEditar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PainelRecorrentes;
