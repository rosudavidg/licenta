import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Bot.css";
import { useHistory } from "react-router-dom";
import { getProfilepic } from "./Auth.js";

const Bot = () => {
  const [question, setQuestion] = useState("");
  const history = useHistory();

  useEffect(() => {
    getQuestion(setQuestion);
  }, []);

  const getQuestion = async (setQuestion) => {
    const jwt_token = localStorage.getItem("token");

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

  const onClickBack = () => {
    history.push("/");
  };

  return (
    <>
      <div className="bot-container">
        <div className="bot-message">
          <img className="bot-message-icon" src="laptop.jpg" />
          {question.image && <img className="bot-message-image" src={`data:image/png;base64,${question.image}`} />}
          <div className="bot-message-text">{question.message}</div>
        </div>
        <div className="bot-answer">
          <img className="bot-answer-icon" src={`data:image/jpeg;base64,${getProfilepic()}`} />
          {question.type === "choice" && <ChoiceComponent question={question} setQuestion={setQuestion} />}
          {question.type === "text" && <TextComponent question={question} setQuestion={setQuestion} />}
          {question.type === "confirm" && <ConfirmComponent question={question} setQuestion={setQuestion} />}
          <div className="bot-choice-container-element back" onClick={onClickBack}>
            Acasă
          </div>
        </div>
      </div>
    </>
  );
};

export default Bot;
