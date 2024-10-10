import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./quizResultPage.css";

const QuizResultPage = () => {
  const location = useLocation();
  const { score, totalCards, flashcardSetId } = location.state || {}; // Get score, totalCards, and flashcardSetId from location state
  const navigate = useNavigate();

  // Handle navigation back to home page
  const goToHomePage = () => {
    navigate("/home");
  };

  // Handle retrying the quiz
  const retryQuiz = () => {
    navigate(`/quiz/${flashcardSetId}`); // Navigate to the quiz page of the same flashcard set
  };

  return (
    <div className="quiz-result-page">
      <Navbar />
      <h2>Quiz Results</h2>
      <p>
        You scored {score} out of {totalCards}
      </p>
      <p>Thank you for completing the quiz!</p>

      <div className="quiz-result-buttons">
        <button onClick={goToHomePage} className="quiz-result-button">
          Back to Home
        </button>
        <button onClick={retryQuiz} className="quiz-result-button">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;
