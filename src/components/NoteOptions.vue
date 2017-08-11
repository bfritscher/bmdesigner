<template>
  <div>
    <v-dialog :value="showNoteOptions" @input="hideDialog" content-class="note-option-dialog" scrollable>
      <v-card class="note-options">
        <v-card-title :class="COLORS_MATERIAL_DARK[note.colors[0]]">
          <span class="headline">{{note.text}}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="max-height: calc(80vh - 104px);">
          <v-layout row wrap>
            <v-flex xs12 md6>
              <image-zone v-ripple class="image-zone" :max-width="200" :max-height="100" :image="note.image" @update:image="updateNote('image', $event)"></image-zone>
            </v-flex>
            <v-flex xs12 md6>
              <v-checkbox label="Show as sticky note" :hide-details="true" :input-value="note.showAsSticky" @click.native.stop.prevent="updateNote('showAsSticky', !note.showAsSticky)"></v-checkbox>
              <v-checkbox label="Show label" :hide-details="true" :disabled="!note.image" :input-value="note.showLabel" @click.native.stop.prevent="note.image ? updateNote('showLabel', !note.showLabel): ''"></v-checkbox>
            </v-flex>
          </v-layout>

          <v-divider></v-divider>c
          <v-text-field :class="`color-${note.colors[0]}`" name="description" label="Description" :value="note.description" @input="updateNote('description', $event)" textarea></v-text-field>
          <v-divider></v-divider>
          <v-layout row align-center @click="showCalc = !showCalc">
            <v-flex class="subheading">Calculations
              <span class="red--text" style="vertical-align: super;">beta</span>
            </v-flex>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon class="icon-toggle" :class="{'rotate': showCalc}">keyboard_arrow_up</v-icon>
            </v-btn>
            </v-flex>
          </v-layout>
          <v-slide-y-transition>
            <div v-if="showCalc" key="calc">
              <v-alert error :value="results.err">{{results.err}}</v-alert>
              <v-layout row align-center>
                <v-flex xs1>
                  <v-icon>vpn_key</v-icon>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="id" :value="note.calcId" @input="updateNote('calcId', $event)" hint="Name used as reference in calculations for this item." required :rules="[rules.variable,]"></v-text-field>
                </v-flex>
              </v-layout>


              <v-layout row align-center v-for="(val, calcVar) in note.values" :key="calcVar">
                <v-flex xs1>
                  <v-menu bottom right>
                    <v-btn icon slot="activator">
                      <v-icon :class="`calcDisplayColor${whichCalcDisplay(calcVar)}`">{{whichCalcDisplay(calcVar) ? 'label' : 'label_outline'}}</v-icon>
                    </v-btn>
                    <v-list>
                      <v-list-tile>
                        <v-list-tile-title>
                          <v-icon :class="`calcDisplayColor${whichCalcDisplay(calcVar)}`">{{whichCalcDisplay(calcVar) ? 'label' : 'label_outline'}}</v-icon>
                        </v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile v-show="note[`calcDisplay${c}`] !== calcVar" v-for="c in ['B', 'R', 'G']" :key="c"  @click.native.prevent="updateCalcDisplay(calcVar, c)">
                        <v-list-tile-title>
                          <v-icon :class="`calcDisplayColor${c}`">label</v-icon>
                        </v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile v-if="whichCalcDisplay(calcVar)"  @click.native.prevent="updateCalcDisplay(calcVar, null)">
                        <v-list-tile-title>
                          <v-icon>label_outline</v-icon>
                        </v-list-tile-title>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                </v-flex>
                <v-flex xs11>
                  <v-text-field hint="Any calculation example cs1.size * tickets.price" :label="calcVar" :value="val" @input="updateCalcVal(calcVar, $event)" :error-messages="getError(calcVar)" :suffix="`= ${getResult(note.calcId, calcVar)}   `" append-icon="delete_forever" :append-icon-cb="() => removeCalcVar(calcVar)"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row align-center>
                <v-flex xs1>
                  <v-icon>bookmark</v-icon>
                </v-flex>
                <v-flex xs8>
                  <v-text-field label="New variable" value="hello" @keypress.enter="addCalcVar" v-model="newVariable" hint="Add a new variable name only use a-z, a-Z, 0-9, _" :rules="[rules.variable,]"></v-text-field>
                </v-flex>
                <v-flex xs3>
                  <v-btn primary block flat @click.native="addCalcVar">add</v-btn>
                </v-flex>
              </v-layout>
            </div>
          </v-slide-y-transition>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" flat @click.native="hideDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import humanFormat from 'human-format';

import ImageZone from '@/components/ImageZone';
import * as types from '@/store/mutation-types';
import Note from '@/models/Note';
import { COLORS_MATERIAL_DARK } from '@/utils';

const patternVar = /^[a-zA-Z_][a-zA-Z\d_]*$/;

export default {
  data() {
    return {
      showCalc: false,
      newVariable: null,
      rules: {
        variable: value => patternVar.test(value) || 'Invalid name only use a-z, a-Z, 0-9, _',
      },
      COLORS_MATERIAL_DARK,
    };
  },
  computed: {
    note() {
      return this.$store.state.layout.focusedNote || new Note();
    },
    showNoteOptions() {
      return this.$store.state.layout.showNoteOptions;
    },
    results() {
      return this.$store.state.calcResults;
    },
  },
  methods: {
    whichCalcDisplay(calcVar) {
      return ['B', 'R', 'G'].find(c => this.note[`calcDisplay${c}`] === calcVar);
    },
    hideDialog() {
      this.$store.commit(types.LAYOUT_UPDATE, { showNoteOptions: false });
    },
    updateNote(field, data) {
      this.$store.dispatch('NOTE_UPDATE', {
        note: this.note,
        changes: {
          [field]: data,
        },
      });
    },
    updateCalcDisplay(calVar, c) {
      const current = this.whichCalcDisplay(calVar);
      const changes = {};
      if (c) {
        changes[`calcDisplay${c}`] = calVar;
      }
      if (current) {
        changes[`calcDisplay${current}`] = null;
      }
      this.$store.dispatch('NOTE_UPDATE', {
        note: this.note,
        changes,
      });
    },
    getResult(calcId, calcVar) {
      if (this.results && this.results[calcId] && this.results[calcId][calcVar]) {
        const res = this.results[calcId][calcVar];
        if (typeof res === 'object') {
          try {
            return JSON.stringify(res);
          } catch (e) {
            return res;
          }
        }
        if (!isNaN(res)) {
          return humanFormat(res);
        }
        return res;
      }
      return 'N/A';
    },
    getError(calcVar) {
      return this.results && this.results[`err_${this.note.calcId}.${calcVar}`] ? [this.results[`err_${this.note.calcId}.${calcVar}`]] : [];
    },
    addCalcVar() {
      // TODO should only send new var...
      if (this.newVariable) {
        const copy = Object.assign({}, this.note.values);
        copy[this.newVariable] = '';
        this.updateNote('values', copy);
        this.newVariable = null;
      }
    },
    removeCalcVar(name) {
      const copy = Object.assign({}, this.note.values);
      delete copy[name];
      this.updateNote('values', copy);
    },
    updateCalcVal(key, value) {
      this.$store.dispatch('NOTE_UPDATE_CALC_VAR', {
        note: this.note,
        key,
        value,
      });
    },
  },
  components: {
    ImageZone,
  },
};
</script>

<style>
.note-options .image-zone {
  height: 100px;
  margin: 0 0 18px 0;
}

.note-options .headline {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.note-options .color-0 textarea {
  background-color: #ffecb3;
}

.note-options .color-1 textarea {
  background-color: #c8e6c9;
}

.note-options .color-2 textarea {
  background-color: #bbdefb;
}

.note-options .color-3 textarea {
  background-color: #e1bee7;
}

.note-options .color-4 textarea {
  background-color: #ffccbc;
}

.note-options .color-5 textarea {
  background-color: #f5f5f5;
}

.note-options .icon-toggle {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.note-options .icon-toggle.rotate {
  transform: rotateZ(-180deg);
}

.input-group.checkbox {
  padding: 9px 0;
}

.btn--icon .icon.calcDisplayColorR,
.icon.calcDisplayColorR {
  color: #D32F2F !important;
}

.btn--icon .icon.calcDisplayColorG,
.icon.calcDisplayColorG {
  color: #558B2F !important;
}

.btn--icon .icon.calcDisplayColorB,
.icon.calcDisplayColorB {
  color: #2196F3 !important;
}

@media (min-width: 600px) {
  .note-option-dialog {
    width: 60% !important;
  }
}

@media (min-width: 1024px) {
  .note-option-dialog {
    width: 40% !important;
  }
}
</style>