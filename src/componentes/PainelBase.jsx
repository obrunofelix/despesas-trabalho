// Importa a biblioteca React.
import React from 'react';

// Declaração do componente funcional PainelBase.
// Este é um componente de layout reutilizável que serve como um "molde" para outros painéis.
// Ele recebe três props:
// - titulo: O texto a ser exibido no cabeçalho do painel.
// - botaoAcao: Um componente de botão opcional a ser exibido no cabeçalho. O valor padrão é null.
// - children: O conteúdo que será renderizado dentro do corpo do painel.
function PainelBase({ titulo, botaoAcao = null, children }) {
  return (
    // O contêiner principal do painel com estilos do Tailwind CSS para fundo, bordas, sombra e overflow.
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      
      {/* Renderização condicional do cabeçalho.
          O cabeçalho só é renderizado se a prop `titulo` ou `botaoAcao` for fornecida. */}
      {(titulo || botaoAcao) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          {/* Exibe o título do painel. */}
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-100">{titulo}</h2>
          
          {/* Renderização condicional do botão de ação.
              O botão só é renderizado se a prop `botaoAcao` for fornecida. */}
          {botaoAcao && <div className="shrink-0">{botaoAcao}</div>}
        </div>
      )}

      {/* Renderiza o conteúdo principal do painel.
          O conteúdo é passado através da prop `children`.
          Um comentário indica que o padding deve ser definido pelo componente filho. */}
      {/* Conteúdo sem padding extra. Cada painel define o seu */}
      {children}
    </div>
  );
}

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default PainelBase;
