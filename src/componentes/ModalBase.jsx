// componentes/ModalBase.jsx
// Importa as dependências necessárias do React e um ícone da biblioteca Heroicons.
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Declaração do componente funcional ModalBase.
// Este é um componente de layout genérico e reutilizável para criar modais com animação.
// Props:
// - aberto: um booleano que controla se o modal está visível ou não.
// - aoFechar: uma função a ser chamada quando o modal deve ser fechado (ex: clique no fundo ou no botão 'X').
// - children: o conteúdo React que será renderizado dentro do modal.
// - larguraMaxima: uma classe do Tailwind CSS para definir a largura máxima do modal (padrão 'max-w-md').
const ModalBase = ({ aberto, aoFechar, children, larguraMaxima = 'max-w-md' }) => {
  // Estado para controlar se o modal deve ser renderizado no DOM.
  const [exibir, setExibir] = useState(false);
  // Estado para controlar a aplicação das classes de animação (fade-in/fade-out).
  const [animar, setAnimar] = useState(false);

  // useEffect para gerenciar o ciclo de vida do modal (montagem/desmontagem com animação).
  // Ele é executado sempre que a prop `aberto` muda.
  useEffect(() => {
    if (aberto) {
      // Se o modal deve ser aberto:
      setExibir(true); // 1. Renderiza o modal no DOM (ainda invisível).
      // 2. Após um pequeno delay, ativa a animação para o efeito de "fade-in".
      setTimeout(() => setAnimar(true), 10); 
    } else {
      // Se o modal deve ser fechado:
      setAnimar(false); // 1. Desativa a animação para o efeito de "fade-out".
      // 2. Após a duração da animação (300ms), remove o modal do DOM.
      setTimeout(() => setExibir(false), 300);
    }
  }, [aberto]); // O array de dependências que dispara o efeito.

  // Se o estado `exibir` for falso, o componente não renderiza nada (retorna null).
  if (!exibir) return null;

  return (
    // Contêiner principal do modal (overlay/fundo).
    <div
      onClick={aoFechar} // Clicar no fundo fecha o modal.
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
        backdrop-blur-sm ${animar ? 'opacity-100 bg-black/30 dark:bg-black/60' : 'opacity-0 bg-black/0'}
      `}
      role="dialog"
      aria-modal="true"
    >
      {/* O corpo do modal. */}
      <div
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal feche-o.
        className={`
          relative w-[95%] sm:w-full ${larguraMaxima}
          bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          rounded-lg shadow-lg overflow-y-auto
          max-h-screen transition-all duration-300 transform ease-in-out
          ${animar ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Botão de fechar no canto superior direito. */}
        <button
          onClick={aoFechar}
          className="cursor-pointer absolute top-3 right-3 text-slate-400 hover:text-red-500 z-10"
          aria-label="Fechar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Área onde o conteúdo filho (passado via props) será renderizado. */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Exporta o componente para ser utilizado em outras partes da aplicação.
export default ModalBase;
