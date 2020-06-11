import React, { useState, useEffect } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
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
    .get(`${process.env.REACT_APP_API_URL}/stats`, {
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

const EvolutionChart = (props) => {
  return (
    <>
      <div className="stats-evolution-stats">
        <div className="stats-evolution-stats-text">{props.title}</div>
        <Line
          options={{
            legend: {
              display: false,
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    fontColor: "#cdd1c4",
                    fontSize: 16,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    suggestedMin: 0,
                  },
                },
              ],
              xAxes: [
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
            labels: props.intervals,
            datasets: [
              {
                // label: false,
                // fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: "miter",
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: props.data,
              },
            ],
          }}
        />
      </div>
    </>
  );
};

const Evolution = (props) => {
  const [stats, _] = useState(props.stats);
  const accTotal = props.stats.map((e) => Math.round(e["acc_total"] * 100));
  const accShort = props.stats.map((e) => Math.round(e["acc_short_term_memory"] * 100));
  const accLong = props.stats.map((e) => Math.round(e["acc_long_term_memory"] * 100));
  const accCommonWords = props.stats.map((e) => Math.round(e["acc_common_words"] * 100));
  const accFace = props.stats.map((e) => Math.round(e["acc_face"] * 100));
  const accSeason = props.stats.map((e) => Math.round(e["acc_season"] * 100));
  const accToday = props.stats.map((e) => Math.round(e["acc_today"] * 100));
  const accTrafficSign = props.stats.map((e) => Math.round(e["acc_traffic_sign"] * 100));
  const accBirthday = props.stats.map((e) => Math.round(e["acc_birthday"] * 100));
  const accTodayDate = props.stats.map((e) => Math.round(e["acc_today_date"] * 100));
  const accAnimals = props.stats.map((e) => Math.round(e["acc_animals"] * 100));
  const accMemoryGame = props.stats.map((e) => Math.round(e["acc_memory_game"] * 100));
  const accDices = props.stats.map((e) => Math.round(e["acc_dices"] * 100));
  const accClock = props.stats.map((e) => Math.round(e["acc_clock"] * 100));
  const accHometown = props.stats.map((e) => Math.round(e["acc_hometown"] * 100));
  const accLocation = props.stats.map((e) => Math.round(e["acc_location"] * 100));
  const accLanguage = props.stats.map((e) => Math.round(e["acc_language"] * 100));
  const accMusicGenre = props.stats.map((e) => Math.round(e["acc_music_genre"] * 100));
  const accPost = props.stats.map((e) => Math.round(e["acc_post"] * 100));
  const accBook = props.stats.map((e) => Math.round(e["acc_book"] * 100));
  const accMovie = props.stats.map((e) => Math.round(e["acc_movie"] * 100));
  const intervals = props.stats.map(
    (e) =>
      `${new Date(e["start_date"]).toLocaleDateString("ro", { timezone: "UTC" })}-${new Date(
        e["end_date"]
      ).toLocaleDateString("ro", { timezone: "UTC" })}`
  );

  return (
    <>
      <EvolutionChart title="Precizia totală" intervals={intervals} data={accTotal} />
      <EvolutionChart title="Memoria de scurtă durată" intervals={intervals} data={accShort} />
      <EvolutionChart title="Memoria de lungă durată" intervals={intervals} data={accLong} />
      <EvolutionChart title="Memorare cuvinte" intervals={intervals} data={accCommonWords} />
      <EvolutionChart title="Recunoaștere persoane" intervals={intervals} data={accFace} />
      <EvolutionChart title="Anotimpuri" intervals={intervals} data={accSeason} />
      <EvolutionChart title="Ziua din săptămână" intervals={intervals} data={accToday} />
      <EvolutionChart title="Recunoaștere indicatoare rutiere" intervals={intervals} data={accTrafficSign} />
      <EvolutionChart title="Ziua de naștere" intervals={intervals} data={accBirthday} />
      <EvolutionChart title="Data calendaristică" intervals={intervals} data={accTodayDate} />
      <EvolutionChart title="Recunoaștere animale" intervals={intervals} data={accAnimals} />
      <EvolutionChart title="Joc memorie" intervals={intervals} data={accMemoryGame} />
      <EvolutionChart title="Zaruri" intervals={intervals} data={accDices} />
      <EvolutionChart title="Desene ceas" intervals={intervals} data={accClock} />
      <EvolutionChart title="Oraș natal" intervals={intervals} data={accHometown} />
      <EvolutionChart title="Oraș curent" intervals={intervals} data={accLocation} />
      <EvolutionChart title="Limbi cunoscute" intervals={intervals} data={accLanguage} />
      <EvolutionChart title="Genuri muzicale" intervals={intervals} data={accMusicGenre} />
      <EvolutionChart title="Postări" intervals={intervals} data={accPost} />
      <EvolutionChart title="Cărți" intervals={intervals} data={accBook} />
      <EvolutionChart title="Filme" intervals={intervals} data={accMovie} />
    </>
  );
};

const Stats = () => {
  const [selectedMenu, setSelectedMenu] = useState("evolutie");
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
    <>
      <Helmet>
        <title>Avatario - Statistici</title>
      </Helmet>
      <div className="stats-container">
        <StatsTop onClickEvolutie={onClickEvolutie} onClickPeriodic={onClickPeriodic} selectedMenu={selectedMenu} />
        {ready && selectedMenu === "periodic" && <Periodic stats={stats} />}
        {ready && selectedMenu === "evolutie" && <Evolution stats={stats} />}
      </div>
    </>
  );
};

export default Stats;
