
// Cria o canal vazio por onde os dados de login vão circular. É igual ao seu theme-context.js.

import { createContext } from "react";

const AuthContext = createContext(null);

export default AuthContext;