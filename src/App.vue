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
        text
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
        <v-list-item
          v-show="userSettings.mini && !isMobile()"
          @click.stop="userSettingsUpdate({ mini: !userSettings.mini })"
        >
          <v-list-item-action>
            <v-icon light>chevron_right</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item exact :to="{ name: 'home' }" ripple>
          <v-list-item-action title="Home">
            <v-icon light>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="!currentUser"
          :to="{ name: 'favorites' }"
          v-show="isModelList"
          ripple
        >
          <v-list-item-action title="Favorite">
            <v-icon light>favorite</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Favorite</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item :to="{ name: 'inspire' }" v-show="isModelList" ripple>
          <v-list-item-action title="Inspire">
            <v-icon light>lightbulb_outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Inspire</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'learn' }" v-show="isModelList" ripple>
          <v-list-item-action title="Learn">
            <v-icon light>school</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Learn</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'play' }" v-show="isModelList" ripple>
          <v-list-item-action title="Play">
            <v-icon light>games</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Play</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'about' }" ripple>
          <v-list-item-action title="Feedback">
            <v-icon light>feedback</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Ideas &amp; Feedback</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="$route.name === 'bmc' && $store.state.canvas">
          <v-divider class="my-2"></v-divider>
          <v-subheader>DISPLAY OPTIONS</v-subheader>

          <v-list-item ripple @click="presentationStart">
            <v-list-item-action title="Start presentation">
              <v-icon>slideshow</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Start presentation</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item ripple @click="changeColorMode">
            <v-list-item-action :title="colorModeSwitch.text">
              <v-icon>{{ colorModeSwitch.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ colorModeSwitch.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="canvasSettings.hideColors" disabled>
            <v-list-item-action title="Colors visibility">
              <v-icon light>color_lens</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Colors visibility</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon light>keyboard_arrow_down</v-icon>
            </v-list-item-action>
          </v-list-item>
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
              <v-list-item ripple @click="showColors">
                <v-list-item-action title="Colors visibility">
                  <v-icon light>color_lens</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Colors visibility</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>

            <v-list-item v-if="currentCanvasUsedColors.size === 0">
              <v-list-item-content>No used colors</v-list-item-content>
            </v-list-item>

            <v-list-item
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
                <v-btn text value="0">off</v-btn>
                <v-btn text value="0.25">1/4</v-btn>
                <v-btn text value="0.5">1/2</v-btn>
                <v-btn text value="0.75">3/4</v-btn>
                <v-btn text value="1">on</v-btn>
              </v-btn-toggle>
            </v-list-item>
          </v-list-group>

          <v-list-item ripple @click="changeLabelMode">
            <v-list-item-action :title="labelModeSwitch.text">
              <v-icon>{{ labelModeSwitch.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ labelModeSwitch.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item ripple @click="changeListMode">
            <v-list-item-action :title="listModeSwitch.text">
              <v-icon>{{ listModeSwitch.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ listModeSwitch.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <v-subheader>PROJECT OPTIONS</v-subheader>

          <v-list-item ripple @click="printCanvas">
            <v-list-item-action title="Print canvas">
              <v-icon>print</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Print canvas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item ripple @click="duplicateCanvas">
            <v-list-item-action title="Duplicate canvas">
              <v-icon>content_copy</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Duplicate canvas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <div v-if="$store.state.layout.isEditable">
            <v-list-item
              ripple
              @click.stop="layoutUpdate({ showPresentationSorter: true })"
            >
              <v-list-item-action title="Presentation order">
                <v-icon>format_list_numbered</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Presentation order</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item ripple @click="changeAccessType">
              <v-list-item-action :title="accessTypeSwitch.text">
                <v-icon>{{ accessTypeSwitch.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ accessTypeSwitch.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-dialog
              v-model="showDialogSettings"
              persistent
              style="display:block"
              max-width="500px"
            >
              <template v-slot:activator="{ on }">
                <v-list-item class="mt-2" ripple v-on="on">
                  <v-list-item-action title="Settings">
                    <v-icon>settings</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
              </template>
              <v-card>
                <v-card-text>
                  <h3 class="headline">Canvas settings</h3>
                  <v-btn color="error" text @click="deleteCanvas">Delete</v-btn>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="blue--text darken-1"
                    text
                    @click="showDialogSettings = false"
                    >Done</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-divider class="mt-2"></v-divider>

            <v-subheader>COLLABORATORS</v-subheader>

            <v-list>
              <v-list-item
                v-for="(u, key) in $store.state.canvas.users"
                :key="key"
                avatar
                ripple
              >
                <v-badge overlap bottom :color="u.online ? 'green' : 'red'">
                  <template v-slot:badge>
                    <span></span>
                  </template>
                  <v-list-item-avatar>
                    <img v-if="u.avatar" :src="u.avatar" :alt="u.name" />
                    <avatar
                      v-if="u.name && !u.avatar"
                      :username="u.name"
                      :size="38"
                    ></avatar>
                  </v-list-item-avatar>
                </v-badge>

                <v-list-item-content>
                  <v-list-item-title v-text="u.name"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
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
                          text
                          @click="showConfirmRemoveUser = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          class="blue--text darken-1"
                          text
                          @click="removeUser(key)"
                          >Remove</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-item-action>
              </v-list-item>
              <v-list-item
                v-for="(u, key) in $store.state.canvas.invites_sent"
                :key="key"
              >
                <v-list-item-action class="invite">
                  <v-icon medium>mail_outline</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title v-text="u"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
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
                          text
                          @click="showConfirmDeleteInvitation = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          class="blue--text darken-1"
                          text
                          @click="removeInvitation(key)"
                          >Remove</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-item-action>
              </v-list-item>

              <v-list-item v-if="$store.state.canvas.invite_request">
                <v-list-item-action>
                  <v-progress-circular
                    indeterminate
                    class="primary--text"
                  ></v-progress-circular>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $store.state.canvas.invite_request }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-dialog
              v-model="showDialogInvite"
              persistent
              style="display:block"
              max-width="500px"
            >
              <template v-slot:activator="{ on }">
                <v-list-item class="mt-2" ripple v-on="on">
                  <v-list-item-action title="Invite a person">
                    <v-icon>add_circle_outline</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>Invite a person</v-list-item-title>
                </v-list-item>
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
                    text
                    @click="showDialogInvite = false"
                    >Cancel</v-btn
                  >
                  <v-btn
                    class="blue--text darken-1"
                    text
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
      <span style="width: 200px"></span>
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
          <v-list-item avatar>
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
              <v-list-item-sub-title>
                {{ currentUser.email }}
              </v-list-item-sub-title>
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
        title += `${(this.$store.state.canvas &&
          this.$store.state.canvas.info.name) ||
          "Loading"} | `;
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
      return this.$store.state.canvas && this.$store.state.canvas.info.public
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
