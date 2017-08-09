<template>
  <div>
    <v-dialog :value="showNoteOptions" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">User Profile</span>
        </v-card-title>
        <v-card-text>
          image
          
          <v-text-field label="Email" required></v-text-field>
          <v-text-field label="Password" type="password" required></v-text-field>
          <v-text-field label="Legal first name" required></v-text-field>
          <v-text-field label="Legal middle name" hint="example of helper text only on focus"></v-text-field>
          <v-text-field label="Legal last name" hint="example of persistent helper text" persistent-hint required></v-text-field>
          <v-select label="Age" required :items="['0-17', '18-29', '30-54', '54+']"></v-select>
          <v-select label="Interests" multiple autocomplete chips :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']" <small>*indicates required field</small>
          <v-text-field label="Email" required></v-text-field>
          <v-text-field label="Password" type="password" required></v-text-field>
          <v-text-field label="Legal first name" required></v-text-field>
          <v-text-field label="Legal middle name" hint="example of helper text only on focus"></v-text-field>
          <v-text-field label="Legal last name" hint="example of persistent helper text" persistent-hint required></v-text-field>
          <v-select label="Age" required :items="['0-17', '18-29', '30-54', '54+']"></v-select>
          <v-select label="Interests" multiple autocomplete chips :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']" <small>*indicates required field</small>
        </v-card-text>
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
import * as types from '@/store/mutation-types';

export default {
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
  },
};
</script>

<style>

</style>
