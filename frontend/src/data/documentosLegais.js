export const NOME_PLATAFORMA = "Plataforma ACS";
export const NOME_RESPONSAVEL = "[PREENCHER: nome da instituição/responsável]";
export const EMAIL_CONTATO = "[PREENCHER: e-mail do encarregado/DPO]";
export const DATA_ATUALIZACAO = "28/10/2026";

export const termosDeUso = {
  titulo: "Termos de Uso",
  atualizadoEm: DATA_ATUALIZACAO,
  secoes: [
    {
      id: "aceitacao",
      titulo: "Aceitação dos termos",
      paragrafos: [
        `Estes Termos de Uso regulam o acesso e a utilização da ${NOME_PLATAFORMA}. Ao criar uma conta ou utilizar a plataforma, você declara que leu e compreendeu estas condições e concorda com elas. Se não concordar, não utilize os recursos que dependem de uma conta.`,
        "A Política de Privacidade complementa estes termos e explica como os dados pessoais são tratados.",
      ],
    },
    {
      id: "sobre-a-plataforma",
      titulo: "Sobre a plataforma",
      paragrafos: [
        `A ${NOME_PLATAFORMA} oferece quizzes e conteúdos educativos sobre LGPD, letramento digital, segurança da informação e saúde digital, voltados a profissionais da saúde e à comunidade.`,
        "O conteúdo tem finalidade exclusivamente educacional. Não constitui aconselhamento, parecer ou orientação jurídica, médica ou profissional e não substitui a avaliação de profissionais qualificados nem as normas e procedimentos aplicáveis a cada situação.",
      ],
    },
    {
      id: "cadastro-e-conta",
      titulo: "Cadastro e conta",
      paragrafos: [
        "Para criar uma conta, informe dados verdadeiros, completos e atualizados. Você é responsável por manter a confidencialidade da senha e por atividades realizadas por meio da sua conta. Avise o contato indicado nestes termos se suspeitar de uso não autorizado.",
        "O cadastro é destinado a pessoas com 18 anos ou mais. Pessoas menores de 18 anos somente podem utilizar a plataforma com autorização e supervisão de seu responsável legal, observadas as regras da Política de Privacidade.",
      ],
    },
    {
      id: "uso-adequado",
      titulo: "Uso adequado",
      paragrafos: [
        "Você deve utilizar a plataforma de forma lícita, segura e compatível com sua finalidade educacional. É proibido:",
      ],
      itens: [
        "fraudar atividades, resultados, mecanismos de acesso ou informações da plataforma;",
        "tentar acessar contas, sistemas, dados ou áreas sem autorização;",
        "realizar engenharia reversa, descompilar ou tentar obter o código-fonte, salvo quando permitido por lei;",
        "utilizar a plataforma para fins ilícitos ou que violem direitos de terceiros.",
      ],
    },
    {
      id: "propriedade-intelectual",
      titulo: "Propriedade intelectual",
      paragrafos: [
        "A plataforma e seus conteúdos, incluindo textos, elementos visuais, marcas, organização e software, são protegidos pela legislação aplicável e pertencem à pessoa ou entidade titular dos respectivos direitos ou são utilizados com autorização.",
        "Você pode acessar e utilizar os conteúdos para fins pessoais e educacionais, sem remover avisos de autoria. Não copie, distribua, modifique ou explore comercialmente materiais protegidos sem autorização, exceto nas hipóteses permitidas por lei.",
      ],
    },
    {
      id: "disponibilidade",
      titulo: "Disponibilidade e alterações do serviço",
      paragrafos: [
        "Buscamos manter a plataforma disponível e atualizada, mas podem ocorrer interrupções, falhas, manutenção ou alterações de funcionalidades. Quando possível, informaremos mudanças relevantes pelos canais disponíveis.",
        "Recursos podem ser modificados, suspensos ou descontinuados para manutenção, segurança, melhoria ou por exigência legal.",
      ],
    },
    {
      id: "suspensao-conta",
      titulo: "Suspensão ou exclusão de conta",
      paragrafos: [
        "A conta poderá ser suspensa ou excluída quando houver violação destes termos, uso que comprometa a segurança ou o funcionamento da plataforma, solicitação da pessoa usuária ou obrigação legal. Sempre que viável, a pessoa usuária será informada sobre a medida e sua razão.",
        "Para solicitar o encerramento da conta ou esclarecer uma suspensão, escreva para o contato indicado na seção Contato.",
      ],
    },
    {
      id: "limitacao-responsabilidade",
      titulo: "Limitação de responsabilidade",
      paragrafos: [
        "Na medida permitida pela legislação, a plataforma é disponibilizada para apoio educacional e sem garantia de disponibilidade ininterrupta, ausência de erros ou adequação a uma necessidade individual específica.",
        "A utilização dos conteúdos e as decisões tomadas com base neles são de responsabilidade da pessoa usuária. Esta seção não exclui nem limita direitos ou responsabilidades que não possam ser afastados por lei.",
      ],
    },
    {
      id: "alteracoes-termos",
      titulo: "Alterações destes termos",
      paragrafos: [
        "Estes termos podem ser atualizados para refletir mudanças na plataforma, em suas práticas ou na legislação. A data de atualização será indicada no início do documento. Se uma alteração for relevante, procuraremos comunicá-la pelos meios disponíveis.",
        "O uso continuado da plataforma após a publicação de uma nova versão indica ciência dos termos atualizados, sem prejuízo dos direitos previstos em lei.",
      ],
    },
    {
      id: "legislacao-e-foro",
      titulo: "Legislação aplicável e foro",
      paragrafos: [
        "Estes termos são regidos pelas leis da República Federativa do Brasil. Eventuais controvérsias serão submetidas ao foro competente, respeitadas as regras legais de competência e, quando aplicável, as normas de proteção da pessoa consumidora.",
      ],
    },
    {
      id: "contato",
      titulo: "Contato",
      paragrafos: [
        `Para dúvidas sobre estes termos, sobre a plataforma ou para solicitar o encerramento da conta, entre em contato com ${NOME_RESPONSAVEL} pelo e-mail ${EMAIL_CONTATO}.`,
      ],
    },
  ],
};

export const politicaPrivacidade = {
  titulo: "Política de Privacidade",
  atualizadoEm: DATA_ATUALIZACAO,
  secoes: [
    {
      id: "introducao-controlador",
      titulo: "Introdução e controlador dos dados",
      paragrafos: [
        `Esta Política explica como a ${NOME_PLATAFORMA} trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).`,
        `${NOME_RESPONSAVEL} é o controlador dos dados pessoais tratados no contexto da plataforma. O contato para dúvidas e solicitações relacionadas a dados pessoais está indicado na seção Contato.`,
      ],
    },
    {
      id: "dados-coletados",
      titulo: "Dados coletados",
      paragrafos: [
        "De acordo com o funcionamento atual do sistema, os dados tratados incluem:",
      ],
      itens: [
        "nome, e-mail e senha informados durante o cadastro. A senha é armazenada somente em formato de hash criptográfico, nunca em texto puro;",
        "data de cadastro, permissão e status da conta;",
        "progresso e histórico de quizzes, além da foto de perfil, armazenados no próprio navegador por meio do localStorage;",
        "token de sessão armazenado no sessionStorage do navegador, que é apagado quando a aba é fechada.",
      ],
    },
    {
      id: "finalidades",
      titulo: "Finalidades do tratamento",
      paragrafos: [
        "Os dados são tratados para permitir o cadastro, a autenticação e a gestão da conta; disponibilizar os recursos educacionais; registrar o progresso e o histórico de quizzes no navegador; manter controles de permissões e status; e responder a solicitações ou cumprir obrigações legais.",
      ],
    },
    {
      id: "bases-legais",
      titulo: "Bases legais",
      paragrafos: [
        "O tratamento é realizado conforme as hipóteses legais aplicáveis previstas na LGPD, especialmente:",
      ],
      itens: [
        "execução de contrato ou de procedimentos preliminares relacionados à utilização da plataforma, como criação e autenticação da conta;",
        "consentimento, quando solicitado para uma finalidade específica que dependa dessa autorização, podendo ser revogado nos termos da lei;",
        "legítimo interesse para medidas de segurança e proteção das contas e do serviço, após a avaliação dos direitos e das liberdades da pessoa titular.",
      ],
    },
    {
      id: "compartilhamento",
      titulo: "Compartilhamento",
      paragrafos: [
        "Não vendemos dados pessoais. O compartilhamento poderá ocorrer quando exigido por lei, por ordem de autoridade competente ou com provedores de infraestrutura estritamente necessários à operação da plataforma, observadas as medidas e obrigações aplicáveis de proteção de dados.",
      ],
    },
    {
      id: "armazenamento-retencao",
      titulo: "Armazenamento e retenção",
      paragrafos: [
        "Os dados de cadastro e de segurança são mantidos nos sistemas utilizados pela plataforma pelo período necessário à operação da conta, à proteção do serviço e ao cumprimento de obrigações legais. Após esse período, poderão ser eliminados ou mantidos de forma permitida pela legislação.",
        "O progresso, o histórico de quizzes e a foto de perfil são guardados localmente no navegador. A pessoa usuária pode removê-los ao limpar os dados do navegador ou o armazenamento local. O token de sessão permanece no sessionStorage até ser removido ou a aba ser fechada.",
      ],
    },
    {
      id: "seguranca",
      titulo: "Segurança da informação",
      paragrafos: [
        "O sistema utiliza medidas de segurança compatíveis com seu funcionamento atual, incluindo armazenamento de senha em formato hash, token de sessão JWT e controle de permissões. Essas medidas reduzem riscos, mas nenhum sistema pode garantir segurança absoluta.",
        "Mantenha sua senha em sigilo e evite utilizar dispositivos compartilhados sem encerrar a sessão.",
      ],
    },
    {
      id: "direitos-titular",
      titulo: "Direitos do titular",
      paragrafos: [
        "Nos termos do artigo 18 da LGPD e observadas as condições legais aplicáveis, você pode solicitar:",
      ],
      itens: [
        "confirmação da existência de tratamento e acesso aos dados;",
        "correção de dados incompletos, inexatos ou desatualizados;",
        "anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;",
        "portabilidade, conforme regulamentação da autoridade nacional e respeitados os segredos comercial e industrial;",
        "informação sobre entidades públicas e privadas com as quais os dados foram compartilhados;",
        "informação sobre a possibilidade de não fornecer consentimento e suas consequências, quando o tratamento depender de consentimento;",
        "revogação do consentimento, quando essa for a base legal aplicável, sem afetar a licitude do tratamento realizado anteriormente.",
      ],
    },
    {
      id: "cookies-armazenamento-local",
      titulo: "Cookies e armazenamento local",
      paragrafos: [
        "O funcionamento atual descrito nesta política utiliza armazenamento do navegador: o localStorage guarda o progresso e o histórico de quizzes e a foto de perfil; o sessionStorage guarda o token de sessão e é apagado ao fechar a aba. Essas tecnologias não são cookies, mas armazenam informações no dispositivo.",
        "Você pode limpar esses dados pelas configurações do navegador. A remoção pode encerrar sua sessão ou apagar informações locais de progresso e personalização.",
      ],
    },
    {
      id: "criancas-adolescentes",
      titulo: "Crianças e adolescentes",
      paragrafos: [
        "A plataforma é destinada a pessoas com 18 anos ou mais. Pessoas menores de 18 anos somente devem utilizá-la com autorização e supervisão de seu responsável legal. O tratamento de dados de crianças e adolescentes deve observar seu melhor interesse e as exigências específicas da LGPD.",
      ],
    },
    {
      id: "alteracoes-politica",
      titulo: "Alterações desta política",
      paragrafos: [
        "Esta Política poderá ser atualizada para refletir mudanças no sistema, nas práticas de tratamento ou na legislação. A data da versão vigente aparece no início do documento. Alterações relevantes serão comunicadas pelos meios disponíveis, quando apropriado.",
      ],
    },
    {
      id: "contato",
      titulo: "Contato",
      paragrafos: [
        `Para exercer seus direitos, fazer perguntas ou tratar de assuntos relacionados à privacidade, entre em contato com ${NOME_RESPONSAVEL} pelo e-mail ${EMAIL_CONTATO}. Descreva sua solicitação e forneça informações suficientes para que possamos analisá-la com segurança.`,
      ],
    },
  ],
};
