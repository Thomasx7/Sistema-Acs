import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/Auth_css/login.css";
import "../../assets/css/Auth_css/esqueci-senha.css";
import roboLogin from "../../assets/images/robo_login.png";

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);

    // TODO: chamar a API quando o backend tiver a rota de recuperação de senha.
    // Por enquanto só simulamos o envio.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setEnviando(false);
    setEnviado(true);
  }

  function tentarOutroEmail() {
    setEnviado(false);
    setEmail("");
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
                Se <strong className="reset-email">{email}</strong> estiver
                cadastrado, você vai receber um link para criar uma nova senha.
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
            <form className="login-form" onSubmit={handleSubmit}>
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
                onChange={(event) => setEmail(event.target.value)}
                required
              />

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