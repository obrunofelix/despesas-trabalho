// Importa a biblioteca React e os componentes que serão utilizados.
import React from 'react';
import FormularioTransacao from './FormularioTransacao'; // O formulário para adicionar/editar transações.
import ModalBase from './ModalBase'; // O componente de layout base para todos os modais.

// Declaração do componente funcional ModalTransacao.
// Este componente atua como um "wrapper" especializado, combinando o ModalBase com o FormularioTransacao.
// Ele recebe props para controlar sua visibilidade e os dados da transação a ser editada.
const ModalTransacao = ({ aberto, aoFechar, transacaoParaEditar, onCancelarEdicao }) => {
  return (
    // Renderiza o componente ModalBase, passando as props para controlar o estado de aberto/fechado.
    <ModalBase aberto={aberto} aoFechar={aoFechar}>
      {/* Dentro do modal, renderiza o formulário de transação. */}
      <FormularioTransacao
        // Passa a transação a ser editada para o formulário. Se for null, o formulário estará em modo de criação.
        transacaoParaEditar={transacaoParaEditar}
        // Passa a função para cancelar a edição.
        // Utiliza um fallback: se onCancelarEdicao não for fornecido, usa a função aoFechar.
        // Isso garante que o formulário sempre tenha uma maneira de fechar o modal.
        onCancelarEdicao={onCancelarEdicao || aoFechar}
      />
    </ModalBase>
  );
};

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default ModalTransacao;
