import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/loginPage/LoginPage";
import Register from "./pages/registerPage/RegisterPage";
import HomePage from "./pages/homePage/HomePage";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Register />} />
          <Route path="register" element={<Login />} />
          <Route path="home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
