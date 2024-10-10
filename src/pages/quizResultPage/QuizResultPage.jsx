// components/quizResultPage/QuizResultPage.js
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./quizResultPage.css";

const QuizResultPage = () => {
  const location = useLocation();
  const { score, totalCards } = location.state || {}; // Get score and totalCards from location state

  return (
    <div className="quiz-result-page">
      <Navbar />
      <h2>Quiz Results</h2>
      <p>
        You scored {score} out of {totalCards}
      </p>
      <p>Thank you for completing the quiz!</p>
    </div>
  );
};

export default QuizResultPage;
