import React, { useState, useEffect } from "react";

import "./MemoryGame.css";
import axios from "axios";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const MemoryGame = (props) => {
  const [elems, setElems] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [clickable, setClickable] = useState(false);
  const [currentElem, setCurrentElem] = useState(0);
  const [running, setRunning] = useState(false);
  const [randomSelected, setRandomSelected] = useState([]);

  const answerMemoryGame = async (score) => {
    const question = props.question;
    const setQuestion = props.setQuestion;
    const getQuestion = props.getQuestion;
    const jwt_token = localStorage.getItem("token");
    await axios
      .post(
        `/questions/${question.id}/answer`,
        { score: score },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      .then(() => {
        setElems([
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]);
        setClickable(false);
        setCurrentElem(0);
        setRunning(false);
        setRandomSelected([]);

        getQuestion(setQuestion);
      })
      .catch((e) => {
        alert(`Answer question failed!\nError: ${e.response.data.error}`);
      });
  };

  const Elem = (props) => {
    const rowId = props.rowId;
    const colId = props.colId;

    const onClickElem = async (rowId, colId) => {
      if (clickable) {
        const i = randomSelected[currentElem][0];
        const j = randomSelected[currentElem][1];

        if (rowId === i && colId === j) {
          setClickable(false);
          await showElem(rowId, colId);
          setClickable(true);

          let copyCurrentElem = currentElem + 1;

          await setCurrentElem(copyCurrentElem);

          if (copyCurrentElem === 4) {
            console.log("acii");
            setClickable(false);
            await sleep(500);
            await answerMemoryGame(copyCurrentElem);
          }
        } else {
          setClickable(false);
          showBadElem(rowId, colId);
          setClickable(false);
          await sleep(500);
          await answerMemoryGame(currentElem);
        }
      }
    };

    return (
      <>
        {elems[rowId][colId] == 0 && (
          <div className="memory-game-elem normal" onClick={() => onClickElem(rowId, colId)}></div>
        )}
        {elems[rowId][colId] == 1 && <div className="memory-game-elem set"></div>}
        {elems[rowId][colId] == 2 && <div className="memory-game-elem bad"></div>}
      </>
    );
  };

  const randomElems = () => {
    let el = [];

    for (let i = 0; i < 4; i++) {
      let randomI = Math.floor(Math.random() * Math.floor(4));
      let randomJ = Math.floor(Math.random() * Math.floor(4));

      el.push([randomI, randomJ]);
    }

    return el;
  };

  const showElem = async (rowId, colId) => {
    let copyElems = JSON.parse(JSON.stringify(elems));

    copyElems[rowId][colId] = 1;
    setElems(copyElems);
    await sleep(500);

    copyElems = JSON.parse(JSON.stringify(elems));
    copyElems[rowId][colId] = 0;
    setElems(copyElems);
  };

  const showBadElem = async (rowId, colId) => {
    const copyElems = JSON.parse(JSON.stringify(elems));

    copyElems[rowId][colId] = 2;
    setElems(copyElems);
  };

  const showElems = async (selected) => {
    let copyElems = JSON.parse(JSON.stringify(elems));

    for (let e = 0; e < selected.length; e++) {
      let i = selected[e][0];
      let j = selected[e][1];

      copyElems = JSON.parse(JSON.stringify(elems));
      await sleep(500);
      copyElems[i][j] = 1;
      setElems(copyElems);

      copyElems = JSON.parse(JSON.stringify(elems));
      await sleep(500);
      copyElems[i][j] = 0;
      setElems(copyElems);
    }
  };

  const playRound = async () => {
    const selected = randomElems();
    setRandomSelected(selected);

    await showElems(selected);

    setClickable(true);
  };

  const startGame = async () => {
    if (!running) {
      setRunning(true);
      playRound();
    }
  };

  return (
    <div className="memory-game">
      {elems.map((row, rowId) => {
        return (
          <div className="memory-game-row" key={rowId}>
            {row.map((elem, colId) => {
              return <Elem rowId={rowId} colId={colId} key={colId} />;
            })}
          </div>
        );
      })}
      <div className="memory-start-button" onClick={startGame}>
        Start!
      </div>
    </div>
  );
};

export default MemoryGame;
