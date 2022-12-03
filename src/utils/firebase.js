import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import "firebase/compat/remote-config";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export const DB_ROOT = "app";

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDCs56KPP1um2IKnBougS1eT4PtjZ_Aw5k",
  authDomain: "bmdesigner-50d6c.firebaseapp.com",
  databaseURL: "https://bmdesigner-50d6c.firebaseio.com",
  projectId: "bmdesigner-50d6c",
  storageBucket: "bmdesigner-50d6c.appspot.com",
  messagingSenderId: "89111401593",
  appId: "1:89111401593:web:60effe3a6e5907e5b870a8"
};

const uiConfig = {
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  callbacks: {
    // Called when the user has been successfully signed in.
    // authResult, redirectUrl
    signInSuccessWithAuthResult() {
      // Do not redirect.
      return false;
    }
  },
  signInFlow: "redirect",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Whether the display name should be displayed in Sign Up page.
      requireDisplayName: true
    }
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: "https://bmdesigner.com"
};

const firebaseApp = firebase.initializeApp(config);
const dbSource = firebaseApp.database();
// dbSource.useEmulator("localhost", 9000);
export const db = dbSource.ref(DB_ROOT);
const authSource = firebaseApp.auth();
// authSource.useEmulator("http://localhost:9099");
export const auth = authSource;
export const storage = firebaseApp.storage();
export const remoteConfig = firebase.remoteConfig();
remoteConfig.defaultConfig = {
  search_enabled: false
};
// remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

// Initialize the FirebaseUI Widget using Firebase.
export const ui = new firebaseui.auth.AuthUI(firebase.auth());

export function startLoginUI() {
  ui.start("#firebaseui-auth-container", uiConfig);
}
