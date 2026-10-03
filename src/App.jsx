import { Routes, Route } from 'react-router-dom'
import Login from "./pages/Auth/login";
import Home from "./pages/Home/home";

function App() {


  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App
