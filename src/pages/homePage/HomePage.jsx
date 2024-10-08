import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./homepage.css";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";
import { FaRegFolderOpen } from "react-icons/fa6";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "flashcards"), (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
      setFilteredSets(sets); // Initialize with all sets
    });

    return () => unsubscribe();
  }, []);

  const filterSets = (category) => {
    const filtered = flashcardSets.filter((set) => set.category === category);
    setFilteredSets(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = flashcardSets.filter((set) =>
      set.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSets(filtered);
  };

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
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="right-input">
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
              onClick={() => filterSets(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="bottom">
          <div className="top-container">
            <div className="top-left">
              <div className="top-text">Recommended</div>
            </div>
            <div className="top-right">
              <div className="add-set-button"></div>
            </div>
          </div>
          <div className="flashcard-sets">
            {filteredSets.map((set) => (
              <FlashcardSet
                key={set.id}
                title={set.title}
                cardCount={set.cards.length}
                creator={set.creator} // Pass creator's name
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
