// components/quizPage/QuizPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore"; // Add Firestore methods
import { getAuth } from "firebase/auth"; // To get the current user
import Navbar from "../../components/navbar/Navbar";
import "./quizPage.css";

const QuizPage = () => {
  const { id } = useParams(); // Get the flashcard set id from the URL
  const [flashcardSet, setFlashcardSet] = useState(null); // Holds the flashcard set
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Track current card in quiz
  const [options, setOptions] = useState([]); // Store options for current card
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer
  const [feedback, setFeedback] = useState(""); // Store feedback (correct/incorrect)
  const [score, setScore] = useState(0); // Track the user's score
  const navigate = useNavigate(); // For navigation
  const auth = getAuth(); // Get the currently logged-in user
  const user = auth.currentUser; // Current user info

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const docRef = doc(db, "flashcards", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFlashcardSet({ id: docSnap.id, ...docSnap.data() });
      }
    };

    fetchFlashcardSet();
  }, [id]);

  useEffect(() => {
    if (flashcardSet && flashcardSet.cards.length > 0) {
      generateOptions();
    }
  }, [flashcardSet, currentCardIndex]);

  // Generate options for the current card (1 correct, 3 incorrect)
  const generateOptions = () => {
    const correctAnswer = flashcardSet.cards[currentCardIndex].term;
    const incorrectOptions = flashcardSet.cards
      .filter((_, index) => index !== currentCardIndex) // Exclude the correct answer
      .map((card) => card.term)
      .sort(() => 0.5 - Math.random()) // Shuffle incorrect terms
      .slice(0, 3); // Get 3 random incorrect options

    const allOptions = [...incorrectOptions, correctAnswer].sort(
      () => 0.5 - Math.random()
    ); // Shuffle all options
    setOptions(allOptions);
    setFeedback(""); // Reset feedback
    setSelectedAnswer(null); // Reset selected answer
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    if (answer === flashcardSet.cards[currentCardIndex].term) {
      setFeedback("Correct!");
      setScore((prevScore) => prevScore + 1); // Increment score for correct answer
    } else {
      setFeedback(
        `Incorrect! The correct answer is: ${flashcardSet.cards[currentCardIndex].term}`
      );
    }
  };

  // Save score to the database and navigate to result page
  const handleFinishQuiz = async () => {
    try {
      // Save the score to Firestore under the flashcard set
      const resultRef = collection(db, "flashcards", id, "results");
      await addDoc(resultRef, {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        score: score,
        timestamp: new Date(),
      });

      // Increment the number of users who have completed the quiz
      const flashcardSetRef = doc(db, "flashcards", id);
      await updateDoc(flashcardSetRef, {
        completedUsers: increment(1), // Increment the number of completed users
      });

      // Navigate to the quiz result page with the score and flashcard set id as state
      navigate(`/quizResultPage`, {
        state: {
          score: score,
          totalCards: flashcardSet.cards.length,
          flashcardSetId: id, // Pass the flashcard set id here
        },
      });
    } catch (error) {
      console.error("Error saving quiz result: ", error);
    }
  };

  // Go to the next card in the quiz
  const handleNextCard = () => {
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      handleFinishQuiz(); // Finish quiz when all cards are answered
    }
  };

  if (!flashcardSet) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="quiz-page">      
        <h2>Quiz: {flashcardSet.title}</h2>

      {feedback !== "Quiz Complete!" && (
          <>
            <div className="quiz-box">
              <h3>Definition</h3>
              <div className="definition-statement">
              {flashcardSet.cards[currentCardIndex].definition}
              </div>
              <p>Choose the correct term</p>
              <div className="options">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={selectedAnswer === option ? "selected" : ""}
                    disabled={selectedAnswer !== null} // Disable options after selecting an answer
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <p className="feedback">{feedback}</p>

            {feedback && (
              <button onClick={handleNextCard} className="next-button">
                {currentCardIndex === flashcardSet.cards.length - 1
                  ? "Finish Quiz"
                  : "Next"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
