import React, { useState, useEffect } from "react";
import "./Loading.css";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const run = async (flipped, setFlipped) => {
  await sleep(500);
  setFlipped(!flipped);
  run(!flipped, setFlipped);
};

const Loading = () => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    run(flipped, setFlipped);
  }, []);

  return (
    <div className="loading">
      {flipped && <img className="loading-logo" src="logo-flipped.png" style={{ width: "50", height: "50px" }} />}
      {!flipped && <img className="loading-logo" src="logo.png" style={{ width: "50px", height: "50px" }} />}
    </div>
  );
};

export default Loading;
