import 'es6-promise/auto';

import Vue from 'vue';
import Vuex from 'vuex';
import { firebaseMutations, firebaseAction } from 'vuexfire';
import Note from '@/models/Note';
import solve from '@/utils/calc';
import { db } from '@/utils/firebase';
import router from '@/router';
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


const DEFAULT_CANVAS_SETTINGS = {
  listMode: false,
  lastUsedColors: [0],
  colorsVisibility: [1, 1, 1, 1, 1, 1],
  isColorsOpen: false,
};

const DEFAULT_USER_SETTINGS = {
  mini: false,
  drawer: true,
};

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
    settings: DEFAULT_CANVAS_SETTINGS,
    notes: {},
    users: {},
  },
  user: {
    projects: {},
    favorites: {},
    settings: DEFAULT_USER_SETTINGS,
  },
  currentUser: {},
  calcResults: {},
  layout: {
    selectedVP: null,
    selectedCS: null,
    focusedNote: null,
    showVPC: false,
    showNoteOptions: false,
    showNoteOptionsCalc: false,
    showLoading: '',
    currentCanvasUsedColors: new Set(),
  },
};


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
      return Object.keys(state.canvas.notes).map((key) => {
        const n = state.canvas.notes[key];
        n['.key'] = key;
        return n;
      }).filter(note => list.indexOf(note.type) > -1);
    }
    return [];
  },
  notesBMC: (state, getters) => getters.getNotesByTypes(BMC_TYPES),
  notesVPC: (state, getters) => getters.getNotesByTypes(VPC_TYPES),
  notesVPCvp: (state, getters) => getters.getNotesByTypes(VPC_VP_TYPES),
  notesVPCcs: (state, getters) => getters.getNotesByTypes(VPC_CS_TYPES),
  canvasSettings: state => (state.canvas && state.user && state.user.projects[state.canvas['.key']] && state.user.projects[state.canvas['.key']].settings ?
    state.user.projects[state.canvas['.key']].settings : Object.assign({}, DEFAULT_CANVAS_SETTINGS)),
  userSettings: state => state.user.settings || DEFAULT_USER_SETTINGS,
};

const refs = {};

// actions
const actions = {
  NOTE_CREATE({ commit }, payload) {
    refs.notes.push(new Note(payload));
    // commit(types.NOTE_CREATE, payload);
    // TODO: allow create but then we have to cache note updates until really created
  },
  NOTE_MOVE({ commit }, payload) {
    commit(types.NOTE_MOVE, payload);
    if (payload.note['.key']) {
      const note = payload.note;
      delete payload.note;
      refs.notes.child(note['.key']).update(payload);
    }
  },
  NOTE_UPDATE({ state, commit }, payload) {
    commit(types.NOTE_UPDATE, payload);
    if (payload.note['.key']) {
      refs.notes.child(payload.note['.key']).update(payload.changes);
    }
  },
  NOTE_DELETE({ state, commit }, payload) {
    refs.notes.child(payload['.key']).remove();
    commit(types.NOTE_DELETE, payload);
  },
  NOTE_MOVE_TOP({ commit }, payload) {
    // TODO: z-index in firebase?
    commit(types.NOTE_MOVE_TOP, payload);
  },
  NOTE_UPDATE_CALC_VAR({ state, commit }, payload) {
    commit(types.NOTE_UPDATE_CALC_VAR, payload);
    refs.notes.child(payload.note['.key']).child('values').child(payload.key).set(payload.value)
      .then(() => {
        commit(types.SOLVE_CALC);
      });
  },
  canvasInfoUpdate({ commit }, payload) {
    refs.canvas.child('info').update(payload);
    commit(types.CANVAS_UPDATE, payload);
  },
  canvasUserSettingsUpdate({ state, commit }, payload) {
    commit(types.CANVAS_USER_SETTINGS_UPDATE, payload);
    if (refs.user) {
      refs.user.child('projects').child(state.canvas['.key']).child('settings').update(payload);
    }
  },
  userSettingsUpdate({ commit }, payload) {
    commit(types.USER_SETTINGS_UPDATE, payload);
    if (refs.user) {
      refs.user.child('settings').update(payload);
    }
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
  unbindCanvas: firebaseAction(({ unbindFirebaseRef }) => {
    unbindFirebaseRef('canvas');
    refs.notes = null;
    refs.canvas = null;
  }),
  setCanvasRef: firebaseAction(({ state, commit, bindFirebaseRef, unbindFirebaseRef }, { ref }) => {
    // this will unbind any previously bound ref
    refs.canvas = ref;
    refs.notes = ref.child('notes');
    return new Promise((resolve) => {
      bindFirebaseRef('canvas', ref, {
        readyCallback: () => {
          resolve();
          computeCurrentCanvasUsedColors(state);
          // update userpic and name for this canvas
          refs.canvas.child('users').child(state.currentUser.uid).update({
            name: state.currentUser.displayName,
            avatar: state.currentUser.photoURL,
            online: true,
          });
          commit(types.SOLVE_CALC);
          refs.canvas.child('users').child(state.currentUser.uid)
            .onDisconnect().update({
              online: false,
            });
        },
        cancelCallback: (error) => {
          if (error.code === 'PERMISSION_DENIED') {
            router.push({ name: 'home' });
          } else {
            console.log(error);
          }
        },

      });
    });
  }),
  createNewCanvas({ commit, state }) {
    commit(types.LAYOUT_UPDATE, { showLoading: 'Generating new workspace' });
    const newProjectHandler = (snapshot) => {
      commit(types.LAYOUT_UPDATE, { showLoading: '' });
      router.push({ name: 'bmc', params: { id: snapshot.key } });
      db.child('users').child(state.currentUser.uid).child('projects').off('child_added', newProjectHandler);
    };
    db.child('users').child(state.currentUser.uid).child('projects').on('child_added', newProjectHandler);
    db.child('users').child(state.currentUser.uid).child('create_project').set('New Project');
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
  [types.NOTE_MOVE_TOP](state, payload) {
    console.log('TODO: fix z-index', payload);
    /*
    TODO: fix
    const index = state.notes.indexOf(payload);
    if (index > -1) {
      state.notes.splice(index, 1);
      state.notes.push(payload);
    }
    */
  },
  [types.NOTE_UPDATE_CALC_VAR](state, payload) {
    Vue.set(payload.note.values, payload.key, payload.value);
  },
  [types.SOLVE_CALC](state) {
    state.calcResults = solve(Object.values(state.canvas.notes));
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
    if (!state.user.projects[state.canvas['.key']].settings) {
      Vue.set(state.user.projects[state.canvas['.key']], 'settings', DEFAULT_CANVAS_SETTINGS);
    }
    Object.keys(payload).forEach((key) => {
      Vue.set(state.user.projects[state.canvas['.key']].settings, key, payload[key]);
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
};

export default new Vuex.Store({
  state: initialState,
  actions,
  getters: gettersDefinition,
  mutations,
  strict: false,
});
