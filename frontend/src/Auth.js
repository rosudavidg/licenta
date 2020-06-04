import jwt_decode from "jwt-decode";

export function isUserAuthenticated() {
  return localStorage.getItem("token") != null;
}

export function getProfilepic() {
  return jwt_decode(localStorage.getItem("token")).profilepic;
}

export function getFirstName() {
  return jwt_decode(localStorage.getItem("token")).firstName;
}
