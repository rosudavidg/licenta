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
          <p>
            Alzheimer este una dintre cele mai comune forme de demență și este întâlnită din ce în ce mai des la
            populația bătrână. Deoarece nu există încă un tratament, accentul este pus pe tehnicile de încetinire a
            evoluției bolii.
          </p>
          <p>
            Această lucrare prezintă o soluție de înglobare a funcționalităților prezente în metodele existente și
            digitalizarea tehnicilor utilizate de către psihologi. Soluția propusă se bazează pe o conversație continuă
            de forma întrebare - răspuns, având un set de întrebări care urmăresc evoluția memoriei de scurtă și lungă
            durată, a funcțiilor de orientare spațială și temporală și a celor lingvistice.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
