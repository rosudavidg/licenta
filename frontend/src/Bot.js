import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { getProfilepic } from "./Auth.js";
import { range } from "./Utils.js";
import MemoryGame from "./MemoryGame.js";
import Drawing from "./Drawing.js";
import Loading from "./Loading.js";

import "./Bot.scss";

const Bot = () => {
  const [question, setQuestion] = useState("");
  const history = useHistory();

  useEffect(() => {
    getQuestion(setQuestion);
  }, []);

  const getQuestion = async (setQuestion) => {
    const jwt_token = localStorage.getItem("token");
    setQuestion("");

    axios
      .get("/questions", {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      })
      .then((res) => {
        setQuestion(res.data);
      })
      .catch((e) => {
        alert(`Get question failed!\nError: ${e.response.data.error}`);
        history.push("/");
      });
  };

  const answerChoiceQuestion = async (question, choice, setQuestion) => {
    const jwt_token = localStorage.getItem("token");
    await axios
      .post(
        `/questions/${question.id}/answer`,
        { choice: choice },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      .then(() => {
        getQuestion(setQuestion);
      })
      .catch((e) => {
        alert(`Answer question failed!\nError: ${e.response.data.error}`);
      });
  };

  const answerConfirmQuestion = async (question, setQuestion) => {
    const jwt_token = localStorage.getItem("token");
    await axios
      .post(`/questions/${question.id}/answer`, "", {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      })
      .then(() => {
        getQuestion(setQuestion);
      })
      .catch((e) => {
        alert(`Answer question failed!\nError: ${e.response.data.error}`);
      });
  };

  const answerTextQuestion = async (question, answer, setQuestion, setText) => {
    const jwt_token = localStorage.getItem("token");
    await axios
      .post(
        `/questions/${question.id}/answer`,
        { answer: answer },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      .then(() => {
        setText("");
        getQuestion(setQuestion);
      })
      .catch((e) => {
        alert(`Answer question failed!\nError: ${e.response.data.error}`);
      });
  };

  const answerDateQuestion = async (question, date, setQuestion) => {
    const jwt_token = localStorage.getItem("token");
    await axios
      .post(
        `/questions/${question.id}/answer`,
        { date: date },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      .then(() => {
        getQuestion(setQuestion);
      })
      .catch((e) => {
        alert(`Answer question failed!\nError: ${e.response.data.error}`);
      });
  };

  const ChoiceComponent = ({ question, setQuestion }) => {
    return (
      <div className="bot-choice-container">
        {question.choices.map((elem, id) => {
          return (
            <div
              key={`choice-${id}`}
              className="bot-choice-container-element"
              onClick={(e) => answerChoiceQuestion(question, elem, setQuestion)}
            >
              {elem}
            </div>
          );
        })}
      </div>
    );
  };

  const TextComponent = ({ question, setQuestion }) => {
    const [text, setText] = useState("");

    const onChangeText = (event) => {
      event.preventDefault();
      setText(event.target.value);
    };

    return (
      <>
        <input className="bot-answer-input" placeholder="Scrie răspunsul tău..." onChange={onChangeText} value={text} />
        <div
          className="bot-choice-container-element"
          onClick={(e) => answerTextQuestion(question, text, setQuestion, setText)}
        >
          Trimite
        </div>
      </>
    );
  };

  const ConfirmComponent = ({ question, setQuestion }) => {
    return (
      <>
        <div className="bot-choice-container-element" onClick={(e) => answerConfirmQuestion(question, setQuestion)}>
          Gata!
        </div>
      </>
    );
  };

  const DateComponent = ({ question, setQuestion }) => {
    const [day, setDay] = useState(1);
    const [month, setMonth] = useState(1);
    const [year, setYear] = useState(1900);

    const days = range(1, 32);
    const months = range(1, 13);
    const years = range(1900, 2021);

    const changeDay = (event) => {
      setDay(event.target.value);
    };

    const changeMonth = (event) => {
      setMonth(event.target.value);
    };

    const changeYear = (event) => {
      setYear(event.target.value);
    };

    return (
      <>
        <p className="selectors">
          <label>Ziua:</label>
          <select id="day-selector" className="bot-select" onChange={changeDay}>
            {days.map((elem, id) => {
              return (
                <option className="bot-select-option" key={id} value={elem}>
                  {elem}
                </option>
              );
            })}
          </select>
          <label>Luna:</label>
          <select id="month-selector" className="bot-select" onChange={changeMonth}>
            {months.map((elem, id) => {
              return (
                <option key={id} value={elem}>
                  {elem}
                </option>
              );
            })}
          </select>

          <label>Anul:</label>
          <select id="year-selector" className="bot-select" onChange={changeYear}>
            {years.map((elem, id) => {
              return (
                <option key={id} value={elem}>
                  {elem}
                </option>
              );
            })}
          </select>
        </p>

        <div
          className="bot-choice-container-element"
          onClick={(e) => answerDateQuestion(question, `${year}-${month}-${day}`, setQuestion)}
        >
          Trimite
        </div>
      </>
    );
  };

  const onClickBack = () => {
    history.push("/");
  };

  return (
    <>
      <div className="bot-container">
        {question == "" && (
          <div className="bot-message">
            <Loading />
            <div className="bot-message-text">Se încarcă...</div>
          </div>
        )}
        {question != "" && (
          <>
            <div className="bot-message">
              <img className="bot-message-icon" src="logo.png" style={{ width: "50px", height: "50px" }} />
              {question.image && <img className="bot-message-image" src={`data:image/png;base64,${question.image}`} />}
              {question.images && (
                <div className="bot-message-images-container">
                  <img className="bot-message-images" src={`data:image/png;base64,${question.images[0]}`} />
                  <img className="bot-message-images" src={`data:image/png;base64,${question.images[1]}`} />
                </div>
              )}
              <div className="bot-message-text">{question.message}</div>
            </div>
            {question.type !== "clock" && (
              <div className="bot-answer">
                <img className="bot-answer-icon" src={`data:image/jpeg;base64,${getProfilepic()}`} />
                {question.type === "date" && <DateComponent question={question} setQuestion={setQuestion} />}
                {question.type === "choice" && <ChoiceComponent question={question} setQuestion={setQuestion} />}
                {question.type === "text" && <TextComponent question={question} setQuestion={setQuestion} />}
                {question.type === "confirm" && <ConfirmComponent question={question} setQuestion={setQuestion} />}
                {question.type === "memory_game" && (
                  <MemoryGame question={question} setQuestion={setQuestion} getQuestion={getQuestion} />
                )}
              </div>
            )}
            {question.type === "clock" && (
              <div className="bot-answer-drawing">
                <img className="bot-answer-icon" src={`data:image/jpeg;base64,${getProfilepic()}`} />
                <Drawing question={question} setQuestion={setQuestion} getQuestion={getQuestion} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Bot;
