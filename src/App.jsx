import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./config/firebase";
import { doc, getDoc } from "firebase/firestore";
import Register from "./pages/registerPage/RegisterPage";
import HomePage from "./pages/homePage/HomePage";
import AdminPage from "./pages/adminPage/AdminPage";
import NewCardPage from "./pages/newCardPage/NewCardPage";
import CardPage from "./pages/cardPage/CardPage";
import QuizPage from "./pages/quizPage/QuizPage";
import MyCardsPage from "./pages/myCardsPage/MyCardsPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import QuizResultPage from "./pages/quizResultPage/QuizResultPage";
import SearchResultsPage from "./pages/searchResultsPage/SearchResultsPage";
import LoadingGif from "../src/images/loading.gif";
import EditCardPage from "./pages/editCardPage/EditCardPage";
import "./App.css";
import SecondBackground from "./components/background/SecondBackground";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the auth-token cookie exists to update auth state
    const authToken = cookies.get("auth-token");

    if (authToken) {
      setIsAuth(true); // User is logged in
    } else {
      setIsAuth(false); // User is not logged in
    }

    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div class="loading-screen">
        <img src={LoadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <BrowserRouter>
    <SecondBackground />
      <Routes>
        <Route path="/" element={<Register />} />
        {/* User-only page */}
        <Route
          path="home"
          element={
            isAuth && role === "user" ? <HomePage /> : <Navigate to="/" />
          }
        />
        <Route
          path="newCard"
          element={
            isAuth && role === "user" ? <NewCardPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="quiz/:id"
          element={
            isAuth && role === "user" ? <QuizPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="myCardsPage"
          element={
            isAuth && role === "user" ? <MyCardsPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="quizResultPage"
          element={
            isAuth && role === "user" ? <QuizResultPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="searchResultsPage"
          element={
            isAuth && role === "user" ? (
              <SearchResultsPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Admin-only page */}
        <Route
          path="adminPage"
          element={
            isAuth && role === "admin" ? <AdminPage /> : <Navigate to="/" />
          }
        />

        {/* Can be accessed by both admin and user */}

        <Route
          path="card/:id"
          element={isAuth ? <CardPage /> : <Navigate to="/" />}
        />
        <Route
          path="profilePage"
          element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
        />

        <Route
          path="editCard/:id"
          element={isAuth ? <EditCardPage /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
