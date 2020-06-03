import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import "./Home.css";

const getReady = async (setReady) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get("/users/ready", {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    })
    .then((res) => {
      setReady(res.data);
    })
    .catch((e) => {
      alert(`Get ready field failed!\nError: ${e.response.data.error}`);
    });
};

const Home = () => {
  const history = useHistory();
  const [ready, setReady] = useState(true);

  useEffect(() => {
    getReady(setReady);
  }, []);

  const onClickBot = () => {
    history.push("/bot");
  };

  return (
    <div className="home-container">
      <div className="home-message">
        <p>Salut!</p>
        <p>Bine ai venit pe Avatario!</p>
        <p>
          {ready && (
            <>
              <div className="home-button" onClick={onClickBot}>
                {" "}
                Antrenează-ți mintea!
              </div>
              <div className="home-button"> Statistici</div>
            </>
          )}
          {!ready && (
            <>
              <div className="home-button deactivated"> Antrenează-ți mintea!</div>
              <div className="home-button deactivated"> Statistici</div>
              <p>Momentan, lucrăm la setările contului dumneavoastră. Vom fi gata în 2 minute!</p>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Home;
