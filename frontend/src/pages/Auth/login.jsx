import { useState } from "react";
import "../../assets/css/Auth_css/login.css";
import { Link, useNavigate } from "react-router-dom";
import { DEV_BYPASS_AUTH } from "../../utils/auth";

// Campo de senha com o botão do olho.
// Vai ser usado no login e no cadastro.
function PasswordField({ id, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder="Digite sua senha"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        className="eye-button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
      >
        {showPassword ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

   // false = mostra o login | true = mostra o cadastro
  const [isSignup, setIsSignup] = useState(false);

  // Dados do cadastro
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleSignup(event) {
    event.preventDefault();
    console.log("Cadastro:", {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
    });
  } 

  function handleSubmit(event) {
    event.preventDefault();

    // TODO: reativar proteção de rotas / autenticação real
    if (DEV_BYPASS_AUTH) {
      navigate("/home");
      return;
    }

    console.log("Dados do login:", { email, password });
  }

  return (
    <div className="login-page">
        <div className={`login-card ${isSignup ? "is-signup" : ""}`}>
        <div className="login-image" />

        {/* Cadastro (metade esquerda) */}
        <div className="login-form-area form-pane signup-pane">
          <form className="login-form" onSubmit={handleSignup}>
            <h1>Criar conta</h1>
            <p className="login-subtitle">
              Preencha os dados para se cadastrar.
            </p>

            <label htmlFor="signup-name">Nome Completo</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Digite seu nome"
              value={signupName}
              onChange={(event) => setSignupName(event.target.value)}
              required
            />

            <label htmlFor="signup-email">E-mail</label>
            <input
              id="signup-email"
              type="email"
              placeholder="Digite seu e-mail"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              required
            />

            <label htmlFor="signup-password">Senha</label>
            <PasswordField
              id="signup-password"
              value={signupPassword}
              onChange={(event) => setSignupPassword(event.target.value)}
            />

            <label className="terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              Li e concordo com os Termos e a Política de Privacidade
            </label>

            <button type="submit" className="login-button">
              Cadastrar
            </button>

            <p className="switch-text">
              Já tem uma conta?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsSignup(false)}
              >
                Entrar
              </button>
            </p>
          </form>
        </div>

        <div className="login-form-area form-pane login-pane">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1>Login</h1>
            <p className="login-subtitle">
              Faça login na sua conta para continuar.
            </p>

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>
            <div className="password-field">
                          <PasswordField
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Link to="/esqueci-senha" className="forgot-password">
              Esqueceu sua senha?
            </Link>
            </div>

            <button type="submit" className="login-button">
              Entrar
            </button>

            
            <p className="switch-text">
              Não tem uma conta?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsSignup(true)}
              >
                Cadastre-se
              </button>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
