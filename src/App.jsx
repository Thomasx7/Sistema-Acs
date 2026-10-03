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


      {/* Rota Pai */}
      <Route path="/painel" element={<PainelLayout />}>
      
        <Route index element={<Home />} />
        <Route path="quiz/:id" element={<Quiz />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="progresso" element={<Progresso />} />
        
      </Route> 

      
      <Route path="*" element={<Navigate to="/painel" />} />
    </Routes>
  );
}

export default App;
