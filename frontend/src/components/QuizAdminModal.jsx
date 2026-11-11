import { useEffect, useRef, useState } from "react";

import { ApiError } from "../services/api";
import {
    adicionarPergunta,
    atualizarPergunta,
    atualizarQuiz,
    criarQuiz,
    excluirPergunta,
    obterQuizAdmin,
} from "../services/quizzes";

import "../assets/css/components_css/quiz-admin-modal.css";

const PERGUNTA_VAZIA = {
    enunciado: "",
    explicacao: "",
    quantidade: 4,
    alternativas: ["", "", "", ""],
    correta: null,
};

function erroDaApi(falha, alternativa) {
    return falha instanceof ApiError ? falha.message : alternativa;
}

function normalizarPergunta(pergunta) {
    return {
        id: pergunta.id,
        enunciado: pergunta.enunciado,
        explicacao: pergunta.explicacao || "",
        alternativas: pergunta.alternativas.map((alternativa) => ({
            texto: alternativa.texto,
            correta: alternativa.correta,
        })),
    };
}

function QuizAdminModal({ quizId, onClose, onSaved }) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [perguntas, setPerguntas] = useState([]);
    const [perguntaForm, setPerguntaForm] = useState(PERGUNTA_VAZIA);
    const [perguntaEditando, setPerguntaEditando] = useState(null);
    const [carregando, setCarregando] = useState(Boolean(quizId));
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const sequenciaRascunho = useRef(0);

    useEffect(() => {
        if (!quizId) return undefined;
        let cancelado = false;

        obterQuizAdmin(quizId)
            .then((quiz) => {
                if (cancelado) return;
                setNome(quiz.nome);
                setDescricao(quiz.descricao || "");
                setPerguntas(quiz.perguntas.map(normalizarPergunta));
            })
            .catch((falha) => {
                if (!cancelado) {
                    const mensagemErro = erroDaApi(
                        falha,
                        "Não foi possível carregar o quiz."
                    );
                    setErroCarregamento(mensagemErro);
                    setErro(mensagemErro);
                }
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [quizId]);

    useEffect(() => {
        function fecharComEscape(evento) {
            if (evento.key === "Escape" && !salvando) onClose();
        }
        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [onClose, salvando]);

    function alterarQuantidade(valor) {
        const quantidade = valor === "" ? "" : Math.max(0, Number(valor));
        setPerguntaForm((atual) => {
            if (!Number.isInteger(quantidade) || quantidade < 0) {
                return { ...atual, quantidade: valor };
            }
            const alternativas = Array.from(
                { length: quantidade },
                (_, indice) => atual.alternativas[indice] || ""
            );
            return {
                ...atual,
                quantidade,
                alternativas,
                correta:
                    atual.correta === null
                        ? null
                        : Math.min(atual.correta, Math.max(quantidade - 1, 0)),
            };
        });
    }

    function selecionarEdicao(pergunta) {
        setPerguntaEditando(pergunta.id ?? pergunta.rascunhoId);
        setPerguntaForm({
            enunciado: pergunta.enunciado,
            explicacao: pergunta.explicacao || "",
            quantidade: pergunta.alternativas.length,
            alternativas: pergunta.alternativas.map((alternativa) => alternativa.texto),
            correta: pergunta.alternativas.findIndex((alternativa) => alternativa.correta),
        });
        setErro("");
        setMensagem("");
    }

    function validarPergunta() {
        const quantidade = Number(perguntaForm.quantidade);
        if (!perguntaForm.enunciado.trim()) return "Informe o enunciado da pergunta.";
        if (!Number.isInteger(quantidade) || quantidade < 2) {
            return "A pergunta precisa ter pelo menos 2 alternativas.";
        }
        if (perguntaForm.alternativas.length !== quantidade) {
            return "Confira a quantidade de alternativas informada.";
        }
        if (perguntaForm.alternativas.some((texto) => !texto.trim())) {
            return "Preencha o texto de todas as alternativas.";
        }
        if (
            !Number.isInteger(perguntaForm.correta) ||
            perguntaForm.correta < 0 ||
            perguntaForm.correta >= quantidade
        ) {
            return "Marque exatamente uma alternativa correta.";
        }
        return "";
    }

    function criarPayloadPergunta() {
        return {
            enunciado: perguntaForm.enunciado.trim(),
            explicacao: perguntaForm.explicacao.trim(),
            alternativas: perguntaForm.alternativas.map((texto, indice) => ({
                texto: texto.trim(),
                correta: indice === perguntaForm.correta,
            })),
        };
    }

    async function salvarPergunta() {
        const erroValidacao = validarPergunta();
        if (erroValidacao) {
            setErro(erroValidacao);
            setMensagem("");
            return;
        }

        const payload = criarPayloadPergunta();
        const index = perguntas.findIndex(
            (pergunta) =>
                (pergunta.id ?? pergunta.rascunhoId) === perguntaEditando
        );
        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            if (quizId && perguntaEditando !== null && perguntas[index]?.id) {
                const atualizada = await atualizarPergunta(
                    perguntaEditando,
                    payload
                );
                setPerguntas((atuais) =>
                    atuais.map((pergunta) =>
                        pergunta.id === atualizada.id
                            ? normalizarPergunta(atualizada)
                            : pergunta
                    )
                );
            } else if (quizId) {
                const criada = await adicionarPergunta(quizId, payload);
                setPerguntas((atuais) => [...atuais, normalizarPergunta(criada)]);
            } else if (perguntaEditando !== null && index >= 0) {
                setPerguntas((atuais) =>
                    atuais.map((pergunta, indice) =>
                        indice === index
                            ? { ...payload, rascunhoId: pergunta.rascunhoId }
                            : pergunta
                    )
                );
            } else {
                sequenciaRascunho.current += 1;
                setPerguntas((atuais) => [
                    ...atuais,
                    { ...payload, rascunhoId: sequenciaRascunho.current },
                ]);
            }
            setPerguntaEditando(null);
            setPerguntaForm(PERGUNTA_VAZIA);
            setMensagem(
                perguntaEditando === null
                    ? "Pergunta adicionada."
                    : "Pergunta atualizada."
            );
        } catch (falha) {
            setErro(erroDaApi(falha, "Não foi possível salvar a pergunta."));
        } finally {
            setSalvando(false);
        }
    }

    async function removerPergunta(pergunta) {
        setSalvando(true);
        setErro("");
        setMensagem("");
        try {
            if (quizId && pergunta.id) {
                await excluirPergunta(pergunta.id);
            }
            setPerguntas((atuais) =>
                atuais.filter(
                    (item) =>
                        (item.id ?? item.rascunhoId) !==
                        (pergunta.id ?? pergunta.rascunhoId)
                )
            );
            if (perguntaEditando === (pergunta.id ?? pergunta.rascunhoId)) {
                setPerguntaEditando(null);
                setPerguntaForm(PERGUNTA_VAZIA);
            }
            setMensagem("Pergunta removida.");
        } catch (falha) {
            setErro(erroDaApi(falha, "Não foi possível remover a pergunta."));
        } finally {
            setSalvando(false);
        }
    }

    async function salvarQuiz(evento) {
        evento.preventDefault();
        if (!nome.trim()) {
            setErro("Informe o nome do quiz.");
            return;
        }
        if (!descricao.trim()) {
            setErro("Informe a descrição do quiz.");
            return;
        }
        if (!quizId && perguntas.length === 0) {
            setErro("Adicione pelo menos uma pergunta.");
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem("");
        try {
            let quizSalvo;
            if (!quizId) {
                quizSalvo = await criarQuiz({
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    perguntas: perguntas.map((pergunta) => ({
                        enunciado: pergunta.enunciado,
                        explicacao: pergunta.explicacao,
                        alternativas: pergunta.alternativas,
                    })),
                });
            } else {
                quizSalvo = await atualizarQuiz(quizId, {
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                });
            }
            await onSaved(quizSalvo);
            onClose();
        } catch (falha) {
            setErro(erroDaApi(falha, "Não foi possível salvar o quiz."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div
            className="quiz-admin-overlay"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !salvando) onClose();
            }}
        >
            <section
                className="quiz-admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quiz-admin-titulo"
            >
                <header className="quiz-admin-topo">
                    <div>
                        <h2 id="quiz-admin-titulo">
                            {quizId ? "Editar quiz" : "Criar quiz"}
                        </h2>
                        <p>Cadastre o quiz e suas perguntas.</p>
                    </div>
                    <button
                        type="button"
                        className="quiz-admin-fechar"
                        onClick={onClose}
                        disabled={salvando}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </header>

                {carregando ? (
                    <p role="status">Carregando quiz...</p>
                ) : erroCarregamento ? (
                    <p className="quiz-admin-erro" role="alert">
                        {erroCarregamento}
                    </p>
                ) : (
                    <form className="quiz-admin-form" onSubmit={salvarQuiz}>
                        <label>
                            Nome do quiz
                            <input
                                type="text"
                                value={nome}
                                maxLength={150}
                                onChange={(evento) => setNome(evento.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Descrição
                            <textarea
                                value={descricao}
                                onChange={(evento) => setDescricao(evento.target.value)}
                                rows={3}
                                required
                            />
                        </label>

                        <section className="quiz-admin-perguntas">
                            <h3>Perguntas cadastradas ({perguntas.length})</h3>
                            {perguntas.length === 0 ? (
                                <p className="quiz-admin-vazio">
                                    Nenhuma pergunta adicionada.
                                </p>
                            ) : (
                                <ol>
                                    {perguntas.map((pergunta, indice) => (
                                        <li key={pergunta.id ?? pergunta.rascunhoId}>
                                            <span>
                                                {indice + 1}. {pergunta.enunciado}
                                            </span>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => selecionarEdicao(pergunta)}
                                                    disabled={salvando}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removerPergunta(pergunta)}
                                                    disabled={salvando}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>

                        <fieldset className="quiz-admin-pergunta-form">
                            <legend>
                                {perguntaEditando === null
                                    ? "Adicionar pergunta"
                                    : "Editar pergunta"}
                            </legend>
                            <label>
                                Enunciado
                                <textarea
                                    value={perguntaForm.enunciado}
                                    onChange={(evento) =>
                                        setPerguntaForm((atual) => ({
                                            ...atual,
                                            enunciado: evento.target.value,
                                        }))
                                    }
                                    rows={2}
                                />
                            </label>
                            <label>
                                Explicação (opcional)
                                <textarea
                                    value={perguntaForm.explicacao}
                                    onChange={(evento) =>
                                        setPerguntaForm((atual) => ({
                                            ...atual,
                                            explicacao: evento.target.value,
                                        }))
                                    }
                                    rows={2}
                                />
                            </label>
                            <label className="quiz-admin-qtd">
                                Quantidade de alternativas
                                <input
                                    type="number"
                                    min="2"
                                    step="1"
                                    value={perguntaForm.quantidade}
                                    onChange={(evento) =>
                                        alterarQuantidade(evento.target.value)
                                    }
                                />
                            </label>
                            <div className="quiz-admin-alternativas">
                                {perguntaForm.alternativas.map((texto, indice) => (
                                    <label
                                        className="quiz-admin-alternativa"
                                        key={indice}
                                    >
                                        <span>Alternativa {indice + 1}</span>
                                        <input
                                            type="text"
                                            value={texto}
                                            onChange={(evento) =>
                                                setPerguntaForm((atual) => ({
                                                    ...atual,
                                                    alternativas: atual.alternativas.map(
                                                        (item, indiceItem) =>
                                                            indiceItem === indice
                                                                ? evento.target.value
                                                                : item
                                                    ),
                                                }))
                                            }
                                        />
                                        <input
                                            type="radio"
                                            name="alternativa-correta"
                                            checked={perguntaForm.correta === indice}
                                            onChange={() =>
                                                setPerguntaForm((atual) => ({
                                                    ...atual,
                                                    correta: indice,
                                                }))
                                            }
                                            aria-label={`Marcar alternativa ${indice + 1} como correta`}
                                        />
                                        <span>Correta</span>
                                    </label>
                                ))}
                            </div>
                            <div className="quiz-admin-acoes-pergunta">
                                <button
                                    className="quiz-admin-secundario"
                                    type="button"
                                    onClick={salvarPergunta}
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : perguntaEditando === null
                                            ? "Adicionar pergunta"
                                            : "Salvar pergunta"}
                                </button>
                                {perguntaEditando !== null && (
                                    <button
                                        type="button"
                                        className="quiz-admin-texto"
                                        onClick={() => {
                                            setPerguntaEditando(null);
                                            setPerguntaForm(PERGUNTA_VAZIA);
                                            setErro("");
                                        }}
                                    >
                                        Cancelar edição
                                    </button>
                                )}
                            </div>
                        </fieldset>

                        {erro && <p className="quiz-admin-erro" role="alert">{erro}</p>}
                        {mensagem && (
                            <p className="quiz-admin-sucesso" role="status">
                                {mensagem}
                            </p>
                        )}
                        <footer className="quiz-admin-acoes">
                            <button
                                type="button"
                                className="quiz-admin-secundario"
                                onClick={onClose}
                                disabled={salvando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="quiz-admin-principal"
                                disabled={salvando || carregando}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : quizId
                                        ? "Salvar quiz"
                                        : "Cadastrar quiz"}
                            </button>
                        </footer>
                    </form>
                )}
            </section>
        </div>
    );
}

export default QuizAdminModal;
