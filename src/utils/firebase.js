import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

export const DB_ROOT = 'app';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyDCs56KPP1um2IKnBougS1eT4PtjZ_Aw5k',
  authDomain: 'bmdesigner-50d6c.firebaseapp.com',
  databaseURL: 'https://bmdesigner-50d6c.firebaseio.com',
  projectId: 'bmdesigner-50d6c',
  storageBucket: 'bmdesigner-50d6c.appspot.com',
  messagingSenderId: '89111401593',
};

const uiConfig = {
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  callbacks: {
    // Called when the user has been successfully signed in.
    // authResult, redirectUrl
    signInSuccessWithAuthResult() {
      // Do not redirect.
      return false;
    },
  },
  signInFlow: 'redirect',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Whether the display name should be displayed in Sign Up page.
      requireDisplayName: true,
    },
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: 'https://bmdesigner.com',
};

const firebaseApp = firebase.initializeApp(config);
export const db = firebaseApp.database().ref(DB_ROOT);
export const auth = firebaseApp.auth();
export const storage = firebaseApp.storage();
// Initialize the FirebaseUI Widget using Firebase.
export const ui = new firebaseui.auth.AuthUI(firebase.auth());

export function startLoginUI() {
  ui.start('#firebaseui-auth-container', uiConfig);
}
