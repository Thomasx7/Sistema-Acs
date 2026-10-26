
// É o porteiro das rotas. Ele fica na frente das telas do painel e decide, a cada acesso:


import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth";

// Porteiro das rotas.
// Quando recebe uma permissão específica, só quem a possui entra.
function ProtectedRoute({ permissao }) {
    const { usuario, autenticado, carregando } = useAuth();

    // Ainda perguntando ao backend quem é o usuário.
    if (carregando) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--fundo)",
                }}
                role="status"
            >
                Carregando...
            </div>
        );
    }

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    if (permissao && usuario.permissao !== permissao) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;