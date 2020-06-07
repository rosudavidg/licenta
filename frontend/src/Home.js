import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFirstName } from "./Auth.js";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Loading from "./Loading.js";
import "./Home.css";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const getReady = async (ready, setReady) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get("/users/ready", {
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
    .get("/stats/availability", {
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
    <div className="home-container">
      <div className="home-message">
        <p>Salut, {getFirstName()}!</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc id libero ultricies, pretium risus id, vulputate
          ex. Donec consequat eget lacus quis venenatis. Morbi quis lorem ut sapien ultricies laoreet ut eu urna. Nullam
          posuere mollis lobortis. Sed vitae nisi vitae nisl dapibus malesuada a vel nisi. Vestibulum ante ipsum primis
          in faucibus orci luctus et ultrices posuere cubilia curae; Donec metus nulla, vestibulum id scelerisque at,
          scelerisque quis velit. Nunc ullamcorper congue varius. Donec vitae finibus metus. Donec venenatis tempus
          massa, et gravida sem tempus nec. Vivamus rhoncus magna nec suscipit feugiat.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc id libero ultricies, pretium risus id, vulputate
          ex. Donec consequat eget lacus quis venenatis. Morbi quis lorem ut sapien ultricies laoreet ut eu urna. Nullam
          posuere mollis lobortis. Sed vitae nisi vitae nisl dapibus malesuada a vel nisi. Vestibulum ante ipsum primis
          in faucibus orci luctus et ultrices posuere cubilia curae; Donec metus nulla, vestibulum id scelerisque at,
          scelerisque quis velit. Nunc ullamcorper congue varius. Donec vitae finibus metus. Donec venenatis tempus
          massa, et gravida sem tempus nec. Vivamus rhoncus magna nec suscipit feugiat.
        </p>
        <p>
          {ready && (
            <>
              {!statsAvailability && (
                <p>
                  Statisticile vor deveni disponibile după prelucrarea unui număr minim de răspunsuri. Pentru mai multe
                  detalii, consultă secțiunea:{" "}
                  <span className="abount-link" onClick={() => history.push("/about")}>
                    Despre
                  </span>
                  .
                </p>
              )}
              <div className="home-button" onClick={onClickBot}>
                Antrenează-ți mintea!
              </div>
              {statsAvailability && <div className="home-button"> Statistici</div>}
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
  );
};

export default Home;
