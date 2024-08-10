import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Register />} />
          <Route path="register" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
