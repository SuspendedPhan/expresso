// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import FirebaseConfig from "./FirebaseConfig";
import { log5 } from "src/utils/utils/Log5";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
// export default initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const log55 = log5("Firebase.ts");

export default class Firebase {
  static init() {
    log55.debug("Initializing Firebase");
    firebase.initializeApp(FirebaseConfig);
  }
}
