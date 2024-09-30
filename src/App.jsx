import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import Register from "./pages/registerPage/RegisterPage";
import HomePage from "./pages/homePage/HomePage";
import NewCardPage from "./pages/newCardPage/NewCardPage";
import QuizPage from "./pages/quizPage/QuizPage";
import CardPage from "./pages/cardPage/CardPage";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route
          path="home"
          element={isAuth ? <HomePage /> : <Navigate to="/" />}
        />
         <Route
          path="newCard"
          element={isAuth ? <NewCardPage /> : <Navigate to="/" />}
        />
         <Route
          path="card"
          element={isAuth ? <CardPage /> : <Navigate to="/" />}
        />
         <Route
          path="quiz"
          element={isAuth ? <QuizPage /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
