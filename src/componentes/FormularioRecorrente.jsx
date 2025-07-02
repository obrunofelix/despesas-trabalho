import React, { useState, useEffect } from 'react';
import { db } from '../firebase/configuracao';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useAuth } from '../contexto/AuthContext.jsx'; // ✨ 1. Importar o hook

const categoriasDisponiveis = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Outro'];
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const FormularioRecorrente = ({ aoFinalizar, recorrenciaParaEditar }) => {
  const { usuario } = useAuth(); // ✨ 2. Obter o usuário logado

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState(categoriasDisponiveis[0]);
  const [diaDoMes, setDiaDoMes] = useState(1);

  const modoEdicao = !!recorrenciaParaEditar;

  useEffect(() => {
    if (modoEdicao) {
      setDescricao(recorrenciaParaEditar.descricao);
      setValor(String(recorrenciaParaEditar.valor * 100));
      setTipo(recorrenciaParaEditar.tipo);
      setCategoria(recorrenciaParaEditar.categoria);
      setDiaDoMes(recorrenciaParaEditar.diaDoMes);
    } else {
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setCategoria(categoriasDisponiveis[0]);
      setDiaDoMes(1);
    }
  }, [recorrenciaParaEditar, modoEdicao]);

  const handleValorChange = (e) => {
    setValor(e.target.value.replace(/\D/g, ''));
  };

  const aoSubmeter = async (e) => {
    e.preventDefault();
    const valorNumerico = Number(valor) / 100;
    
    if (!usuario) {
      Swal.fire('Erro', 'Você precisa estar logado para esta ação.', 'error');
      return;
    }

    if (!descricao || !valorNumerico || valorNumerico <= 0) {
      Swal.fire('Atenção', 'Preencha todos os campos com valores válidos.', 'warning');
      return;
    }

    const dadosRecorrencia = {
      descricao,
      valor: valorNumerico,
      tipo,
      categoria,
      diaDoMes: Number(diaDoMes),
      userId: usuario.uid, // ✨ 3. Adicionar o ID do usuário aos dados
    };

    try {
      if (modoEdicao) {
        const docRef = doc(db, 'transacoesRecorrentes', recorrenciaParaEditar.id);
        await updateDoc(docRef, dadosRecorrencia);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Recorrência atualizada!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      } else {
        await addDoc(collection(db, 'transacoesRecorrentes'), {
          ...dadosRecorrencia,
          frequencia: 'mensal',
          dataInicio: new Date(),
          ultimoRegistro: null,
          ativa: true,
        });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Recorrência criada!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
      aoFinalizar();
    } catch (error) {
      console.error("Erro ao salvar recorrência: ", error);
      Swal.fire('Erro', 'Não foi possível salvar a regra de recorrência.', 'error');
    }
  };

  const inputStyle = 'w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
  const labelStyle = "text-sm font-medium text-slate-600 mb-1 block";

  return (
    <form onSubmit={aoSubmeter} className="space-y-4 p-4 pt-10">
      <h2 className="text-lg font-bold text-slate-700">{modoEdicao ? 'Editar Recorrência' : 'Nova Transação Recorrente'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
            <label className={labelStyle}>Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Aluguel" className={inputStyle} />
        </div>
        <div>
            <label className={labelStyle}>Valor (R$)</label>
            <input type="text" value={!valor ? '' : formatadorMoeda.format(Number(valor) / 100)} onChange={handleValorChange} placeholder="R$ 0,00" className={inputStyle}/>
        </div>
        <div>
            <label className={labelStyle}>Dia do Mês</label>
            <input type="number" value={diaDoMes} onChange={(e) => setDiaDoMes(e.target.value)} min="1" max="31" className={inputStyle} />
        </div>
        <div>
            <label className={labelStyle}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputStyle}>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
            </select>
        </div>
        <div>
            <label className={labelStyle}>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputStyle}>
                {categoriasDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">
        {modoEdicao ? 'Salvar Alterações' : 'Criar Recorrência'}
      </button>
    </form>
  );
};

export default FormularioRecorrente;
