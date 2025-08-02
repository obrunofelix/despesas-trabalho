// Importa a biblioteca React e os componentes que serão utilizados.
import React from 'react';
import FormularioMeta from './FormularioMeta'; // O formulário para criar/editar metas financeiras.
import ModalBase from './ModalBase'; // O componente de layout base para todos os modais.

// Declaração do componente funcional ModalMeta.
// Este componente serve como um "wrapper", combinando o ModalBase com o FormularioMeta.
// Ele é responsável por exibir o formulário de metas dentro de um modal.
const ModalMeta = ({ aberto, aoFechar, metaParaEditar }) => {
  return (
    // Renderiza o componente ModalBase, passando as props para controlar o estado de aberto/fechado.
    <ModalBase aberto={aberto} aoFechar={aoFechar} titulo="Meta Financeira">
      {/* Dentro do modal, renderiza o formulário de metas. */}
      <FormularioMeta 
        // Passa a função `aoFechar` para o formulário com o nome de `aoFinalizar`,
        // para que o formulário possa fechar o modal após a submissão bem-sucedida.
        aoFinalizar={aoFechar} 
        // Passa a meta a ser editada. Se for null, o formulário estará em modo de criação.
        metaParaEditar={metaParaEditar} 
      />
    </ModalBase>
  );
};

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ModalMeta;
