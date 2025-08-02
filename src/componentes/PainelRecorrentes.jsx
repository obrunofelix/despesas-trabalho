// Importa as dependências necessárias do React, Firebase e outras bibliotecas.
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/configuracao'; // Instância do Firestore.
import Swal from 'sweetalert2'; // Para alertas e modais.
import { PlusCircleIcon, TrashIcon, PencilIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'; // Ícones.
import { useAuth } from '../contexto/AuthContext.jsx'; // Hook para autenticação.
import PainelBase from './PainelBase'; // Componente base para painéis.

// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Componente para renderizar um único card de transação recorrente.
const RecorrenteCard = ({ regra, onEditar, onExcluir }) => {
  // Define a cor do texto e do fundo com base no tipo da transação (receita ou despesa).
  const cor = regra.tipo === 'receita' ? 'text-green-600' : 'text-red-600';
  const corBg = regra.tipo === 'receita' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const vencimento = `Todo dia ${regra.diaDoMes}`;

  return (
    <div className="flex items-center justify-between p-3">
      {/* Lado esquerdo do card: ícone, descrição e data de vencimento. */}
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${corBg}`}>
          <ArrowPathIcon className={`h-5 w-5 ${cor}`} />
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{regra.descricao}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{vencimento}</p>
        </div>
      </div>

      {/* Lado direito do card: valor e botões de ação (editar/excluir). */}
      <div className="flex items-center space-x-3">
        <p className={`font-bold ${cor}`}>{formatadorMoeda.format(regra.valor)}</p>
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

// Componente principal do painel de transações recorrentes.
const PainelRecorrentes = ({ onSelecionarParaEditar, onNovaRecorrenciaClick }) => {
  // Obtém o usuário logado do contexto de autenticação.
  const { usuario } = useAuth();
  // Estado para armazenar a lista de regras de recorrência.
  const [recorrencias, setRecorrencias] = useState([]);
  // Estado para controlar o indicador de carregamento.
  const [carregando, setCarregando] = useState(true);
  // Estado para controlar se o painel está expandido ou recolhido.
  const [expandido, setExpandido] = useState(false);

  // useEffect para buscar as regras de recorrência do usuário em tempo real.
  useEffect(() => {
    // Se não houver usuário, não faz nada.
    if (!usuario) return;

    // Cria uma query para buscar as recorrências do usuário logado.
    const q = query(collection(db, 'transacoesRecorrentes'), where('userId', '==', usuario.uid));
    // onSnapshot "escuta" as mudanças na coleção em tempo real.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Atualiza o estado com a nova lista de recorrências.
      setRecorrencias(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false); // Finaliza o carregamento.
    });

    // Função de limpeza: cancela a "escuta" quando o componente é desmontado.
    return () => unsubscribe();
  }, [usuario]); // O efeito depende do objeto `usuario`.

  // Função assíncrona para lidar com a exclusão de uma regra de recorrência.
  const handleExcluir = async (id) => {
    // Exibe um modal de confirmação antes de excluir.
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
        // Exclui o documento do Firestore.
        await deleteDoc(doc(db, 'transacoesRecorrentes', id));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Regra de recorrência removida!', timer: 3000, showConfirmButton: false });
      } catch (err) {
        // Em caso de erro, exibe uma mensagem no console e um alerta para o usuário.
        console.error(err);
        Swal.fire('Erro', 'Não foi possível remover a regra.', 'error');
      }
    }
  };

  // Renderização do JSX do componente.
  return (
    // Utiliza o PainelBase para manter a consistência visual.
    <PainelBase
      titulo={
        // O título é um botão que controla o estado de expansão do painel.
        <button onClick={() => setExpandido(!expandido)} className="flex items-center space-x-2 text-left">
          <span>Transações Recorrentes</span>
          {expandido ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
        </button>
      }
      botaoAcao={
        // Botão para abrir o modal de criação de uma nova recorrência.
        <button
          onClick={onNovaRecorrenciaClick}
          className="cursor-pointer flex items-center space-x-2 text-sm bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700"
        >
          <PlusCircleIcon className="h-5 w-5 mx-auto" />
          <span className="cursor-pointer hidden sm:inline">Nova</span>
        </button>
      }
    >
      {/* O conteúdo do painel, que é exibido ou ocultado com base no estado `expandido`. */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="divide-y divide-slate-100 dark:divide-slate-700 p-4 space-y-3">
          {/* Renderização condicional: mostra mensagem de carregamento. */}
          {carregando && (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">Carregando...</p>
          )}
          {/* Renderização condicional: mostra mensagem se não houver recorrências. */}
          {!carregando && recorrencias.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma transação recorrente configurada.</p>
          )}
          {/* Mapeia a lista de recorrências para renderizar um RecorrenteCard para cada uma. */}
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
    </PainelBase>
  );
};

// Exporta o componente.
export default PainelRecorrentes;
