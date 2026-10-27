// Falas do Didio no quiz (etapa 1: falas prontas, sem IA).
//
// Cada fala tem um título curto e um texto.
// O quiz escolhe uma delas de acordo com a pergunta atual.
//
//   inicio -> antes de a pessoa confirmar a resposta
//   acerto -> depois de confirmar, quando acertou
//   erro   -> depois de confirmar, quando errou

export const falasDidio = {
    inicio: [
        {
            titulo: "Estou com você!",
            texto: "Escolha a alternativa que parece mais segura para o paciente. Depois eu explico.",
        },
        {
            titulo: "Sem pressa.",
            texto: "Leia com calma e pense em uma situação parecida da sua rotina de visitas.",
        },
        {
            titulo: "Vamos lá!",
            texto: "Na dúvida, pergunte: isso protege os dados de quem confiou em mim?",
        },
        {
            titulo: "Você consegue!",
            texto: "Marque uma alternativa e confirme quando tiver certeza.",
        },
    ],
    acerto: [
        {
            titulo: "Isso mesmo!",
            texto: "Você pensou como quem cuida bem dos dados dos pacientes.",
        },
        {
            titulo: "Muito bem!",
            texto: "Resposta certa. Veja por que ela é a mais segura.",
        },
        {
            titulo: "Acertou!",
            texto: "É assim que se protege quem a gente atende.",
        },
        {
            titulo: "Boa!",
            texto: "Continue assim. Olha só o motivo.",
        },
    ],
    erro: [
        {
            titulo: "Quase!",
            texto: "Errar faz parte de aprender.",
        },
        {
            titulo: "Não foi dessa vez.",
            texto: "Vamos entender juntos o que torna a outra alternativa mais segura.",
        },
        {
            titulo: "Tudo bem!",
            texto: "Essa pegadinha é comum.",
        },
        {
            titulo: "Calma, acontece.",
            texto: "O importante é entender o motivo.",
        },
    ],
};