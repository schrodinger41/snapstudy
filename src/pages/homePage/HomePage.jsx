import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage.css";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";
import { IoSearch } from "react-icons/io5";

const categories = [
  "Mathematics",
  "Science",
  "History",
  "Languages",
  "Social Studies",
  "Literature",
  "Medical Studies",
  "Business & Economics",
  "Technology & Computer Science",
  "Art & Music",
  "Other",
];

const HomePage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "flashcards"), (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
      setFilteredSets(sets);
    });

    return () => unsubscribe();
  }, []);

  // Handle search action
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      // Navigate to the search results page and pass the search query as a URL parameter
      navigate(`/searchResultsPage?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Trigger search when Enter key is pressed
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle category selection and navigate to search results page
  const handleCategoryClick = (category) => {
    navigate(`/searchResultsPage?category=${encodeURIComponent(category)}`);
  };

  // Get the top 3 flashcard sets based on completed users
  const topFlashcardSets = flashcardSets
    .sort((a, b) => (b.completedUsers || 0) - (a.completedUsers || 0))
    .slice(0, 3);

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="searchInput-container">
            <div className="left-input">
              <input
                type="text"
                placeholder="Search here..."
                className="search-input"
                value={searchQuery} // Bind search query state
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                onKeyPress={handleKeyPress} // Trigger search on Enter
              />
            </div>
            <div className="right-input" onClick={handleSearch}>
              <IoSearch className="search-icon" />
            </div>
          </div>
          <h1 className="main-title">Snap, Save, and Study, and Save</h1>
        </div>

        <div className="top">
          <div className="top-container">
            <div className="top-left">
              <div className="top-text">Select Categories</div>
            </div>
            <div className="top-right">
              <div className="add-set-button"></div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="category-container">
          {categories.map((category, index) => (
            <button
              key={index}
              className="category-button"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="bottom">
          <div className="top-container">
            <div className="top-left">
              <div className="top-text reco">Recommended</div>
            </div>
            <div className="top-right">
              <div className="add-set-button"></div>
            </div>
          </div>
          <div className="flashcard-sets">
            {topFlashcardSets.map((set) => (
              <FlashcardSet
                key={set.id}
                title={set.title}
                cardCount={set.cards.length}
                creator={set.creator} 
                id={set.id} 
                completedUsers={set.completedUsers || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
