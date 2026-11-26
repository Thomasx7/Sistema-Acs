import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../../assets/css/Auth_css/login.css";
import "../../assets/css/Auth_css/esqueci-senha.css";
import PasswordField from "../../components/PasswordField";
import roboEsqueciSenha from "../../assets/images/robo-esqueci-senha.png";
import { api, ApiError } from "../../services/api";
import { validarSenha } from "../../utils/validacao";

const MSG_LINK_INVALIDO = "Link inválido ou expirado";

function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verificacaoIniciada = useRef(false);
  const tokenDaUrl = searchParams.get("token");
  const [token] = useState(tokenDaUrl || "");
  const [estado, setEstado] = useState(
    tokenDaUrl ? "verificando" : "invalido"
  );
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (verificacaoIniciada.current) return;
    verificacaoIniciada.current = true;

    if (!tokenDaUrl) {
      return;
    }

    navigate("/redefinir-senha", { replace: true });

    api
      .post("/auth/redefinir-senha/validar", { token: tokenDaUrl })
      .then(() => setEstado("valido"))
      .catch((falha) => {
        if (
          falha instanceof ApiError &&
          falha.status === 400 &&
          falha.message === MSG_LINK_INVALIDO
        ) {
          setEstado("invalido");
        } else {
          setErro(
            falha instanceof ApiError
              ? falha.message
              : "Ocorreu um erro inesperado. Tente novamente."
          );
          setEstado("erro");
        }
      });
  }, [navigate, tokenDaUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (enviando) return;

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      await api.post("/auth/redefinir-senha", { token, senha });
      navigate("/login", {
        replace: true,
        state: {
          mensagem: "Senha redefinida com sucesso! Faça login com a nova senha.",
        },
      });
    } catch (falha) {
      if (
        falha instanceof ApiError &&
        falha.status === 400 &&
        falha.message === MSG_LINK_INVALIDO
      ) {
        setEstado("invalido");
        return;
      }
      setErro(
        falha instanceof ApiError
          ? falha.message
          : "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  function renderLinks() {
    return (
      <>
        <Link to="/esqueci-senha" className="login-button link-button">
          Solicitar novo link
        </Link>
        <Link to="/login" className="back-link">
          Voltar para o login
        </Link>
      </>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-image">
          <img src={roboEsqueciSenha} alt="Robô mascote" />
        </div>

        <div className="login-form-area form-pane login-pane">
          <div className="login-form">
            {estado === "verificando" && (
              <p className="reset-info" role="status">
                Verificando link...
              </p>
            )}

            {estado === "invalido" && (
              <>
                <h1 className="reset-title">Link inválido ou expirado</h1>
                <p className="reset-info">
                  Este link é inválido ou expirou.
                </p>
                {renderLinks()}
              </>
            )}

            {estado === "erro" && (
              <>
                <h1 className="reset-title">Não foi possível verificar o link</h1>
                <p className="form-erro" role="alert">
                  {erro}
                </p>
                {renderLinks()}
              </>
            )}

            {estado === "valido" && (
              <form onSubmit={handleSubmit} noValidate>
                <h1 className="reset-title">Criar nova senha</h1>
                <p className="login-subtitle reset-subtitle">
                  Escolha uma nova senha para sua conta.
                </p>

                <label htmlFor="nova-senha">Nova senha</label>
                <PasswordField
                  id="nova-senha"
                  value={senha}
                  onChange={(event) => {
                    setSenha(event.target.value);
                    setErro("");
                  }}
                  autoComplete="new-password"
                  placeholder="Digite sua nova senha"
                />

                <label htmlFor="confirmar-senha">Confirmar nova senha</label>
                <PasswordField
                  id="confirmar-senha"
                  value={confirmacao}
                  onChange={(event) => {
                    setConfirmacao(event.target.value);
                    setErro("");
                  }}
                  autoComplete="new-password"
                  placeholder="Confirme sua nova senha"
                />

                {erro && (
                  <p className="form-erro" role="alert">
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  className="login-button"
                  disabled={enviando}
                >
                  {enviando ? "Redefinindo..." : "Redefinir senha"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;
