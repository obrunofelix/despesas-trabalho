import React from 'react';
import { useAuth } from '../contexto/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { loginComGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginComGoogle();
    } catch (error) {
      console.error("Erro ao fazer login com Google", error);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
      <section className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-sm space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Bem-vindo!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Acesse sua conta para controlar suas finanças com praticidade.
          </p>
        </header>

        <button
          onClick={handleLogin}
          aria-label="Entrar com conta do Google"
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-4 font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shadow-sm"
        >
          <FcGoogle size={20} />
          Entrar com Google
        </button>
      </section>
    </main>
  );
};

export default Login;
