import Vue from 'vue';
import firebase from 'firebase';
import firebaseui from 'firebaseui';
import VueFire from 'vuefire';
import 'firebaseui/dist/firebaseui.css';

Vue.use(VueFire);

export const DB_ROOT = 'shop-app';

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
    'signInSuccess': function (user, credential, redirectUrl) {
      // Do not redirect.
      return false;
    }
  },
  signInFlow: 'popup',
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
  tosUrl: 'https://ptw.fritscher.ch'
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

export const messaging = firebase.messaging();

// TODO: could be more customizable to enable/disable
// https://github.com/firebase/functions-samples/blob/master/fcm-notifications/public/main.js
function sendTokenToServer(token) {
  if (auth.currentUser && auth.currentUser.uid) {
    db.child('users').child(auth.currentUser.uid).child('tokens').child(token).set(true);
  }
}

navigator.serviceWorker.register('static/firebase-messaging-sw.js')
  .then((registration) => {
    messaging.useServiceWorker(registration);
    messaging.requestPermission()
      .then(() => {
        // Notification permission granted.
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        auth.onAuthStateChanged(user => {
          if (!user) {
            return;
          }
          messaging.getToken()
            .then(function (currentToken) {
              if (currentToken) {
                sendTokenToServer(currentToken);
                // console.log('currentToken', currentToken);
              } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
              }
            })
            .catch(function (err) {
              console.log('An error occurred while retrieving token. ', err);
            });

          // Callback fired if Instance ID token is updated.
          messaging.onTokenRefresh(function () {
            messaging.getToken()
              .then(function (refreshedToken) {
                // Send Instance ID token to app server.
                sendTokenToServer(refreshedToken);
              })
              .catch(function (err) {
                console.log('Unable to retrieve refreshed token ', err);
              });
          });
        });
        /* sample getting message when app in front
        messaging.onMessage(function (payload) {
            console.log('Message received. ', payload);
            // ...
        });
        */
      })
      .catch(err => {
        console.log('Unable to get permission to notify.', err);
      });
  });
