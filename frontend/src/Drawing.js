import React from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import "./Drawing.css";

const Drawing = (props) => {
  const answerDrawing = async (score) => {
    const question = props.question;
    const setQuestion = props.setQuestion;
    const getQuestion = props.getQuestion;
    const jwt_token = localStorage.getItem("token");

    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/questions/${question.id}/answer`,
        { image: window.canvas.toDataURL() },
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

  return (
    <div className="drawing-container">
      <Helmet>
        <script src="canvas.js" type="text/javascript" />
      </Helmet>
      <div className="drawing-area">
        <canvas className="drawing-canvas" />
      </div>
      <div className="drawing-submit-button" onClick={answerDrawing}>
        Trimite
      </div>
    </div>
  );
};

export default Drawing;
