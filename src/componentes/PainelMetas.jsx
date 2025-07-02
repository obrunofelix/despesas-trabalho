import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/configuracao';
import Swal from 'sweetalert2';
import { PlusCircleIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const MetaCard = ({ meta, onEditar, onExcluir, onAdicionarProgresso }) => {
  const isConcluida = meta.status === 'concluida';
  const isExpirada = meta.status === 'expirada';
  
  let progresso = meta.progresso || 0;
  let valorAtualFormatado = formatadorMoeda.format(meta.valorAtualCalculado || 0);
  let valorAlvoFormatado = formatadorMoeda.format(meta.valorAlvo || 0);
  let textoProgresso;
  let corBarra;
  
  const containerClasses = isExpirada ? 'opacity-60 grayscale' : '';

  switch (meta.tipo) {
    case 'GASTO_LIMITE':
      textoProgresso = `${valorAtualFormatado} gastos de ${valorAlvoFormatado}`;
      if (isConcluida) corBarra = 'bg-red-600'; // Estourou o limite
      else if (progresso > 80) corBarra = 'bg-orange-500';
      else corBarra = 'bg-teal-500';
      break;
    case 'SALDO_MES':
      textoProgresso = `Saldo de ${valorAtualFormatado} de ${valorAlvoFormatado}`;
      if (meta.valorAtualCalculado < 0) progresso = 0;
      corBarra = isConcluida ? 'bg-green-500' : 'bg-sky-500';
      break;
    case 'ECONOMIA':
    default:
      textoProgresso = `${valorAtualFormatado} de ${valorAlvoFormatado}`;
      corBarra = isConcluida ? 'bg-green-500' : 'bg-indigo-500';
      break;
  }
  
  if (isConcluida && meta.tipo !== 'GASTO_LIMITE') textoProgresso = `Meta Concluída!`;
  if (isExpirada) textoProgresso = `Prazo encerrado.`;


  return (
    <div className={`space-y-2 ${containerClasses}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
            {isConcluida && <CheckBadgeIcon className="h-6 w-6 text-green-500" />}
            <h3 className="font-bold text-slate-700">{meta.nome}</h3>
        </div>
        <div className="flex space-x-2 items-center">
           {meta.tipo === 'ECONOMIA' && (
             <button onClick={() => onAdicionarProgresso(meta)} disabled={isConcluida || isExpirada} className="text-slate-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Adicionar Progresso">
               <PlusCircleIcon className="h-6 w-6"/>
             </button>
           )}
           <button onClick={() => onEditar(meta)} disabled={isConcluida || isExpirada} className="text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"><PencilIcon className="h-5 w-5"/></button>
           <button onClick={() => onExcluir(meta.id)} className="text-slate-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
        </div>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`${corBarra} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${progresso > 100 ? 100 : progresso}%` }}
        ></div>
      </div>

      <p className="text-sm text-slate-600 text-right">{textoProgresso}</p>
    </div>
  );
};


const PainelMetas = ({ onNovaMetaClick, onSelecionarMetaParaEditar, transacoes }) => {
  const [metas, setMetas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "metas"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMetas(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);
  
  const metasComProgresso = useMemo(() => {
    if (!transacoes) return [];

    return metas.map(meta => {
      let valorAtualCalculado = meta.valorAtual || 0;
      let status = 'ativa';

      switch (meta.tipo) {
        case 'GASTO_LIMITE':
          valorAtualCalculado = transacoes
            .filter(t => t.tipo === 'despesa' && t.categoria === meta.categoria && t.data.startsWith(meta.mes))
            .reduce((acc, t) => acc + t.valor, 0);
          break;
        case 'SALDO_MES':
          const receitasDoMes = transacoes.filter(t => t.tipo === 'receita' && t.data.startsWith(meta.mes)).reduce((acc, t) => acc + t.valor, 0);
          const despesasDoMes = transacoes.filter(t => t.tipo === 'despesa' && t.data.startsWith(meta.mes)).reduce((acc, t) => acc + t.valor, 0);
          valorAtualCalculado = receitasDoMes - despesasDoMes;
          break;
        default:
          valorAtualCalculado = meta.valorAtual || 0;
          break;
      }
      
      // ✨ Lógica para definir o status da meta
      if (meta.valorAlvo > 0 && valorAtualCalculado >= meta.valorAlvo) {
        status = 'concluida';
      } else if (meta.dataFim && meta.dataFim.toDate() < new Date()) {
        status = 'expirada';
      }

      const progresso = meta.valorAlvo > 0 ? (valorAtualCalculado / meta.valorAlvo) * 100 : 0;
      return { ...meta, valorAtualCalculado, progresso, status };
    });
  }, [metas, transacoes]);
  
  const handleAdicionarProgresso = async (meta) => {
    const { value: valorFinal } = await Swal.fire({
      title: `Adicionar à meta "${meta.nome}"`,
      html: `<input id="swal-input-valor" class="swal2-input" placeholder="R$ 0,00">`,
      confirmButtonText: 'Adicionar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      didOpen: () => {
        const input = document.getElementById('swal-input-valor');
        input.focus();
        input.addEventListener('input', (e) => {
          let valor = e.target.value.replace(/\D/g, '');
          e.target.value = valor ? formatadorMoeda.format(Number(valor) / 100) : '';
        });
      },
      preConfirm: () => {
        const valorLimpo = document.getElementById('swal-input-valor').value.replace(/\D/g, '');
        const valorNumerico = Number(valorLimpo) / 100;
        if (!valorNumerico || valorNumerico <= 0) {
          Swal.showValidationMessage(`Por favor, insira um valor positivo.`);
          return false;
        }
        return valorNumerico;
      }
    });

    if (valorFinal) {
        const metaDocRef = doc(db, 'metas', meta.id);
        const novoValorAtual = (meta.valorAtualCalculado || 0) + valorFinal;

        try {
            await updateDoc(metaDocRef, { valorAtual: increment(valorFinal) });

            // ✨ Lógica de celebração ao atingir a meta
            if (novoValorAtual >= meta.valorAlvo) {
                Swal.fire({
                    title: 'Parabéns!',
                    text: `Você alcançou sua meta "${meta.nome}"!`,
                    icon: 'success',
                    didOpen: () => {
                      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                    }
                });
            } else {
                Swal.fire({
                    toast: true, position: 'top-end', icon: 'success',
                    title: 'Progresso adicionado!',
                    showConfirmButton: false, timer: 3000, timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Erro ao adicionar progresso:", error);
            Swal.fire('Erro', 'Não foi possível atualizar a meta.', 'error');
        }
    }
  };

  const handleExcluirMeta = async (id) => {
    const confirmacao = await Swal.fire({
      title: 'Deseja excluir esta meta?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });
    if (confirmacao.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'metas', id));
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'Meta removida com sucesso!',
          showConfirmButton: false, timer: 3000, timerProgressBar: true,
        });
      } catch (error) {
        console.error("Erro ao excluir meta: ", error);
        Swal.fire('Erro', 'Não foi possível remover a meta.', 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center">
        <button onClick={() => setExpandido(!expandido)} className="flex items-center space-x-2 text-left">
          <h2 className="text-lg font-bold text-slate-700">Minhas Metas</h2>
          {expandido ? <ChevronUpIcon className="h-5 w-5 text-slate-500"/> : <ChevronDownIcon className="h-5 w-5 text-slate-500"/>}
        </button>
        
        <button 
          onClick={onNovaMetaClick}
          className="flex items-center space-x-2 text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nova Meta</span>
        </button>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? 'max-h-screen mt-4' : 'max-h-0'}`}>
        <div className="space-y-3 divide-y divide-slate-100">
            {carregando && <p className="text-slate-500 text-center py-4">Carregando metas...</p>}
            
            {!carregando && metasComProgresso.length === 0 && (
                <p className="text-slate-500 text-center py-4">Você ainda não tem nenhuma meta. Que tal criar uma?</p>
            )}

            {metasComProgresso.map(meta => (
              <div key={meta.id} className="pt-3 first:pt-0">
                <MetaCard 
                  meta={meta} 
                  onEditar={onSelecionarMetaParaEditar} 
                  onExcluir={handleExcluirMeta}
                  onAdicionarProgresso={handleAdicionarProgresso}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PainelMetas;