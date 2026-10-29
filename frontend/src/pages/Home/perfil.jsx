import { useRef, useState } from "react";

import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/useTheme";
import { quizzes } from "../../data/quizzes";
import { useProgresso } from "../../hooks/useProgresso";
import { api, ApiError } from "../../services/api";
import { lerFoto, salvarFoto } from "../../utils/perfil";
import {
    SENHA_MIN,
    normalizarEmail,
    validarEmail,
    validarSenha,
} from "../../utils/validacao";

import "../../assets/css/pages_css/perfil.css";

const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;
const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const EXTENSOES_IMAGEM = [".jpg", ".jpeg", ".png", ".webp"];
const NOME_MAX = 100; 

function obterIniciais(nome) {
    return nome
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("") || "U";
}

function Perfil() {
    const { usuario, atualizarUsuario } = useAuth();
    const { theme, setTheme } = useTheme();
    const { historico, carregando, erro, recarregar } = useProgresso();

    // Nome e e-mail começam com o que veio do banco 
    const [nome, setNome] = useState(usuario.nome);
    const [email, setEmail] = useState(usuario.email);

    // A foto ainda é local
    const [fotoSalva, setFotoSalva] = useState(() => lerFoto(usuario.id_usuario));
    const [foto, setFoto] = useState(fotoSalva);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const [erros, setErros] = useState({});
    const [erroFoto, setErroFoto] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const inputFotoRef = useRef(null);

  
    const alterado =
        nome !== usuario.nome ||
        email !== usuario.email ||
        foto !== fotoSalva ||
        senha !== "" ||
        confirmacaoSenha !== "";

    const itensProgresso = quizzes.map((quiz) => {
        const item = historico.find((registro) => registro?.id === quiz.id);
        const progresso = item ? Number(item.progresso) : 0;

        return {
            id: quiz.id,
            status: item ? item.status : "novo",
            progresso: Number.isFinite(progresso)
                ? Math.min(100, Math.max(0, progresso))
                : 0,
        };
    });
    const concluidos = itensProgresso.filter((item) => item.status === "concluido").length;
    const emAndamento = itensProgresso.filter((item) => item.status === "andamento").length;
    const progressoGeral = itensProgresso.length
        ? Math.round(
            itensProgresso.reduce((total, item) => total + item.progresso, 0) /
            itensProgresso.length
        )
        : 0;

    function atualizarCampo(setter, valor) {
        setter(valor);
        setFeedback(null);
    }

    function selecionarFoto(evento) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = "";
        if (!arquivo) return;

        const nomeArquivo = arquivo.name.toLowerCase();
        const extensaoValida = EXTENSOES_IMAGEM.some((extensao) =>
            nomeArquivo.endsWith(extensao)
        );
        const tipoValido = TIPOS_IMAGEM.includes(arquivo.type);

        if (!tipoValido || !extensaoValida) {
            setErroFoto("Escolha uma imagem JPG, PNG ou WEBP.");
            return;
        }

        if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
            setErroFoto("A imagem deve ter no máximo 2 MB.");
            return;
        }

        const leitor = new FileReader();
        leitor.onload = () => {
            if (typeof leitor.result !== "string") {
                setErroFoto("Não foi possível carregar essa imagem. Tente outro arquivo.");
                return;
            }

            setFoto(leitor.result);
            setErroFoto("");
            setFeedback(null);
        };
        leitor.onerror = () => {
            setErroFoto("Não foi possível carregar essa imagem. Tente outro arquivo.");
        };
        leitor.readAsDataURL(arquivo);
    }

    function validarFormulario() {
        const novosErros = {};

        if (!nome.trim()) {
            novosErros.nome = "Informe seu nome.";
        } else if (nome.trim().length > NOME_MAX) {
            novosErros.nome = `O nome deve ter no máximo ${NOME_MAX} caracteres.`;
        }

        const erroEmail = validarEmail(normalizarEmail(email));
        if (erroEmail) {
            novosErros.email = erroEmail;
        }

        if (senha) {
            const erroSenha = validarSenha(senha);
            if (erroSenha) novosErros.senha = erroSenha;

            if (!senhaAtual) {
                novosErros.senhaAtual = "Informe sua senha atual para trocar a senha.";
            }
        }

        if (confirmacaoSenha && !senha) {
            novosErros.senha = "Informe a nova senha.";
        } else if (senha && !confirmacaoSenha) {
            novosErros.confirmacaoSenha = "Confirme a nova senha.";
        } else if (senha && confirmacaoSenha !== senha) {
            novosErros.confirmacaoSenha = "As senhas não coincidem.";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    async function salvarAlteracoes(evento) {
        evento.preventDefault();
        if (salvando) return;

        setFeedback(null);

        if (!validarFormulario()) return;

        const nomeLimpo = nome.trim();
        const emailLimpo = normalizarEmail(email);

        // Envia para a API só o que mudou
        const corpo = {};
        if (nomeLimpo !== usuario.nome) corpo.nome = nomeLimpo;
        if (emailLimpo !== usuario.email) corpo.email = emailLimpo;
        if (senha) {
            corpo.senha = senha;
            corpo.senha_atual = senhaAtual;
        }

        const mudouFoto = foto !== fotoSalva;
        const temDadosParaEnviar = Object.keys(corpo).length > 0;

        setSalvando(true);

        try {
            if (temDadosParaEnviar) {
                const resposta = await api.put(`/usuarios/${usuario.id_usuario}`, corpo);
                // Atualiza o contexto: o Header muda o nome na hora
                atualizarUsuario(resposta.usuario);
            }

            let fotoOk = true;
            if (mudouFoto) {
                fotoOk = salvarFoto(usuario.id_usuario, foto);
                if (fotoOk) setFotoSalva(foto);
            }

            // Mostra no formulário os valores já tratados
            setNome(nomeLimpo);
            setEmail(emailLimpo);
            setSenhaAtual("");
            setSenha("");
            setConfirmacaoSenha("");
            setErros({});

            if (!fotoOk) {
                setFeedback({
                    tipo: "erro",
                    mensagem: "Seus dados foram salvos, mas a foto não coube no navegador. Tente uma imagem menor.",
                });
            } else {
                setFeedback({
                    tipo: "sucesso",
                    mensagem: senha
                        ? "Alterações salvas. Sua senha foi atualizada."
                        : "Alterações salvas com sucesso.",
                });
            }
        } catch (falha) {
            setFeedback({
                tipo: "erro",
                mensagem:
                    falha instanceof ApiError
                        ? falha.message
                        : "Não foi possível salvar. Tente novamente.",
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="perfil anim-page-enter">
            <header className="perfil-top">
                <h1>Meu perfil</h1>
                <p>Gerencie suas informações pessoais e acompanhe sua jornada.</p>
            </header>

            <div className="perfil-layout">
                <section className="perfil-card perfil-form-card" aria-labelledby="perfil-dados-titulo">
                    <div className="perfil-identidade">
                        <div className="perfil-avatar-area">
                            <button
                                className="perfil-avatar-botao"
                                type="button"
                                onClick={() => inputFotoRef.current?.click()}
                                aria-label="Escolher foto de perfil"
                            >
                                {foto ? (
                                    <img src={foto} alt={`Foto de perfil de ${nome || "usuário"}`} />
                                ) : (
                                    <span aria-hidden="true">{obterIniciais(nome)}</span>
                                )}
                                <span className="perfil-camera" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 4h-4l-2 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3Z" />
                                        <circle cx="12" cy="13" r="3" />
                                    </svg>
                                </span>
                            </button>
                            <input
                                ref={inputFotoRef}
                                className="perfil-file-input"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                onChange={selecionarFoto}
                                aria-label="Selecionar uma imagem de perfil"
                            />
                        </div>

                        <div className="perfil-identidade-texto">
                            <span className="perfil-sobretitulo">Sua conta</span>
                            <h2>{nome.trim() || "Seu nome"}</h2>
                            <p>JPG, PNG ou WEBP · até 2 MB</p>
                            {erroFoto && <p className="perfil-erro-foto" role="alert">{erroFoto}</p>}
                        </div>
                    </div>

                    <form className="perfil-formulario" onSubmit={salvarAlteracoes} noValidate>
                        <div className="perfil-secao-titulo">
                            <h2 id="perfil-dados-titulo">Informações pessoais</h2>
                            <p>Atualize os dados da sua conta.</p>
                        </div>

                        <div className="perfil-campos">
                            <div className="perfil-campo">
                                <label htmlFor="perfil-nome">Nome</label>
                                <input
                                    id="perfil-nome"
                                    type="text"
                                    autoComplete="name"
                                    maxLength={NOME_MAX}
                                    value={nome}
                                    onChange={(evento) => {
                                        atualizarCampo(setNome, evento.target.value);
                                        setErros((atuais) => ({ ...atuais, nome: "" }));
                                    }}
                                    aria-invalid={Boolean(erros.nome)}
                                    aria-describedby={erros.nome ? "perfil-nome-erro" : undefined}
                                />
                                {erros.nome && <span className="perfil-erro" id="perfil-nome-erro">{erros.nome}</span>}
                            </div>

                            <div className="perfil-campo">
                                <label htmlFor="perfil-email">E-mail</label>
                                <input
                                    id="perfil-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(evento) => {
                                        atualizarCampo(setEmail, evento.target.value);
                                        setErros((atuais) => ({ ...atuais, email: "" }));
                                    }}
                                    aria-invalid={Boolean(erros.email)}
                                    aria-describedby={erros.email ? "perfil-email-erro" : undefined}
                                />
                                {erros.email && <span className="perfil-erro" id="perfil-email-erro">{erros.email}</span>}
                            </div>
                        </div>

                        <div className="perfil-secao-titulo perfil-senha-titulo">
                            <h2>Alterar senha</h2>
                            <p>Para trocar a senha, informe a atual e a nova. Deixe em branco se não quiser alterar.</p>
                        </div>

                        <div className="perfil-campos">
                            <div className="perfil-campo">
                                <label htmlFor="perfil-senha-atual">Senha atual</label>
                                <div className="perfil-senha-campo">
                                    <input
                                        id="perfil-senha-atual"
                                        type={mostrarSenhaAtual ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={senhaAtual}
                                        onChange={(evento) => {
                                            atualizarCampo(setSenhaAtual, evento.target.value);
                                            setErros((atuais) => ({ ...atuais, senhaAtual: "" }));
                                        }}
                                        aria-invalid={Boolean(erros.senhaAtual)}
                                        aria-describedby={erros.senhaAtual ? "perfil-senha-atual-erro" : undefined}
                                    />
                                    <button
                                        className="perfil-mostrar-senha"
                                        type="button"
                                        onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                                        aria-label={mostrarSenhaAtual ? "Ocultar senha atual" : "Mostrar senha atual"}
                                    >
                                        {mostrarSenhaAtual ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                                {erros.senhaAtual && (
                                    <span className="perfil-erro" id="perfil-senha-atual-erro">{erros.senhaAtual}</span>
                                )}
                            </div>
                        </div>

                        <div className="perfil-campos">
                            <div className="perfil-campo">
                                <label htmlFor="perfil-senha">Nova senha</label>
                                <div className="perfil-senha-campo">
                                    <input
                                        id="perfil-senha"
                                        type={mostrarSenha ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={senha}
                                        onChange={(evento) => {
                                            atualizarCampo(setSenha, evento.target.value);
                                            setErros((atuais) => ({ ...atuais, senha: "", confirmacaoSenha: "" }));
                                        }}
                                        aria-invalid={Boolean(erros.senha)}
                                        aria-describedby={erros.senha ? "perfil-senha-erro" : "perfil-senha-ajuda"}
                                    />
                                    <button
                                        className="perfil-mostrar-senha"
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        aria-label={mostrarSenha ? "Ocultar nova senha" : "Mostrar nova senha"}
                                    >
                                        {mostrarSenha ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                                {erros.senha
                                    ? <span className="perfil-erro" id="perfil-senha-erro">{erros.senha}</span>
                                    : <span className="perfil-ajuda" id="perfil-senha-ajuda">Mínimo de {SENHA_MIN} caracteres.</span>}
                            </div>

                            <div className="perfil-campo">
                                <label htmlFor="perfil-confirmacao-senha">Confirmar nova senha</label>
                                <div className="perfil-senha-campo">
                                    <input
                                        id="perfil-confirmacao-senha"
                                        type={mostrarConfirmacao ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={confirmacaoSenha}
                                        onChange={(evento) => {
                                            atualizarCampo(setConfirmacaoSenha, evento.target.value);
                                            setErros((atuais) => ({ ...atuais, confirmacaoSenha: "" }));
                                        }}
                                        aria-invalid={Boolean(erros.confirmacaoSenha)}
                                        aria-describedby={erros.confirmacaoSenha ? "perfil-confirmacao-erro" : undefined}
                                    />
                                    <button
                                        className="perfil-mostrar-senha"
                                        type="button"
                                        onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                                        aria-label={mostrarConfirmacao ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                                    >
                                        {mostrarConfirmacao ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                                {erros.confirmacaoSenha && (
                                    <span className="perfil-erro" id="perfil-confirmacao-erro">{erros.confirmacaoSenha}</span>
                                )}
                            </div>
                        </div>

                        {feedback && (
                            <p
                                className={`perfil-feedback perfil-feedback-${feedback.tipo}`}
                                role={feedback.tipo === "erro" ? "alert" : "status"}
                            >
                                {feedback.mensagem}
                            </p>
                        )}

                        <div className="perfil-acoes">
                            <button className="perfil-salvar" type="submit" disabled={!alterado || salvando}>
                                {salvando
                                    ? "Salvando..."
                                    : alterado
                                        ? "Salvar alterações"
                                        : "Editar informações"}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="perfil-lateral">
                    <section className="perfil-card perfil-progresso" aria-labelledby="perfil-progresso-titulo">
                        <div className="perfil-card-titulo">
                            <span className="perfil-sobretitulo">Sua jornada</span>
                            <h2 id="perfil-progresso-titulo">Meu progresso</h2>
                        </div>

                        {carregando ? (
                            <div role="status">Carregando seu progresso...</div>
                        ) : erro ? (
                            <div role="alert">
                                Não foi possível carregar seu progresso.
                                <button type="button" onClick={recarregar}>Tentar novamente</button>
                            </div>
                        ) : (
                            <>
                                <div className="perfil-progresso-numero">
                                    <strong>{progressoGeral}%</strong>
                                    <span>concluído</span>
                                </div>
                                <div
                                    className="perfil-barra"
                                    role="progressbar"
                                    aria-label="Progresso geral dos quizzes"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-valuenow={progressoGeral}
                                >
                                    <span style={{ width: `${progressoGeral}%` }} />
                                </div>
                                <p className="perfil-progresso-resumo">
                                    {concluidos} de {quizzes.length} quizzes concluídos
                                </p>
                                <div className="perfil-progresso-detalhe">
                                    <span>Em andamento</span>
                                    <strong>{emAndamento}</strong>
                                </div>
                            </>
                        )}
                    </section>

                    <section className="perfil-card perfil-tema" aria-labelledby="perfil-tema-titulo">
                        <div>
                            <h2 id="perfil-tema-titulo">Aparência</h2>
                            <p>Escolha sua preferência de tema.</p>
                        </div>
                        <label className="perfil-tema-controle">
                            <span>{theme === "dark" ? "Escuro" : "Claro"}</span>
                            <input
                                type="checkbox"
                                role="switch"
                                checked={theme === "dark"}
                                onChange={(evento) => setTheme(evento.target.checked ? "dark" : "light")}
                                aria-label={theme === "dark" ? "Desativar tema escuro" : "Ativar tema escuro"}
                                aria-pressed={theme === "dark"}
                            />
                            <span className="perfil-tema-trilho" aria-hidden="true" />
                        </label>
                        <p className="perfil-tema-nota">
                            O tema é aplicado imediatamente durante esta sessão.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default Perfil;