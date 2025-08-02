// Importa as dependências necessárias do React, Firebase e outras bibliotecas.
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/configuracao'; // Importa a instância do Firestore.
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'; // Funções do Firestore para manipular documentos.
import Swal from 'sweetalert2'; // Biblioteca para exibir alertas e modais elegantes.
import { useAuth } from '../contexto/AuthContext.jsx'; // Hook personalizado para acessar o contexto de autenticação.

// Define uma lista de categorias de transação disponíveis.
const categoriasDisponiveis = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Outro'];
// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Função auxiliar para obter a data e hora local atual no formato 'YYYY-MM-DDTHH:MM'.
// Isso é necessário para preencher corretamente o input do tipo 'datetime-local'.
const obterDataHoraLocal = () => {
  const agora = new Date();
  // Ajusta o fuso horário para garantir que a data e hora exibidas sejam as locais do usuário.
  const offset = agora.getTimezoneOffset() * 60000;
  return new Date(agora.getTime() - offset).toISOString().slice(0, 16);
};

// Declaração do componente funcional FormularioTransacao.
const FormularioTransacao = ({ transacaoParaEditar, onCancelarEdicao }) => {
  // Obtém o usuário logado a partir do contexto de autenticação.
  const { usuario } = useAuth();
  // Verifica se o formulário está em modo de edição (se `transacaoParaEditar` foi passada como prop).
  const modoEdicao = !!transacaoParaEditar;

  // Define os estados locais para cada campo do formulário.
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(''); // O valor é armazenado como uma string de centavos.
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState(categoriasDisponiveis[0]);
  const [data, setData] = useState(obterDataHoraLocal());

  // useEffect é usado para preencher o formulário quando estiver em modo de edição.
  // Ele executa sempre que `modoEdicao` ou `transacaoParaEditar` mudam.
  useEffect(() => {
    if (modoEdicao) {
      // Se estiver editando, preenche os estados com os dados da transação existente.
      setDescricao(transacaoParaEditar.descricao);
      setValor(String(transacaoParaEditar.valor * 100)); // Converte o valor para centavos e armazena como string.
      setTipo(transacaoParaEditar.tipo);
      setCategoria(transacaoParaEditar.categoria);
      setData(transacaoParaEditar.data?.slice(0, 16) || obterDataHoraLocal()); // Formata a data para o input.
    } else {
      // Se não estiver editando (criando uma nova transação), reseta todos os campos para o estado inicial.
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setCategoria(categoriasDisponiveis[0]);
      setData(obterDataHoraLocal());
    }
  }, [modoEdicao, transacaoParaEditar]);

  // Função para lidar com a mudança no campo de valor, removendo caracteres não numéricos.
  const handleValorChange = (e) => {
    setValor(e.target.value.replace(/\D/g, ''));
  };

  // Função assíncrona para lidar com o envio do formulário.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página.

    const valorNumerico = Number(valor) / 100; // Converte o valor de centavos para um número.

    // Validação: verifica se o usuário está logado.
    if (!usuario) {
      Swal.fire('Erro', 'Você precisa estar logado para esta ação.', 'error');
      return;
    }

    // Validação: verifica se os campos obrigatórios foram preenchidos corretamente.
    if (!descricao || valorNumerico <= 0) {
      Swal.fire('Atenção', 'Preencha todos os campos com valores válidos.', 'warning');
      return;
    }

    // Cria um objeto com os dados da transação a serem salvos no Firestore.
    const dadosTransacao = {
      descricao,
      valor: valorNumerico,
      tipo,
      categoria,
      data,
      userId: usuario.uid, // Associa a transação ao ID do usuário logado.
    };

    try {
      if (modoEdicao) {
        // Se estiver editando, atualiza o documento existente no Firestore.
        await updateDoc(doc(db, 'transacoes', transacaoParaEditar.id), dadosTransacao);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Transação atualizada!', showConfirmButton: false, timer: 3000 });
        onCancelarEdicao(); // Fecha o modal.
      } else {
        // Se estiver criando, adiciona um novo documento à coleção 'transacoes'.
        await addDoc(collection(db, 'transacoes'), dadosTransacao);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Transação adicionada!', showConfirmButton: false, timer: 3000 });
        // Reseta o formulário para um novo lançamento.
        setDescricao('');
        setValor('');
        setTipo('despesa');
        setCategoria(categoriasDisponiveis[0]);
        setData(obterDataHoraLocal());
        if (onCancelarEdicao) onCancelarEdicao(); // Fecha o modal se a função for fornecida.
      }
    } catch (error) {
      // Em caso de erro, exibe uma mensagem no console e um alerta para o usuário.
      console.error('Erro ao salvar transação:', error);
      Swal.fire('Erro', 'Não foi possível salvar a transação.', 'error');
    }
  };

  // Constantes para armazenar as classes do Tailwind CSS, facilitando a reutilização e manutenção.
  const inputStyle = 'w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
  const labelStyle = 'text-sm font-medium text-slate-600 dark:text-slate-200 mb-1 block';

  // Renderização do JSX do formulário.
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 pt-10 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <h2 className="text-lg font-bold text-slate-700 dark:text-white">
        {modoEdicao ? 'Editar Transação' : 'Novo Lançamento'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dropdown para selecionar o tipo (receita/despesa). */}
        <div>
          <label className={labelStyle}>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputStyle}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </div>

        {/* Dropdown para selecionar a categoria. */}
        <div>
          <label className={labelStyle}>Categoria</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputStyle}>
            {categoriasDisponiveis.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Input para a descrição. */}
        <div className="sm:col-span-2">
          <label className={labelStyle}>Descrição</label>
          <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Compras do mercado" className={inputStyle} />
        </div>

        {/* Input para o valor, com formatação de moeda. */}
        <div>
          <label className={labelStyle}>Valor (R$)</label>
          <input type="text" value={!valor ? '' : formatadorMoeda.format(Number(valor) / 100)} onChange={handleValorChange} placeholder="R$ 0,00" className={inputStyle} />
        </div>

        {/* Input para a data e hora. */}
        <div>
          <label className={labelStyle}>Data e Hora</label>
          <input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} className={inputStyle} />
        </div>
      </div>

      {/* Botões de ação do formulário. */}
      <div className="pt-2 space-y-2">
        <button type="submit" className="cursor-pointer w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors">
          {modoEdicao ? 'Salvar Alterações' : 'Adicionar'}
        </button>
        {/* Renderização condicional: o botão "Cancelar Edição" só aparece no modo de edição. */}
        {modoEdicao && (
          <button type="button" onClick={onCancelarEdicao} className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-center">
            Cancelar Edição
          </button>
        )}
      </div>
    </form>
  );
};

// Exporta o componente para ser utilizado em outras partes da aplicação.
export default FormularioTransacao;
