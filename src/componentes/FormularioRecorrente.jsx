// Importa as dependências necessárias do React, Firebase e outras bibliotecas.
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/configuracao'; // Importa a instância do Firestore.
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'; // Funções do Firestore para manipular documentos.
import Swal from 'sweetalert2'; // Biblioteca para exibir alertas e modais.
import { useAuth } from '../contexto/AuthContext.jsx'; // Hook para acessar o contexto de autenticação.

// Define as categorias disponíveis para as transações recorrentes.
const categoriasDisponiveis = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Outro'];
// Cria um formatador de moeda para exibir valores no formato de Real (BRL).
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Declaração do componente funcional FormularioRecorrente.
const FormularioRecorrente = ({ aoFinalizar, recorrenciaParaEditar }) => {
  // Obtém o usuário logado a partir do contexto de autenticação.
  const { usuario } = useAuth();

  // Define os estados locais para cada campo do formulário.
  const [descricao, setDescricao] = useState(''); // Descrição da transação recorrente.
  const [valor, setValor] = useState(''); // Valor (armazenado como string de centavos).
  const [tipo, setTipo] = useState('despesa'); // Tipo (receita ou despesa).
  const [categoria, setCategoria] = useState(categoriasDisponiveis[0]); // Categoria da transação.
  const [diaDoMes, setDiaDoMes] = useState(1); // Dia do mês em que a transação deve ocorrer.

  // Verifica se o formulário está em modo de edição.
  const modoEdicao = !!recorrenciaParaEditar;

  // useEffect para preencher o formulário quando estiver em modo de edição.
  // Executa quando `recorrenciaParaEditar` ou `modoEdicao` mudam.
  useEffect(() => {
    if (modoEdicao) {
      // Preenche os estados com os dados da recorrência existente.
      setDescricao(recorrenciaParaEditar.descricao);
      setValor(String(recorrenciaParaEditar.valor * 100)); // Converte para centavos.
      setTipo(recorrenciaParaEditar.tipo);
      setCategoria(recorrenciaParaEditar.categoria);
      setDiaDoMes(recorrenciaParaEditar.diaDoMes);
    } else {
      // Reseta os campos para o estado inicial ao criar uma nova recorrência.
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setCategoria(categoriasDisponiveis[0]);
      setDiaDoMes(1);
    }
  }, [recorrenciaParaEditar, modoEdicao]);

  // Função para lidar com a mudança no campo de valor, removendo caracteres não numéricos.
  const handleValorChange = (e) => {
    setValor(e.target.value.replace(/\D/g, ''));
  };

  // Função assíncrona para lidar com o envio do formulário.
  const aoSubmeter = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página.
    const valorNumerico = Number(valor) / 100; // Converte o valor de centavos para um número.
    
    // Validação: verifica se o usuário está logado.
    if (!usuario) {
      Swal.fire('Erro', 'Você precisa estar logado para esta ação.', 'error');
      return;
    }

    // Validação: verifica se os campos obrigatórios foram preenchidos corretamente.
    if (!descricao || !valorNumerico || valorNumerico <= 0) {
      Swal.fire('Atenção', 'Preencha todos os campos com valores válidos.', 'warning');
      return;
    }

    // Cria um objeto com os dados da transação recorrente.
    const dadosRecorrencia = {
      descricao,
      valor: valorNumerico,
      tipo,
      categoria,
      diaDoMes: Number(diaDoMes),
      userId: usuario.uid, // Associa a recorrência ao ID do usuário.
    };

    try {
      if (modoEdicao) {
        // Se estiver editando, atualiza o documento existente no Firestore.
        const docRef = doc(db, 'transacoesRecorrentes', recorrenciaParaEditar.id);
        await updateDoc(docRef, dadosRecorrencia);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Recorrência atualizada!', showConfirmButton: false, timer: 3000 });
      } else {
        // Se estiver criando, adiciona um novo documento à coleção 'transacoesRecorrentes'.
        await addDoc(collection(db, 'transacoesRecorrentes'), {
          ...dadosRecorrencia,
          frequencia: 'mensal', // Define a frequência padrão.
          dataInicio: new Date(), // Registra a data de início.
          ultimoRegistro: null, // Inicializa o último registro como nulo.
          ativa: true, // Define a recorrência como ativa por padrão.
        });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Recorrência criada!', showConfirmButton: false, timer: 3000 });
      }
      aoFinalizar(); // Chama a função para fechar o modal.
    } catch (error) {
      // Em caso de erro, exibe uma mensagem no console e um alerta para o usuário.
      console.error("Erro ao salvar recorrência: ", error);
      Swal.fire('Erro', 'Não foi possível salvar a regra de recorrência.', 'error');
    }
  };

  // Constantes para armazenar as classes do Tailwind CSS para estilização.
  const inputStyle = 'w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
  const labelStyle = 'text-sm font-medium text-slate-600 dark:text-slate-200 mb-1 block';

  // Renderização do JSX do formulário.
  return (
    <form onSubmit={aoSubmeter} className="space-y-4 p-4 pt-10 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <h2 className="text-lg font-bold text-slate-700 dark:text-white">
        {modoEdicao ? 'Editar Recorrência' : 'Nova Transação Recorrente'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Input para a descrição. */}
        <div className="sm:col-span-2">
          <label className={labelStyle}>Descrição</label>
          <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Aluguel" className={inputStyle} />
        </div>

        {/* Input para o valor, com formatação de moeda. */}
        <div>
          <label className={labelStyle}>Valor (R$)</label>
          <input type="text" value={!valor ? '' : formatadorMoeda.format(Number(valor) / 100)} onChange={handleValorChange} placeholder="R$ 0,00" className={inputStyle} />
        </div>

        {/* Input para o dia do mês. */}
        <div>
          <label className={labelStyle}>Dia do Mês</label>
          <input type="number" value={diaDoMes} onChange={(e) => setDiaDoMes(e.target.value)} min="1" max="31" className={inputStyle} />
        </div>

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
            {categoriasDisponiveis.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botão de envio do formulário. */}
      <button type="submit" className="cursor-pointer w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
        {modoEdicao ? 'Salvar Alterações' : 'Criar Transação Recorrente'}
      </button>
    </form>
  );
};

// Exporta o componente.
export default FormularioRecorrente;
