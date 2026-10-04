// Perguntas mocadas de cada quiz.
// A chave é o mesmo "id" usado em quizzes.js.
//
// Cada pergunta tem:
//   descricao     -> selo pequeno acima da pergunta (ex.: "Dado sensível")
//   titulo        -> a pergunta em si
//   alternativas  -> sempre 4 textos (A, B, C, D)
//   correta       -> posição da alternativa certa (0 = A, 1 = B, 2 = C, 3 = D)
//   explicacao    -> frase curta exibida depois que o usuário confirma
//
// Quando houver back-end, basta trocar este arquivo por uma chamada à API
// que devolva o mesmo formato.

export const perguntasPorQuiz = {
    "lgpd": [
        {
            descricao: "Decisão do dia",
            titulo: "Um ACS pode compartilhar dados pessoais de um paciente em um grupo de WhatsApp da equipe?",
            alternativas: [
                "Sim, se o grupo tiver profissionais de saúde.",
                "Não, deve usar somente meios autorizados e necessários.",
                "Sim, quando a família autorizar verbalmente.",
                "Somente se o número do prontuário não aparecer.",
            ],
            correta: 1,
            explicacao:
                "Dados de saúde são sensíveis. Use apenas os canais oficiais da unidade e compartilhe somente o que for necessário para o cuidado.",
        },
        {
            descricao: "Dado sensível",
            titulo: "Qual destas informações é considerada dado pessoal sensível pela LGPD?",
            alternativas: [
                "O endereço da residência do paciente.",
                "O número de telefone do paciente.",
                "Uma informação sobre a condição de saúde do paciente.",
                "O nome completo do paciente.",
            ],
            correta: 2,
            explicacao:
                "Dados sobre saúde, origem racial, religião e biometria, entre outros, são sensíveis e exigem proteção reforçada.",
        },
        {
            descricao: "Direitos do titular",
            titulo: "Uma moradora pergunta quais dados dela a unidade de saúde mantém. O que a LGPD garante a ela?",
            alternativas: [
                "Nada, pois os dados pertencem à unidade de saúde.",
                "Somente o direito de ver resultados de exames.",
                "O direito de consultar os dados apenas mediante pagamento de taxa.",
                "O direito de confirmar o tratamento e de acessar os seus dados.",
            ],
            correta: 3,
            explicacao:
                "O titular pode confirmar se há tratamento de dados e acessá-los, além de pedir correção, entre outros direitos.",
        },
        {
            descricao: "Incidente de segurança",
            titulo: "Você perdeu uma caderneta com anotações de pacientes. Qual deve ser a atitude?",
            alternativas: [
                "Avisar imediatamente o responsável da unidade, para que o incidente seja tratado.",
                "Não contar a ninguém, para evitar problemas.",
                "Esperar alguns dias para ver se alguém devolve.",
                "Avisar apenas os pacientes que aparecem nas anotações.",
            ],
            correta: 0,
            explicacao:
                "Incidentes devem ser comunicados logo, para que a unidade avalie os riscos e tome as providências necessárias.",
        },
    ],

    "letramento-digital": [
        {
            descricao: "Notícia suspeita",
            titulo: "Você recebe em um grupo uma notícia de saúde alarmante. Qual é o melhor primeiro passo?",
            alternativas: [
                "Compartilhar logo, pois pode ajudar alguém.",
                "Acreditar se muitas pessoas já compartilharam.",
                "Compartilhar apenas se a imagem for convincente.",
                "Verificar a fonte e confirmar em sites oficiais antes de compartilhar.",
            ],
            correta: 3,
            explicacao:
                "Antes de compartilhar, confira quem publicou e confirme a informação em fontes oficiais.",
        },
        {
            descricao: "Fontes oficiais",
            titulo: "Qual destes é o endereço mais confiável para buscar informações oficiais sobre saúde?",
            alternativas: [
                "gov.br/saude",
                "saude-oficial-gratis.net",
                "Um perfil anônimo em rede social",
                "Um blog sem autoria identificada",
            ],
            correta: 0,
            explicacao:
                "Sites de órgãos públicos, como o do Ministério da Saúde, têm responsáveis identificáveis e conteúdo revisado.",
        },
        {
            descricao: "Armazenamento",
            titulo: "O que é um arquivo guardado na nuvem?",
            alternativas: [
                "Um arquivo que existe apenas em um cartão de memória.",
                "Um arquivo que desaparece depois de aberto.",
                "Um arquivo armazenado em servidores na internet e acessível de diferentes dispositivos.",
                "Um arquivo que só funciona sem internet.",
            ],
            correta: 2,
            explicacao:
                "Na nuvem, os arquivos ficam em servidores remotos e podem ser acessados, de vários aparelhos, por quem tem permissão.",
        },
        {
            descricao: "Formulários online",
            titulo: "Ao preencher um formulário online, o que você deve observar?",
            alternativas: [
                "Se o formulário tem cores bonitas.",
                "Se o endereço é seguro (https) e se os dados pedidos são realmente necessários.",
                "Se ele pede também a senha do seu e-mail, para facilitar o acesso.",
                "Nada, pois todo formulário é seguro.",
            ],
            correta: 1,
            explicacao:
                "Um endereço seguro e pedidos de dados compatíveis com a finalidade reduzem o risco de golpes.",
        },
        {
            descricao: "Convivência digital",
            titulo: "Qual atitude demonstra boa convivência no ambiente digital?",
            alternativas: [
                "Responder com agressividade a quem discorda.",
                "Publicar fotos de pacientes para mostrar o trabalho.",
                "Compartilhar conversas privadas sem pedir licença.",
                "Respeitar as pessoas, evitar expor terceiros e pensar antes de publicar.",
            ],
            correta: 3,
            explicacao:
                "Respeito e cuidado ao publicar protegem a privacidade e a imagem das pessoas, inclusive a dos pacientes.",
        },
    ],

    "seguranca-da-informacao": [
        {
            descricao: "Senhas",
            titulo: "Qual destas senhas é a mais segura?",
            alternativas: [
                "acs12345",
                "A data de nascimento do usuário.",
                "Uma combinação longa de letras, números e símbolos.",
                "A mesma senha usada em todos os sites.",
            ],
            correta: 2,
            explicacao:
                "Senhas longas e variadas são mais difíceis de adivinhar, e cada serviço deve ter a sua.",
        },
        {
            descricao: "Phishing",
            titulo: "Chega uma mensagem dizendo que você ganhou um prêmio e pedindo que clique em um link. O que fazer?",
            alternativas: [
                "Não clicar, desconfiar e avisar o responsável ou apagar a mensagem.",
                "Clicar rápido, antes que a oferta acabe.",
                "Encaminhar para os colegas aproveitarem também.",
                "Informar seus dados para receber o prêmio.",
            ],
            correta: 0,
            explicacao:
                "Mensagens com urgência e promessas fáceis são sinais clássicos de golpe de phishing.",
        },
        {
            descricao: "Backup",
            titulo: "Por que é importante manter backups (cópias de segurança)?",
            alternativas: [
                "Servem apenas para liberar espaço no computador.",
                "Permitem recuperar as informações em caso de perda, falha ou ataque.",
                "Aumentam a velocidade da internet.",
                "Substituem a necessidade de usar senhas.",
            ],
            correta: 1,
            explicacao:
                "Com uma cópia atualizada, é possível restaurar os dados mesmo após falha do equipamento ou ataque.",
        },
    ],

    "saude-digital": [
        {
            descricao: "Conceito",
            titulo: "O que é a telessaúde?",
            alternativas: [
                "Um aplicativo de jogos para estimular pacientes.",
                "O uso de tecnologias para oferecer serviços e apoio em saúde à distância.",
                "Um tipo de exame feito em laboratório.",
                "A venda de medicamentos pela internet.",
            ],
            correta: 1,
            explicacao:
                "A telessaúde usa tecnologias de informação e comunicação para apoiar o cuidado, a educação e a gestão em saúde à distância.",
        },
        {
            descricao: "Prontuário eletrônico",
            titulo: "Qual é uma vantagem do prontuário eletrônico?",
            alternativas: [
                "Dispensa o uso de senha para acessar.",
                "Permite que qualquer pessoa da comunidade consulte os dados.",
                "Facilita o acesso ao histórico do paciente por profissionais autorizados.",
                "Elimina a necessidade de registrar os atendimentos.",
            ],
            correta: 2,
            explicacao:
                "Ele reúne o histórico em um só lugar, com acesso controlado, o que melhora a continuidade do cuidado.",
        },
        {
            descricao: "Visita domiciliar",
            titulo: "Durante uma visita domiciliar, qual cuidado é essencial ao usar o tablet da unidade?",
            alternativas: [
                "Deixar a tela desbloqueada para agilizar os registros.",
                "Emprestar o aparelho a familiares enquanto você conversa.",
                "Anotar os dados também em um aplicativo pessoal, para não esquecer.",
                "Manter o bloqueio por senha e não deixar o aparelho sem supervisão.",
            ],
            correta: 3,
            explicacao:
                "O aparelho guarda dados de pacientes. Bloqueio e atenção constante evitam acessos indevidos.",
        },
        {
            descricao: "Informação confiável",
            titulo: "Um paciente quer seguir orientações de saúde que viu em um aplicativo desconhecido. O que fazer?",
            alternativas: [
                "Orientar a buscar fontes confiáveis, como as do SUS, e conversar com a equipe de saúde.",
                "Recomendar o aplicativo que tiver mais avaliações.",
                "Dizer que a internet nunca deve ser usada para assuntos de saúde.",
                "Indicar o tratamento que está mais popular nas redes sociais.",
            ],
            correta: 0,
            explicacao:
                "Informações de saúde precisam de fonte confiável e acompanhamento profissional. Popularidade não é garantia de qualidade.",
        },
    ],
};