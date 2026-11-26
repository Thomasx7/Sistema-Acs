import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/Auth_css/login.css";
import "../../assets/css/Auth_css/esqueci-senha.css";
import roboLogin from "../../assets/images/robo-esqueci-senha.png";
import { api, ApiError } from "../../services/api";
import { normalizarEmail, validarEmail } from "../../utils/validacao";

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (enviando) return;

    const emailNormalizado = normalizarEmail(email);
    const erroEmail = validarEmail(emailNormalizado);
    if (erroEmail) {
      setErro(erroEmail);
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      await api.post("/auth/esqueci-senha", { email: emailNormalizado });
      setEnviado(true);
    } catch (falha) {
      setErro(
        falha instanceof ApiError
          ? falha.message
          : "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  function tentarOutroEmail() {
    setEnviado(false);
    setEmail("");
    setErro("");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-image">
          <img src={roboLogin} alt="Robô mascote dando tchau" />
        </div>

        <div className="login-form-area form-pane login-pane">
          {enviado ? (
            <div className="login-form" role="status">
              <h1 className="reset-title">Verifique seu e-mail</h1>
              <p className="reset-info">
                Se o e-mail estiver cadastrado, você receberá um link para
                criar uma nova senha.
              </p>
              <p className="reset-info reset-info-small">
                Não encontrou? Olhe também a caixa de spam.
              </p>

              <Link to="/login" className="login-button link-button">
                Voltar para o login
              </Link>

              <p className="switch-text">
                Digitou o e-mail errado?{" "}
                <button
                  type="button"
                  className="switch-button"
                  onClick={tentarOutroEmail}
                >
                  Tentar outro e-mail
                </button>
              </p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <Link to="/login" className="back-link">
                ← Voltar para o login
              </Link>

              <h1 className="reset-title">Esqueceu a senha?</h1>
              <p className="login-subtitle reset-subtitle">
                Digite seu e-mail e enviaremos um link para você criar uma nova
                senha.
              </p>

              <label htmlFor="reset-email">E-mail</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErro("");
                }}
                required
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
                {enviando ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;