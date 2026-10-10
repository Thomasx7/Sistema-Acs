import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/login";

import PainelLayout from "./layouts/PainelLayout";
import Home from "./pages/Home/home";
import Quiz from "./pages/Home/quiz";
import Biblioteca from "./pages/Home/biblioteca";
import Progresso from "./pages/Home/progresso";

function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Rota Pai: painel na raiz */}
      <Route path="/" element={<PainelLayout />}>
        <Route index element={<Home />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/:id" element={<Quiz />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="progresso" element={<Progresso />} />
      </Route>

      {/* Qualquer endereço desconhecido volta para o início */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;