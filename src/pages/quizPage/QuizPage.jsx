import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Navbar from "../../components/navbar/Navbar";
import LoadingGif from "../../images/loading.gif";
import Background from "../../components/background/Background";
import "./quizPage.css";

const QuizPage = () => {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();
  const { timer } = location.state || {};
  const [timeRemaining, setTimeRemaining] = useState(timer);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Function to format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Fetch flashcard set and shuffle cards
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const docRef = doc(db, "flashcards", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const flashcardData = { id: docSnap.id, ...docSnap.data() };
        const shuffledCards = shuffleArray([...flashcardData.cards]);
        setFlashcardSet({ ...flashcardData, cards: shuffledCards });
      }
    };

    fetchFlashcardSet();
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (timer) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setIsTimeUp(true);
            handleQuizComplete(timer); // Complete quiz with full timer value as timeTaken
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleQuizComplete = (timeTakenOverride = null) => {
    setIsQuizComplete(true);
    const timeTaken = timeTakenOverride || (!timer ? 0 : timer - timeRemaining); // If no timer, timeTaken is 0
    handleFinishQuiz(timeTaken);
  };

  useEffect(() => {
    if (flashcardSet && flashcardSet.cards.length > 0) {
      generateOptions();
    }
  }, [flashcardSet, currentCardIndex]);

  const generateOptions = () => {
    const correctAnswer = flashcardSet.cards[currentCardIndex].term;
    setCorrectAnswer(correctAnswer);

    const incorrectOptions = flashcardSet.cards
      .map((card) => card.term)
      .filter(
        (term, index) => term !== correctAnswer && index !== currentCardIndex
      )
      .filter((term, index, self) => self.indexOf(term) === index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [...incorrectOptions, correctAnswer].sort(
      () => 0.5 - Math.random()
    );

    setOptions(allOptions);
    setFeedback("");
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    if (answer === flashcardSet.cards[currentCardIndex].term) {
      setFeedback("Correct!");
      setScore((prevScore) => prevScore + 1);
    } else {
      setFeedback(
        `Incorrect! The correct answer is: ${flashcardSet.cards[currentCardIndex].term}`
      );
    }
  };

  const handleFinishQuiz = async (timeTakenInSeconds) => {
    try {
      const resultsRef = collection(db, "results");
      await addDoc(resultsRef, {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        score: score,
        timeTaken: timeTakenInSeconds,
        flashcardSetId: id,
        timestamp: new Date(),
      });

      const flashcardSetRef = doc(db, "flashcards", id);
      await updateDoc(flashcardSetRef, {
        completedUsers: increment(1),
      });

      navigate("/quizResultPage", {
        state: {
          score: score,
          totalCards: flashcardSet.cards.length,
          timeTaken: timeTakenInSeconds,
          flashcardSetId: id,
          timer, // Pass the timer back to the result page
        },
      });
    } catch (error) {
      console.error("Error saving quiz result: ", error);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      handleQuizComplete(); // Finish quiz when all cards are answered
    }
  };

  if (!flashcardSet)
    return (
      <div class="loading-screen">
        <img src={LoadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <Background />
      <div className="quiz-page">
        <div className="progress-bar-wrapper">
          <span className="progress-number current">
            {currentCardIndex + 1}
          </span>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${
                  ((currentCardIndex + 1) / flashcardSet.cards.length) * 100
                }%`,
              }}
            ></div>
          </div>
          <span className="progress-number total">
            {flashcardSet.cards.length}
          </span>
        </div>
        <h2>{flashcardSet.title}</h2>

        {timer && (
          <div className="timer">
            <p>Time Remaining: {formatTime(timeRemaining)}</p>
          </div>
        )}

        {isTimeUp ? (
          <div>
            <h3>Time's up!</h3>
            <p>Your final score is: {score}</p>
            <button
              className="next-button"
              onClick={() => handleQuizComplete(timer)}
            >
              Finish Quiz
            </button>
          </div>
        ) : (
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
                          ? "correct"
                          : "incorrect"
                        : option === correctAnswer &&
                          feedback.includes("Incorrect")
                        ? "correct"
                        : ""
                    }
                    disabled={selectedAnswer !== null}
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
