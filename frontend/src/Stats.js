import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Stats.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faArrowCircleRight } from "@fortawesome/free-solid-svg-icons";

const StatsTop = (props) => {
  return (
    <div className="stats-top">
      {props.selectedMenu === "evolutie" && (
        <>
          <div className="stats-button-pressed" onClick={props.onClickEvolutie}>
            Evoluție
          </div>
          <div className="stats-vertical-line"></div>
          <div className="stats-button" onClick={props.onClickPeriodic}>
            Periodic
          </div>
        </>
      )}
      {props.selectedMenu === "periodic" && (
        <>
          <div className="stats-button" onClick={props.onClickEvolutie}>
            Evoluție
          </div>
          <div className="stats-vertical-line"></div>
          <div className="stats-button-pressed" onClick={props.onClickPeriodic}>
            Periodic
          </div>
        </>
      )}
    </div>
  );
};

const getStats = async (setStats) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get("/stats", {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    })
    .then((res) => {
      setStats(res.data);
    })
    .catch((e) => {
      alert(`Get question failed!\nError: ${e.response.data.error}`);
    });
};

const Periodic = (props) => {
  const [stats, _] = useState(props.stats);
  const [index, setIndex] = useState(props.stats.length - 1);

  const onClickNext = () => {
    let newIndex = index + 1;

    if (newIndex === props.stats.length) {
      newIndex = 0;
    }

    setIndex(newIndex);
  };

  const onClickPrev = () => {
    let newIndex = index - 1;

    if (newIndex === -1) {
      newIndex = props.stats.length - 1;
    }

    setIndex(newIndex);
  };

  return (
    <>
      <div className="stats-periodic-top">
        <div className="stats-periodic-button" onClick={onClickPrev}>
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </div>
        <div className="stats-periodic-top-dates">
          {new Date(stats[index]["start_date"]).toLocaleDateString("ro", { timezone: "UTC" })} -{" "}
          {new Date(stats[index]["end_date"]).toLocaleDateString("ro", { timezone: "UTC" })}
        </div>
        <div className="stats-periodic-button" onClick={onClickNext}>
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </div>
      </div>

      <div className="stats-periodic-stats">Precizia totală {stats[index]["acc_total"]}</div>
    </>
  );
};

const Stats = () => {
  const [selectedMenu, setSelectedMenu] = useState("evolutie");
  const [stats, setStats] = useState({});

  const onClickEvolutie = () => {
    setSelectedMenu("evolutie");
  };

  const onClickPeriodic = () => {
    setSelectedMenu("periodic");
  };

  useEffect(() => {
    getStats(setStats);
  }, []);

  return (
    <div className="stats-container">
      <StatsTop onClickEvolutie={onClickEvolutie} onClickPeriodic={onClickPeriodic} selectedMenu={selectedMenu} />
      {selectedMenu === "periodic" && <Periodic stats={stats} />}
    </div>
  );
};

export default Stats;
