import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormularioTransacao from './FormularioTransacao';

const ModalTransacao = ({ aberto, aoFechar, transacaoParaEditar, onCancelarEdicao }) => {
  const [visivel, setVisivel] = useState(false);
  const fundoRef = useRef(null);

  useEffect(() => {
    if (aberto) {
      setVisivel(true);
      document.body.classList.add('overflow-hidden');
    } else {
      const timer = setTimeout(() => setVisivel(false), 200);
      document.body.classList.remove('overflow-hidden');
      return () => clearTimeout(timer);
    }
  }, [aberto]);

  // Fecha o modal se clicar fora do conteúdo
  const aoClicarFora = (e) => {
    if (e.target === fundoRef.current) {
      aoFechar();
    }
  };

  if (!aberto && !visivel) return null;

  return (
    <div
      ref={fundoRef}
      onClick={aoClicarFora}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
        aberto ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-[95%] sm:w-full max-w-md p-4 sm:p-6 relative max-h-screen overflow-y-auto transform transition-transform duration-200 ${
          aberto ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()} // Impede fechamento ao clicar dentro
      >
        <button
          onClick={aoFechar}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          aria-label="Fechar modal"
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
