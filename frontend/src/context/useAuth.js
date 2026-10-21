
// Atalho que as telas usam para pegar os dados de login (const { usuario, login } = useAuth()).


import { useContext } from "react";

import AuthContext from "./auth-context";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    }

    return context;
}