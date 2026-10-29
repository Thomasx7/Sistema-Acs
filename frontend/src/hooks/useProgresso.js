import { useCallback, useEffect, useState } from "react";

import { listarProgresso } from "../services/progresso";

export function useProgresso() {
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        let ativo = true;

        setCarregando(true);
        setErro(null);

        try {
            const dados = await listarProgresso();
            if (ativo) {
                setHistorico(dados);
            }
        } catch (falha) {
            if (ativo) {
                setErro(falha);
            }
        } finally {
            if (ativo) {
                setCarregando(false);
            }
        }

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        let ativo = true;

        async function buscar() {
            setCarregando(true);
            setErro(null);

            try {
                const dados = await listarProgresso();
                if (ativo) {
                    setHistorico(dados);
                }
            } catch (falha) {
                if (ativo) {
                    setErro(falha);
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        buscar();

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.removeItem("acs-historico-quiz");
        } catch {
            // ignora falhas do navegador ao limpar o histórico antigo
        }
    }, []);

    const recarregar = useCallback(async () => {
        const cleanup = await carregar();
        if (typeof cleanup === "function") cleanup();
    }, [carregar]);

    return { historico, carregando, erro, recarregar };
}
