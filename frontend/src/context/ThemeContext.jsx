import { useCallback, useMemo, useState } from "react";

import ThemeContext from "./theme-context";
import { lerPreferenciaTema, salvarPreferenciaTema } from "../utils/perfil";

function temaDoSistema() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function lerTemaInicial() {
    try {
        const salvo = lerPreferenciaTema();
        if (salvo) return salvo;
    } catch (erro) {
        console.error("Não foi possível ler a preferência de tema salva.", erro);
    }

    return temaDoSistema();
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const doDom = document.documentElement.dataset.theme;
        return doDom === "dark" || doDom === "light" ? doDom : lerTemaInicial();
    });
    const [persistenceError, setPersistenceError] = useState("");

    const setTheme = useCallback((novoTema) => {
        if (novoTema !== "light" && novoTema !== "dark") {
            throw new Error(`Tema inválido: ${novoTema}`);
        }

        document.documentElement.dataset.theme = novoTema;
        document.documentElement.style.colorScheme = novoTema;
        setThemeState(novoTema);
        setPersistenceError("");

        try {
            salvarPreferenciaTema(novoTema);
            return true;
        } catch (erro) {
            console.error("Não foi possível salvar a preferência de tema.", erro);
            setPersistenceError("O tema foi aplicado, mas não foi possível salvar a preferência neste navegador.");
            return false;
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]);

    const value = useMemo(
        () => ({ theme, toggleTheme, setTheme, persistenceError }),
        [theme, toggleTheme, setTheme, persistenceError]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
