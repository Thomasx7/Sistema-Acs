import { useEffect, useRef, useState } from "react";

import {
    atualizarUsuario,
    buscarUsuario,
    criarUsuario,
    excluirUsuario,
} from "../services/admin";
import { ApiError } from "../services/api";
import {
    SENHA_MIN,
    normalizarEmail,
    validarEmail,
    validarSenha,
} from "../utils/validacao";
import { PERMISSAO_ADM } from "../utils/permissoes";
import PasswordField from "./PasswordField";
import "../assets/css/components_css/usuario-modal.css";

const NOME_MAX = 100;

function formatarData(valor) {
    if (typeof valor !== "string") return "-";

    const data = new Date(`${valor.replace(" ", "T")}Z`);
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR");
}

function mensagemDoErro(erro, padrao) {
    return erro instanceof ApiError
        ? erro.message
        : padrao;
}

function UsuarioModal({
    modo,
    usuarioId,
    usuarioLogado,
    onFechar,
    onSalvo,
}) {
    const dialogRef = useRef(null);
    const tituloRef = useRef(null);
    const elementoOrigemRef = useRef(null);
    const camposRef = useRef({});
    const fechadoRef = useRef(false);
    const controllerRef = useRef(null);
    const cicloDialogoRef = useRef(0);
    const ignorarCloseRef = useRef(false);
    const mouseNoFundoRef = useRef(false);
    const [tentativa, setTentativa] = useState(0);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(modo === "editar");
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erroApi, setErroApi] = useState("");
    const [erroExclusao, setErroExclusao] = useState("");
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [permissao, setPermissao] = useState("Comum");
    const [status, setStatus] = useState("Ativo");
    const [senha, setSenha] = useState("");
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
    const [erros, setErros] = useState({});
    const proprioUsuario =
        modo === "editar" &&
        String(usuarioId) === String(usuarioLogado?.id_usuario);

    useEffect(() => {
        elementoOrigemRef.current = document.activeElement;
        const dialogo = dialogRef.current;
        cicloDialogoRef.current += 1;
        if (!dialogo.open) dialogo.showModal();
        tituloRef.current?.focus();

        return () => {
            controllerRef.current?.abort();
            const cicloLimpeza = ++cicloDialogoRef.current;
            queueMicrotask(() => {
                if (cicloDialogoRef.current !== cicloLimpeza) {
                    return;
                }

                if (dialogo.open) {
                    ignorarCloseRef.current = true;
                    dialogo.close();
                }
            });
        };
    }, []);

    useEffect(() => {
        if (modo !== "editar") {
            return undefined;
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        buscarUsuario(usuarioId, { signal: controller.signal })
            .then((dados) => {
                if (controller.signal.aborted) return;
                setUsuario(dados);
                setNome(dados.nome);
                setEmail(dados.email);
                setPermissao(dados.permissao);
                setStatus(dados.status);
            })
            .catch((erro) => {
                if (controller.signal.aborted) return;
                setErroCarregamento(
                    mensagemDoErro(
                        erro,
                        "Não foi possível carregar os dados do usuário. Tente novamente."
                    )
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) setCarregando(false);
            });

        return () => controller.abort();
    }, [modo, usuarioId, tentativa]);

    function concluirFechamento() {
        if (ignorarCloseRef.current) {
            ignorarCloseRef.current = false;
            return;
        }
        if (fechadoRef.current) return;
        fechadoRef.current = true;
        onFechar();
        elementoOrigemRef.current?.focus();
    }

    function fecharModal() {
        const dialogo = dialogRef.current;
        if (dialogo?.open) {
            dialogo.close();
        }
        concluirFechamento();
    }

    function lidarComCancelamento(evento) {
        if (enviando) evento.preventDefault();
    }

    function validarFormulario() {
        const novosErros = {};

        if (!nome.trim()) {
            novosErros.nome = "Informe o nome.";
        } else if (nome.trim().length > NOME_MAX) {
            novosErros.nome = `O nome deve ter no máximo ${NOME_MAX} caracteres.`;
        }

        const erroEmail = validarEmail(normalizarEmail(email));
        if (erroEmail) novosErros.email = erroEmail;

        if (modo === "criar" || senha || confirmacaoSenha) {
            const erroSenha = validarSenha(senha);
            if (erroSenha) novosErros.senha = erroSenha;

            if (!confirmacaoSenha) {
                novosErros.confirmacaoSenha = "Confirme a senha.";
            } else if (senha !== confirmacaoSenha) {
                novosErros.confirmacaoSenha = "As senhas não coincidem.";
            }
        }

        setErros(novosErros);
        const primeiroCampo = Object.keys(novosErros)[0];
        if (primeiroCampo) camposRef.current[primeiroCampo]?.focus();
        return Object.keys(novosErros).length === 0;
    }

    async function salvar(evento) {
        evento.preventDefault();
        if (enviando || !validarFormulario()) return;

        setErroApi("");
        setEnviando(true);
        const nomeLimpo = nome.trim();
        const emailLimpo = normalizarEmail(email);

        try {
            let resposta;
            if (modo === "criar") {
                resposta = await criarUsuario({
                    nome: nomeLimpo,
                    email: emailLimpo,
                    senha,
                    permissao,
                    status,
                });
            } else {
                const dados = {};
                if (nomeLimpo !== usuario.nome) dados.nome = nomeLimpo;
                if (emailLimpo !== usuario.email) dados.email = emailLimpo;
                if (permissao !== usuario.permissao) dados.permissao = permissao;
                if (status !== usuario.status) dados.status = status;
                if (senha) dados.senha = senha;

                resposta = await atualizarUsuario(usuarioId, dados);
            }

            onSalvo(resposta.mensagem, resposta.usuario);
            fecharModal();
        } catch (erro) {
            setErroApi(
                mensagemDoErro(erro, "Não foi possível salvar o usuário. Tente novamente.")
            );
        } finally {
            setEnviando(false);
        }
    }

    async function excluir() {
        if (enviando || proprioUsuario) return;

        setErroExclusao("");
        setEnviando(true);
        try {
            const resposta = await excluirUsuario(usuarioId);
            onSalvo(resposta.mensagem);
            fecharModal();
        } catch (erro) {
            setErroExclusao(
                mensagemDoErro(erro, "Não foi possível excluir o usuário. Tente novamente.")
            );
        } finally {
            setEnviando(false);
        }
    }

    function obterDescricao(campo, textoAjuda) {
        const ids = [];
        if (textoAjuda) ids.push(`usuario-${campo}-ajuda`);
        if (erros[campo]) ids.push(`usuario-${campo}-erro`);
        return ids.length ? ids.join(" ") : undefined;
    }

    function mostrarErro(campo) {
        return erros[campo] ? (
            <span className="usuario-modal-erro-campo" id={`usuario-${campo}-erro`}>
                {erros[campo]}
            </span>
        ) : null;
    }

    return (
        <dialog
            ref={dialogRef}
            className="usuario-modal"
            aria-labelledby="usuario-modal-titulo"
            onClose={concluirFechamento}
            onCancel={lidarComCancelamento}
            onMouseDown={(evento) => {
                mouseNoFundoRef.current = evento.target === evento.currentTarget;
            }}
            onClick={(evento) => {
                const clicouNoFundo =
                    evento.target === evento.currentTarget && mouseNoFundoRef.current;
                mouseNoFundoRef.current = false;
                if (clicouNoFundo && !enviando) fecharModal();
            }}
        >
            <div className="usuario-modal-conteudo">
                <header className="usuario-modal-cabecalho">
                    <div>
                        <h2 id="usuario-modal-titulo" ref={tituloRef} tabIndex="-1">
                            {modo === "criar" ? "Adicionar usuário" : "Editar usuário"}
                        </h2>
                        <p>
                            {modo === "criar"
                                ? "Preencha os dados para criar uma conta."
                                : "Atualize os dados da conta selecionada."}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="usuario-modal-fechar"
                        onClick={fecharModal}
                        disabled={enviando}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </header>

                {carregando && (
                    <p className="usuario-modal-status" role="status">
                        Carregando dados...
                    </p>
                )}

                {!carregando && erroCarregamento && (
                    <div className="usuario-modal-alerta" role="alert">
                        <p>{erroCarregamento}</p>
                        <button
                            type="button"
                            className="usuario-modal-botao usuario-modal-secundario"
                            onClick={() => {
                                setErroCarregamento("");
                                setErroApi("");
                                setCarregando(true);
                                setTentativa((valor) => valor + 1);
                            }}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!carregando && !erroCarregamento && (
                    <>
                        {erroApi && (
                            <div className="usuario-modal-alerta" role="alert">
                                {erroApi}
                            </div>
                        )}

                        {!confirmandoExclusao ? (
                            <form
                                className="usuario-modal-formulario"
                                onSubmit={salvar}
                                noValidate
                            >
                                <div className="usuario-modal-campos">
                                    <div className="usuario-modal-campo usuario-modal-campo-largo">
                                        <label htmlFor="usuario-nome">Nome</label>
                                        <input
                                            ref={(elemento) => {
                                                camposRef.current.nome = elemento;
                                            }}
                                            id="usuario-nome"
                                            type="text"
                                            value={nome}
                                            onChange={(evento) => setNome(evento.target.value)}
                                            maxLength={NOME_MAX}
                                            required
                                            autoComplete="name"
                                            aria-invalid={Boolean(erros.nome)}
                                            aria-describedby={obterDescricao("nome")}
                                        />
                                        {mostrarErro("nome")}
                                    </div>

                                    <div className="usuario-modal-campo usuario-modal-campo-largo">
                                        <label htmlFor="usuario-email">E-mail</label>
                                        <input
                                            ref={(elemento) => {
                                                camposRef.current.email = elemento;
                                            }}
                                            id="usuario-email"
                                            type="email"
                                            value={email}
                                            onChange={(evento) => setEmail(evento.target.value)}
                                            maxLength={100}
                                            required
                                            autoComplete="email"
                                            aria-invalid={Boolean(erros.email)}
                                            aria-describedby={obterDescricao("email")}
                                        />
                                        {mostrarErro("email")}
                                    </div>

                                    <div className="usuario-modal-campo">
                                        <label htmlFor="usuario-permissao">Permissão</label>
                                        <select
                                            ref={(elemento) => {
                                                camposRef.current.permissao = elemento;
                                            }}
                                            id="usuario-permissao"
                                            value={permissao}
                                            onChange={(evento) => setPermissao(evento.target.value)}
                                            disabled={proprioUsuario}
                                            aria-describedby={
                                                proprioUsuario
                                                    ? "usuario-proprio-ajuda"
                                                    : undefined
                                            }
                                        >
                                            <option value={PERMISSAO_ADM}>ADM</option>
                                            <option value="Comum">Comum</option>
                                        </select>
                                    </div>

                                    <div className="usuario-modal-campo">
                                        <label htmlFor="usuario-status">Status</label>
                                        <select
                                            ref={(elemento) => {
                                                camposRef.current.status = elemento;
                                            }}
                                            id="usuario-status"
                                            value={status}
                                            onChange={(evento) => setStatus(evento.target.value)}
                                            disabled={proprioUsuario}
                                            aria-describedby={
                                                proprioUsuario
                                                    ? "usuario-proprio-ajuda"
                                                    : undefined
                                            }
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                {proprioUsuario && modo === "editar" && (
                                    <p
                                        className="usuario-modal-ajuda"
                                        id="usuario-proprio-ajuda"
                                    >
                                        Você não pode alterar a sua própria permissão ou status.
                                    </p>
                                )}

                                {modo === "editar" && usuario && (
                                    <p className="usuario-modal-cadastro">
                                        Cadastrado em: {formatarData(usuario.data_cadastro)}
                                    </p>
                                )}

                                {proprioUsuario && modo === "editar" ? (
                                    <p className="usuario-modal-ajuda">
                                        Para alterar a sua senha, use a página Perfil.
                                    </p>
                                ) : (
                                    <div className="usuario-modal-senhas">
                                        <h3>Senha</h3>
                                        {modo === "editar" && (
                                            <p className="usuario-modal-ajuda" id="usuario-senha-ajuda">
                                                Deixe em branco para manter a senha atual.
                                            </p>
                                        )}
                                        <div className="usuario-modal-campos">
                                            <div className="usuario-modal-campo usuario-modal-campo-largo">
                                                <label htmlFor="usuario-senha">Senha</label>
                                                <PasswordField
                                                    id="usuario-senha"
                                                    inputRef={(elemento) => {
                                                        camposRef.current.senha = elemento;
                                                    }}
                                                    value={senha}
                                                    onChange={(evento) => setSenha(evento.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="Digite uma senha"
                                                    required={modo === "criar"}
                                                    ariaDescribedby={obterDescricao(
                                                        "senha",
                                                        modo === "editar"
                                                    )}
                                                    ariaInvalid={Boolean(erros.senha)}
                                                />
                                                {mostrarErro("senha")}
                                            </div>
                                            <div className="usuario-modal-campo usuario-modal-campo-largo">
                                                <label htmlFor="usuario-confirmacao-senha">
                                                    Confirmar senha
                                                </label>
                                                <PasswordField
                                                    id="usuario-confirmacao-senha"
                                                    inputRef={(elemento) => {
                                                        camposRef.current.confirmacaoSenha = elemento;
                                                    }}
                                                    value={confirmacaoSenha}
                                                    onChange={(evento) =>
                                                        setConfirmacaoSenha(evento.target.value)
                                                    }
                                                    autoComplete="new-password"
                                                    placeholder="Digite a senha novamente"
                                                    required={modo === "criar"}
                                                    ariaDescribedby={obterDescricao("confirmacaoSenha")}
                                                    ariaInvalid={Boolean(erros.confirmacaoSenha)}
                                                />
                                                {mostrarErro("confirmacaoSenha")}
                                            </div>
                                        </div>
                                        <p className="usuario-modal-ajuda">
                                            A senha deve ter no mínimo {SENHA_MIN} caracteres.
                                        </p>
                                    </div>
                                )}

                                <footer className="usuario-modal-acoes">
                                    <button
                                        type="button"
                                        className="usuario-modal-botao usuario-modal-secundario"
                                        onClick={fecharModal}
                                        disabled={enviando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="usuario-modal-botao usuario-modal-primario"
                                        disabled={
                                            enviando ||
                                            (modo === "editar" &&
                                                (!usuario ||
                                                    (nome.trim() === usuario.nome &&
                                                        normalizarEmail(email) === usuario.email &&
                                                        permissao === usuario.permissao &&
                                                        status === usuario.status &&
                                                        !senha &&
                                                        !confirmacaoSenha)))
                                        }
                                    >
                                        {enviando
                                            ? "Salvando..."
                                            : modo === "criar"
                                              ? "Criar usuário"
                                              : "Salvar alterações"}
                                    </button>
                                </footer>
                            </form>
                        ) : (
                            <section className="usuario-modal-confirmacao">
                                <h3>Excluir usuário?</h3>
                                <p>
                                    <strong>{usuario.nome}</strong>
                                    <br />
                                    {usuario.email}
                                </p>
                                <p>
                                    Esta ação não pode ser desfeita. Se você só quer impedir o
                                    acesso, altere o status para Inativo.
                                </p>
                                {erroExclusao && (
                                    <div className="usuario-modal-alerta" role="alert">
                                        {erroExclusao}
                                    </div>
                                )}
                                <footer className="usuario-modal-acoes">
                                    <button
                                        type="button"
                                        className="usuario-modal-botao usuario-modal-secundario"
                                        onClick={() => {
                                            setConfirmandoExclusao(false);
                                            setErroExclusao("");
                                        }}
                                        disabled={enviando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="usuario-modal-botao usuario-modal-excluir"
                                        onClick={excluir}
                                        disabled={enviando}
                                    >
                                        {enviando ? "Excluindo..." : "Sim, excluir"}
                                    </button>
                                </footer>
                            </section>
                        )}

                        {modo === "editar" && !confirmandoExclusao && (
                            <div className="usuario-modal-excluir-area">
                                <button
                                    type="button"
                                    className="usuario-modal-botao usuario-modal-excluir-outline"
                                    onClick={() => {
                                        setConfirmandoExclusao(true);
                                        setErroExclusao("");
                                    }}
                                    disabled={proprioUsuario || enviando}
                                    title={
                                        proprioUsuario
                                            ? "Você não pode excluir a sua própria conta"
                                            : undefined
                                    }
                                >
                                    Excluir usuário
                                </button>
                                {proprioUsuario && (
                                    <span>Você não pode excluir a sua própria conta.</span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </dialog>
    );
}

export default UsuarioModal;
