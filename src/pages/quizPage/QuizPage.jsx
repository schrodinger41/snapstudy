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
} from "firebase/firestore"; // Firestore methods
import { getAuth } from "firebase/auth"; // Get the current user
import Navbar from "../../components/navbar/Navbar";
import "./quizPage.css";

const QuizPage = () => {
  const { id } = useParams(); // Get the flashcard set id from the URL
  const [flashcardSet, setFlashcardSet] = useState(null); // Holds the flashcard set
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Track current card in quiz
  const [options, setOptions] = useState([]); // Store options for current card
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [feedback, setFeedback] = useState(""); // Store feedback (correct/incorrect)
  const [score, setScore] = useState(0); // Track the user's score
  const navigate = useNavigate(); // For navigation
  const auth = getAuth(); // Get the currently logged-in user
  const user = auth.currentUser; // Current user info

  // Function to shuffle an array (Fisher-Yates Shuffle)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Fetch the flashcard set and shuffle the cards
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const docRef = doc(db, "flashcards", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const flashcardData = { id: docSnap.id, ...docSnap.data() };

        // Shuffle the cards array inside the flashcard set
        const shuffledCards = shuffleArray([...flashcardData.cards]);
        setFlashcardSet({ ...flashcardData, cards: shuffledCards });
      }
    };

    fetchFlashcardSet();
  }, [id]);

  useEffect(() => {
    if (flashcardSet && flashcardSet.cards.length > 0) {
      generateOptions();
    }
  }, [flashcardSet, currentCardIndex]);

  // Generate options for the current card (1 correct, 3 incorrect), ensuring unique options
  const generateOptions = () => {
    const correctAnswer = flashcardSet.cards[currentCardIndex].term;
    setCorrectAnswer(correctAnswer);

    // Filter out the correct answer and ensure all terms are unique
    const incorrectOptions = flashcardSet.cards
      .map((card) => card.term) // Get all terms
      .filter(
        (term, index) => term !== correctAnswer && index !== currentCardIndex
      ) // Exclude correct answer and current card
      .filter((term, index, self) => self.indexOf(term) === index) // Ensure terms are unique
      .sort(() => 0.5 - Math.random()) // Shuffle terms
      .slice(0, 3); // Get 3 unique incorrect options

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

  // Save score to the "results" collection and the flashcard set, then navigate to result page
  const handleFinishQuiz = async () => {
    try {
      // Save the score to the "results" collection
      const resultsRef = collection(db, "results"); // New global "results" collection
      await addDoc(resultsRef, {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        score: score,
        flashcardSetId: id, // Flashcard set ID
        timestamp: new Date(), // Save the timestamp
      });

      // Increment the number of users who have completed the quiz in the flashcard set
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
        <div className="progress-bar-wrapper">
          <span className="progress-number current">
            {currentCardIndex + 1}
          </span>
        <div className="progress-bar-container">
          <div
          className="progress-bar"
          style={{
            width: `${((currentCardIndex + 1) / flashcardSet.cards.length) * 100}%`,
          }}
          ></div>
        </div>
          <span className="progress-number total">
          {flashcardSet.cards.length}
          </span>
        </div>
        <h2>{flashcardSet.title}</h2>
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
                    className={
                      selectedAnswer === option
                        ? option === correctAnswer
                          ? "correct" // For correct answer selected
                          : "incorrect" // For incorrect answer selected
                        : option === correctAnswer &&
                          feedback.includes("Incorrect")
                        ? "correct" // Show correct answer if user selected wrong
                        : ""
                    }
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
                  : "Continue"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
