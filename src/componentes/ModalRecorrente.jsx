// Importa a biblioteca React e os componentes que serão utilizados.
import React from 'react';
import FormularioRecorrente from './FormularioRecorrente'; // O formulário para criar/editar regras de recorrência.
import ModalBase from './ModalBase'; // O componente de layout base para todos os modais.

// Declaração do componente funcional ModalRecorrente.
// Este componente serve como um "wrapper", combinando o ModalBase com o FormularioRecorrente.
// Ele é responsável por exibir o formulário de recorrência dentro de um modal.
const ModalRecorrente = ({ aberto, aoFechar, recorrenciaParaEditar }) => {
  return (
    // Renderiza o componente ModalBase, passando as props para controlar o estado de aberto/fechado.
    <ModalBase 
      aberto={aberto} 
      aoFechar={aoFechar} 
      // Define um título específico para este modal.
      titulo="Transação Recorrente" 
      // Define uma largura máxima customizada para o modal.
      larguraMaxima="max-w-lg"
    >
      {/* Dentro do modal, renderiza o formulário de recorrência. */}
      <FormularioRecorrente 
        // Passa a função `aoFechar` para o formulário com o nome de `aoFinalizar`, 
        // para que o formulário possa fechar o modal após a submissão.
        aoFinalizar={aoFechar} 
        // Passa a regra de recorrência a ser editada. Se for null, o formulário estará em modo de criação.
        recorrenciaParaEditar={recorrenciaParaEditar} 
      />
    </ModalBase>
  );
};

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ModalRecorrente;
