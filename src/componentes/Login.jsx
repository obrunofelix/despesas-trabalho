// Importa as dependências necessárias do React e de outras bibliotecas.
import React from 'react';
import { useAuth } from '../contexto/AuthContext'; // Hook personalizado para acessar o contexto de autenticação.
import { FcGoogle } from 'react-icons/fc'; // Ícone do Google da biblioteca react-icons.

// Declaração do componente funcional Login.
const Login = () => {
  // Obtém a função de login do contexto de autenticação.
  const { loginComGoogle } = useAuth();

  // ===================================================================
  // LÓGICA DE DETECÇÃO DE AMBIENTE (WEBVIEW NATIVO)
  // ===================================================================
  // Verifica se uma variável global `isNativeApp` foi injetada pelo WebView do aplicativo nativo.
  // O `!!` converte o valor para um booleano (true se existir, false se não).
  // Isso permite que o componente se comporte de maneira diferente no navegador e no app.
  const isWebView = !!window.isNativeApp;
  // ===================================================================

  // Função assíncrona para lidar com o clique no botão de login.
  const handleLogin = async () => {
    try {
      // Chama a função de login com Google, que abre o popup de autenticação.
      await loginComGoogle();
    } catch (error) {
      // Em caso de erro durante o login, exibe uma mensagem no console.
      console.error("Erro ao fazer login com Google", error);
    }
  };

  // Renderização do JSX do componente.
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
      <section className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-sm space-y-6">
        {/* Cabeçalho da tela de login. */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Bem-vindo!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {/* A mensagem de instrução poderia ser alterada com base no contexto (isWebView),
                mas atualmente exibe o mesmo texto para ambos os casos. */}
            {isWebView 
              ? "Acesse sua conta para controlar suas finanças com praticidade." 
              : "Acesse sua conta para controlar suas finanças com praticidade."
            }
          </p>
        </header>

        {/* ===================================================================
            RENDERIZAÇÃO CONDICIONAL DO BOTÃO DE LOGIN
            ===================================================================
            Este botão só será renderizado se `isWebView` for falso.
            Isso significa que o botão de login do Google só aparece quando o site
            é acessado por um navegador comum. No app nativo, o login é feito de outra forma.
        =================================================================== */}
        {!isWebView && (
          <button
            onClick={handleLogin}
            aria-label="Entrar com conta do Google"
            className="cursor-pointer w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-4 font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shadow-sm"
          >
            <FcGoogle size={20} />
            Entrar com Google
          </button>
        )}
      </section>
    </main>
  );
};

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default Login;
