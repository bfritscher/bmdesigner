"use strict";

const Typesense = require("typesense");

const useEmulator = true;

if (useEmulator) {
  process.env["FIREBASE_DATABASE_EMULATOR_HOST"] = "localhost:9000";
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const DB_ROOT = "app";

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: functions.config().typesense.host,
      port: functions.config().typesense.port,
      protocol: functions.config().typesense.protocol
    }
  ],
  apiKey: functions.config().typesense.key,
  connectionTimeoutSeconds: 2
  // retryIntervalSeconds: 120,
});

/* EMAIL SENDING */

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(functions.config().sendgrid.key);

function UserProjectSettings() {
  return {
    listMode: false,
    lastUsedColors: [0],
    colorsVisibility: [1, 1, 1, 1, 1, 1],
    isColorsOpen: false,
    fav: false
  };
}

/* FIREBASE DATABASE TRIGGERS */
exports.createProject = functions.database
  .ref(`/${DB_ROOT}/users/{uid}/create_project`)
  .onWrite((change, context) => {
    const uid = context.params.uid;
    if (!change.after.val()) {
      return "no value";
    }
    const project = {
      info: {
        name: change.after.val(),
        logoImage: "",
        logoColor: "",
        stickyCount: 0,
        usersCount: 1,
        public: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      notesOrder: [],
      users: {},
      notes: []
    };
    project.users[uid] = {
      name: context.auth.token.name || context.auth.token.email || "anonymous"
    };
    const node = admin.database().ref(`/${DB_ROOT}/projects`).push(project);
    return admin
      .database()
      .ref(`/${DB_ROOT}/users/${uid}/projects/${node.key}`)
      .set({
        info: project.info,
        settings: UserProjectSettings()
      })
      .then(() => {
        change.after.ref.remove();
        return "ok";
      });
  });

// TRIGER to update copy projects canvas.info to users projects...
exports.updateInfo = functions.database
  .ref(`/${DB_ROOT}/projects/{pid}/updateInfo`)
  .onWrite((change, context) => {
    const pid = context.params.pid;
    if (!change.after.val()) {
      return "no value";
    }
    const projectRef = admin.database().ref(`/${DB_ROOT}/projects/${pid}`);
    return projectRef.once("value", snapshot => {
      const project = snapshot.val();
      project.info.usersCount = Object.keys(project.users || {}).length;
      project.info.stickyCount = Object.keys(project.notes || {}).length;
      project.info.updatedAt = new Date().toISOString();

      // update search index
      // TODO: do it live foreach note?
      const documents = Object.keys(project.notes || {}).map(key => {
        const note = project.notes[key];
        return {
          objectID: `${pid}.${key}`,
          type: note.type,
          text: note.text,
          description: note.description,
          colors: note.colors.map(color => String(color)),
          values: Object.keys(note.values || {}),
          projectTitle: project.info.name,
          canvasKey: pid,
          users: Object.keys(project.users || {}),
          public: project.info.public,
          updatedAt: project.info.updatedAt // TODO index as timestamp?
        };
      });
      const collectionName = functions.config().typesense.collection;

      typesenseClient
        .collections(collectionName)
        .documents()
        .delete({ filter_by: `canvasKey:=${pid}` })
        .then(() => {
          typesenseClient
            .collections(collectionName)
            .documents()
            .import(documents, { action: "upsert" });
        });
      return Promise.all([
        admin
          .database()
          .ref(`/${DB_ROOT}/projects/${pid}/info`)
          .update(project.info),
        ...Object.keys(project.users || {}).map(key =>
          admin
            .database()
            .ref(`/${DB_ROOT}/users/${key}/projects/${pid}/info`)
            .update(project.info)
        )
      ]).then(() => change.after.ref.remove());
    });
  });

exports.onRemoveUserFromProject = functions.database
  .ref(`/${DB_ROOT}/projects/{pid}/users/{uid}`)
  .onDelete((snap, context) => {
    const uid = context.params.uid;
    const pid = context.params.pid;
    admin.database().ref(`/${DB_ROOT}/users/${uid}/projects/${pid}`).remove();
    const projectRef = admin.database().ref(`/${DB_ROOT}/projects/${pid}`);
    return projectRef.once("value", snapshot => {
      const project = snapshot.val();
      const usersCount = Object.keys(project.users || {}).length;
      // TODO: update index;
      if (usersCount === 0) {
        projectRef.remove();
      }
    });
  });

exports.inviteToken = functions.database
  .ref(`/${DB_ROOT}/projects/{pid}/invite_request`)
  .onWrite((change, context) => {
    const pid = context.params.pid;
    const email = change.after.val();
    if (!email) {
      return "no email";
    }
    // FEATURE: check is valid email?
    // FEATURE: user can add custom message?
    const token = admin
      .database()
      .ref(`/${DB_ROOT}/projects/${pid}/invites_sent`)
      .push(email).key;
    change.after.ref.remove();

    const msg = {
      from: `"${context.auth.token.name}" <${context.auth.token.email}>`,
      to: email,
      subject: `${context.auth.token.name} invited you to his Business Model Canvas`,
      text: `Connect to https://bmdesigner.com/login/${pid}:${token} , to see the shared project.\n\nRegards,\nBM|Designer.com`
    };
    return sgMail.send(msg);
  });

// create search key filtered by user's permissions
exports.addSearchKey = functions.database
  .ref(`/${DB_ROOT}/users/{uid}/settings/search_key`)
  .onWrite(event => {
    // TODO only if keyword
    const uid = event.params.uid;
    const securedApiKey = typesenseClient.keys().generateScopedSearchKey(
      functions.config().typesense.search_key, // Make sure to use a search key,
      {
        filter_by: `users:${uid} OR public:true`
      }
    );
    admin
      .database()
      .ref(`/${DB_ROOT}/users/${uid}/settings/search_key`)
      .set(securedApiKey);
  });

/* register with token */

const cors = require("cors");

function acceptInvite(req, res) {
  const projectUid = req.body.projectUid;
  const userUid = req.body.userUid;
  const token = req.body.token;

  // check token exists in list
  const projectRef = admin.database().ref(`/${DB_ROOT}/projects/${projectUid}`);
  return projectRef
    .once("value", snapshot => {
      const project = snapshot.val();
      if (project && project.invites_sent && project.invites_sent[token]) {
        return Promise.all([
          // add user to list
          projectRef.child(`users/${userUid}`).set(true),
          // add list to user
          admin
            .database()
            .ref(`/${DB_ROOT}/users/${userUid}/projects/${projectUid}`)
            .set({
              info: project.info,
              settings: UserProjectSettings()
            })
        ]).then(() => {
          projectRef.child(`invites_sent/${token}`).remove();
          res.sendStatus(200);
        });
      }
      return res.sendStatus(404);
    })
    .catch(() => {
      res.sendStatus(500);
    });
}

exports.acceptInvite = functions.https.onRequest((req, res) =>
  cors()(req, res, () => acceptInvite(req, res))
);

function makeFirebaseCompatible(value) {
  if (typeof value === "object") {
    Object.keys(value).forEach(key => {
      if (typeof value[key] === "undefined" || value[key] === null) {
        delete value[key];
        return;
      }
      if (key === ".key") {
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
  if (typeof value === "string") {
    return value.replace(/\./g, "*");
  }
  return value;
}

const { v4: uuidv4 } = require("uuid");

function Note(args) {
  const note = {
    id: uuidv4(),
    left: 0,
    top: 0,
    listLeft: 0,
    listTop: 0,
    angle: 0,
    height: 5,
    colors: [0],
    showLabel: true,
    showAsSticky: true
  };
  return Object.assign(note, args);
}

function importJSONProject(req, res) {
  const project = req.body;
  // verify/clean json
  if (project[".key"]) {
    project.parent = project[".key"];
  }
  // remove users
  delete project.users;
  // replace createDate
  const info = {
    name: "No Name",
    logoImage: "",
    logoColor: "",
    stickyCount: 0,
    usersCount: 0,
    public: false,
    updatedAt: new Date().toISOString()
  };
  Object.assign(info, project.info || {});
  project.info = info;
  project.info.createdAt = new Date().toISOString();

  if (project.notes) {
    if (Array.isArray(project.notes)) {
      project.notes = project.notes.map(n => Note(n));
    } else {
      Object.keys(project.notes).forEach(k => {
        project.notes[k] = Note(project.notes[k]);
      });
    }
  }

  // create new project
  const pid = admin
    .database()
    .ref(`/${DB_ROOT}/projects`)
    .push(makeFirebaseCompatible(project)).key;
  // generate invite token
  const token = admin
    .database()
    .ref(`/${DB_ROOT}/projects/${pid}/invites_sent`)
    .push("import").key;
  res.send(`https://bmdesigner.com/login/${pid}:${token}`);
}

exports.importJSONProject = functions.https.onRequest((req, res) =>
  cors()(req, res, () => importJSONProject(req, res))
);
