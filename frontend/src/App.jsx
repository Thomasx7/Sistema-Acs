import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/login";
import ProtectedRoute from "./components/ProtectedRoute";

import PainelLayout from "./layouts/PainelLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home/home";
import Quiz from "./pages/Home/quiz";
import Biblioteca from "./pages/Home/biblioteca";
import Progresso from "./pages/Home/progresso";
import Perfil from "./pages/Home/perfil";
import EsqueciSenha from "./pages/Auth/esqueci-senha";
import RedefinirSenha from "./pages/Auth/redefinir-senha";
import Termos from "./pages/Legal/termos";
import Privacidade from "./pages/Legal/privacidade";
import Usuarios from "./pages/Home/usuarios";
import { PERMISSAO_ADM } from "./utils/permissoes";

function App() {
  return (
    <Routes>

      {/* Auth (pública) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      </Route>
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />

      {/* Painel: só entra quem estiver logado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<PainelLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:id" element={<Quiz />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="progresso" element={<Progresso />} />
          <Route path="perfil" element={<Perfil />} />
          <Route element={<ProtectedRoute permissao={PERMISSAO_ADM} />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      {/* Qualquer endereço desconhecido volta para o login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;