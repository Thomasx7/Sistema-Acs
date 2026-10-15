import { useState } from "react";
import { NavLink } from "react-router-dom";

import homeIcon from "../assets/icons/home.png";
import quizIcon from "../assets/icons/quiz.png";
import bibliotecaIcon from "../assets/icons/biblioteca.png";
import progressoIcon from "../assets/icons/progresso.png";
import menuIcon from "../assets/icons/menu.png";

import "../assets/css/components_css/sidebar.css";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

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
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;