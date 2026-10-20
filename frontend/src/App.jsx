import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/login";
import ProtectedRoute from "./components/ProtectedRoute";

import PainelLayout from "./layouts/PainelLayout";
import Home from "./pages/Home/home";
import Quiz from "./pages/Home/quiz";
import Biblioteca from "./pages/Home/biblioteca";
import Progresso from "./pages/Home/progresso";
import Perfil from "./pages/Home/perfil";

function App() {
  return (
    <Routes>

      {/* Auth (pública) */}
      <Route path="/login" element={<Login />} />

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
        </Route>
      </Route>

      {/* Qualquer endereço desconhecido volta para o login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;