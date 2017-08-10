<template>
  <div>
    <v-dialog :value="showNoteOptions" persistent content-class="note-option-dialog" scrollable>
      <v-card class="note-options">
        <v-card-title>
          <span class="headline">{{note.text}}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="max-height: calc(80vh - 104px);">
          <v-layout row wrap>
            <v-flex xs12 md6>
              <image-zone v-ripple class="image-zone" :max-width="200" :max-height="100" :image="note.image" @update:image="updateImage"></image-zone>
            </v-flex>
            <v-flex xs12 md6>
              <v-checkbox label="Transparent background" :hide-details="true"></v-checkbox>
              <v-checkbox label="Show label" :hide-details="true"></v-checkbox>
            </v-flex>
          </v-layout>

          <v-divider></v-divider>
          <v-text-field :class="`color-${note.colors[0]}`" name="description" label="Description" textarea></v-text-field>
          <v-divider></v-divider>
          <v-layout row align-center @click="showCalc = !showCalc">
            <v-flex class="subheading">Calculations</v-flex>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon class="icon-toggle" :class="{'rotate': showCalc}">keyboard_arrow_up</v-icon>
            </v-btn>
            </v-flex>
          </v-layout>
          <v-slide-y-transition>
            <div v-if="showCalc" key="calc">
              <v-text-field label="id" v-model="note.calcId" hint="Name used as reference in calculations for this item." required></v-text-field>

              <v-text-field v-for="(val, calcVar) in values" :error-messages="getError(calcVar)" :key="calcVar" :label="calcVar" :value="val" @input="updateCalcVal(calcVar, $event)" :suffix="`= ${getResult(note.calcId, calcVar)}   `" append-icon="delete_forever" :append-icon-cb="removeCalcVar()"></v-text-field>

              <v-layout row>
                <v-flex xs9>
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
          <v-btn class="black--text" flat @click.native="hideDialog">Cancel</v-btn>
          <v-btn class="blue--text darken-1" flat @click.native="hideDialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ImageZone from '@/components/ImageZone';
import * as types from '@/store/mutation-types';
import solve from '@/utils/calc';

const patternVar = /^[a-zA-Z_][a-zA-Z\d_]*$/;

export default {
  data() {
    return {
      showCalc: true,
      results: {},
      values: {},
      newVariable: null,
      rules: {
        variable: value => patternVar.test(value) || 'Invalid name only use a-z, a-Z, 0-9, _',
      },
    };
  },
  computed: {
    note() {
      return this.$store.state.layout.focusedNote;
    },
    showNoteOptions() {
      return this.$store.state.layout.showNoteOptions;
    },
  },
  methods: {
    hideDialog() {
      this.$store.commit(types.LAYOUT_UPDATE, { showNoteOptions: false });
    },
    updateImage(src) {
      this.$store.dispatch('NOTE_UPDATE', {
        note: this.note,
        changes: {
          image: src,
        },
      });
    },
    getResult(calcId, calcVar) {
      if (this.results && this.results[calcId] && this.results[calcId][calcVar]) {
        const res = this.results[calcId][calcVar];
        if (typeof res === 'object') {
          return JSON.stringify(res);
        }
        return res;
      }
      return 'N/A';
    },
    getError(calcVar) {
      return this.results && this.results[`err_${this.note.calcId}.${calcVar}`] ? [this.results[`err_${this.note.calcId}.${calcVar}`]] : [];
    },
    addCalcVar() {
      if (this.newVariable) {
        this.values[this.newVariable] = '';
        this.newVariable = null;
      }
      // TODO: vuex
    },
    updateCalcVal(key, val) {
      this.$set(this.values, key, val);
      this.results = solve([{ calcId: this.note.calcId, values: this.values }]);
    },
    removeCalcVar(name) {
      // TODO: vuex
      delete this.$delete(this.values, name);
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


.note-options .input-group {
  padding: 9px 0;
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
