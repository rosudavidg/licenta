import React from "react";
import { Helmet } from "react-helmet";
import "./About.scss";

const About = () => {
  return (
    <>
      <Helmet>
        <title>Avatario - Despre</title>
      </Helmet>
      <div className="about-container">
        <div className="about-message">
          <p>Salut!</p>
          <p>Bine ai venit pe Avatario!</p>
          <p>TODO: implement me</p>
        </div>
      </div>
    </>
  );
};

export default About;
