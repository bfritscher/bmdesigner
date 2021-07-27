<template>
  <v-app>
    <nav-bar></nav-bar>
    <presentation-sorter></presentation-sorter>

    <v-app-bar
      app
      fixed
      class="blue-grey darken-2"
      dark
      :clipped-left="userSettings.mini && !isMobile()"
    >
      <v-app-bar-nav-icon
        @click.stop.prevent="
          userSettingsUpdate({ drawer: !userSettings.drawer })
        "
      ></v-app-bar-nav-icon>
      <search></search>
      <v-spacer></v-spacer>
      <transition name="title-fade-transition" mode="out-in">
        <v-dialog
          v-model="showDialogTitle"
          persistent
          :disabled="!$store.state.layout.isEditable || !isModelEdit"
          max-width="500px"
        >
          <template v-slot:activator="{ on }">
            <v-toolbar-title v-on="on">{{ title }}</v-toolbar-title>
          </template>

          <v-card>
            <v-card-title class="headline">Name of project?</v-card-title>
            <v-card-text>
              <v-text-field
                required
                light
                :value="$store.state.canvas.info.name"
                @input="localTitle = $event"
                @keyup.enter="saveNewTitle"
                :autofocus="true"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="black--text" text @click="showDialogTitle = false"
                >Cancel</v-btn
              >
              <v-btn class="blue--text darken-1" text @click="saveNewTitle"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </transition>
      <v-spacer></v-spacer>
      <v-menu offset-y v-if="currentUser">
        <template v-slot:activator="{ on }">
          <v-list-item-avatar v-on="on">
            <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
            <avatar
              v-if="currentUser.displayName && !currentUser.photoURL"
              :username="currentUser.displayName"
              :size="38"
            ></avatar>
          </v-list-item-avatar>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
              <avatar
                v-if="currentUser.displayName && !currentUser.photoURL"
                :username="currentUser.displayName"
                :size="38"
              ></avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ currentUser.displayName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ currentUser.email }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="signOut">
            <v-list-item-action>
              <v-icon>exit_to_app</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item exact :to="{ name: 'about' }">
            <v-list-item-action>
              <v-icon>feedback</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Send feedback</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn v-else exact :to="{ name: 'login' }">Sign in</v-btn>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <note-options></note-options>
    <v-dialog
      :value="$store.state.layout.showLoading"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title class="headline">Working</v-card-title>
        <v-card-text>
          <p>{{ $store.state.layout.showLoading }}</p>
          <p style="text-align: center">
            <v-progress-circular
              indeterminate
              v-bind:size="100"
              v-bind:width="7"
              class="primary--text"
            ></v-progress-circular>
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      :value="$store.state.layout.showPrint"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title class="headline">Export result</v-card-title>
        <v-card-text>
          <p>
            <a :href="$store.state.layout.showPrint" download="export.jpg">
              <img :src="$store.state.layout.showPrint" style="width: 100%" />
            </a>
          </p>
          <p>Click image to download large version</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="blue--text darken-1"
            text
            @click="layoutUpdate({ showPrint: '' })"
            >Done</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";

import Avatar from "vue-avatar";
import NoteOptions from "@/components/NoteOptions";
import PresentationSorter from "@/components/PresentationSorter";
import NavBar from "@/components/NavBar";
import Search from '@/components/Search';

export default {
  name: "app",
  data() {
    return {
      showDialogTitle: false,
      localTitle: ""
    };
  },
  computed: {
    ...mapState({
      currentUser: "currentUser"
    }),
    ...mapGetters(["userSettings", "canvasSettings"]),
    title() {
      let title =
        this.$route.meta && this.$route.meta.title
          ? this.$route.meta.title
          : "";
      if (this.isModelEdit) {
        title += `${
          (this.$store.state.canvas && this.$store.state.canvas.info.name) ||
          "Loading"
        } | `;
        if (this.$store.state.layout.showVPC) {
          if (this.$store.state.layout.selectedVP) {
            title += "Value Proposition Zoom";
          }
          if (
            this.$store.state.layout.selectedVP &&
            this.$store.state.layout.selectedCS
          ) {
            title += " & ";
          }
          if (this.$store.state.layout.selectedCS) {
            title += "Customer Segment Zoom";
          }
        } else {
          title += "Business Model Canvas";
        }
      }
      document.title = `BM|Designer | ${title}`;
      return title;
    },
    // TODO move to store
    isModelEdit() {
      return ["bmc", "canvas"].includes(this.$route.name);
    }
  },
  methods: {
    ...mapActions([
      "signOut",
      "userSettingsUpdate",
      "canvasInfoUpdate",
      "layoutUpdate"
    ]),
    saveNewTitle() {
      this.showDialogTitle = false;
      this.canvasInfoUpdate({ name: this.localTitle });
    }
  },
  components: {
    NoteOptions,
    Avatar,
    PresentationSorter,
    NavBar,
    Search
  }
};
</script>

<style>
html {
  overflow-y: auto;
}

body {
  font-family: "Open Sans";
  user-select: none;
}

#logo-title {
  color: #fff;
  text-decoration: none;
}

.v-navigation-drawer--mini-variant .v-list__tile {
  padding: 0 8px;
}

.title-fade-transition-enter-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.title-fade-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}

.title-fade-transition-enter,
.title-fade-transition-leave-to {
  opacity: 0;
}

.v-application--is-ltr
  .menu-color-group.v-list-group--no-action
  > .v-list-group__items
  > .v-list-item {
  padding-left: 16px;
}

.avatar:not(.v-list-item__avatar) {
  justify-content: center;
  min-width: 0;
}

.invite {
  justify-content: center;
}

.color-btn {
  max-width: none !important;
}

.color-btn .v-btn {
  color: black;
}

.color-btn.v-btn-toggle--selected {
  box-shadow: none;
}

.color-btn.v-btn-toggle--dense > .v-btn.v-btn {
  min-width: auto;
}

.dialog__container {
  overflow: hidden;
}
</style>
