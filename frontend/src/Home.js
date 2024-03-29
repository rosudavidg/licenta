import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFirstName } from "./Auth.js";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Loading from "./Loading.js";
import { Helmet } from "react-helmet";
import "./Home.scss";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const getReady = async (ready, setReady) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get(`${process.env.REACT_APP_API_URL}/users/ready`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    })
    .then(async (res) => {
      setReady(res.data);

      if (res.data != true) {
        await sleep(5000);
        getReady(ready, setReady);
      }
    })
    .catch((e) => {
      alert(`Get ready field failed!\nError: ${e.response.data.error}`);
    });
};

const getStatsAvailability = async (setStatsAvailability) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get(`${process.env.REACT_APP_API_URL}/stats/availability`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    })
    .then(async (res) => {
      setStatsAvailability(res.data);
    })
    .catch((e) => {
      setStatsAvailability(false);
    });
};

const Home = () => {
  const history = useHistory();
  const [ready, setReady] = useState(true);
  const [statsAvailability, setStatsAvailability] = useState(true);

  useEffect(() => {
    getReady(ready, setReady);
    getStatsAvailability(setStatsAvailability);
  }, []);

  const onClickBot = () => {
    history.push("/bot");
  };

  return (
    <>
      <Helmet>
        <title>Avatario - Acasă</title>
      </Helmet>
      <div className="home-container">
        <div className="home-message">
          <p>Salut, {getFirstName()}!</p>
          <p>
            {ready && (
              <>
                {!statsAvailability && (
                  <p>
                    Statisticile vor deveni disponibile după prelucrarea unui număr minim de răspunsuri. Pentru mai
                    multe detalii, consultă secțiunea:{" "}
                    <span className="abount-link" onClick={() => history.push("/about")}>
                      Despre
                    </span>
                    .
                  </p>
                )}
                <div className="home-button" onClick={onClickBot}>
                  Antrenează-ți mintea!
                </div>
                {statsAvailability && (
                  <div className="home-button" onClick={() => history.push("/stats")}>
                    {" "}
                    Statistici
                  </div>
                )}
                {!statsAvailability && (
                  <>
                    <div className="home-button deactivated" alt="hi">
                      <FontAwesomeIcon icon={faLock} className="lock" />
                      Statistici
                    </div>
                  </>
                )}
              </>
            )}
            {!ready && (
              <>
                <p>Momentan, lucrăm la setările contului tău. Imediat ce vom termina, vei putea folosi aplicația!</p>
                <Loading />
                <div className="home-button deactivated">
                  <FontAwesomeIcon icon={faLock} className="lock" />
                  Antrenează-ți mintea!
                </div>
                <div className="home-button deactivated">
                  <FontAwesomeIcon icon={faLock} className="lock" />
                  Statistici
                </div>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
