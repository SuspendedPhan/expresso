import firebase from "firebase/compat/app";
import { auth } from "firebaseui";
import { Subject } from "rxjs";
import { OBS } from "../utils/Utils";

export class FirebaseAuthentication {
  private static readonly userLoggedIn$_ = new Subject<void>();
  public static readonly userLoggedIn$: OBS<void> = this.userLoggedIn$_;

  static init() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.userLoggedIn$_.complete();
      } else {
        this.startAuthUI();
      }
    });
  }

  static startAuthUI() {
    const ui = new auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", {
      callbacks: {
        signInSuccessWithAuthResult: function (_authResult, _redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return false;
        },
      },
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      // Other config options...
    });
  }
}
