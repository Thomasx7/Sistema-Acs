import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ehAdm } from "../utils/permissoes";

import homeIcon from "../assets/icons/home.png";
import quizIcon from "../assets/icons/quiz.png";
import bibliotecaIcon from "../assets/icons/biblioteca.png";
import progressoIcon from "../assets/icons/progresso.png";
import menuIcon from "../assets/icons/menu.png";

import "../assets/css/components_css/sidebar.css";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);

    return (
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} anim-slide-in-left`}>
            {/* Cabeçalho */}
            <div className="sidebar-header">
                <h2>Plataforma ACS</h2>

                <button
                type="button"
                className="sidebar-menu"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                <img src={menuIcon} alt="" />
                </button>
            </div>

            {/* Navegação */}
            <nav>
                <ul>
                <li>
                    <NavLink
                    to="/home"
                    end
                    className={({ isActive }) => (isActive ? "active" : "")}
                    >
                    
                    <img src={homeIcon} alt="" />
                    <span>Início</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink
                    to="quiz"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    >
                    <img src={quizIcon} alt="" />
                    <span>Quiz</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink
                    to="biblioteca"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    >
                    <img src={bibliotecaIcon} alt="" />
                    <span>Biblioteca</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink
                    to="progresso"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    >
                    <img src={progressoIcon} alt="" />
                    <span>Progresso</span>
                    </NavLink>
                </li>
                {administrador && (
                    <li>
                        <NavLink
                            to="/usuarios"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            <svg
                                className="sidebar-usuarios-icone"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>Usuários</span>
                        </NavLink>
                    </li>
                )}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;