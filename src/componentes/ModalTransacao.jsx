import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormularioTransacao from './FormularioTransacao';

const ModalTransacao = ({ aberto, aoFechar, transacaoParaEditar, onCancelarEdicao }) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={aoFechar}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <FormularioTransacao
          transacaoParaEditar={transacaoParaEditar}
          onCancelarEdicao={onCancelarEdicao || aoFechar}
        />
      </div>
    </div>
  );
};

export default ModalTransacao;
