// src/main.jsx
// Ponto de entrada da aplicação React.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importa os estilos CSS globais.
import App from './App.jsx'; // Importa o componente principal da aplicação.
import { AuthProvider } from './contexto/AuthContext.jsx'; // Importa o provedor de contexto de autenticação.
import { TemaProvider } from './contexto/TemaContext.jsx'; // Importa o provedor de contexto do tema.

// Cria a raiz da aplicação no elemento com o id 'root' no index.html.
createRoot(document.getElementById('root')).render(
  // StrictMode é uma ferramenta para destacar problemas potenciais na aplicação.
  // Não renderiza nenhuma UI visível e só é executado em modo de desenvolvimento.
  <StrictMode>
    {/*
      O AuthProvider envolve a aplicação, disponibilizando o contexto de autenticação
      (informações do utilizador, funções de login/logout) a todos os componentes descendentes.
    */}
    <AuthProvider>
      {/*
        O TemaProvider envolve a aplicação, disponibilizando o contexto do tema
        (se o modo escuro está ativo e a função para o alterar).
      */}
      <TemaProvider>
        <App />
      </TemaProvider>
    </AuthProvider>
  </StrictMode>,
)