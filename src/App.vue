<template>
  <v-app>
    <v-navigation-drawer
      app
      ref="drawer"
      width="240"
      mini-variant-width="64"
      :mobile-break-point="1440"
      class="drawer"
      fixed
      :clipped="userSettings.mini && !isMobile()"
      :mini-variant="userSettings.mini && !isMobile()"
      :value="userSettings.drawer"
      @input="userSettingsUpdate({ drawer: $event })"
    >
      <v-toolbar
        flat
        class="blue-grey darken-2"
        dark
        v-show="!userSettings.mini"
      >
        <v-toolbar-title>
          <router-link :to="{ name: 'home' }" id="logo-title"
            >BM|Designer</router-link
          >
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click.stop="userSettingsUpdate({ mini: !userSettings.mini })"
          v-show="!isMobile()"
        >
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <v-list-tile
          v-show="userSettings.mini && !isMobile()"
          @click.stop="userSettingsUpdate({ mini: !userSettings.mini })"
        >
          <v-list-tile-action>
            <v-icon light>chevron_right</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile exact :to="{ name: 'home' }" ripple>
          <v-list-tile-action title="Home">
            <v-icon light>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
          :disabled="!currentUser"
          :to="{ name: 'favorites' }"
          v-show="isModelList"
          ripple
        >
          <v-list-tile-action title="Favorite">
            <v-icon light>favorite</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Favorite</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="{ name: 'inspire' }" v-show="isModelList" ripple>
          <v-list-tile-action title="Inspire">
            <v-icon light>lightbulb_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Inspire</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'learn' }" v-show="isModelList" ripple>
          <v-list-tile-action title="Learn">
            <v-icon light>school</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Learn</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'play' }" v-show="isModelList" ripple>
          <v-list-tile-action title="Play">
            <v-icon light>games</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Play</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'about' }" ripple>
          <v-list-tile-action title="Feedback">
            <v-icon light>feedback</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Ideas &amp; Feedback</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div v-if="$route.name === 'bmc'">
          <v-divider class="my-2"></v-divider>
          <v-subheader>DISPLAY OPTIONS</v-subheader>

          <v-list-tile ripple @click="presentationStart">
            <v-list-tile-action title="Start presentation">
              <v-icon>slideshow</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Start presentation</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile ripple @click="changeColorMode">
            <v-list-tile-action :title="colorModeSwitch.text">
              <v-icon>{{ colorModeSwitch.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ colorModeSwitch.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="canvasSettings.hideColors" disabled>
            <v-list-tile-action title="Colors visibility">
              <v-icon light>color_lens</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Colors visibility</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon light>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-group
            class="menu-color-group"
            no-action
            :value="canvasSettings.isColorsOpen"
            @input="
              canvasUserSettingsUpdate({
                isColorsOpen: !canvasSettings.isColorsOpen
              })
            "
          >
            <template v-slot:activator>
              <v-list-tile ripple @click="showColors">
                <v-list-tile-action title="Colors visibility">
                  <v-icon light>color_lens</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>Colors visibility</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>

            <v-list-tile v-if="currentCanvasUsedColors.size === 0">
              <v-list-tile-content>No used colors</v-list-tile-content>
            </v-list-tile>

            <v-list-tile
              v-for="(colorCode, colorId) in COLORS_MATERIAL"
              :key="colorId"
              v-show="currentCanvasUsedColors.has(colorId)"
            >
              <v-btn-toggle
                class="color-btn"
                :style="{ 'background-color': colorCode }"
                :class="colorCode"
                mandatory
                :value="colorsVisibility[colorId]"
                @change="toggleColorVisibility($event, colorId)"
              >
                <v-btn flat value="0">off</v-btn>
                <v-btn flat value="0.25">1/4</v-btn>
                <v-btn flat value="0.5">1/2</v-btn>
                <v-btn flat value="0.75">3/4</v-btn>
                <v-btn flat value="1">on</v-btn>
              </v-btn-toggle>
            </v-list-tile>
          </v-list-group>

          <v-list-tile ripple @click="changeLabelMode">
            <v-list-tile-action :title="labelModeSwitch.text">
              <v-icon>{{ labelModeSwitch.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ labelModeSwitch.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile ripple @click="changeListMode">
            <v-list-tile-action :title="listModeSwitch.text">
              <v-icon>{{ listModeSwitch.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ listModeSwitch.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider class="my-2"></v-divider>

          <v-subheader>PROJECT OPTIONS</v-subheader>

          <v-list-tile ripple @click="printCanvas">
            <v-list-tile-action title="Print canvas">
              <v-icon>print</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Print canvas</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile ripple @click="duplicateCanvas">
            <v-list-tile-action title="Duplicate canvas">
              <v-icon>content_copy</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Duplicate canvas</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <div v-if="$store.state.layout.isEditable">
            <v-list-tile
              ripple
              @click.stop="layoutUpdate({ showPresentationSorter: true })"
            >
              <v-list-tile-action title="Presentation order">
                <v-icon>format_list_numbered</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Presentation order</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile ripple @click="changeAccessType">
              <v-list-tile-action :title="accessTypeSwitch.text">
                <v-icon>{{ accessTypeSwitch.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{
                  accessTypeSwitch.text
                }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-dialog
              v-model="showDialogSettings"
              persistent
              style="display:block"
              max-width="500px"
            >
              <template v-slot:activator="{ on }">
                <v-list-tile class="mt-2" ripple v-on="on">
                  <v-list-tile-action title="Settings">
                    <v-icon>settings</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>Settings</v-list-tile-title>
                </v-list-tile>
              </template>
              <v-card>
                <v-card-text>
                  <h3 class="headline">Canvas settings</h3>
                  <v-btn color="error" flat @click="deleteCanvas">Delete</v-btn>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="blue--text darken-1"
                    flat
                    @click="showDialogSettings = false"
                    >Done</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-divider class="mt-2"></v-divider>

            <v-subheader>COLLABORATORS</v-subheader>

            <v-list>
              <v-list-tile
                v-for="(u, key) in $store.state.canvas.users"
                :key="key"
                avatar
                ripple
              >
                <v-badge overlap bottom :color="u.online ? 'green' : 'red'">
                  <template v-slot:badge>
                    <span></span>
                  </template>
                  <v-list-tile-avatar>
                    <img v-if="u.avatar" :src="u.avatar" :alt="u.name" />
                    <avatar
                      v-if="u.name && !u.avatar"
                      :username="u.name"
                      :size="38"
                    ></avatar>
                  </v-list-tile-avatar>
                </v-badge>

                <v-list-tile-content>
                  <v-list-tile-title v-text="u.name"></v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-dialog
                    v-model="showConfirmRemoveUser"
                    persistent
                    max-width="500px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn icon ripple v-on="on">
                        <v-icon class="grey--text text--lighten-1"
                          >clear</v-icon
                        >
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline">Remove user?</v-card-title>
                      <v-card-text>
                        {{ u.name }} will no longer be able to edit this
                        project.
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          class="black--text"
                          flat
                          @click="showConfirmRemoveUser = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          class="blue--text darken-1"
                          flat
                          @click="removeUser(key)"
                          >Remove</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                v-for="(u, key) in $store.state.canvas.invites_sent"
                :key="key"
              >
                <v-list-tile-action class="invite">
                  <v-icon medium>mail_outline</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title v-text="u"></v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-dialog
                    v-model="showConfirmDeleteInvitation"
                    persistent
                    max-width="500px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn icon ripple v-on="on">
                        <v-icon class="grey--text text--lighten-1"
                          >clear</v-icon
                        >
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline"
                        >Disable invitation token?</v-card-title
                      >
                      <v-card-text>
                        The sent share link will no longer be usable to join
                        this project.
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          class="black--text"
                          flat
                          @click="showConfirmDeleteInvitation = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          class="blue--text darken-1"
                          flat
                          @click="removeInvitation(key)"
                          >Remove</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-tile-action>
              </v-list-tile>

              <v-list-tile v-if="$store.state.canvas.invite_request">
                <v-list-tile-action>
                  <v-progress-circular
                    indeterminate
                    class="primary--text"
                  ></v-progress-circular>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{
                    $store.state.canvas.invite_request
                  }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>

            <v-dialog
              v-model="showDialogInvite"
              persistent
              style="display:block"
              max-width="500px"
            >
              <template v-slot:activator="{ on }">
                <v-list-tile class="mt-2" ripple v-on="on">
                  <v-list-tile-action title="Invite a person">
                    <v-icon>add_circle_outline</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>Invite a person</v-list-tile-title>
                </v-list-tile>
              </template>
              <v-card>
                <v-card-text>
                  <h3 class="headline">Send invitation to?</h3>
                  <v-text-field
                    label="Email"
                    required
                    type="email"
                    light
                    v-model="inviteEmail"
                    @keyup.enter="sendInviteEmail"
                    :autofocus="true"
                  ></v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="black--text"
                    flat
                    @click="showDialogInvite = false"
                    >Cancel</v-btn
                  >
                  <v-btn
                    class="blue--text darken-1"
                    flat
                    @click="sendInviteEmail"
                    >Send</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </v-list>
    </v-navigation-drawer>

    <presentation-sorter></presentation-sorter>

    <v-toolbar
      app
      fixed
      class="blue-grey darken-2"
      dark
      :clipped-left="userSettings.mini && !isMobile()"
    >
      <v-toolbar-side-icon
        @click.stop.prevent="
          userSettingsUpdate({ drawer: !userSettings.drawer })
        "
      ></v-toolbar-side-icon>
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
            <v-toolbar-title v-on="on"> {{ title }}</v-toolbar-title>
          </template>

          <v-card>
            <v-card-text>
              <h3 class="headline">Name of project?</h3>
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
              <v-btn class="black--text" flat @click="showDialogTitle = false"
                >Cancel</v-btn
              >
              <v-btn class="blue--text darken-1" flat @click="saveNewTitle"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </transition>
      <v-spacer></v-spacer>
      <span style="width: 200px"></span>
      <v-menu offset-y v-if="currentUser">
        <template v-slot:activator="{ on }">
          <v-list-tile-avatar v-on="on">
            <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
            <avatar
              v-if="currentUser.displayName && !currentUser.photoURL"
              :username="currentUser.displayName"
              :size="38"
            ></avatar>
          </v-list-tile-avatar>
        </template>
        <v-list>
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img v-if="currentUser.photoURL" :src="currentUser.photoURL" />
              <avatar
                v-if="currentUser.displayName && !currentUser.photoURL"
                :username="currentUser.displayName"
                :size="38"
              ></avatar>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{
                currentUser.displayName
              }}</v-list-tile-title>
              <v-list-tile-sub-title>{{
                currentUser.email
              }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="signOut">
            <v-list-tile-action>
              <v-icon>exit_to_app</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Sign out</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile exact :to="{ name: 'about' }">
            <v-list-tile-action>
              <v-icon>feedback</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Send feedback</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn v-else exact :to="{ name: 'login' }">Sign in</v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
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
          <p style="text-align:center;">
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
            flat
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
import { COLORS_MATERIAL } from "@/utils";
import Avatar from "vue-avatar";
import { db } from "@/utils/firebase";
import NoteOptions from "@/components/NoteOptions";
import PresentationSorter from "@/components/PresentationSorter";
import Search from "@/components/Search";

export default {
  name: "app",
  data() {
    return {
      right: true,
      showDialogInvite: false,
      showDialogTitle: false,
      showConfirmDeleteInvitation: false,
      showConfirmRemoveUser: false,
      showDialogSettings: false,
      localTitle: "",
      inviteEmail: "",
      COLORS_MATERIAL
    };
  },
  computed: {
    ...mapState({
      currentUser: "currentUser",
      currentCanvasUsedColors: state => state.layout.currentCanvasUsedColors
    }),
    ...mapGetters(["userSettings", "canvasSettings"]),
    title() {
      let title =
        this.$route.meta && this.$route.meta.title
          ? this.$route.meta.title
          : "";
      if (this.isModelEdit) {
        title += `${this.$store.state.canvas.info.name || "Loading"} | `;
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
    colorModeSwitch() {
      return this.canvasSettings.hideColors
        ? { text: "Show colors", icon: "invert_colors" }
        : { text: "Hide colors", icon: "invert_colors_off" };
    },
    listModeSwitch() {
      return this.canvasSettings.listMode
        ? { text: "Display as sticky notes", icon: "widgets" }
        : { text: "Display as lists", icon: "list" };
    },
    accessTypeSwitch() {
      return this.$store.state.canvas.info.public
        ? { text: "Make private", icon: "public" }
        : { text: "Make public", icon: "lock" };
    },
    labelModeSwitch() {
      return this.canvasSettings.hideAllLabels
        ? { text: "Show labels", icon: "label" }
        : { text: "Hide all labels", icon: "label_outline" };
    },
    isModelList() {
      return [
        "home",
        "play",
        "inspire",
        "learn",
        "favorites",
        "about",
        "login"
      ].includes(this.$route.name);
    },
    isModelEdit() {
      return ["bmc"].includes(this.$route.name);
    },
    colorsVisibility() {
      return this.canvasSettings.colorsVisibility.map(opacity =>
        opacity.toString()
      );
    }
  },
  methods: {
    ...mapActions([
      "signOut",
      "canvasUserSettingsUpdate",
      "userSettingsUpdate",
      "canvasInfoUpdate",
      "duplicateCanvas",
      "presentationStart",
      "layoutUpdate",
      "printCanvas"
    ]),
    isMobile() {
      return this.$refs.drawer ? this.$refs.drawer.isMobile : false;
    },
    removeInvitation(key) {
      this.showConfirmDeleteInvitation = false;
      this.$store.dispatch("removeInvitation", key);
    },
    removeUser(key) {
      this.showConfirmRemoveUser = false;
      this.$store.dispatch("removeUser", key);
    },
    deleteCanvas() {
      this.showDialogSettings = false;
      this.$store.dispatch("deleteCanvas");
    },
    sendInviteEmail() {
      db.child("projects")
        .child(this.$store.state.canvas[".key"])
        .child("invite_request")
        .set(this.inviteEmail);
      this.inviteEmail = "";
      this.showDialogInvite = false;
    },
    changeListMode() {
      this.canvasUserSettingsUpdate({
        listMode: !this.canvasSettings.listMode
      });
    },
    changeColorMode() {
      this.canvasUserSettingsUpdate({
        hideColors: !this.canvasSettings.hideColors
      });
    },
    changeLabelMode() {
      this.canvasUserSettingsUpdate({
        hideAllLabels: !this.canvasSettings.hideAllLabels
      });
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
      newArray[colorId] = parseFloat(value);
      this.canvasUserSettingsUpdate({ colorsVisibility: newArray });
    }
  },
  components: {
    NoteOptions,
    Avatar,
    Search,
    PresentationSorter
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

.menu-color-group .v-list__group__items--no-action .v-list__tile {
  padding-left: 22px;
}

.v-badge .v-list__tile__avatar + .v-badge__badge {
  left: 32px;
  top: 26px;
  height: 16px;
  width: 16px;
}

.avatar:not(.v-list__tile__avatar) {
  justify-content: center;
  min-width: 0;
}

.invite {
  justify-content: center;
}

.color-btn .v-btn {
  color: black;
}

.color-btn.v-btn-toggle--selected {
  box-shadow: none;
}

.dialog__container {
  overflow: hidden;
}
</style>
