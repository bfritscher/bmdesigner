<template>
  <v-app dark toolbar>
    <v-navigation-drawer class="drawer" absolute overflow :mini-variant="mini" light persistent enable-resize-watcher v-model="drawer">
      <v-toolbar flat class="blue-grey darken-2" v-show="!mini">
        <v-toolbar-title>
          <router-link :to="{name: 'home'}">BM|DESIGNER</router-link>
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
        <v-list-tile exact :to="{name: 'home'}">
          <v-list-tile-action>
            <v-icon light>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Home
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile replace :to="{name: 'inspire'}">
          <v-list-tile-action>
            <v-icon light>lightbulb_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Inspire
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile replace :to="{name: 'learn'}">
          <v-list-tile-action>
            <v-icon light>school</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Learn
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile replace :to="{name: 'about'}">
          <v-list-tile-action>
            <v-icon light>question_answer</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              About
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div  v-if="$route.name === 'bmc'">

        <v-divider class="my-2"></v-divider>

        <v-btn-toggle class="red" mandatory
           :items="[{text: 'Free', value: 'free'}, {text: 'List', value: 'list'}]"
           :input-value="listModeText" @change="changeListMode"></v-btn-toggle>
        {{ $store.state.layout.listMode }}

        <v-divider class="my-2"></v-divider>

        <v-subheader class="mt-2 grey--text text--darken-1">COLLABORATORS</v-subheader>

        <v-list>
          <v-list-tile v-for="item in items2" :key="item.text" avatar>
            <v-list-tile-avatar v-badge="{ value:'', overlap: true, left: true }">
              <img :src="`https://randomuser.me/api/portraits/men/${item.picture}.jpg`" alt="">
            </v-list-tile-avatar>
            <v-list-tile-title v-text="item.text"></v-list-tile-title>
          </v-list-tile>
        </v-list>

        <v-divider class="my-2"></v-divider>

        <v-list-tile class="mt-2">
          <v-list-tile-action>
            <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-title class="grey--text text--darken-1">Invite a person</v-list-tile-title>
        </v-list-tile>
        <v-list-tile>
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
      <v-toolbar-side-icon  @click.native.stop.prevent="drawer = !drawer"></v-toolbar-side-icon>
      <v-text-field class="ml-5" v-if="$route.name === 'home'" append-icon="search" hide-details single-line></v-text-field>
      <v-spacer></v-spacer>
      <transition v-if="$route.name === 'bmc'" name="title-fade-transition" mode="out-in">
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
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
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
    };
  },
  computed: {
    title() {
      const type = this.$store.state.layout.showVPC ? 'Value Proposition Canvas' : 'Business Model Canvas';
      return `Test 123 - ${type}`;
    },
    listModeText() {
      return this.$store.state.layout.listMode ? 'list' : 'free';
    },
  },
  methods: {
    changeListMode(data) {
      console.log(data);
      this.$store.state.layout.listMode = data === 'list';
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

</style>
