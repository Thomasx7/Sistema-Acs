import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import "../assets/css/components_css/header.css";

function Header() {

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    // Nome vindo do backend (o "?? Usuário" é só uma rede de segurança)
    const nomeCompleto = usuario?.nome ?? "Usuário";

    // Na saudação aparece só o primeiro nome: "Olá, Thomas!"
    const primeiroNome = nomeCompleto.trim().split(" ")[0];

    // Primeira letra do nome, em maiúscula (aparece dentro da bolinha)
    const inicial = nomeCompleto.trim().charAt(0).toUpperCase();

    const [aberto, setAberto] = useState(false);
    const perfilRef = useRef(null);

    useEffect(() => {
        function aoClicarFora(evento) {
            if (perfilRef.current && !perfilRef.current.contains(evento.target)) {
                setAberto(false);
            }
        }

        function aoApertarTecla(evento) {
            if (evento.key === "Escape") {
                setAberto(false);
            }
        }

        document.addEventListener("mousedown", aoClicarFora);
        document.addEventListener("keydown", aoApertarTecla);

        // Limpeza: remove os "ouvintes" quando o componente sair da tela
        return () => {
            document.removeEventListener("mousedown", aoClicarFora);
            document.removeEventListener("keydown", aoApertarTecla);
        };
    }, []);

    function handleSair() {
        setAberto(false);
        logout();                              // apaga o token e zera o usuário
        navigate("/login", { replace: true }); // vai para o login sem recarregar a página
    }

    return (
        <header className="header anim-slide-in-top">

            <div className="nome-usuario">
                <h2>Olá, {primeiroNome}!</h2>
            </div>

            <div className="header-perfil" ref={perfilRef}>
                {/* Bolinha com a inicial */}
                <button
                type="button"
                className="header-avatar"
                onClick={() => setAberto(!aberto)}
                aria-label="Abrir menu do usuário"
                aria-haspopup="menu"
                aria-expanded={aberto}
                >
                {inicial}
                </button>
        
                {aberto && (
                <div className="header-menu" role="menu">
                    <Link
                    to="/perfil"
                    role="menuitem"
                    onClick={() => setAberto(false)}
                    >
                    Perfil
                    </Link>            
        
                    <button
                    type="button"
                    role="menuitem"
                    className="header-menu-sair"
                    onClick={handleSair}
                    >
                    Sair
                    </button>
                </div>
                )}
            </div>
    </header>
    );
}

export default Header;