// Importa as dependências necessárias do React, Firebase e outras bibliotecas.
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/configuracao'; // Importa a instância do Firestore.
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'; // Funções do Firestore para manipular documentos.
import Swal from 'sweetalert2'; // Biblioteca para exibir alertas e modais elegantes.
import { useAuth } from '../contexto/AuthContext.jsx'; // Hook personalizado para acessar o contexto de autenticação.

// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Define os tipos de metas disponíveis que o usuário pode criar.
const tiposDeMeta = [
  { valor: 'ECONOMIA', texto: 'Economizar para um Objetivo' },
  { valor: 'GASTO_LIMITE', texto: 'Definir Limite de Gasto' },
  { valor: 'SALDO_MES', texto: 'Alcançar Saldo Mensal' },
];

// Define as categorias de gastos disponíveis para metas do tipo 'GASTO_LIMITE'.
const categoriasDisponiveis = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outro'];

// Declaração do componente funcional FormularioMeta.
const FormularioMeta = ({ aoFinalizar, metaParaEditar }) => {
  // Obtém o usuário logado a partir do contexto de autenticação.
  const { usuario } = useAuth();

  // Define os estados locais para cada campo do formulário.
  const [tipo, setTipo] = useState(tiposDeMeta[0].valor); // Tipo da meta (ex: ECONOMIA).
  const [nome, setNome] = useState(''); // Nome da meta.
  const [valorAlvo, setValorAlvo] = useState(''); // Valor alvo da meta (armazenado como string de centavos).
  const [categoria, setCategoria] = useState(categoriasDisponiveis[0]); // Categoria (relevante para GASTO_LIMITE).
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7)); // Mês da meta (relevante para GASTO_LIMITE e SALDO_MES).
  const [dataFim, setDataFim] = useState(''); // Data final (relevante para ECONOMIA).
  const [semPrazo, setSemPrazo] = useState(true); // Flag para indicar se a meta de economia tem prazo.

  // Verifica se o formulário está em modo de edição (se `metaParaEditar` foi passada como prop).
  const modoEdicao = !!metaParaEditar;

  // useEffect é usado para preencher o formulário quando estiver em modo de edição.
  // Ele executa sempre que `metaParaEditar` ou `modoEdicao` mudam.
  useEffect(() => {
    if (modoEdicao) {
      // Se estiver editando, preenche os estados com os dados da meta existente.
      setTipo(metaParaEditar.tipo);
      setNome(metaParaEditar.nome);
      setValorAlvo(String(metaParaEditar.valorAlvo * 100)); // Converte o valor para centavos e armazena como string.

      // Preenche campos específicos dependendo do tipo da meta.
      if (metaParaEditar.tipo === 'GASTO_LIMITE') {
        setCategoria(metaParaEditar.categoria);
        setMes(metaParaEditar.mes);
      } else if (metaParaEditar.tipo === 'SALDO_MES') {
        setMes(metaParaEditar.mes);
      } else if (metaParaEditar.tipo === 'ECONOMIA') {
        if (metaParaEditar.dataFim) {
          setSemPrazo(false);
          setDataFim(metaParaEditar.dataFim.toDate().toISOString().slice(0, 10)); // Formata a data para o input.
        } else {
          setSemPrazo(true);
          setDataFim('');
        }
      }
    } else {
      // Se não estiver editando (criando uma nova meta), reseta todos os campos para o estado inicial.
      setTipo(tiposDeMeta[0].valor);
      setNome('');
      setValorAlvo('');
      setCategoria(categoriasDisponiveis[0]);
      setMes(new Date().toISOString().slice(0, 7));
      setDataFim('');
      setSemPrazo(true);
    }
  }, [metaParaEditar, modoEdicao]);

  // Função para lidar com a mudança no campo de valor, removendo caracteres não numéricos.
  const handleValorChange = (e) => {
    setValorAlvo(e.target.value.replace(/\D/g, ''));
  };

  // Função assíncrona para lidar com o envio do formulário.
  const aoSubmeter = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página.
    const valorAlvoNumerico = Number(valorAlvo) / 100; // Converte o valor de centavos para um número.

    // Validação: verifica se o usuário está logado.
    if (!usuario) {
      Swal.fire('Erro', 'Você precisa estar logado para criar ou editar uma meta.', 'error');
      return;
    }

    // Validação: verifica se os campos obrigatórios foram preenchidos corretamente.
    if (!nome || !valorAlvoNumerico || valorAlvoNumerico <= 0) {
      Swal.fire('Atenção', 'Preencha o nome e um valor alvo positivo.', 'warning');
      return;
    }

    // Cria um objeto com os dados base da meta.
    let dadosMeta = {
      nome,
      tipo,
      valorAlvo: valorAlvoNumerico,
      userId: usuario.uid, // Associa a meta ao ID do usuário logado.
    };

    // Adiciona campos específicos ao objeto `dadosMeta` com base no tipo da meta.
    if (tipo === 'ECONOMIA') {
      dadosMeta.dataFim = semPrazo ? null : new Date(dataFim);
    } else if (tipo === 'GASTO_LIMITE') {
      dadosMeta.categoria = categoria;
      dadosMeta.mes = mes;
    } else if (tipo === 'SALDO_MES') {
      dadosMeta.mes = mes;
    }

    try {
      if (modoEdicao) {
        // Se estiver editando, atualiza o documento existente no Firestore.
        const metaDocRef = doc(db, 'metas', metaParaEditar.id);
        await updateDoc(metaDocRef, dadosMeta);
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'Sua meta foi atualizada!',
          showConfirmButton: false, timer: 3000,
        });
      } else {
        // Se estiver criando, adiciona um novo documento à coleção 'metas' no Firestore.
        dadosMeta.valorAtual = 0; // Define o valor inicial como 0.
        dadosMeta.dataCriacao = new Date(); // Registra a data de criação.
        await addDoc(collection(db, 'metas'), dadosMeta);
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'Sua nova meta foi criada!',
          showConfirmButton: false, timer: 3000,
        });
      }
      aoFinalizar(); // Chama a função para fechar o modal após o sucesso.
    } catch (error) {
      // Em caso de erro, exibe uma mensagem no console e um alerta para o usuário.
      console.error("Erro ao salvar meta: ", error);
      Swal.fire('Erro', 'Não foi possível salvar a meta.', 'error');
    }
  };

  // Constantes para armazenar as classes do Tailwind CSS, facilitando a reutilização e manutenção.
  const inputStyle = 'w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
  const labelStyle = "text-sm font-medium text-slate-600 dark:text-slate-200 mb-1 block";

  // Renderização do JSX do formulário.
  return (
    <form onSubmit={aoSubmeter} className="space-y-4 p-4 pt-10 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <h2 className="text-lg font-bold text-slate-700 dark:text-white">{modoEdicao ? 'Editar Meta' : 'Criar Nova Meta'}</h2>
      
      {/* Dropdown para selecionar o tipo de meta. */}
      <div>
        <label className={labelStyle}>Qual o tipo de meta?</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputStyle} disabled={modoEdicao}>
          {tiposDeMeta.map(t => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
        </select>
      </div>

      {/* Input para o nome da meta. */}
      <div>
        <label className={labelStyle}>Dê um nome para a meta</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Férias de Fim de Ano" className={inputStyle} />
      </div>

      {/* Renderização condicional: mostra o seletor de categoria apenas para metas de GASTO_LIMITE. */}
      {tipo === 'GASTO_LIMITE' && (
        <div>
          <label className={labelStyle}>Para qual categoria de gasto?</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputStyle}>
            {categoriasDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Renderização condicional: mostra o seletor de mês para metas de GASTO_LIMITE ou SALDO_MES. */}
      {(tipo === 'GASTO_LIMITE' || tipo === 'SALDO_MES') && (
        <div>
          <label className={labelStyle}>Para qual mês?</label>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className={inputStyle} />
        </div>
      )}

      {/* Input para o valor alvo, com formatação de moeda. */}
      <div>
        <label className={labelStyle}>
          {tipo === 'GASTO_LIMITE' ? 'Qual o limite de gasto?' : 'Qual o valor alvo?'}
        </label>
        <input
          type="text"
          value={!valorAlvo ? '' : formatadorMoeda.format(Number(valorAlvo) / 100)}
          onChange={handleValorChange}
          placeholder="R$ 0,00"
          className={inputStyle}
        />
      </div>

      {/* Renderização condicional: mostra as opções de prazo apenas para metas de ECONOMIA. */}
      {tipo === 'ECONOMIA' && (
        <>
          <div>
            <label className={labelStyle}>Prazo final (opcional)</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              disabled={semPrazo}
              className={`${inputStyle} ${semPrazo ? 'bg-slate-200 dark:bg-slate-600' : ''}`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="semPrazo"
              checked={semPrazo}
              onChange={(e) => setSemPrazo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="semPrazo" className="text-sm text-slate-600 dark:text-slate-300">Sem prazo definido</label>
          </div>
        </>
      )}

      {/* Botão de envio do formulário. */}
      <button type="submit" className=" cursor-pointer w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
        {modoEdicao ? 'Salvar Alterações' : 'Criar Meta'}
      </button>
    </form>
  );
};

// Exporta o componente para ser utilizado em outras partes da aplicação.
export default FormularioMeta;
