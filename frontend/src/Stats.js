import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Stats.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faArrowCircleRight } from "@fortawesome/free-solid-svg-icons";

import { HorizontalBar, Bar, Line, Pie, Doughnut } from "react-chartjs-2";

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

const getStats = async (setStats, setReady) => {
  const jwt_token = localStorage.getItem("token");

  axios
    .get("/stats", {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    })
    .then((res) => {
      setStats(res.data);
      setReady(true);
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
        <div className="stats-periodic-button stats-periodic-button-left" onClick={onClickPrev}>
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </div>
        <div className="stats-periodic-top-dates">
          {new Date(stats[index]["start_date"]).toLocaleDateString("ro", { timezone: "UTC" })} -{" "}
          {new Date(stats[index]["end_date"]).toLocaleDateString("ro", { timezone: "UTC" })}
        </div>
        <div className="stats-periodic-button stats-periodic-button-right" onClick={onClickNext}>
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </div>
      </div>
      <div className="stats-periodic-stats-total">
        <div className="stats-periodic-stats-pie">
          <Doughnut
            options={{
              title: {
                display: true,
                text: "Precizia totală",
                fontColor: "#cdd1c4",
                fontSize: 16,
              },
              legend: {
                display: false,
              },
            }}
            data={{
              labels: ["Corect", "Greșit"],
              datasets: [
                {
                  data: [
                    Math.round(stats[index]["acc_total"] * 100),
                    100 - Math.round(stats[index]["acc_total"] * 100),
                  ],
                  backgroundColor: ["#cdd1c4", "#22333b"],
                  hoverBackgroundColor: ["4e8098", "#22333b"],
                },
              ],
            }}
          />
          <div className="stats-periodic-stats-pie-text">{Math.round(stats[index]["acc_total"] * 100)}%</div>
        </div>
        <div className="stats-periodic-stats-pie">
          <Doughnut
            options={{
              title: {
                display: true,
                text: "Memorie de scurtă durată",
                fontColor: "#cdd1c4",
                fontSize: 16,
              },
              legend: {
                display: false,
              },
            }}
            data={{
              labels: ["Corect", "Greșit"],
              datasets: [
                {
                  data: [
                    Math.round(stats[index]["acc_short_term_memory"] * 100),
                    100 - Math.round(stats[index]["acc_short_term_memory"] * 100),
                  ],
                  backgroundColor: ["#cdd1c4", "#22333b"],
                  hoverBackgroundColor: ["4e8098", "#22333b"],
                },
              ],
            }}
          />
          <div className="stats-periodic-stats-pie-text">
            {Math.round(stats[index]["acc_short_term_memory"] * 100)}%
          </div>
        </div>
        <div className="stats-periodic-stats-pie">
          <Doughnut
            options={{
              title: {
                display: true,
                text: "Memorie de lungă durată",
                fontColor: "#cdd1c4",
                fontSize: 16,
              },
              legend: {
                display: false,
              },
            }}
            data={{
              labels: ["Corect", "Greșit"],
              datasets: [
                {
                  data: [
                    Math.round(stats[index]["acc_long_term_memory"] * 100),
                    100 - Math.round(stats[index]["acc_long_term_memory"] * 100),
                  ],
                  backgroundColor: ["#cdd1c4", "#22333b"],
                  hoverBackgroundColor: ["4e8098", "#22333b"],
                },
              ],
            }}
          />
          <div className="stats-periodic-stats-pie-text">{Math.round(stats[index]["acc_long_term_memory"] * 100)}%</div>
        </div>
      </div>
      <div className="stats-periodic-stats">
        <div className="stats-periodic-stats-text">Precizii detaliate</div>
        <HorizontalBar
          className="stats-periodic-stats-bar"
          options={{
            legend: {
              display: false,
            },
            scales: {
              xAxes: [
                {
                  ticks: {
                    fontColor: "#cdd1c4",
                    fontSize: 16,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                  },
                },
              ],
              yAxes: [
                {
                  ticks: {
                    fontColor: "#cdd1c4",
                    fontSize: 16,
                  },
                },
              ],
            },
          }}
          data={{
            labels: [
              "Memorare cuvinte",
              "Recunoaștere persoane",
              "Anotimpuri",
              "Ziua din săptămână",
              "Indicatoare rutiere",
              "Zi de naștere",
              "Data calendaristică",
              "Recunoaștere animale",
              "Joc de memorie",
              "Zaruri",
              "Desenare ceas",
              "Oraș natal",
              "Oraț curent",
              "Limbi cunoscute",
              "Genuri muzicale",
              "Postări",
              "Cărți",
              "Filme",
            ],

            datasets: [
              {
                // barPercentage: 0.5,
                data: [
                  Math.round(stats[index]["acc_common_words"] * 100),
                  Math.round(stats[index]["acc_face"] * 100),
                  Math.round(stats[index]["acc_season"] * 100),
                  Math.round(stats[index]["acc_today"] * 100),
                  Math.round(stats[index]["acc_traffic_sign"] * 100),
                  Math.round(stats[index]["acc_birthday"] * 100),
                  Math.round(stats[index]["acc_today_date"] * 100),
                  Math.round(stats[index]["acc_animals"] * 100),
                  Math.round(stats[index]["acc_memory_game"] * 100),
                  Math.round(stats[index]["acc_dices"] * 100),
                  Math.round(stats[index]["acc_clock"] * 100),
                  Math.round(stats[index]["acc_hometown"] * 100),
                  Math.round(stats[index]["acc_location"] * 100),
                  Math.round(stats[index]["acc_language"] * 100),
                  Math.round(stats[index]["acc_music_genre"] * 100),
                  Math.round(stats[index]["acc_post"] * 100),
                  Math.round(stats[index]["acc_book"] * 100),
                  Math.round(stats[index]["acc_movie"] * 100),
                ],
                backgroundColor: "#cdd1c4",
                hoverBackgroundColor: "#4e8098",
              },
            ],
          }}
        />
      </div>
    </>
  );
};

const Stats = () => {
  const [selectedMenu, setSelectedMenu] = useState("periodic");
  const [stats, setStats] = useState({});
  const [ready, setReady] = useState(false);

  const onClickEvolutie = () => {
    setSelectedMenu("evolutie");
  };

  const onClickPeriodic = () => {
    setSelectedMenu("periodic");
  };

  useEffect(() => {
    getStats(setStats, setReady);
  }, []);

  return (
    <div className="stats-container">
      <StatsTop onClickEvolutie={onClickEvolutie} onClickPeriodic={onClickPeriodic} selectedMenu={selectedMenu} />
      {ready && selectedMenu === "periodic" && <Periodic stats={stats} />}
    </div>
  );
};

export default Stats;
