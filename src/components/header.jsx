import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import "../assets/css/components_css/header.css";

function Header({ nome = "Mateus" }) {

    const [aberto, setAberto] = useState(false);
    const perfilRef = useRef(null);

    // Primeira letra do nome, em maiúscula (aparece dentro da bolinha)
    const inicial = nome.trim().charAt(0).toUpperCase();

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
        window.location.href = '/login';
    }

    return (
        <header className="header">

            <div className="nome-usuario">
                <h2>Olá, {nome}!</h2>
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