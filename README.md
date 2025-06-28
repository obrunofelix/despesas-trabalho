# Dashboard Financeiro Pessoal

![Screenshot do Dashboard Financeiro](caminho/para/sua/imagem.png)

Um dashboard moderno e interativo para gerenciamento de finanças pessoais, permitindo ao usuário adicionar, visualizar, editar e excluir transações de receitas e despesas. A aplicação conta com resumos financeiros e visualizações gráficas para uma análise clara dos dados.

---

## 🚀 Funcionalidades

-   **CRUD Completo de Transações:** Adicione, leia, atualize e exclua transações financeiras.
-   **Atualizações em Tempo Real:** A interface é atualizada instantaneamente com as mudanças no banco de dados graças à integração com o Firebase Firestore.
-   **Resumo Financeiro:** Cards de destaque que exibem o total de receitas, despesas e o saldo atual.
-   **Visualização Gráfica:** Um gráfico de pizza interativo que mostra a distribuição de despesas por categoria.
-   **Edição Inteligente:** O formulário principal é reutilizado para adição e edição, pré-preenchendo os dados ao selecionar uma transação para editar.
-   **Design Responsivo:** Interface limpa e funcional, inspirada em dashboards profissionais, que se adapta a diferentes tamanhos de tela.
-   **Alertas Modernos:** Notificações e diálogos de confirmação elegantes com a biblioteca SweetAlert2, melhorando a experiência do usuário.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e bibliotecas do ecossistema front-end moderno:

-   **React.js:** Biblioteca principal para a construção da interface de usuário.
-   **Vite:** Ferramenta de build e servidor de desenvolvimento de alta performance.
-   **Firebase (Firestore):** Utilizado como banco de dados NoSQL em tempo real para armazenar e sincronizar todas as transações.
-   **Tailwind CSS:** Framework CSS utility-first para uma estilização rápida e customizável.
-   **Chart.js (com react-chartjs-2):** Para a criação de gráficos interativos.
-   **SweetAlert2:** Para a criação de alertas e modais elegantes e não intrusivos.
-   **Heroicons:** Biblioteca de ícones SVG de alta qualidade.
-   **Hooks do React:** Uso extensivo de `useState`, `useEffect` e `useMemo` para gerenciamento de estado e lógica do componente.

---

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   `npm` ou `yarn`

### Passos

1.  **Clone o repositório (se estiver no GitHub):**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências do projeto:**
    ```bash
    npm install
    ```

3.  **Configure suas variáveis de ambiente do Firebase:**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Dentro deste arquivo, adicione as chaves de configuração do seu projeto Firebase. Você pode encontrá-las nas configurações do seu projeto no console do Firebase.

    **Exemplo do conteúdo do arquivo `.env.local`:**
    ```
    VITE_API_KEY="SUA_API_KEY"
    VITE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
    VITE_PROJECT_ID="SEU_PROJECT_ID"
    VITE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
    VITE_MESSAGING_SENDER_ID="SEU_MESSAGING_SENDER_ID"
    VITE_APP_ID="SEU_APP_ID"
    ```
    *Lembre-se de substituir os valores `SUA_...` pelas suas chaves reais.*

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Abra seu navegador e acesse `http://localhost:5173` (ou o endereço que aparecer no seu terminal).

---

## ✒️ Autor

**Bruno Felix**

-   [GitHub](https://github.com/obrunofelix) 
-   (Adicione seu LinkedIn ou outro contato se desejar)
