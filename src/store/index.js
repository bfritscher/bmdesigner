import Vue from 'vue';
import Vuex from 'vuex';
import Note from '@/models/Note';
import * as types from './mutation-types';


export const BMC_TYPES = [
  'vp', 'cs', 'r', 'c', 'dc', 'cr', 'kr', 'ka', 'pn', 'bmc_tmp',
];

export const VPC_TYPES = [
  'features', 'solution', 'pain_gain', 'job', 'vpc_tmp',
];


Vue.use(Vuex);

// initial state
const initialState = {
  notes: [],
};

// getters
const gettersDefinition = {
  getNotesByTypes: state => (filteredTypes) => {
    let list = filteredTypes;
    if (!Array.isArray(list)) {
      list = [list];
    }
    return state.notes.filter(note => list.indexOf(note.type) > -1);
  },
  notesBMC: (state, getters) => getters.getNotesByTypes(BMC_TYPES),
  notesVPC: (state, getters) => getters.getNotesByTypes(VPC_TYPES),
};

// actions
const actions = {
  NOTE_CREATE({ commit }, payload) {
    commit(types.NOTE_CREATE, payload);
  },
  NOTE_MOVE({ commit }, payload) {
    commit(types.NOTE_MOVE, payload);
  },
  NOTE_UPDATE({ commit }, payload) {
    commit(types.NOTE_UPDATE, payload);
  },
  NOTE_DELETE({ commit }, payload) {
    commit(types.NOTE_DELETE, payload);
  },
};

// mutations
/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  [types.NOTE_CREATE](state, payload) {
    state.notes.push(new Note(payload));
  },
  [types.NOTE_MOVE](state, payload) {
    payload.note.left = payload.left;
    payload.note.top = payload.top;
  },
  [types.NOTE_UPDATE](state, payload) {
    Object.keys(payload.changes).forEach((key) => {
      payload.note[key] = payload.changes[key];
    });
  },
  [types.NOTE_DELETE](state, payload) {
    const index = state.notes.indexOf(payload);
    if (index > -1) {
      state.notes.splice(index, 1);
    }
  },
};

export default new Vuex.Store({
  state: initialState,
  actions,
  getters: gettersDefinition,
  mutations,
  strict: true,
});
