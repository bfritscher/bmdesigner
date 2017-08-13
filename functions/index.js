'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const DB_ROOT = 'app';

/* EMAIL SENDING */

const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const options = {
  auth: {
    api_key: functions.config().sendgrid.key,
  },
};

const mailer = nodemailer.createTransport(sgTransport(options));

/* FIREBASE DATABASE TRIGGERS */
exports.createProject = functions.database.ref(`/${DB_ROOT}/users/{uid}/create_project`).onWrite((event) => {
  const uid = event.params.uid;
  if (!event.data.val()) {
    return;
  }
  const project = {
    info: {
      name: event.data.val(),
      logoImage: '',
      logoColor: '',
      stickyCount: 0,
      usersCount: 1,
      public: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    notesOrder: [],
    users: {},
    notes: [],
  };

  project.users[uid] = {
    name: event.auth.variable.name,
  };
  const node = admin.database().ref(`/${DB_ROOT}/projects`).push(project);
  admin.database()
    .ref(`/${DB_ROOT}/users/${uid}/projects/${node.key}`)
    .set({
      info: project.info,
      settings: {
        listMode: false,
        lastUsedColors: [0],
        colorsVisibility: [1, 1, 1, 1, 1, 1],
        isColorsOpen: false,
        fav: false,
      },
    }).then(() => event.data.ref.remove());
});

// TRIGER to update copy projects canvas.info to users projects...

exports.inviteToken = functions.database.ref(`/${DB_ROOT}/projects/{uid}/invite_request`).onWrite((event) => {
  const uid = event.params.uid;
  if (!event.data.val()) {
    return;
  }
  // FEATURE: check is valid email?
  // FEATURE: user can add custom message?
  const email = event.data.val();
  const token = admin.database().ref(`/${DB_ROOT}/projects/${uid}/invites_sent`).push(email).key;
  event.data.ref.remove();

  const mailOptions = {
    from: `"${event.auth.variable.name}" <${event.auth.variable.email}>`,
    to: email,
    subject: `${event.auth.variable.name} invited you to his Business Model Canvas`,
    text: `Connect to https://bmdesigner.com/login/${uid}:${token} , to see the shared project.\n\nRegards,\nBM|Designer.com`,
  };
  mailer.sendMail(mailOptions);
});

/* register with token */

const cors = require('cors');

function acceptInvite(req, res) {
  const projectUid = req.body.projectUid;
  const userUid = req.body.userUid;
  const token = req.body.token;

  // check token exists in list
  const projectRef = admin.database().ref(`/${DB_ROOT}/projects/${projectUid}`);
  return projectRef.once('value', (snapshot) => {
    const project = snapshot.val();
    if (project && project.invites_sent && project.invites_sent[token]) {
      // TODO: get user name from userUid in auth? and add to list
      return Promise.all([
        // add user to list
        projectRef.child(`users/${userUid}`).set(true),
        // add list to user
        admin.database().ref(`/${DB_ROOT}/users/${userUid}/projects/${projectUid}/name`).set(project.name)])
        .then(() => {
          projectRef.child(`invites_sent/${token}`).remove();
          res.sendStatus(200);
        });
    }
    return res.sendStatus(404);
  }).catch(() => {
    res.sendStatus(500);
  });
}

exports.acceptInvite = functions.https.onRequest((req, res) =>
  cors()(req, res,
    () => acceptInvite(req, res)));
