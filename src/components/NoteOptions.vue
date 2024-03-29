<template>
  <div>
    <v-dialog
      :value="showNoteOptions"
      @input="hideDialog"
      content-class="note-option-dialog"
      scrollable
    >
      <v-card class="note-options">
        <v-card-title :class="COLORS_MATERIAL_DARK[note.colors[0]]">
          <span class="headline">{{ note.text }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="max-height: calc(80vh - 104px)">
          <v-row wrap v-if="isEditable">
            <v-col cols="12" md="6">
              <image-zone
                v-ripple
                class="image-zone"
                :max-width="200"
                :max-height="100"
                :image="note.image"
                @update:image="updateNote('image', $event)"
              ></image-zone>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                color="primary"
                label="Show as sticky note"
                :hide-details="true"
                :input-value="note.showAsSticky"
                @click.stop.prevent="
                  updateNote('showAsSticky', !note.showAsSticky)
                "
              ></v-checkbox>
              <v-checkbox
                color="primary"
                label="Show label"
                :hide-details="true"
                :disabled="!note.image"
                :input-value="note.showLabel"
                @click.stop.prevent="
                  note.image ? updateNote('showLabel', !note.showLabel) : ''
                "
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-divider v-if="isEditable"></v-divider>
          <v-textarea
            outlined
            :class="`color-${note.colors[0]}`"
            name="description"
            label="Description"
            :value="note.description"
            @input="updateNote('description', $event)"
          ></v-textarea>
          <v-divider></v-divider>
          <v-expansion-panels v-model="showNoteOptionsCalc" flat>
            <v-expansion-panel>
              <v-expansion-panel-header>Calculations</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-alert type="error" :value="Boolean(results.err)">{{
                  results.err
                }}</v-alert>
                <v-row align-center>
                  <v-col cols="1">
                    <v-icon>vpn_key</v-icon>
                  </v-col>
                  <v-col cols="11">
                    <v-text-field
                      :disabled="!isEditable"
                      label="id"
                      :value="note.calcId"
                      @input="updateNote('calcId', $event)"
                      hint="Name used as reference in calculations for this item."
                      required
                      :rules="[rules.variable, rules.unique]"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row
                  align-center
                  v-for="(val, calcVar) in note.values"
                  :key="calcVar"
                >
                  <v-col cols="1">
                    <v-menu bottom right>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                          <v-icon
                            :class="`calcDisplayColor${whichCalcDisplay(
                              calcVar
                            )}`"
                          >
                            {{
                              whichCalcDisplay(calcVar)
                                ? "label"
                                : "label_outline"
                            }}
                          </v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item>
                          <v-list-item-title>
                            <v-icon
                              :class="`calcDisplayColor${whichCalcDisplay(
                                calcVar
                              )}`"
                            >
                              {{
                                whichCalcDisplay(calcVar)
                                  ? "label"
                                  : "label_outline"
                              }}
                            </v-icon>
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                          v-show="note[`calcDisplay${c}`] !== calcVar"
                          v-for="c in ['B', 'R', 'G']"
                          :key="c"
                          @click.prevent="updateCalcDisplay(calcVar, c)"
                        >
                          <v-list-item-title>
                            <v-icon :class="`calcDisplayColor${c}`"
                              >label</v-icon
                            >
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                          v-if="whichCalcDisplay(calcVar)"
                          @click.prevent="updateCalcDisplay(calcVar, null)"
                        >
                          <v-list-item-title>
                            <v-icon>label_outline</v-icon>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-col>
                  <v-col cols="11">
                    <v-text-field
                      :disabled="!isEditable"
                      hint="Any calculation example cs1.size * tickets.price"
                      :label="calcVar"
                      :value="val"
                      @input="updateCalcVal(calcVar, $event)"
                      :error-messages="getError(calcVar)"
                      :suffix="`= ${getResult(note.calcId, calcVar)}`"
                      :append-icon="isEditable ? 'delete_forever' : false"
                      @click:append="() => removeCalcVar(calcVar)"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row align-center v-if="isEditable">
                  <v-col cols="1">
                    <v-icon>bookmark</v-icon>
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      label="New variable"
                      value="hello"
                      @keypress.enter="addCalcVar"
                      v-model="newVariable"
                      hint="Add a new variable name only use a-z, a-Z, 0-9, _"
                      :rules="[rules.variable]"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-btn color="primary" text block @click="addCalcVar"
                      >add</v-btn
                    >
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="error" text @click="deleteNote" v-if="isEditable"
            >Delete</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            class="blue--text darken-1"
            text
            @click="hideDialog"
            color="primary"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import humanFormat from "human-format";
import { mapState } from "vuex";
import ImageZone from "@/components/ImageZone";
import * as types from "@/store/mutation-types";
import Note from "@/models/Note";
import { COLORS_MATERIAL_DARK } from "@/utils";

const patternVar = /^[a-zA-Z_][a-zA-Z\d_]*$/;

export default {
  data() {
    return {
      newVariable: null,
      rules: {
        variable: value =>
          patternVar.test(value) || "Invalid name only use a-z, a-Z, 0-9, _",
        unique: value => {
          const calcIds = this.$store.getters.calcIds;
          const firstIndex = calcIds.indexOf(value) + 1;
          // check if there is a 2nd element in the array (1st time is self)
          return (
            calcIds.indexOf(value, firstIndex) === -1 ||
            "Name already used, ID must be unique!"
          );
        }
      },
      COLORS_MATERIAL_DARK
    };
  },
  computed: {
    ...mapState({
      showNoteOptions: state => state.layout.showNoteOptions,
      results: state => state.calcResults || {}
    }),
    showNoteOptionsCalc: {
      get() {
        return this.$store.state.layout.showNoteOptionsCalc ? 0 : undefined;
      },
      set(value) {
        this.$store.commit(types.LAYOUT_UPDATE, {
          showNoteOptionsCalc: value === 0
        });
      }
    },
    note() {
      const note = this.$store.state.layout.focusedNote;
      // auto generate id if not defined at first use
      if (this.showNoteOptionsCalc && note && !note.calcId) {
        const calcId = note.text.replace(/[^a-zA-Z\d_]/g, "_");
        Vue.nextTick(() => {
          this.$store.dispatch("NOTE_UPDATE", {
            note,
            changes: {
              calcId
            }
          });
        });
        return note;
      }
      return note || new Note();
    },
    isEditable() {
      return !this.note.isGame && this.$store.state.layout.isEditable;
    }
  },
  methods: {
    whichCalcDisplay(calcVar) {
      return ["B", "R", "G"].find(
        c => this.note[`calcDisplay${c}`] === calcVar
      );
    },
    hideDialog() {
      this.$store.commit(types.LAYOUT_UPDATE, { showNoteOptions: false });
    },
    deleteNote() {
      this.hideDialog();
      this.$store.dispatch("NOTE_DELETE", this.note);
    },
    updateNote(field, data) {
      this.$store.dispatch("NOTE_UPDATE", {
        note: this.note,
        changes: {
          [field]: data
        }
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
      this.$store.dispatch("NOTE_UPDATE", {
        note: this.note,
        changes
      });
    },
    getResult(calcId, calcVar) {
      if (
        this.results &&
        this.results[calcId] &&
        this.results[calcId][calcVar]
      ) {
        const res = this.results[calcId][calcVar];
        if (typeof res === "object") {
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
      return "N/A";
    },
    getError(calcVar) {
      return this.results && this.results[`err_${this.note.calcId}.${calcVar}`]
        ? [this.results[`err_${this.note.calcId}.${calcVar}`]]
        : [];
    },
    addCalcVar() {
      // TODO should only send new var...
      if (this.newVariable) {
        const copy = Object.assign({}, this.note.values);
        copy[this.newVariable] = "";
        this.updateNote("values", copy);
        this.newVariable = null;
      }
    },
    removeCalcVar(name) {
      const copy = Object.assign({}, this.note.values);
      delete copy[name];
      this.updateNote("values", copy);
    },
    updateCalcVal(key, value) {
      this.$store.dispatch("NOTE_UPDATE_CALC_VAR", {
        note: this.note,
        key,
        value
      });
    }
  },
  components: {
    ImageZone
  }
};
</script>

<style>
.note-options .v-expansion-panel-header,
.note-options .v-expansion-panel-content__wrap {
  padding: 0;
}

.note-options .image-zone {
  height: 100px;
  margin: 0 0 18px 0;
}

.note-options .headline {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.note-options .color-0 .v-input__slot {
  background-color: #ffecb3 !important;
}

.note-options .color-1 .v-input__slot {
  background-color: #c8e6c9 !important;
}

.note-options .color-2 .v-input__slot {
  background-color: #bbdefb !important;
}

.note-options .color-3 .v-input__slot {
  background-color: #e1bee7 !important;
}

.note-options .color-4 .v-input__slot {
  background-color: #ffccbc !important;
}

.note-options .color-5 .v-input__slot {
  background-color: #f5f5f5 !important;
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

.v-btn--icon .v-icon.calcDisplayColorR,
.v-icon.calcDisplayColorR {
  color: #d32f2f !important;
}

.v-btn--icon .v-icon.calcDisplayColorG,
.v-icon.calcDisplayColorG {
  color: #558b2f !important;
}

.v-btn--icon .v-icon.calcDisplayColorB,
.v-icon.calcDisplayColorB {
  color: #2196f3 !important;
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
