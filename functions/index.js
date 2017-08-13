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
exports.updateInfo = functions.database.ref(`/${DB_ROOT}/projects/{uid}/updateInfo`).onWrite((event) => {
  const uid = event.params.uid;
  if (!event.data.val()) {
    return;
  }
  const projectRef = admin.database().ref(`/${DB_ROOT}/projects/${uid}`);
  projectRef.once('value', (snapshot) => {
    const project = snapshot.val();
    project.info.usersCount = Object.keys(project.users || {}).length;
    project.info.stickyCount = Object.keys(project.notes || {}).length;
    project.info.updatedAt = new Date().toISOString();
    Promise.all([admin.database().ref(`/${DB_ROOT}/projects/${uid}/info`).update(project.info),
    ...Object.keys(project.users || {}).map(key => admin.database().ref(`/${DB_ROOT}/users/${key}/projects/${uid}/info`).update(project.info))])
      .then(() => event.data.ref.remove());
  });
});

exports.onRemoveUserFromProject = functions.database.ref(`/${DB_ROOT}/projects/{pid}/users/{uid}`).onDelete((event) => {
  const uid = event.params.uid;
  const pid = event.params.pid;
  admin.database().ref(`/${DB_ROOT}/users/${uid}/projects/${pid}`).remove();
});

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
      return Promise.all([
        // add user to list
        projectRef.child(`users/${userUid}`).set(true),
        // add list to user
        admin.database().ref(`/${DB_ROOT}/users/${userUid}/projects/${projectUid}/info`).set(project.info)])
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

function makeFirebaseCompatible(value) {
  if (typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (typeof value[key] === 'undefined') {
        delete value[key];
        return;
      }
      if (key === '.key') {
        delete value[key];
        return;
      }
      const compatibleKey = makeFirebaseCompatible(key);
      if (compatibleKey !== key) {
        value[compatibleKey] = value[key];
        delete value[key];
      }
      makeFirebaseCompatible(value[compatibleKey]);
    });
    return value;
  }
  if (typeof value === 'string') {
    return value.replace(/\./g, '*');
  }
}

function importJSONProject(req, res) {
  const project = req.body;
  // verify/clean json
  if (project['.key']) {
    project.parent = project['.key'];
  }
  // remove users
  delete project.users;
  // replace createDate
  if (!project.info) {
    project.info = {
      name: 'No Name',
      logoImage: '',
      logoColor: '',
      stickyCount: 0,
      usersCount: 0,
      public: false,
      updatedAt: new Date().toISOString(),
    };
  }
  project.info.createdAt = new Date().toISOString();
  // TODO: validate notes min properties
  // create new project
  const pid = admin.database().ref(`/${DB_ROOT}/projects`).push(makeFirebaseCompatible(project)).key;
  // generate invite token
  const token = admin.database().ref(`/${DB_ROOT}/projects/${pid}/invites_sent`).push('import').key;
  res.send(`https://bmdesigner.com/login/${pid}:${token}`);
}

exports.importJSONProject = functions.https.onRequest((req, res) =>
  cors()(req, res,
    () => importJSONProject(req, res)));
