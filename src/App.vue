<template>
  <v-app toolbar>
    <v-navigation-drawer ref="drawer" :mobile-break-point="1440" class="drawer" overflow :mini-variant="userSettings.mini && !isMobile()" persistent enable-resize-watcher :value="userSettings.drawer" @input="userSettingsUpdate({drawer: $event})">
      <v-toolbar flat class="blue-grey darken-2" dark v-show="!userSettings.mini">
        <v-toolbar-title>
          <router-link :to="{name: 'home'}" id="logo-title">BM|Designer</router-link>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click.native.stop="userSettingsUpdate({ mini: !userSettings.mini })" v-show="!isMobile()">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <v-list-tile v-show="userSettings.mini && !isMobile()" @click.native.stop="userSettingsUpdate({ mini: !userSettings.mini })">
          <v-list-tile-action>
            <v-icon light>chevron_right</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Home
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile exact :to="{name: 'home'}" ripple>
          <v-list-tile-action>
            <v-icon light>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Home
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :disabled="!currentUser" :to="{name: 'favorites'}" v-show="isModelList" ripple>
          <v-list-tile-action>
            <v-icon light>favorite</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Favorite
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="{name: 'inspire'}" v-show="isModelList" v-ripple>
          <v-list-tile-action>
            <v-icon light>lightbulb_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Inspire
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{name: 'learn'}" v-show="isModelList" v-ripple>
          <v-list-tile-action>
            <v-icon light>school</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Learn
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{name: 'play'}" v-show="isModelList" v-ripple>
          <v-list-tile-action>
            <v-icon light>games</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Play
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{name: 'about'}" v-ripple>
          <v-list-tile-action>
            <v-icon light>feedback</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Ideas & Feedback
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div v-if="$route.name === 'bmc'">

          <v-divider class="my-2"></v-divider>

          <v-list-group no-action :value="isColorsOpen" @input="canvasUserSettingsUpdate({ isColorsOpen: !canvasSettings.isColorsOpen })">
            <v-list-tile slot="item" @click.native="showColors">
              <v-list-tile-action>
                <v-icon light>color_lens</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Colors visibility</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon light>keyboard_arrow_down</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile v-if="currentCanvasUsedColors.size === 0">
              <v-list-tile-content>
                No used colors
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(colorCode, colorId) in COLORS_MATERIAL" :key="colorId" v-show="currentCanvasUsedColors.has(colorId)">

              <v-btn-toggle class="color-btn" :style="{'background-color': colorCode}" :class="colorCode" :items="[{text: 'off', value: '0'}, {text: '1/4', value: '0.25'}, {text: '1/2', value: '0.5'},  {text: '3/4', value: '0.75'}, {text: 'on', value: '1'},]" mandatory :input-value="colorsVisibility[colorId]" @change="toggleColorVisibility($event, colorId)"> </v-btn-toggle>

            </v-list-tile>

          </v-list-group>

          <v-list-tile v-ripple @click.native="changeListMode">
            <v-list-tile-action>
              <v-icon>{{listModeSwitch.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{listModeSwitch.text}}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

<div v-if="$store.state.layout.isEditable">

          <v-list-tile v-ripple @click.native="changeAccessType">
            <v-list-tile-action>
              <v-icon>{{accessTypeSwitch.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{accessTypeSwitch.text}}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider class="my-2"></v-divider>

          <v-subheader class="mt-2 grey--text text--darken-1">COLLABORATORS</v-subheader>

          <v-list>
            <v-list-tile v-for="(u, key) in $store.state.canvas.users" :key="key" avatar ripple>
              <v-list-tile-avatar v-badge="{ value:'', overlap: true, left: true }"
                :class="[u.online ? 'green--after' : 'red--after']">
                <img v-if="u.avatar" :src="u.avatar" :alt="u.name">
                <avatar v-if="u.name && !u.avatar" :username="u.name" :size="38"></avatar>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-text="u.name"></v-list-tile-title>
              </v-list-tile-content>
              <!-- <v-list-tile-action>
                <v-icon v-bind:class="[u.online ? 'teal--text' : 'grey--text']">chat_bubble</v-icon>
              </v-list-tile-action>
              -->
            </v-list-tile>
            <v-list-tile v-for="(u, key) in $store.state.canvas.invites_sent" :key="key">
              <v-list-tile-action>
                <v-icon light>mail_outline</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="u"></v-list-tile-title>
              </v-list-tile-content>
              <!-- <v-list-tile-action>
                <v-icon v-bind:class="[u.online ? 'teal--text' : 'grey--text']">chat_bubble</v-icon>
              </v-list-tile-action>
              -->
            </v-list-tile>
          </v-list>
          <v-divider class="my-2"></v-divider>

          <v-dialog v-model="showDialogInvite" persistent style="display:block">
            <v-list-tile class="mt-2" v-ripple slot="activator">
              <v-list-tile-action>
                <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
              </v-list-tile-action>
              <v-list-tile-title class="grey--text text--darken-1">Invite a person</v-list-tile-title>
            </v-list-tile>
            <v-card>
              <v-card-text>
                <h3 class="headline">Send invitation to?</h3>
                <v-text-field label="Email" required type="email" light v-model="inviteEmail" :autofocus="true"></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="black--text" flat @click.native="showDialogInvite = false">Cancel</v-btn>
                <v-btn class="blue--text darken-1" flat @click.native="sendInviteEmail">Send</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

</div>
          <!--
                    <v-list-tile v-ripple>
                      <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">settings</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-title class="grey--text text--darken-1">Settings</v-list-tile-title>
                    </v-list-tile>
          -->
        </div>
      </v-list>
    </v-navigation-drawer>
    <!--
                        <v-navigation-drawer
                            right
                            temporary
                            hide-overlay
                            :value="$store.state.layout.focusedNote"
                          ></v-navigation-drawer>
                          -->
    <v-toolbar fixed class="blue-grey darken-2" dark>
      <v-toolbar-side-icon @click.native.stop.prevent="userSettingsUpdate({drawer: !userSettings.drawer})"></v-toolbar-side-icon>
      <!-- <v-text-field class="ml-5" v-if="$route.name === 'home'" prepend-icon="search" hide-details single-line placeholder="Search your models"></v-text-field> -->
      <v-spacer></v-spacer>
      <transition name="title-fade-transition" mode="out-in">
        <v-dialog v-model="showDialogTitle" persistent :disabled="!$store.state.layout.isEditable || !isModelEdit">
          <v-toolbar-title :key="title" slot="activator">{{title}}</v-toolbar-title>
          <v-card>
            <v-card-text>
              <h3 class="headline">Name of project?</h3>
              <v-text-field required light :value="$store.state.canvas.info.name" @input="localTitle=$event" :autofocus="true"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="black--text" flat @click.native="showDialogTitle = false">Cancel</v-btn>
              <v-btn class="blue--text darken-1" flat @click.native="saveNewTitle">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </transition>
      <v-spacer></v-spacer>
      <v-menu offset-y v-if="currentUser">
        <v-list-tile-avatar slot="activator">
          <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
          <avatar v-if="currentUser.displayName && !currentUser.photoURL" :username="currentUser.displayName" :size="38"></avatar>
        </v-list-tile-avatar>
        <v-list>
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
              <avatar v-if="currentUser.displayName && !currentUser.photoURL" :username="currentUser.displayName" :size="38"></avatar>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{currentUser.displayName}}</v-list-tile-title>
              <v-list-tile-sub-title>{{currentUser.email}}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click.native="signOut">
            <v-list-tile-action>
              <v-icon>exit_to_app</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Sign out</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile exact :to="{name: 'about'}">
            <v-list-tile-action>
              <v-icon>feedback</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Send feedback</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn v-else exact :to="{name: 'login'}">Sign in</v-btn>

    </v-toolbar>
    <main>
      <v-container fluid style="position: relative">
        <router-view></router-view>
      </v-container>
    </main>
    <note-options></note-options>
    <v-dialog :value="$store.state.layout.showLoading" persistent>
        <v-card>
          <v-card-title class="headline">Working</v-card-title>
          <v-card-text>{{$store.state.layout.showLoading}}</v-card-text>
        </v-card>
      </v-dialog>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { COLORS_MATERIAL } from '@/utils';
import Avatar from 'vue-avatar/dist/Avatar';
import { auth, db } from '@/utils/firebase';

import * as types from '@/store/mutation-types';
import NoteOptions from '@/components/NoteOptions';

export default {
  name: 'app',
  data() {
    return {
      right: true,
      showDialogInvite: false,
      showDialogTitle: false,
      localTitle: '',
      inviteEmail: '',
      COLORS_MATERIAL,
    };
  },
  computed: {
    ...mapState({
      currentUser: 'currentUser',
      currentCanvasUsedColors: state => state.layout.currentCanvasUsedColors,
    }),
    ...mapGetters(['userSettings', 'canvasSettings']),
    isColorsOpen() {
      return this.canvasSettings.isColorsOpen;
    },
    title() {
      let title = this.$route.meta && this.$route.meta.title ? this.$route.meta.title : '';
      if (this.isModelEdit) {
        title += `${this.$store.state.canvas.info.name || 'Loading'} | `;
        if (this.$store.state.layout.showVPC) {
          if (this.$store.state.layout.selectedVP) {
            title += 'Value Proposition Zoom';
          }
          if (this.$store.state.layout.selectedVP && this.$store.state.layout.selectedCS) {
            title += ' & ';
          }
          if (this.$store.state.layout.selectedCS) {
            title += 'Customer Segment Zoom';
          }
        } else {
          title += 'Business Model Canvas';
        }
      }
      document.title = `BM|Designer | ${title}`;
      return title;
    },
    listModeSwitch() {
      return this.canvasSettings.listMode ? { text: 'Switch to sticky notes', icon: 'widgets' } : { text: 'Switch to lists', icon: 'list' };
    },
    accessTypeSwitch() {
      return this.$store.state.canvas.info.public ? { text: 'Switch to private', icon: 'public' } : { text: 'Switch to public', icon: 'lock' };
    },
    isModelList() {
      return ['home', 'play', 'inspire', 'learn', 'favorites', 'about', 'login'].includes(this.$route.name);
    },
    isModelEdit() {
      // TODO: adapt
      return ['bmc'].includes(this.$route.name);
    },
    colorsVisibility() {
      return this.canvasSettings.colorsVisibility.map(opacity => opacity.toString());
    },
  },
  methods: {
    ...mapActions(['canvasUserSettingsUpdate', 'userSettingsUpdate', 'canvasInfoUpdate']),
    isMobile() {
      return this.$refs.drawer ? this.$refs.drawer.isMobile : false;
    },
    signOut() {
      auth.signOut();
      this.$router.push({ name: 'home' });
    },
    sendInviteEmail() {
      db.child('projects').child(this.$store.state.canvas['.key']).child('invite_request').set(this.inviteEmail);
      this.inviteEmail = '';
      this.showDialogInvite = false;
    },
    changeListMode() {
      this.canvasUserSettingsUpdate({ listMode: !this.canvasSettings.listMode });
    },
    changeAccessType() {
      this.canvasInfoUpdate({ public: !this.$store.state.canvas.info.public });
    },
    saveNewTitle() {
      this.showDialogTitle = false;
      this.canvasInfoUpdate({ name: this.localTitle });
    },
    showColors() {
      if (this.userSettings.mini) {
        this.userSettingsUpdate({ mini: false });
        this.canvasUserSettingsUpdate({ isColorsOpen: true });
      }
    },
    toggleColorVisibility(value, colorId) {
      const newArray = this.canvasSettings.colorsVisibility.slice(0);
      newArray[colorId] = parseFloat(value); // / 100.0;
      this.$store.commit(types.LAYOUT_UPDATE, {
        colorsVisibility: newArray,
      });
    },
  },
  components: {
    NoteOptions,
    Avatar,
  },
};
</script>

<style lang="stylus">
@import './stylus/main'

html {
  overflow-y: auto;
}

body {
  font-family: 'Open Sans';
  user-select: none;
}

#logo-title {
  color: #fff;
  text-decoration: none;
}

.navigation-drawer--mini-variant .list__tile {
  padding 0 8px;
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

.avatar.list__tile__avatar.badge--overlap.badge:after {
  left: 26px;
  top: 28px;
  height: 16px;
  width: 16px;
}

.avatar:not(.list__tile__avatar){
  justify-content: center;
  min-width: 0;
}

.color-btn .btn {
  color: black;
}

.color-btn.btn-toggle--selected {
  box-shadow: none;
}

.dialog__container {
  overflow: hidden;
}

</style>
