
// É o componente que guarda quem está logado e oferece as ações login, cadastrar e logout para o resto do sistema.


import { useCallback, useEffect, useMemo, useState } from "react";

import AuthContext from "./auth-context";
import { api, definirAoExpirarSessao } from "../services/api";
import { lerToken, removerToken, salvarToken } from "../utils/tokenStorage";

export function AuthProvider({ children }) {
    // Dados do usuário logado: { id_usuario, nome, email, permissao } ou null.
    const [usuario, setUsuario] = useState(null);

    // true enquanto confirmamos o token salvo com o backend.
    const [carregando, setCarregando] = useState(() => Boolean(lerToken()));

    // Se o api.js descobrir que a sessão expirou (401), limpa o usuário.
    // registrado antes de qualquer chamada à API.
    useEffect(() => {
        definirAoExpirarSessao(() => setUsuario(null));
        return () => definirAoExpirarSessao(null);
    }, []);

    useEffect(() => {
        if (!lerToken()) return;

        let cancelado = false;

        api.get("/auth/me")
            .then((dados) => {
                if (!cancelado) setUsuario(dados);
            })
            .catch(() => {
                if (!cancelado) setUsuario(null);
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, []);

    const login = useCallback(async (email, senha) => {
        const dados = await api.post("/auth/login", { email, senha });
        salvarToken(dados.access_token);
        setUsuario(dados.usuario);
        return dados.usuario;
    }, []);

    // Só cria a conta. Não faz login automático: depois do cadastro
    // a tela leva o usuário ao login.
    const cadastrar = useCallback(async (nome, email, senha) => {
        return api.post("/usuarios/", { nome, email, senha });
    }, []);

    const logout = useCallback(() => {
        removerToken();
        setUsuario(null);
    }, []);

    const value = useMemo(
        () => ({
            usuario,
            autenticado: usuario !== null,
            carregando,
            login,
            cadastrar,
            logout,
        }),
        [usuario, carregando, login, cadastrar, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}