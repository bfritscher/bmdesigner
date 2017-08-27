import 'es6-promise/auto';

import Vue from 'vue';
import Vuex from 'vuex';
import { firebaseMutations, firebaseAction } from 'vuexfire';
import Note from '@/models/Note';
import solve from '@/utils/calc';
import router from '@/router';
import { auth } from '@/utils/firebase';
import * as types from './mutation-types';


Vue.use(Vuex);
// tmp has to be first for type filters using these lists to ignoring it
export const BMC_TYPES = [
  'bmc_tmp', 'vp', 'cs', 'r', 'c', 'dc', 'cr', 'kr', 'ka', 'pn',
];

export const VPC_TYPES = [
  'vpc_tmp', 'features', 'solution', 'pain_gain', 'job',
];

export const VPC_VP_TYPES = [
  'vpc_tmp', 'features', 'solution',
];

export const VPC_CS_TYPES = [
  'vpc_tmp', 'pain_gain', 'job',
];

const DEFAULT_USER_CANVAS_SETTINGS = {
  listMode: false,
  lastUsedColors: [0],
  colorsVisibility: [1, 1, 1, 1, 1, 1],
  isColorsOpen: false,
  fav: false,
  hideColors: false,
  hideAllLabels: false,
};

const DEFAULT_USER_SETTINGS = {
  mini: false,
  drawer: true,
};

const LOCALSTORAGE_USER_HOME = 'user_home_cache';

// initial state
const initialState = {
  canvas: {
    info: { // content copied to users list
      name: '',
      logoImage: '',
      logoColor: '',
      stickyCount: 0,
      usersCount: 0,
      public: false,
      createdAt: '',
      updatedAt: '',
    },
    notesOrder: [], // for z-index
    notesPresentationOrder: [],
    notes: {},
    users: {},
    currentPresentationKey: '',
  },
  currentUser: {},
  calcResults: {},
  layout: { // local state vars for ui not synced
    selectedVP: null,
    selectedCS: null,
    focusedNote: null,
    showVPC: false,
    showNoteOptions: false,
    showNoteOptionsCalc: false,
    showLoading: '',
    currentCanvasUsedColors: new Set(),
    isEditable: false,
    showDrawSurface: false,
    presentation: '',
    showPresentationSorter: false,
  },
};

// try to load local cache
const cache = localStorage.getItem(LOCALSTORAGE_USER_HOME) || JSON.stringify({
  projects: { // by project keys
    /*
    info: {}, // duplicated from canvas
    settings: DEFAULT_USER_CANVAS_SETTINGS,
    */
  },
  settings: DEFAULT_USER_SETTINGS,
});

initialState.user = JSON.parse(cache);

function computeCurrentCanvasUsedColors(state) {
  const usedColors = new Set();
  if (state.canvas.notes) {
    Object.values(state.canvas.notes).reduce((colors, note) => {
      if (note.colors) {
        note.colors.forEach(c => colors.add(c));
      }
      return colors;
    }, usedColors);
  }
  Vue.set(state.layout, 'currentCanvasUsedColors', usedColors);
}

// getters
const gettersDefinition = {
  lastUsedColors: (state, getters) => getters.canvasSettings.lastUsedColors.slice(0),
  getNotesByTypes: state => (filteredTypes) => {
    let list = filteredTypes;
    if (!Array.isArray(list)) {
      list = [list];
    }
    if (state.canvas.notes) {
      if (!state.canvas.notesOrder) {
        Vue.set(state.canvas, 'notesOrder', []);
      }
      const keys = Object.keys(state.canvas.notes);
      return keys.reduce((notes, key) => {
        const note = state.canvas.notes[key];
        note['.key'] = key;
        // filter for only the requested types
        if (list.indexOf(note.type) > -1) {
          // if we know the position add it there, else put it at end
          const pos = state.canvas.notesOrder.indexOf(note['.key']);
          if (pos > -1) {
            notes[pos] = note;
          } else {
            notes.push(note);
          }
        }
        return notes;
      }, new Array(state.canvas.notesOrder.length)).filter(note => note);
    }
    return [];
  },
  notesBMC: (state, getters) => getters.getNotesByTypes(BMC_TYPES),
  notesVPC: (state, getters) => getters.getNotesByTypes(VPC_TYPES),
  notesVPCvp: (state, getters) => getters.getNotesByTypes(VPC_VP_TYPES),
  notesVPCcs: (state, getters) => getters.getNotesByTypes(VPC_CS_TYPES),
  noteById: state => id => Object.values(state.canvas.notes || {}).find(n => n.id === id),
  canvasSettings: state => (state.canvas && state.user && state.user.projects[state.canvas['.key']] && state.user.projects[state.canvas['.key']].settings ?
    state.user.projects[state.canvas['.key']].settings : Object.assign({}, DEFAULT_USER_CANVAS_SETTINGS)),
  userSettings: state => state.user.settings || DEFAULT_USER_SETTINGS,
  calcIds: state => Object.values(state.canvas.notes)
    .filter(n => n.calcId).map(n => n.calcId),
};

const refs = {};

// actions
const actions = {
  NOTE_CREATE({ state, commit }, payload) {
    if (state.layout.isEditable) {
      const note = new Note(payload);
      refs.notes.push(note);
      commit(types.LAYOUT_UPDATE, { focusedNote: note });
    }
    // commit(types.NOTE_CREATE, payload);
    // TODO: allow create but then we have to cache note updates until really created
  },
  NOTE_MOVE({ state, commit }, payload) {
    if (state.layout.isEditable) {
      commit(types.NOTE_MOVE, payload);
      if (payload.note['.key']) {
        const note = payload.note;
        delete payload.note;
        refs.notes.child(note['.key']).update(payload);
      }
    } else {
      commit(types.NOTE_MOVE_LOCAL, payload);
    }
  },
  NOTE_UPDATE({ state, commit }, payload) {
    commit(types.NOTE_UPDATE, payload);
    // TODO fix permission  && state.layout.isEditable
    if (payload.note['.key'] && state.currentUser && state.currentUser.uid in state.canvas.users) {
      refs.notes.child(payload.note['.key']).update(payload.changes);
    }
  },
  NOTE_MOVE_LOCAL({ state, commit }, payload) {
    commit(types.NOTE_MOVE_LOCAL, payload);
  },
  NOTE_DELETE({ state, commit }, payload) {
    // TODO: update notesOrder, notesPresentationOrder
    refs.notes.child(payload['.key']).remove();
    commit(types.NOTE_DELETE, payload);
  },
  NOTE_MOVE_TOP({ commit }, key) {
    commit(types.NOTE_MOVE_TOP, key);
  },
  NOTE_UPDATE_CALC_VAR({ state, commit }, payload) {
    commit(types.NOTE_UPDATE_CALC_VAR, payload);
    if (state.layout.isEditable) {
      refs.notes.child(payload.note['.key']).child('values').child(payload.key).set(payload.value);
    }
  },
  canvasInfoUpdate({ commit }, payload) {
    refs.canvas.child('info').update(payload);
    commit(types.CANVAS_UPDATE, payload);
  },
  canvasUserSettingsUpdate({ state, commit }, payload) {
    commit(types.CANVAS_USER_SETTINGS_UPDATE, payload);
    if (refs.user) {
      const key = payload.canvasKey || state.canvas['.key'];
      refs.user.child('projects').child(key).child('settings').update(payload);
    }
  },
  layoutUpdate({ commit }, payload) {
    commit(types.LAYOUT_UPDATE, payload);
  },
  userSettingsUpdate({ commit }, payload) {
    commit(types.USER_SETTINGS_UPDATE, payload);
    if (refs.user) {
      refs.user.child('settings').update(payload);
    }
  },
  removeUser(context, key) {
    refs.canvas.child('users').child(key).remove();
  },
  removeInvitation(context, key) {
    refs.canvas.child('invites_sent').child(key).remove();
  },
  deleteCanvas({ state }) {
    Object.keys(state.canvas.users).forEach((key) => {
      if (key !== state.currentUser.uid) {
        // eslint-disable-next-line
        store.dispatch('removeUser', key);
      }
    });
    // eslint-disable-next-line
    store.dispatch('removeUser', state.currentUser.uid);
    delete state.user.projects[state.canvas['.key']];
    router.push({ name: 'home' });
  },
  signOut() {
    auth.signOut();
    localStorage.removeItem(LOCALSTORAGE_USER_HOME);
    router.push({ name: 'home' });
  },
  setUserRef: firebaseAction(({ state, bindFirebaseRef, unbindFirebaseRef }, { ref }) => {
    // this will unbind any previously bound ref
    refs.user = ref;
    bindFirebaseRef('user', ref, {
      readyCallback: () => {
        if (!state.user.settings) {
          refs.user.child('settings').set(DEFAULT_USER_SETTINGS);
        }
      },
    });
  }),
  unbindCanvas: firebaseAction(({ state, unbindFirebaseRef }) => {
    if (refs.canvas) {
      // fake immediat feedback
      state.user.projects[state.canvas['.key']].info = state.canvas.info;
      refs.canvas.child('users').child(state.currentUser.uid).update({
        online: false,
      }).then(() => {
        refs.canvas.child('updateInfo').set(true).then(() => {
          unbindFirebaseRef('canvas');
          refs.notes = null;
          refs.canvas = null;
          state.canvas = {
            info: { // content copied to users list
              name: '',
              logoImage: '',
              logoColor: '',
              stickyCount: 0,
              usersCount: 0,
              public: false,
              createdAt: '',
              updatedAt: '',
            },
            notesOrder: [],
            notesPresentationOrder: [],
            notes: {},
            users: {},
            currentPresentationKey: '',
          };
        });
      });
    }
  }),
  setCanvasRef: firebaseAction(({ state, commit, bindFirebaseRef, unbindFirebaseRef }, { ref }) => {
    // this will unbind any previously bound ref
    refs.canvas = ref;
    refs.notes = ref.child('notes');
    return new Promise((resolve) => {
      bindFirebaseRef('canvas', ref, {
        readyCallback: () => {
          if (refs.user && !state.user.projects[state.canvas['.key']].settings) {
            refs.user.child('projects').child(state.canvas['.key']).child('settings').set(DEFAULT_USER_CANVAS_SETTINGS);
          }
          if (!state.canvas.notesOrder || Object.keys(state.canvas.notesOrder || {}).length
            !== Object.keys(state.canvas.notes || {}).length) {
            refs.canvas.child('notesOrder').set(Object.keys(state.canvas.notes || {}));
          }
          if (!state.canvas.notesPresentationOrder
            || Object.keys(state.canvas.notesPresentationOrder || {}).length
            !== Object.keys(state.canvas.notes || {}).length) {
            refs.canvas.child('notesPresentationOrder').set(Object.keys(state.canvas.notes || {}));
          }
          resolve();
          computeCurrentCanvasUsedColors(state);

          if (state.currentUser && state.currentUser.uid
            && state.currentUser.uid in state.canvas.users) {
            commit(types.LAYOUT_UPDATE, { isEditable: true });
            // update userpic and name for this canvas
            refs.canvas.child('users').child(state.currentUser.uid).update({
              name: state.currentUser.displayName,
              avatar: state.currentUser.photoURL,
              online: true,
            });

            refs.canvas.child('users').child(state.currentUser.uid)
              .onDisconnect().update({
                online: false,
              });
          }
        },
        cancelCallback: (error) => {
          if (error.code === 'PERMISSION_DENIED') {
            router.push({ name: 'home' });
          }
        },

      });
    });
  }),
  createNewCanvas({ commit }) {
    commit(types.LAYOUT_UPDATE, { showLoading: 'Generating new workspace...' });
    let valHasBeenSent = false;
    const newProjectHandler = (snapshot) => {
      if (valHasBeenSent) {
        commit(types.LAYOUT_UPDATE, { showLoading: '' });
        router.push({ name: 'bmc', params: { id: snapshot.key } });
        refs.user.child('projects').off('child_added', newProjectHandler);
      }
    };
    refs.user.child('projects').on('child_added', newProjectHandler);
    refs.user.child('create_project').set('New Project').then(() => {
      valHasBeenSent = true;
    });
  },
  duplicateCanvas({ commit, state }) {
    commit(types.LAYOUT_UPDATE, { showLoading: 'Copying content...' });
    const canvas = Object.assign({}, state.canvas);
    canvas.info = Object.assign({}, state.canvas.info);
    canvas.info.name += ' copy';
    canvas.source = 'bmdesigner';
    fetch(' https://us-central1-bmdesigner-50d6c.cloudfunctions.net/importJSONProject', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(canvas),
    })
    .then(res => res.text()).then((url) => {
      window.location = url;
    });
  },
  updateCurrentPresentationKey({ commit, state }, value) {
    commit(types.PRESENTATION_KEY, value);
    if (state.currentUser && state.currentUser.uid in state.canvas.users) {
      refs.canvas.child('currentPresentationKey').set(value);
    }
  },
  setNotesPresentationOrder({ commit, state }, value) {
    // TODO: commit
    if (state.layout.isEditable) {
      refs.canvas.child('notesPresentationOrder').set(value);
    }
  },
  presentationStart({ commit, state }) {
    // hide all
    Object.values(state.canvas.notes || {}).forEach((note) => {
      // eslint-disable-next-line
      store.dispatch('NOTE_UPDATE', { note, changes: { hidden: true } });
    });
    commit(types.LAYOUT_UPDATE, { presentation: 'single', isEditable: false, showVPC: false });
    // eslint-disable-next-line
    store.dispatch('updateCurrentPresentationKey', '');
  },
  presentationExit({ commit, state }) {
    commit(types.LAYOUT_UPDATE, { presentation: '', showDrawSurface: false, isEditable: state.currentUser && state.currentUser.uid in state.canvas.users });
  },
  presentationNext({ state }) {
    const currentIndex = state.canvas.notesPresentationOrder
    .indexOf(state.canvas.currentPresentationKey);
    if (currentIndex === state.canvas.notesPresentationOrder.length - 1) {
      // eslint-disable-next-line
      store.dispatch('presentationExit');
    } else {
      let key = state.canvas.notesPresentationOrder[currentIndex + 1];
      if (currentIndex === -1) {
        key = state.canvas.notesPresentationOrder[0];
      }
      // eslint-disable-next-line
      store.dispatch('NOTE_UPDATE', { note: state.canvas.notes[key], changes: { hidden: false }});
      // eslint-disable-next-line
      store.dispatch('updateCurrentPresentationKey', key);
      // eslint-disable-next-line
      store.dispatch('zoomNoteKey', key);
    }
  },
  presentationPrevious({ state, commit }) {
    const currentIndex = state.canvas.notesPresentationOrder
    .indexOf(state.canvas.currentPresentationKey);
    if (currentIndex === -1) {
      // eslint-disable-next-line
      store.dispatch('presentationExit');
    } else if (currentIndex === 0) {
      const key = state.canvas.notesPresentationOrder[0];
      // eslint-disable-next-line
      store.dispatch('NOTE_UPDATE', { note: state.canvas.notes[key], changes: { hidden: true }});
      // eslint-disable-next-line
      store.dispatch('updateCurrentPresentationKey', '');
    } else {
      const key = state.canvas.notesPresentationOrder[currentIndex - 1];
      // eslint-disable-next-line
      store.dispatch('NOTE_UPDATE', { note: state.canvas.notes[state.canvas.currentPresentationKey], changes: { hidden: true }});
      // eslint-disable-next-line
      store.dispatch('updateCurrentPresentationKey', key);
      // eslint-disable-next-line
      store.dispatch('zoomNoteKey', key).then((zoomed) => {
        if (!zoomed) {
          commit(types.LAYOUT_UPDATE, { showVPC: false, selectedVP: null, selectedCS: null });
        }
      });
    }
  },
  zoomNoteKey({ commit, state }, key) {
    const note = state.canvas.notes[key];
    if (!note) {
      return false;
    }
    // eslint-disable-next-line
    const parentNote = store.getters.noteById(note.parent);
    if (parentNote) {
      if (parentNote.type === 'vp') {
        commit(types.LAYOUT_UPDATE, { selectedVP: parentNote, showVPC: true });
      }
      if (parentNote.type === 'cs') {
        commit(types.LAYOUT_UPDATE, { selectedCS: parentNote, showVPC: true });
      }
      return true;
    }
    return false;
  },
};

// mutations
/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  ...firebaseMutations,
  [types.NOTE_CREATE](state, payload) {
    const note = new Note(payload);
    state.canvas.notes[note.id] = note;
  },
  [types.NOTE_MOVE](state, payload) {
    ['left', 'top', 'listLeft', 'listTop', 'type', 'angle', 'height'].forEach((key) => {
      if (key in payload) {
        payload.note[key] = payload[key];
      }
    });
  },
  [types.NOTE_MOVE_LOCAL](state, payload) {
    ['left', 'top', 'listLeft', 'listTop', 'type', 'angle', 'height'].forEach((key) => {
      if (key in payload) {
        payload.note[key] = payload[key];
      }
    });
  },
  [types.NOTE_UPDATE](state, payload) {
    Object.keys(payload.changes).forEach((key) => {
      Vue.set(payload.note, key, payload.changes[key]);
    });
    if (payload.changes.colors) {
      computeCurrentCanvasUsedColors(state);
    }
  },
  [types.NOTE_DELETE](state, payload) {
    delete state.canvas.notes[payload.id];
    delete state.canvas.notes[payload['.id']];
  },
  [types.NOTE_MOVE_TOP](state, key) {
    const index = state.canvas.notesOrder.indexOf(key);
    if (index > -1) {
      state.canvas.notesOrder.splice(index, 1);
    }
    state.canvas.notesOrder.push(key);
    if (state.layout.isEditable) {
      refs.canvas.child('notesOrder').set(state.canvas.notesOrder);
    }
  },
  [types.NOTE_UPDATE_CALC_VAR](state, payload) {
    Vue.set(payload.note.values, payload.key, payload.value);
  },
  [types.SOLVE_CALC](state) {
    if (state.canvas.notes) {
      Vue.set(state, 'calcResults', solve(Object.values(state.canvas.notes)));
    }
  },
  [types.LAYOUT_UPDATE](state, payload) {
    Object.keys(payload).forEach((key) => {
      Vue.set(state.layout, key, payload[key]);
    });
  },
  [types.CANVAS_UPDATE](state, payload) {
    Object.keys(payload).forEach((key) => {
      Vue.set(state.canvas.info, key, payload[key]);
    });
  },
  [types.CURRENT_USER](state, payload) {
    state.currentUser = payload;
  },
  [types.CANVAS_USER_SETTINGS_UPDATE](state, payload) {
    if (!state.canvas) {
      return;
    }
    const canvasKey = payload.canvasKey || state.canvas['.key'];
    if (!state.user.projects[canvasKey]) {
      Vue.set(state.user.projects, canvasKey, {});
    }
    if (!state.user.projects[canvasKey].settings) {
      Vue.set(state.user.projects[canvasKey], 'settings', DEFAULT_USER_CANVAS_SETTINGS);
    }
    Object.keys(payload).forEach((key) => {
      Vue.set(state.user.projects[canvasKey].settings, key, payload[key]);
    });
  },
  [types.USER_SETTINGS_UPDATE](state, payload) {
    if (!state.user.settings) {
      Vue.set(state.user, 'settings', DEFAULT_USER_SETTINGS);
    }
    Object.keys(payload).forEach((key) => {
      Vue.set(state.user.settings, key, payload[key]);
    });
  },
  [types.PRESENTATION_KEY](state, value) {
    Vue.set(state.canvas, 'currentPresentationKey', value);
  },
};

const store = new Vuex.Store({
  state: initialState,
  actions,
  getters: gettersDefinition,
  mutations,
  strict: false,
});

store.watch((state) => {
  if (state.canvas && state.canvas.notes) {
    const values = Object.values(state.canvas.notes).map(n => JSON.stringify(n.values)).join();
    return values;
  }
  return '';
}, () => {
  store.commit(types.SOLVE_CALC);
});

store.watch(state => JSON.stringify(state.user), (data) => {
  localStorage.setItem(LOCALSTORAGE_USER_HOME, data);
});

export default store;
