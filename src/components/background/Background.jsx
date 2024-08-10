import React from "react";
import "./background.css";

const generateStars = (count, size) => {
  let stars = [];
  for (let i = 0; i < count; i++) {
    const style = {
      width: `${size}px`,
      height: `${size}px`,
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      opacity: Math.random(),
    };
    stars.push(<div key={i} className="star" style={style} />);
  }
  return stars;
};

const Background = () => {
  return (
    <>
      <div id="stars">{generateStars(100, 1)}</div>
      <div id="stars2">{generateStars(50, 2)}</div>
      <div id="stars3">{generateStars(20, 3)}</div>
    </>
  );
};

export default Background;
