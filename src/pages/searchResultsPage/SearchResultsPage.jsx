// searchResultsPage.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { IoSearch } from "react-icons/io5";
import "./searchResultsPage.css";

const SearchResultsPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Use location to get the query from the URL

  // Extract the query and category from the URL
  const query = new URLSearchParams(location.search).get("query");
  const category = new URLSearchParams(location.search).get("category");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "flashcards"), (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (query) {
      const results = flashcardSets.filter((set) =>
        set.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else if (category) {
      const results = flashcardSets.filter(
        (set) => set.category.toLowerCase() === category.toLowerCase()
      );
      setSearchResults(results);
    }
  }, [query, category, flashcardSets]);

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

  return (
    <div className="search-results-page">
      <Navbar />
      <div className="search-results">
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
        </div>
        <div className="results-container">
          <div className="search-title">
          {query ? <p>Search Results for <span>{query}</span></p> : null}
          {category ? <p>Category: <span>{category}</span></p> : null}
          </div>
          <div className="flashcard-sets flashcard-sets-search">
            {searchResults.length > 0 ? (
              searchResults.map((set) => (
                <FlashcardSet
                  key={set.id}
                  title={set.title}
                  cardCount={set.cards.length}
                  creator={set.creator} // Pass creator's name
                  id={set.id} // Pass id for navigation
                  completedUsers={set.completedUsers || 0}
                />
              ))
            ) : (
              <p>
                No flashcard sets found {query ? `matching "${query}"` : ""}{" "}
                {category ? `in category "${category}"` : ""}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
