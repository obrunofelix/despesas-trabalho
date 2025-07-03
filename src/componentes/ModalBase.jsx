// componentes/ModalBase.jsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ModalBase = ({ aberto, aoFechar, children, larguraMaxima = 'max-w-md' }) => {
  if (!aberto) return null;

  return (
    <div
      onClick={aoFechar}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 dark:bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg shadow-lg w-[95%] sm:w-full ${larguraMaxima} relative`}
      >
        <button
          onClick={aoFechar}
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
          aria-label="Fechar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalBase;
