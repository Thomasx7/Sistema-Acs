import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function PainelLayout() {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />

            <main style={{ flex: 1, minWidth: 0, background: "var(--fundo)" }}>
                <Header />
                <section className="conteudo-home" style={{ padding: "20px" }}>
                    <Outlet />
                </section>
            </main>
        </div>
    )
}

export default PainelLayout;