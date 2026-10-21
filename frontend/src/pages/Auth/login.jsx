import { useEffect, useState } from "react";
import "../../assets/css/Auth_css/login.css";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ApiError } from "../../services/api";
import {
  normalizarEmail,
  validarEmail,
  validarSenha,
} from "../../utils/validacao";
import roboCadastro from "../../assets/images/robo_cadastro.png";
import roboLogin from "../../assets/images/robo_login.png";

// Campo de senha com o botão do olho.
// Vai ser usado no login e no cadastro.
function PasswordField({ id, value, onChange, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder="Digite sua senha"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
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

// Transforma qualquer falha em uma mensagem para mostrar na tela.
function mensagemDeErro(falha) {
  return falha instanceof ApiError
    ? falha.message
    : "Ocorreu um erro inesperado. Tente novamente.";
}

// Validação do cadastro. Devolve a mensagem de erro ou null.
function validarCadastro(nome, email, senha, aceitouTermos) {
  if (!nome) return "Informe seu nome.";
  return (
    validarEmail(email) ||
    validarSenha(senha) ||
    (aceitouTermos
      ? null
      : "Aceite os Termos e a Política de Privacidade para continuar.")
  );
}

function Login() {
  const { autenticado, carregando, login, cadastrar } = useAuth();

  // Dados do login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [enviandoLogin, setEnviandoLogin] = useState(false);
  // Segundos que faltam para o bloqueio (5 tentativas erradas) acabar.
  const [segundosBloqueio, setSegundosBloqueio] = useState(0);
  // Aviso de sucesso mostrado no login depois de cadastrar.
  const [sucesso, setSucesso] = useState("");

  // false = mostra o login | true = mostra o cadastro
  const [isSignup, setIsSignup] = useState(false);

  // Dados do cadastro
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [enviandoCadastro, setEnviandoCadastro] = useState(false);

  // Contagem regressiva do bloqueio: a cada segundo, diminui 1.
  // Quando chega em 0, o efeito para sozinho e o botão volta.
  useEffect(() => {
    if (segundosBloqueio <= 0) return;

    const timer = setTimeout(() => {
      setSegundosBloqueio((segundos) => segundos - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [segundosBloqueio]);

  // Alterna entre login e cadastro limpando os avisos da tela anterior.
  function trocarFormulario(mostrarCadastro) {
    setIsSignup(mostrarCadastro);
    setErroLogin("");
    setErroCadastro("");
    setSucesso("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (enviandoLogin || segundosBloqueio > 0) return;

    setSucesso("");

    const emailLimpo = normalizarEmail(email);
    const erroValidacao =
      validarEmail(emailLimpo) || (password ? null : "Informe sua senha.");

    if (erroValidacao) {
      setErroLogin(erroValidacao);
      return;
    }

    setErroLogin("");
    setEnviandoLogin(true);

    try {
      await login(emailLimpo, password);
      // Deu certo: o usuário agora está logado e o <Navigate> lá embaixo
      // leva para /home sozinho.
    } catch (falha) {
      if (falha instanceof ApiError && falha.status === 429) {
        // Bloqueado por tentativas: inicia a contagem regressiva.
        setSegundosBloqueio(falha.retryAfter ?? 60);
        setErroLogin("");
      } else {
        setErroLogin(mensagemDeErro(falha));
      }
    } finally {
      setEnviandoLogin(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    if (enviandoCadastro) return;

    const nome = signupName.trim();
    const emailLimpo = normalizarEmail(signupEmail);
    const erroValidacao = validarCadastro(
      nome,
      emailLimpo,
      signupPassword,
      acceptedTerms
    );

    if (erroValidacao) {
      setErroCadastro(erroValidacao);
      return;
    }

    setErroCadastro("");
    setEnviandoCadastro(true);

    try {
      await cadastrar(nome, emailLimpo, signupPassword);

      // Cadastro feito: volta ao login com o e-mail já preenchido.
      setEmail(emailLimpo);
      setPassword("");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setAcceptedTerms(false);
      setSucesso("Conta criada com sucesso! Faça login para continuar.");
      setIsSignup(false);
    } catch (falha) {
      setErroCadastro(mensagemDeErro(falha));
    } finally {
      setEnviandoCadastro(false);
    }
  }

  // Confirmando o token salvo na aba (ex.: F5): espera um instante.
  if (carregando) return null;

  // Já logado (ou acabou de logar): não faz sentido ficar no login.
  if (autenticado) return <Navigate to="/home" replace />;

  const bloqueado = segundosBloqueio > 0;

  return (
    <div className="login-page">
        <div className={`login-card ${isSignup ? "is-signup" : ""}`}>
        <div className="login-image">
          <img
            src={isSignup ? roboCadastro : roboLogin}
            alt={
              isSignup
                ? "Robô mascote segurando uma prancheta"
                : "Robô mascote dando tchau"
            }
          />
        </div>

        {/* Cadastro (metade esquerda) */}
        <div className="login-form-area form-pane signup-pane">
          <form className="login-form" onSubmit={handleSignup} noValidate>
            <h1>Criar conta</h1>
            <p className="login-subtitle">
              Preencha os dados para se cadastrar.
            </p>

            <label htmlFor="signup-name">Nome Completo</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Digite seu nome"
              autoComplete="name"
              maxLength={100}
              value={signupName}
              onChange={(event) => setSignupName(event.target.value)}
              required
            />

            <label htmlFor="signup-email">E-mail</label>
            <input
              id="signup-email"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              required
            />

            <label htmlFor="signup-password">Senha</label>
            <PasswordField
              id="signup-password"
              autoComplete="new-password"
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

            {erroCadastro && (
              <p className="form-erro" role="alert">
                {erroCadastro}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={enviandoCadastro}
            >
              {enviandoCadastro ? "Cadastrando..." : "Cadastrar"}
            </button>

            <p className="switch-text">
              Já tem uma conta?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => trocarFormulario(false)}
              >
                Entrar
              </button>
            </p>
          </form>
        </div>

        <div className="login-form-area form-pane login-pane">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h1>Login</h1>
            <p className="login-subtitle">
              Faça login na sua conta para continuar.
            </p>

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <PasswordField
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Link to="/esqueci-senha" className="forgot-password">
                Esqueceu sua senha?
              </Link>
            </div>

            {sucesso && (
              <p className="form-sucesso" role="status">
                {sucesso}
              </p>
            )}

            {bloqueado && (
              <p className="form-erro">
                Muitas tentativas de login. Tente novamente em{" "}
                {segundosBloqueio}s.
              </p>
            )}

            {erroLogin && !bloqueado && (
              <p className="form-erro" role="alert">
                {erroLogin}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={enviandoLogin || bloqueado}
            >
              {bloqueado
                ? `Aguarde ${segundosBloqueio}s`
                : enviandoLogin
                  ? "Entrando..."
                  : "Entrar"}
            </button>

            <p className="switch-text">
              Não tem uma conta?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => trocarFormulario(true)}
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