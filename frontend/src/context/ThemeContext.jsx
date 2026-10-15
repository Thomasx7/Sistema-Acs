import { useCallback, useMemo, useState } from "react";

import ThemeContext from "./theme-context";

// Para voltar a restaurar preferências no futuro, altere este padrão e a inicialização do index.html.
const DEFAULT_THEME = "light";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(DEFAULT_THEME);

    const setTheme = useCallback((novoTema) => {
        if (novoTema !== "light" && novoTema !== "dark") {
            throw new Error(`Tema inválido: ${novoTema}`);
        }

        document.documentElement.dataset.theme = novoTema;
        document.documentElement.style.colorScheme = novoTema;
        setThemeState(novoTema);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]);

    const value = useMemo(
        () => ({ theme, toggleTheme, setTheme }),
        [theme, toggleTheme, setTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
