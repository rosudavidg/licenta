import React, { useState, useEffect } from "react";
import "./Star.css";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const Star = (props) => {
  const [x, setX] = useState(props.x);
  const [initY, setInitY] = useState(props.y);
  const [y, setY] = useState(props.y);
  const [size, setSize] = useState(props.size);
  const [speed, setSpeed] = useState(props.speed);

  useEffect(() => {
    const interval = setInterval(() => {
      if (y < 0) {
        setY(initY);
      } else {
        setY(y - speed);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [y]);

  return (
    <div
      key={y}
      className="star"
      style={{ marginLeft: `${x}px`, marginTop: `${y}px`, width: `${size}px`, height: `${size}px` }}
    ></div>
  );
};

export default Star;
