// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import FirebaseConfig from "./FirebaseConfig";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Initialize Firebase
// export default initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default class Firebase {
  static init() {
    return initializeApp(FirebaseConfig);
  }
}