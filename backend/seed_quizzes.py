from app import create_app, db
from app.models.models import Alternativa, Pergunta, Quiz


QUIZZES = (
    {
        "nome": "LGPD",
        "descricao": (
            "Entenda a Lei Geral de Proteção de Dados: direitos dos titulares, "
            "deveres e boas práticas no tratamento de dados pessoais."
        ),
        "cor": "card-lgpd",
        "perguntas": (
            (
                "Um ACS pode compartilhar dados pessoais de um paciente em um grupo de WhatsApp da equipe?",
                "Dados de saúde são sensíveis. Use apenas os canais oficiais da unidade e compartilhe somente o que for necessário para o cuidado.",
                (
                    ("Sim, se o grupo tiver profissionais de saúde.", False),
                    ("Não, deve usar somente meios autorizados e necessários.", True),
                    ("Sim, quando a família autorizar verbalmente.", False),
                    ("Somente se o número do prontuário não aparecer.", False),
                ),
            ),
            (
                "Qual destas informações é considerada dado pessoal sensível pela LGPD?",
                "Dados sobre saúde, origem racial, religião e biometria, entre outros, são sensíveis e exigem proteção reforçada.",
                (
                    ("O endereço da residência do paciente.", False),
                    ("O número de telefone do paciente.", False),
                    ("Uma informação sobre a condição de saúde do paciente.", True),
                    ("O nome completo do paciente.", False),
                ),
            ),
            (
                "Uma moradora pergunta quais dados dela a unidade de saúde mantém. O que a LGPD garante a ela?",
                "O titular pode confirmar se há tratamento de dados e acessá-los, além de pedir correção, entre outros direitos.",
                (
                    ("Nada, pois os dados pertencem à unidade de saúde.", False),
                    ("Somente o direito de ver resultados de exames.", False),
                    ("O direito de consultar os dados apenas mediante pagamento de taxa.", False),
                    ("O direito de confirmar o tratamento e de acessar os seus dados.", True),
                ),
            ),
            (
                "Você perdeu uma caderneta com anotações de pacientes. Qual deve ser a atitude?",
                "Incidentes devem ser comunicados logo, para que a unidade avalie os riscos e tome as providências necessárias.",
                (
                    ("Avisar imediatamente o responsável da unidade, para que o incidente seja tratado.", True),
                    ("Não contar a ninguém, para evitar problemas.", False),
                    ("Esperar alguns dias para ver se alguém devolve.", False),
                    ("Avisar apenas os pacientes que aparecem nas anotações.", False),
                ),
            ),
        ),
    },
    {
        "nome": "Letramento Digital",
        "descricao": (
            "Desenvolva habilidades para usar as tecnologias digitais com "
            "autonomia, senso crítico e responsabilidade."
        ),
        "cor": "card-letramento",
        "perguntas": (
            (
                "Você recebe em um grupo uma notícia de saúde alarmante. Qual é o melhor primeiro passo?",
                "Antes de compartilhar, confira quem publicou e confirme a informação em fontes oficiais.",
                (
                    ("Compartilhar logo, pois pode ajudar alguém.", False),
                    ("Acreditar se muitas pessoas já compartilharam.", False),
                    ("Compartilhar apenas se a imagem for convincente.", False),
                    ("Verificar a fonte e confirmar em sites oficiais antes de compartilhar.", True),
                ),
            ),
            (
                "Qual destes é o endereço mais confiável para buscar informações oficiais sobre saúde?",
                "Sites de órgãos públicos, como o do Ministério da Saúde, têm responsáveis identificáveis e conteúdo revisado.",
                (
                    ("gov.br/saude", True),
                    ("saude-oficial-gratis.net", False),
                    ("Um perfil anônimo em rede social", False),
                    ("Um blog sem autoria identificada", False),
                ),
            ),
            (
                "O que é um arquivo guardado na nuvem?",
                "Na nuvem, os arquivos ficam em servidores remotos e podem ser acessados, de vários aparelhos, por quem tem permissão.",
                (
                    ("Um arquivo que existe apenas em um cartão de memória.", False),
                    ("Um arquivo que desaparece depois de aberto.", False),
                    ("Um arquivo armazenado em servidores na internet e acessível de diferentes dispositivos.", True),
                    ("Um arquivo que só funciona sem internet.", False),
                ),
            ),
            (
                "Ao preencher um formulário online, o que você deve observar?",
                "Um endereço seguro e pedidos de dados compatíveis com a finalidade reduzem o risco de golpes.",
                (
                    ("Se o formulário tem cores bonitas.", False),
                    ("Se o endereço é seguro (https) e se os dados pedidos são realmente necessários.", True),
                    ("Se ele pede também a senha do seu e-mail, para facilitar o acesso.", False),
                    ("Nada, pois todo formulário é seguro.", False),
                ),
            ),
            (
                "Qual atitude demonstra boa convivência no ambiente digital?",
                "Respeito e cuidado ao publicar protegem a privacidade e a imagem das pessoas, inclusive a dos pacientes.",
                (
                    ("Responder com agressividade a quem discorda.", False),
                    ("Publicar fotos de pacientes para mostrar o trabalho.", False),
                    ("Compartilhar conversas privadas sem pedir licença.", False),
                    ("Respeitar as pessoas, evitar expor terceiros e pensar antes de publicar.", True),
                ),
            ),
        ),
    },
    {
        "nome": "Segurança da Informação",
        "descricao": (
            "Aprenda a proteger dados e sistemas: senhas fortes, golpes de "
            "phishing, backups e cuidados do dia a dia."
        ),
        "cor": "card-seguranca",
        "perguntas": (
            (
                "Qual destas senhas é a mais segura?",
                "Senhas longas e variadas são mais difíceis de adivinhar, e cada serviço deve ter a sua.",
                (
                    ("acs12345", False),
                    ("A data de nascimento do usuário.", False),
                    ("Uma combinação longa de letras, números e símbolos.", True),
                    ("A mesma senha usada em todos os sites.", False),
                ),
            ),
            (
                "Chega uma mensagem dizendo que você ganhou um prêmio e pedindo que clique em um link. O que fazer?",
                "Mensagens com urgência e promessas fáceis são sinais clássicos de golpe de phishing.",
                (
                    ("Não clicar, desconfiar e avisar o responsável ou apagar a mensagem.", True),
                    ("Clicar rápido, antes que a oferta acabe.", False),
                    ("Encaminhar para os colegas aproveitarem também.", False),
                    ("Informar seus dados para receber o prêmio.", False),
                ),
            ),
            (
                "Por que é importante manter backups (cópias de segurança)?",
                "Com uma cópia atualizada, é possível restaurar os dados mesmo após falha do equipamento ou ataque.",
                (
                    ("Servem apenas para liberar espaço no computador.", False),
                    ("Permitem recuperar as informações em caso de perda, falha ou ataque.", True),
                    ("Aumentam a velocidade da internet.", False),
                    ("Substituem a necessidade de usar senhas.", False),
                ),
            ),
        ),
    },
    {
        "nome": "Saúde Digital",
        "descricao": (
            "Conheça o uso da tecnologia na saúde, como prontuário eletrônico, "
            "telessaúde e cuidados com os dados dos pacientes."
        ),
        "cor": "card-saude",
        "perguntas": (
            (
                "O que é a telessaúde?",
                "A telessaúde usa tecnologias de informação e comunicação para apoiar o cuidado, a educação e a gestão em saúde à distância.",
                (
                    ("Um aplicativo de jogos para estimular pacientes.", False),
                    ("O uso de tecnologias para oferecer serviços e apoio em saúde à distância.", True),
                    ("Um tipo de exame feito em laboratório.", False),
                    ("A venda de medicamentos pela internet.", False),
                ),
            ),
            (
                "Qual é uma vantagem do prontuário eletrônico?",
                "Ele reúne o histórico em um só lugar, com acesso controlado, o que melhora a continuidade do cuidado.",
                (
                    ("Dispensa o uso de senha para acessar.", False),
                    ("Permite que qualquer pessoa da comunidade consulte os dados.", False),
                    ("Facilita o acesso ao histórico do paciente por profissionais autorizados.", True),
                    ("Elimina a necessidade de registrar os atendimentos.", False),
                ),
            ),
            (
                "Durante uma visita domiciliar, qual cuidado é essencial ao usar o tablet da unidade?",
                "O aparelho guarda dados de pacientes. Bloqueio e atenção constante evitam acessos indevidos.",
                (
                    ("Deixar a tela desbloqueada para agilizar os registros.", False),
                    ("Emprestar o aparelho a familiares enquanto você conversa.", False),
                    ("Anotar os dados também em um aplicativo pessoal, para não esquecer.", False),
                    ("Manter o bloqueio por senha e não deixar o aparelho sem supervisão.", True),
                ),
            ),
            (
                "Um paciente quer seguir orientações de saúde que viu em um aplicativo desconhecido. O que fazer?",
                "Informações de saúde precisam de fonte confiável e acompanhamento profissional. Popularidade não é garantia de qualidade.",
                (
                    ("Orientar a buscar fontes confiáveis, como as do SUS, e conversar com a equipe de saúde.", True),
                    ("Recomendar o aplicativo que tiver mais avaliações.", False),
                    ("Dizer que a internet nunca deve ser usada para assuntos de saúde.", False),
                    ("Indicar o tratamento que está mais popular nas redes sociais.", False),
                ),
            ),
        ),
    },
)


def seed_quizzes():
    for seed in QUIZZES:
        quiz = Quiz.query.filter_by(nome=seed["nome"]).first()
        if quiz is not None:
            continue

        quiz = Quiz(
            nome=seed["nome"],
            descricao=seed["descricao"],
            cor=seed["cor"],
        )
        db.session.add(quiz)
        db.session.flush()

        for ordem, (enunciado, explicacao, alternativas) in enumerate(
            seed["perguntas"],
            start=1,
        ):
            pergunta = Pergunta(
                enunciado=enunciado,
                explicacao=explicacao,
                ordem=ordem,
                alternativas=[
                    Alternativa(texto=texto, correta=correta)
                    for texto, correta in alternativas
                ],
            )
            quiz.perguntas.append(pergunta)
        quiz.quantidade_perguntas = len(quiz.perguntas)

    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_quizzes()
    print("Quizzes e perguntas iniciais cadastrados.")
