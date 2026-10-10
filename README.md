# Sistema ACS

> Plataforma de educação e capacitação em temas de segurança digital, LGPD, letramento digital e saúde digital.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## Sobre o projeto

O Sistema ACS é uma aplicação web desenvolvida em React para apoiar o aprendizado de temas centrais para a atuação de profissionais da saúde e da comunidade em geral. A proposta atual da interface é oferecer uma experiência de estudo por meio de quizzes, acompanhamento de progresso e materiais introdutórios sobre:

- LGPD
- Letramento digital
- Segurança da informação
- Saúde digital

A aplicação está em desenvolvimento e a estrutura atual representa principalmente o frontend da solução.

## Objetivo

O objetivo do projeto é facilitar a aprendizagem de conceitos importantes para o uso seguro, responsável e informado da tecnologia no contexto da saúde e da proteção de dados.

A interface foi criada para propor uma jornada simples de estudo, com:

- escolha de temas;
- perguntas em sequência;
- feedback imediato de acerto ou erro;
- explicações por questão;
- visualização do progresso no navegador.

## Funcionalidades atuais

### Implementadas

- 🏠 Página inicial com seleção de quizzes
- 🧠 Fluxo de quiz com perguntas, alternativas e explicações
- 📈 Acompanhamento de progresso salvo no navegador via localStorage
- 📝 Histórico de quizzes recentes
- 🔐 Tela de login com campos e alternância de visualização da senha
- 📚 Página de biblioteca com informações gerais e fluxo de uso

### Parcialmente implementadas

- 📚 Biblioteca de materiais, ainda em estrutura informativa e não funcional como repositório de conteúdos
- 🧾 Menu lateral e header com navegação visual, mas com algumas rotas e links ainda não alinhados com a estrutura de rotas atual
- 🔁 Progresso do usuário, que funciona localmente no navegador, mas ainda não sincroniza com backend

### Pendentes / futuras

- 👤 Cadastro de usuários
- 🔑 Recuperação de senha
- 🔐 Reset de senha
- 🗄️ Integração com API e banco de dados
- 🧾 Autenticação real com sessão, token ou sistema de login persistente
- 📦 Armazenamento centralizado de dados e histórico de usuários

## Tecnologias utilizadas

As tecnologias identificadas no código atual são:

- JavaScript
- React
- Vite
- HTML5
- CSS3
- React Router
- LocalStorage para persistência local

## Como o sistema funciona

O fluxo principal é simples:

1. O usuário acessa a interface inicial.
2. Escolhe um tema de quiz.
3. Responde perguntas sequencialmente.
4. A aplicação valida a resposta e exibe o feedback.
5. O progresso é salvo no armazenamento local do navegador.
6. A tela de progresso apresenta o status do usuário por tema.

## Estado atual do desenvolvimento

### Já desenvolvido

- Interface principal em React
- Navegação por rotas internas
- Quiz interativo com dados locais
- Página de progresso funcional localmente
- Base visual para login e áreas do sistema

### Em desenvolvimento

- Autenticação real
- Fluxos de cadastro e recuperação de senha
- Integração com backend
- Persistência de dados em servidor

### Próximas etapas

- Criar camada de serviços/API client
- Implementar backend e autenticação
- Integrar banco de dados
- Expandir biblioteca de materiais
- Ajustar rotas e menu com autenticação real

## Visão futura

A arquitetura prevista para a evolução do sistema é:

- frontend em React para interface e experiência do usuário;
- serviços/APIs para comunicação com o backend;
- API backend para regras de negócio e acesso aos dados;
- banco de dados para persistência de usuários, progresso e conteúdo.

Essa estrutura futura ainda não está implementada no código atual.

## Observações importantes

Este projeto ainda não está finalizado e não deve ser tratado como produto pronto ou em produção. A documentação atual considera o estado real do código disponível no repositório.

Além disso:

- o login atual é uma interface visual, sem autenticação real;
- o cadastro não está implementado como fluxo funcional;
- a recuperação e o reset de senha são apenas referências visuais/pendentes;
- o histórico e o progresso são armazenados no navegador e não em um backend centralizado.

## Como executar o projeto

1. Instale as dependências:

   npm install

2. Inicie a aplicação em modo de desenvolvimento:

   npm run dev

3. Acesse a URL mostrada no terminal pelo Vite.

## Conclusão

O Sistema ACS já possui uma base funcional de frontend para educação digital e acompanhamento de aprendizado. Ele demonstra claramente a intenção do produto e a estrutura inicial do fluxo de uso, mas ainda depende de etapas futuras de backend, autenticação e persistência para evoluir para uma solução completa e integrada.
