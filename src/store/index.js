import 'es6-promise/auto';

import Vue from 'vue';
import Vuex from 'vuex';
import Note from '@/models/Note';
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

// initial state
const initialState = {
  notes: [],
  layout: {
    selectedVP: null,
    selectedCS: null,
    focusedNote: null,
    showVPC: false,
  },
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
  notesVPCvp: (state, getters) => getters.getNotesByTypes(VPC_VP_TYPES),
  notesVPCcs: (state, getters) => getters.getNotesByTypes(VPC_CS_TYPES),
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
    commit(types.LAYOUT_UPDATE, { focusedNote: null });
  },
  NOTE_MOVE_TOP({ commit }, payload) {
    commit(types.NOTE_MOVE_TOP, payload);
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
      Vue.set(payload.note, key, payload.changes[key]);
    });
  },
  [types.NOTE_DELETE](state, payload) {
    const index = state.notes.indexOf(payload);
    if (index > -1) {
      state.notes.splice(index, 1);
    }
  },
  [types.NOTE_MOVE_TOP](state, payload) {
    const index = state.notes.indexOf(payload);
    if (index > -1) {
      state.notes.splice(index, 1);
      state.notes.push(payload);
    }
  },
  [types.LAYOUT_UPDATE](state, payload) {
    Object.keys(payload).forEach((key) => {
      Vue.set(state.layout, key, payload[key]);
    });
  },
};

export default new Vuex.Store({
  state: initialState,
  actions,
  getters: gettersDefinition,
  mutations,
  strict: true,
});
