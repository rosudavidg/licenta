import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookie, faHandshake } from "@fortawesome/free-solid-svg-icons";
import "./Terms.css";

const Terms = (props) => {
  const history = useHistory();
  const [accepted, setAccepted] = useState(localStorage.getItem("gdpr") === "true");

  const onClickAccept = () => {
    localStorage.setItem("gdpr", true);
    setAccepted("true");
    history.push("/");

    props.callback(true);
  };

  return (
    <div className="terms-container">
      <div className="terms-message">
        <p className="cookie-icon">
          <FontAwesomeIcon icon={faHandshake} size="3x" />
        </p>
        <p>Salut!</p>
        <p>Bine ai venit pe Avatario!</p>
        <p>TODO: implement me</p>
        {!accepted && (
          <div className="terms-button" onClick={onClickAccept}>
            Accept!
          </div>
        )}
        {accepted && <p>Ai acceptat termenii și condițiile.</p>}
      </div>
    </div>
  );
};

export default Terms;
