import { useLayoutEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/useTheme";

function AuthLayout() {
    const { setTheme } = useTheme();

    useLayoutEffect(() => {
        // As telas públicas de autenticação devem sempre aparecer no tema claro.
        setTheme("light");
    }, [setTheme]);

    return <Outlet />;
}

export default AuthLayout;
