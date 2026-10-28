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

A aplicação está em desenvolvimento e inclui frontend React e API Flask com autenticação JWT e persistência de usuários em PostgreSQL.

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
- 🔐 Login e cadastro de usuários integrados à API
- 📚 Página de biblioteca com informações gerais e fluxo de uso

### Parcialmente implementadas

- 📚 Biblioteca de materiais, ainda em estrutura informativa e não funcional como repositório de conteúdos
- 🧾 Menu lateral e header com navegação visual, mas com algumas rotas e links ainda não alinhados com a estrutura de rotas atual
- 🔁 Progresso do usuário, que funciona localmente no navegador, mas ainda não sincroniza com backend

### Pendentes / futuras

- 📦 Sincronização do progresso e histórico de quizzes com o backend

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
- Login, cadastro e áreas autenticadas integrados à API

### Em desenvolvimento

- Sincronização do progresso e do histórico de quizzes com o backend

### Próximas etapas

- Expandir a camada de serviços para a futura sincronização do progresso
- Expandir biblioteca de materiais
- Sincronizar progresso e histórico de quizzes com o backend

## Arquitetura atual e evolução

A arquitetura atual inclui:

- frontend em React para interface e experiência do usuário;
- serviços no frontend para comunicação com a API Flask;
- backend Flask para autenticação, cadastro e gerenciamento de usuários;
- PostgreSQL para persistência dos usuários;
- localStorage para o progresso e histórico dos quizzes.

A sincronização do progresso e a expansão da biblioteca ainda estão previstas.

## Observações importantes

Este projeto ainda não está finalizado e não deve ser tratado como produto pronto ou em produção. A documentação atual considera o estado real do código disponível no repositório.

Além disso:

- login e cadastro usam a API backend com autenticação JWT;
- não há bloqueio de login por tentativas nem recuperação de senha por e-mail;
- o histórico e o progresso são armazenados no navegador e não em um backend centralizado.

## Como executar o projeto

1. Instale as dependências:

   npm install

2. Inicie a aplicação em modo de desenvolvimento:

   npm run dev

3. Acesse a URL mostrada no terminal pelo Vite.

## Conclusão

O Sistema ACS já possui uma base funcional de frontend para educação digital e acompanhamento de aprendizado, além de backend com autenticação e persistência de usuários. A sincronização do progresso e a expansão da biblioteca permanecem como etapas futuras.
