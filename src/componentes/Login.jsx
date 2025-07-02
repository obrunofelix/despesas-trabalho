import React from 'react';
import { useAuth } from '../contexto/AuthContext';

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
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Bem-vindo!</h1>
        <p className="text-slate-600 mb-6">Faça login para gerenciar suas finanças.</p>
        <button
          onClick={handleLogin}
          className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

export default Login;