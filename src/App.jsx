// src/App.jsx

// Importa as dependências necessárias do React, Firebase, bibliotecas de UI e componentes locais.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs, where, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/configuracao'; // Configuração do Firebase.
import Swal from 'sweetalert2'; // Para alertas e modais.
import { useAuth } from './contexto/AuthContext.jsx'; // Hook para autenticação.
import Login from './componentes/Login.jsx'; // Componente de Login.
import ListaTransacoes from './componentes/ListaTransacoes';
import ResumoFinanceiro from './componentes/ResumoFinanceiro';
import GraficoCategorias from './componentes/GraficoCategorias';
import Filtros from './componentes/Filtros';
import ModalTransacao from './componentes/ModalTransacao';
import { ChartBarIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid'; // Ícones.
import PainelMetas from './componentes/PainelMetas';
import ModalMeta from './componentes/ModalMeta';
import ModalRecorrente from './componentes/ModalRecorrente';
import PainelRecorrentes from './componentes/PainelRecorrentes';
import { useTema } from './contexto/TemaContext'; // Hook para o tema (claro/escuro).

// Componente principal da aplicação.
function App() {
  // === ESTADOS E CONTEXTOS ===
  const { usuario, logout } = useAuth(); // Obtém o usuário logado e a função de logout do contexto.
  const { temaEscuro, setTemaEscuro } = useTema(); // Obtém o estado do tema.

  // Estados para dados da aplicação.
  const [transacoes, setTransacoes] = useState([]); // Armazena a lista de todas as transações do usuário.
  const [carregando, setCarregando] = useState(true); // Indica se os dados iniciais estão sendo carregados.

  // Estados para controle dos modais.
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState(null);
  const [modalMetaAberto, setModalMetaAberto] = useState(false);
  const [metaParaEditar, setMetaParaEditar] = useState(null);
  const [modalRecorrenteAberto, setModalRecorrenteAberto] = useState(false);
  const [recorrenciaParaEditar, setRecorrenciaParaEditar] = useState(null);

  // Estados para os filtros.
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Estados para controle da UI.
  const [mostrarBotaoFlutuante, setMostrarBotaoFlutuante] = useState(true);
  const [abaMobile, setAbaMobile] = useState('grafico'); // Controla a aba ativa em telas pequenas.

  // Refs para armazenar valores que não precisam re-renderizar o componente.
  const recorrenciasProcessadas = useRef(false); // Evita que o processamento de recorrências rode múltiplas vezes.
  const ultimaPosicaoScroll = useRef(0); // Armazena a última posição do scroll para o efeito do botão flutuante.

  // === EFEITOS (useEffect) ===

  // Efeito para mostrar/esconder o botão flutuante com base na direção do scroll.
  useEffect(() => {
    const handleScroll = () => {
      const scrollAtual = window.scrollY;
      // Se o scroll for para baixo, esconde o botão. Se for para cima, mostra.
      if (scrollAtual > ultimaPosicaoScroll.current) {
        setMostrarBotaoFlutuante(false);
      } else {
        setMostrarBotaoFlutuante(true);
      }
      ultimaPosicaoScroll.current = scrollAtual;
    };
    window.addEventListener('scroll', handleScroll);
    // Função de limpeza: remove o listener quando o componente é desmontado.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito para processar transações recorrentes uma única vez após o login.
  useEffect(() => {
    // Só executa se houver um usuário e se as recorrências ainda não foram processadas.
    if (!usuario || recorrenciasProcessadas.current) return;

    const processarRecorrencias = async () => {
      const hoje = new Date();
      // Busca todas as regras de recorrência ativas do usuário.
      const q = query(collection(db, "transacoesRecorrentes"), where("ativa", "==", true), where("userId", "==", usuario.uid));
      const querySnapshot = await getDocs(q);
      const promessas = []; // Array para armazenar as operações de escrita no banco.

      querySnapshot.forEach((docRecorrente) => {
        const regra = { id: docRecorrente.id, ...docRecorrente.data() };
        const ultimoRegistro = regra.ultimoRegistro ? regra.ultimoRegistro.toDate() : null;
        let deveCriar = false;

        // Lógica para decidir se uma nova transação deve ser criada este mês.
        if (!ultimoRegistro) { // Se nunca foi registrada.
          if (hoje.getDate() >= regra.diaDoMes) deveCriar = true;
        } else { // Se já foi registrada antes.
          const noMesmoMes = hoje.getMonth() === ultimoRegistro.getMonth() && hoje.getFullYear() === ultimoRegistro.getFullYear();
          if (!noMesmoMes && hoje.getDate() >= regra.diaDoMes) deveCriar = true;
        }

        if (deveCriar) {
          // Cria o objeto da nova transação.
          const dataDaTransacao = new Date(hoje.getFullYear(), hoje.getMonth(), regra.diaDoMes);
          const novaTransacao = {
            descricao: `${regra.descricao} (Recorrente)`,
            valor: regra.valor,
            tipo: regra.tipo,
            categoria: regra.categoria,
            data: dataDaTransacao.toISOString(),
            userId: usuario.uid,
          };

          // Adiciona as promessas de criar a transação e atualizar a regra de recorrência.
          promessas.push(addDoc(collection(db, 'transacoes'), novaTransacao));
          promessas.push(updateDoc(doc(db, 'transacoesRecorrentes', regra.id), { ultimoRegistro: new Date() }));
        }
      });

      // Executa todas as operações de escrita no banco de uma vez.
      if (promessas.length > 0) await Promise.all(promessas);
    };

    processarRecorrencias();
    recorrenciasProcessadas.current = true; // Marca como processado.
  }, [usuario]);

  // Efeito para buscar as transações do usuário em tempo real.
  useEffect(() => {
    if (!usuario) {
      setTransacoes([]);
      setCarregando(false);
      return;
    }

    // Cria uma query para buscar as transações do usuário logado, ordenadas por data.
    const q = query(collection(db, "transacoes"), where("userId", "==", usuario.uid), orderBy("data", "desc"));
    // onSnapshot "escuta" as mudanças na coleção em tempo real.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Atualiza o estado com as novas transações.
      setTransacoes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setCarregando(false);
    });
    // Função de limpeza: cancela a "escuta" quando o componente é desmontado.
    return () => unsubscribe();
  }, [usuario]);

  // === MEMOIZAÇÃO (useMemo) ===

  // useMemo para otimizar a filtragem das transações.
  // A lista só é recalculada se uma das dependências (transacoes ou filtros) mudar.
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      const dataFimAjustada = dataFim ? new Date(dataFim) : null;
      if (dataFimAjustada) dataFimAjustada.setHours(23, 59, 59, 999); // Garante que o dia final seja incluído.

      const passaFiltroData = (!dataInicio || dataTransacao >= new Date(dataInicio)) && (!dataFimAjustada || dataTransacao <= dataFimAjustada);
      const passaFiltroCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria;
      const passaFiltroTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;

      return passaFiltroData && passaFiltroCategoria && passaFiltroTipo;
    });
  }, [transacoes, dataInicio, dataFim, filtroCategoria, filtroTipo]);

  // === FUNÇÕES DE MANIPULAÇÃO (Handlers) ===

  // Função para excluir uma transação.
  const handleExcluir = async (idParaExcluir) => {
    const resultado = await Swal.fire({
      title: 'Você tem certeza?', text: "Esta ação não poderá ser revertida!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar'
    });
    if (resultado.isConfirmed) {
      try {
        if (transacaoParaEditar?.id === idParaExcluir) setTransacaoParaEditar(null);
        await deleteDoc(doc(db, "transacoes", idParaExcluir));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Transação excluída!', showConfirmButton: false, timer: 3000 });
      } catch (error) {
        console.error("Erro ao excluir: ", error);
        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a transação.', 'error');
      }
    }
  };

  // Funções para abrir e fechar modais e limpar estados.
  const handleSelecionarParaEditar = (transacao) => { setTransacaoParaEditar(transacao); setModalAberto(true); };
  const handleCancelarEdicao = () => { setTransacaoParaEditar(null); setModalAberto(false); };
  const limparFiltros = () => { setDataInicio(null); setDataFim(null); setFiltroCategoria('todas'); setFiltroTipo('todos'); };
  const abrirModalParaNovaTransacao = () => { setTransacaoParaEditar(null); limparFiltros(); setModalAberto(true); };
  const abrirModalNovaMeta = () => { setMetaParaEditar(null); setModalMetaAberto(true); };
  const handleSelecionarMetaParaEditar = (meta) => { setMetaParaEditar(meta); setModalMetaAberto(true); };
  const handleCancelarEdicaoMeta = () => { setMetaParaEditar(null); setModalMetaAberto(false); };
  const handleSelecionarRecorrenciaParaEditar = (regra) => { setRecorrenciaParaEditar(regra); setModalRecorrenteAberto(true); };
  const abrirModalNovaRecorrencia = () => { setRecorrenciaParaEditar(null); setModalRecorrenteAberto(true); };
  const handleCancelarEdicaoRecorrencia = () => { setRecorrenciaParaEditar(null); setModalRecorrenteAberto(false); };

  // Função para fazer logout.
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout", error);
      Swal.fire('Erro', 'Não foi possível sair. Tente novamente.', 'error');
    }
  };

  // === RENDERIZAÇÃO ===

  // Se não houver usuário logado, renderiza o componente de Login.
  if (!usuario) {
    return <Login />;
  }

  // Renderiza o dashboard principal se houver um usuário logado.
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Cabeçalho da aplicação */}
      <header className="bg-slate-800 shadow-md dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 dark:text-indigo-300" />
            <h1 className="text-lg sm:text-xl font-bold text-white dark:text-slate-100">Dashboard Financeiro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <img src={usuario.photoURL} alt={usuario.displayName} className="h-8 w-8 rounded-full" />
            <span className="text-white text-sm font-medium hidden sm:block dark:text-slate-100">{usuario.displayName}</span>
            <button onClick={() => setTemaEscuro(!temaEscuro)} className="text-slate-300 hover:text-white dark:text-slate-400 dark:hover:text-slate-100">
              {temaEscuro ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={handleLogout} className="text-sm text-slate-300 hover:text-white font-semibold dark:text-slate-400 dark:hover:text-slate-100">Sair</button>
          </div>
        </div>
      </header>

      {/* Botão flutuante para adicionar transação em telas pequenas (mobile). */}
      <div
        className={`
          sm:hidden fixed bottom-6 right-6 z-50 transition-all duration-300
          ${mostrarBotaoFlutuante ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-20 pointer-events-none'}
        `}
      >
        <button
          onClick={() => {
            setTransacaoParaEditar(null);
            setModalAberto(true);
          }}
          className="cursor-pointer w-14 h-14 rounded-full bg-indigo-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none"
          aria-label="Adicionar Transação"
        >
          +
        </button>
      </div>

      {/* Botão tradicional para adicionar transação em telas maiores. */}
      <div className="hidden sm:flex justify-end items-center flex-wrap gap-4 mt-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={abrirModalParaNovaTransacao}
          className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm sm:text-base"
        >
          Adicionar Transação
        </button>
      </div>
      
      {/* Conteúdo principal do dashboard. */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <ResumoFinanceiro transacoes={transacoesFiltradas} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

          {/* Layout de abas para telas pequenas (mobile). */}
          <div className="md:hidden space-y-4">
            <div className="flex justify-around border-b border-slate-300 dark:border-slate-700">
              <button
                className={`flex-1 py-2 text-sm font-medium ${abaMobile === 'grafico' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setAbaMobile('grafico')}
              >
                Gráfico
              </button>
               <button
                className={`flex-1 py-2 text-sm font-medium ${abaMobile === 'metas' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setAbaMobile('metas')}
              >
                Metas
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${abaMobile === 'recorrentes' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setAbaMobile('recorrentes')}
              >
                Recorrentes
              </button>
            </div>

            {/* Renderização condicional do conteúdo da aba ativa. */}
            {abaMobile === 'grafico' && <GraficoCategorias transacoes={transacoesFiltradas} />}
            {abaMobile === 'metas' && (
              <PainelMetas
                onNovaMetaClick={abrirModalNovaMeta}
                onSelecionarMetaParaEditar={handleSelecionarMetaParaEditar}
                transacoes={transacoes}
              />
            )}
            {abaMobile === 'recorrentes' && (
              <PainelRecorrentes
                onSelecionarParaEditar={handleSelecionarRecorrenciaParaEditar}
                onNovaRecorrenciaClick={abrirModalNovaRecorrencia}
              />
            )}
          </div>

          {/* Layout de colunas para telas maiores (desktop). */}
          <div className="hidden md:block lg:col-span-1 md:col-span-2 space-y-6">
            <PainelRecorrentes
              onSelecionarParaEditar={handleSelecionarRecorrenciaParaEditar}
              onNovaRecorrenciaClick={abrirModalNovaRecorrencia}
            />
            <PainelMetas
              onNovaMetaClick={abrirModalNovaMeta}
              onSelecionarMetaParaEditar={handleSelecionarMetaParaEditar}
              transacoes={transacoes}
            />
            <GraficoCategorias transacoes={transacoesFiltradas} />
          </div>

          {/* Coluna principal com filtros e lista de transações. */}
          <div className="lg:col-span-2 md:col-span-2 space-y-6">
            <Filtros
              transacoes={transacoes}
              filtros={{ dataInicio, dataFim, filtroCategoria, filtroTipo }}
              setters={{ setDataInicio, setDataFim, setFiltroCategoria, setFiltroTipo }}
              onLimparFiltros={limparFiltros}
            />

            {/* Renderização condicional: mostra um spinner de carregamento ou a lista de transações. */}
            {carregando ? (
              <div className="bg-white rounded-lg shadow-md p-4 text-center text-slate-500 flex justify-center items-center space-x-2 dark:bg-slate-800 dark:text-slate-400">
                <svg className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

      {/* Renderização dos modais (só são visíveis quando seus estados 'aberto' são true). */}
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
      <ModalRecorrente
        aberto={modalRecorrenteAberto}
        aoFechar={handleCancelarEdicaoRecorrencia}
        recorrenciaParaEditar={recorrenciaParaEditar}
      />
    </div>
  );
}

export default App;