import React, { useState, useEffect } from 'react';
import { db } from '../firebase/configuracao';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// 1. Importe o SweetAlert2
import Swal from 'sweetalert2';

const obterDataHoraLocal = () => {
  const agora = new Date();
  const fusoHorarioOffset = agora.getTimezoneOffset() * 60000;
  const dataLocal = new Date(agora.getTime() - fusoHorarioOffset);
  return dataLocal.toISOString().slice(0, 16);
};

function FormularioTransacao({ transacaoParaEditar, onCancelarEdicao }) {
  const [dadosFormulario, setDadosFormulario] = useState({ tipo: 'despesa', descricao: '', valor: '', categoria: 'Alimentação', data: obterDataHoraLocal() });
  const modoEdicao = !!transacaoParaEditar;

  useEffect(() => {
    if (modoEdicao) {
      setDadosFormulario({ ...transacaoParaEditar, valor: String(transacaoParaEditar.valor) });
    } else {
      setDadosFormulario({ tipo: 'despesa', descricao: '', valor: '', categoria: 'Alimentação', data: obterDataHoraLocal() });
    }
  }, [transacaoParaEditar, modoEdicao]);

  const aoMudar = (e) => setDadosFormulario((s) => ({ ...s, [e.target.name]: e.target.value }));

  const aoSubmeter = async (e) => {
    e.preventDefault();
    // 2. Substituindo o alerta de validação
    if (!dadosFormulario.descricao || !dadosFormulario.valor || parseFloat(dadosFormulario.valor) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Por favor, preencha a descrição e um valor positivo.',
      });
      return;
    }
    
    const dadosParaSalvar = { ...dadosFormulario, valor: Number(dadosFormulario.valor) };
    try {
      if (modoEdicao) {
        await updateDoc(doc(db, "transacoes", transacaoParaEditar.id), dadosParaSalvar);
        // 3. Substituindo o alerta de sucesso por um "toast"
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Transação atualizada!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        onCancelarEdicao();
      } else {
        await addDoc(collection(db, "transacoes"), dadosParaSalvar);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Transação adicionada!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        setDadosFormulario({ tipo: 'despesa', descricao: '', valor: '', categoria: 'Alimentação', data: obterDataHoraLocal() });
      }
    } catch (error) {
      console.error("Erro: ", error);
      // 4. Substituindo o alerta de erro
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ocorreu um erro ao salvar a transação. Tente novamente.',
      });
    }
  };

  const inputStyle = "w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-700">{modoEdicao ? 'Editar Transação' : 'Novo Lançamento'}</h2>
      </div>
      <form onSubmit={aoSubmeter} className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Tipo</label>
          <select name="tipo" value={dadosFormulario.tipo} onChange={aoMudar} className={inputStyle}><option value="despesa">Despesa</option><option value="receita">Receita</option></select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Descrição</label>
          <input type="text" name="descricao" value={dadosFormulario.descricao} onChange={aoMudar} placeholder="Ex: Compras do mercado" required className={inputStyle} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Valor (R$)</label>
          <input type="number" name="valor" value={dadosFormulario.valor} onChange={aoMudar} placeholder="150,00" step="0.01" required className={inputStyle} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Categoria</label>
          <select name="categoria" value={dadosFormulario.categoria} onChange={aoMudar} className={inputStyle}><option>Alimentação</option><option>Transporte</option><option>Moradia</option><option>Salário</option><option>Lazer</option><option>Saúde</option><option>Outro</option></select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Data e Hora</label>
          <input type="datetime-local" name="data" value={dadosFormulario.data} onChange={aoMudar} required className={inputStyle} />
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">{modoEdicao ? 'Salvar Alterações' : 'Adicionar'}</button>
          {modoEdicao && (<button type="button" onClick={onCancelarEdicao} className="w-full text-center mt-2 text-sm text-slate-500 hover:text-slate-700">Cancelar Edição</button>)}
        </div>
      </form>
    </div>
  );
}

export default FormularioTransacao;