// Importa as dependências necessárias do React e do Firebase Authentication.
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { app } from '../firebase/configuracao'; // Importa a configuração inicial do Firebase.

// Cria um Contexto de Autenticação para compartilhar o estado do usuário em toda a aplicação.
const AuthContext = createContext();

// Hook personalizado para facilitar o acesso ao contexto de autenticação em outros componentes.
export function useAuth() {
  return useContext(AuthContext);
}

// Componente Provedor que envolve a aplicação e disponibiliza o contexto de autenticação.
export function AuthProvider({ children }) {
  // Estado para armazenar o objeto do usuário logado.
  const [usuario, setUsuario] = useState(null);
  // Estado para controlar o carregamento inicial da verificação de autenticação.
  const [carregando, setCarregando] = useState(true);
  // Obtém a instância do serviço de autenticação do Firebase.
  const auth = getAuth(app);

  // useEffect para configurar listeners de autenticação quando o componente é montado.
  useEffect(() => {
    // onAuthStateChanged é um listener do Firebase que executa sempre que o estado de login do usuário muda.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user); // Atualiza o estado com o usuário logado (ou null se deslogado).
      setCarregando(false); // Finaliza o estado de carregamento.
      
      // ===================================================================
      // LÓGICA DE COMUNICAÇÃO COM O APP NATIVO (REACT NATIVE WEBVIEW)
      // ===================================================================
      // Verifica se a aplicação está rodando dentro de um WebView do React Native.
      if (window.ReactNativeWebView) {
        if (user) {
          // Se um usuário fez login, envia uma mensagem para o app nativo.
          window.ReactNativeWebView.postMessage('USER_LOGGED_IN');
        } else {
          // Se o usuário fez logout, envia outra mensagem.
          window.ReactNativeWebView.postMessage('USER_LOGGED_OUT');
        }
      }
      // ===================================================================
    });

    // Função para lidar com o token de autenticação enviado pelo app nativo.
    const handleTokenFromNative = async (event) => {
      console.log("Token recebido do app nativo!");
      const { token } = event.detail; // Extrai o token do evento.

      if (token) {
        setCarregando(true);
        try {
          // Cria uma credencial do Google a partir do token recebido.
          const credential = GoogleAuthProvider.credential(token);
          // Usa a credencial para fazer login no Firebase.
          await signInWithCredential(auth, credential);
        } catch (error) {
          // Em caso de erro, exibe no console e finaliza o carregamento.
          console.error("Erro ao autenticar com a credencial nativa:", error);
          setCarregando(false); 
        }
      }
    };

    // Adiciona um listener para um evento customizado que será disparado pelo app nativo.
    window.addEventListener('firebaseAuthTokenReceived', handleTokenFromNative);

    // Função de limpeza: é executada quando o componente é desmontado para evitar vazamentos de memória.
    return () => {
      unsubscribe(); // Remove o listener do onAuthStateChanged.
      window.removeEventListener('firebaseAuthTokenReceived', handleTokenFromNative); // Remove o listener do token nativo.
    };
  }, [auth]); // O array de dependências garante que o efeito execute apenas uma vez.

  // Função para realizar o login com o popup do Google (usado no navegador web).
  const loginComGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Função para realizar o logout do usuário.
  const logout = () => {
    return signOut(auth);
  };

  // Objeto que será compartilhado através do contexto.
  const value = {
    usuario,
    carregando,
    loginComGoogle,
    logout,
  };

  // Retorna o Provedor do Contexto, envolvendo os componentes filhos.
  // Os filhos só são renderizados após a verificação inicial de autenticação (`!carregando`).
  return (
    <AuthContext.Provider value={value}>
      {!carregando && children}
    </AuthContext.Provider>
  );
}
