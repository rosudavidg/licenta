import React from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faCookie } from "@fortawesome/free-solid-svg-icons";

const FooterFacebook = () => {
  return (
    <a className="f-facebook" href="https://www.facebook.com/rosudavidg">
      <div className="footer-facebook">
        <FontAwesomeIcon icon={faFacebook} />
        <div className="footer-facebook-text">Facebook</div>
      </div>
    </a>
  );
};

const FooterEmail = () => {
  return (
    <a className="f-email" href="mailto:avatario.romania@gmail.com">
      <div className="footer-email">
        <FontAwesomeIcon icon={faEnvelope} />
        <div className="footer-facebook-email">Email</div>
      </div>
    </a>
  );
};

const TermsLink = (props) => {
  return (
    <div className="footer-terms f-terms" onClick={props.redirect}>
      <FontAwesomeIcon icon={faCookie} />
      <div className="footer-facebook-email">Termeni și condiții</div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-contact">
        <FooterFacebook />
        <FooterEmail />
        <TermsLink />
      </div>
      <div className="footer-copyright">&copy; 2020 Avatario</div>
    </div>
  );
};

export default Footer;
