import React from 'react';
import FormularioRecorrente from './FormularioRecorrente';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ModalRecorrente = ({ aberto, aoFechar, recorrenciaParaEditar }) => {
  if (!aberto) return null;

  return (
    <div
      onClick={aoFechar}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-[95%] sm:w-full max-w-lg relative"
      >
        <button
          onClick={aoFechar}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Fechar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        {/* Passando as props corretamente para o formulário */}
        <FormularioRecorrente 
          aoFinalizar={aoFechar} 
          recorrenciaParaEditar={recorrenciaParaEditar} 
        />
      </div>
    </div>
  );
};

export default ModalRecorrente;