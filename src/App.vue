<template>
  <v-app dark toolbar>
    <v-navigation-drawer class="drawer" overflow :mini-variant="mini" light persistent enable-resize-watcher v-model="drawer">
      <v-toolbar flat class="blue-grey darken-2" v-show="!mini">
        <v-toolbar-title>
          <router-link :to="{name: 'home'}">BM|Designer</router-link>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click.native.stop="mini = !mini">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <v-list-tile v-show="mini" @click.native.stop="mini = !mini">
          <v-list-tile-action>
            <v-icon light>chevron_right</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Home
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile exact :to="{name: 'home'}" v-ripple>
          <v-list-tile-action>
            <v-icon light>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Home
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="{name: 'favorites'}" v-show="isModelList" v-ripple>
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
            <v-icon light>question_answer</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Ideas & Feedback
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div v-if="$route.name === 'bmc'">

          <v-divider class="my-2"></v-divider>

          <v-list-group no-action v-model="item.active">
            <v-list-tile slot="item">
              <v-list-tile-action>
                <v-icon light>keyboard_arrow_down</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Colors</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(colorCode, colorId) in COLORS_MATERIAL_DARK" :key="colorId" v-show="colorsUsedInCanvas.has(colorId)"
            :class="colorCode">
            <v-slider :value="colorsVisibility[colorId]" @input="toggleColorVisibility($event, colorId)"></v-slider>

            </v-list-tile>
          </v-list-group>

          <v-btn-toggle class="red" mandatory :items="[{text: 'Free', value: 'free'}, {text: 'List', value: 'list'}]" :input-value="listModeText" @change="changeListMode"></v-btn-toggle>
          {{ $store.state.layout.listMode }}

          <v-divider class="my-2"></v-divider>

          <v-subheader class="mt-2 grey--text text--darken-1">COLLABORATORS</v-subheader>

          <v-list>
            <v-list-tile v-for="item in items2" :key="item.text" avatar v-ripple>
              <v-list-tile-avatar v-badge="{ value:'', overlap: true, left: true }">
                <img :src="`https://randomuser.me/api/portraits/men/${item.picture}.jpg`" alt="">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-text="item.text"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon v-bind:class="[item.active ? 'teal--text' : 'grey--text']">chat_bubble</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-divider class="my-2"></v-divider>

          <v-list-tile class="mt-2" v-ripple>
            <v-list-tile-action>
              <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
            </v-list-tile-action>
            <v-list-tile-title class="grey--text text--darken-1">Invite a person</v-list-tile-title>
          </v-list-tile>
          <v-list-tile v-ripple>
            <v-list-tile-action>
              <v-icon class="grey--text text--darken-1">settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-title class="grey--text text--darken-1">Manage Subscriptions</v-list-tile-title>
          </v-list-tile>
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
    <v-toolbar fixed class="blue-grey darken-2">
      <v-toolbar-side-icon @click.native.stop.prevent="drawer = !drawer"></v-toolbar-side-icon>
      <v-text-field class="ml-5" v-if="$route.name === 'home'" prepend-icon="search" hide-details single-line placeholder="Search your models"></v-text-field>
      <v-spacer></v-spacer>
      <transition name="title-fade-transition" mode="out-in">
        <v-toolbar-title :key="title">{{title}}</v-toolbar-title>
      </transition>
      <v-spacer></v-spacer>
      <v-btn primary>Sign in</v-btn>
      <!--
            <v-btn icon>
              <v-icon>more_vert</v-icon>
            </v-btn>
            -->
    </v-toolbar>
    <main>
      <v-container fluid style="position: relative">
        <router-view></router-view>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { COLORS_MATERIAL_DARK } from '@/utils';
import * as types from '@/store/mutation-types';
import { mapGetters } from 'vuex';

export default {
  name: 'app',
  data() {
    return {
      drawer: true,
      mini: false,
      right: true,
      items: [
        { icon: 'trending_up', text: 'Most Popular' },
        { icon: 'subscriptions', text: 'Subscriptions' },
        { icon: 'history', text: 'History' },
        { icon: 'featured_play_list', text: 'Playlists' },
        { icon: 'watch_later', text: 'Watch Later' },
      ],
      items2: [
        { picture: 28, text: 'Joseph' },
        { picture: 38, text: 'Apple' },
        { picture: 48, text: 'Xbox Ahoy' },
      ],
      item: {
        active: true,
        items: [
          { title: 'Breakfast & brunch', on: false },
          { title: 'New American', on: false },
          { title: 'Sushi', on: false },
        ],
      },
      COLORS_MATERIAL_DARK,
    };
  },
  computed: {
    ...mapGetters(['colorsUsedInCanvas']),
    title() {
      /*
      const type = this.$store.state.layout.showVPC ? 'Value Proposition Canvas'
      : 'Business Model Canvas';
      */
      return typeof this.$route.meta.title === 'string' ?
        this.$route.meta.title : this.$route.meta.title(this.$route);
    },
    listModeText() {
      return this.$store.state.layout.listMode ? 'list' : 'free';
    },
    isModelList() {
      return ['home', 'play', 'inspire', 'learn', 'favorites', 'about'].includes(this.$route.name);
    },
    colorsVisibility() {
      return this.$store.state.layout.colorsVisibility.map(opacity => opacity * 100);
    },
  },
  methods: {
    changeListMode(data) {
      this.$store.state.layout.listMode = data === 'list';
    },
    toggleColorVisibility(value, colorId) {
      const newArray = this.$store.state.layout.colorsVisibility.slice(0);
      newArray[colorId] = parseFloat(value) / 100.0;
      this.$store.commit(types.LAYOUT_UPDATE, {
        colorsVisibility: newArray,
      });
    },
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

.list--group__header--active .list__tile .list__tile__action .icon {
  transform: rotateZ(-180deg);
}

</style>
