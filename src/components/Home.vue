<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-btn v-if="$store.state.currentUser" color="primary" fab primary class="floating-action" @click.native="createNewCanvas">
        <v-icon>add</v-icon>
      </v-btn>
      <v-flex xs12 sm6 md4 xl3 v-for="({info, settings={}, key}) in projects" :key="key">
        <v-card class="model">
          <v-card-media @click.native="$router.push({name:'bmc', params: {id: key}})"
          :contain="!!info.logoImage"
          :class="{'default-background': !info.logoImage, 'fix-white': info.logoColor == 'rgb(255, 255, 255)' }"
          :style="{'background-color': info.logoColor ? info.logoColor : colorHash(info.name)}"
          :src="info.logoImage ? info.logoImage : require('@/assets/default_bmc_logo_background.jpg')">
            <div class="left-icons" v-if="info.updatedAt">
              <v-icon>
                event_note
              </v-icon>
              <timeago :since="info.updatedAt"></timeago>
            </div>
            <div class="right-icons">
              <v-badge bottom overlap>
                <span slot="badge">{{info.stickyCount || 0}}</span>
                <v-icon>note</v-icon>
              </v-badge>
              <v-badge bottom overlap>
                <span slot="badge">{{info.usersCount || 1}}</span>
                <v-icon>account_box</v-icon>
              </v-badge>
              <v-spacer></v-spacer>
              <v-icon v-if="info.public" title="public">public</v-icon>
              <v-icon v-if="!info.public" title="private">lock</v-icon>
            </div>
            <v-container fill-height fluid>
              <v-layout fill-height align-end>
                <v-flex  xs12 class="headline white--text">{{info.name}}</v-flex>
              </v-layout>
            </v-container>
          </v-card-media>
          <v-card-actions class="white">
            <v-btn icon light @click.native="toggleFav(key, !settings.fav)">
              <v-icon :color="settings.fav ? 'primary' : 'grey'">favorite</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" :to="{name:'bmc', params: {id: key}}">Open</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ColorHash from 'color-hash';
import { mapActions, mapState } from 'vuex';

const colorHash = new ColorHash({
  saturation: [0.35, 0.4],
  lightness: [0.6, 0.65],
});

export default {
  name: 'home',
  computed: {
    ...mapState({
      user: 'user',
    }),
    projects() {
      const projects = Object.keys(this.user.projects || {}).map((key) => {
        const p = this.user.projects[key];
        p.key = key;
        return p;
      }).filter((p) => {
        if (this.$route.name === 'favorites') {
          return p.settings.fav;
        }
        if (this.$route.name === 'inspire') {
          // only show user's current games
          return p.isGame;
        }
        return true;
      });

      if (this.$route.name === 'inspire') {
        // append public game starers?
      }

      projects.sort((a, b) => new Date(b.info.updatedAt) - new Date(a.info.updatedAt));
      return projects;
    },
  },
  methods: {
    ...mapActions(['createNewCanvas', 'canvasInfoUpdate', 'canvasUserSettingsUpdate']),
    colorHash(input) {
      return colorHash.hex(input);
    },
    toggleFav(canvasKey, fav) {
      this.canvasUserSettingsUpdate({
        fav,
        canvasKey,
      });
    },
  },
};
</script>

<style>

.model .headline {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.60);
}

.model .card__media {
  height: 160px !important;
}

.model .card__media__background {
  opacity: 0.8;
}

.model .default-background .card__media__background {
  opacity: 0.5;
  background-position: 0 0 !important;
}

.model .fix-white .card__media__content{
  background-color: rgba(69, 89, 100, 0.33);
}

.model .badge--overlap.badge--bottom:after {
  font-size: 12px;
  height: 18px;
  width: 18px;
}

.model .right-icons {
  position: absolute;
  top: 0px;
  right: 15px;
  bottom: 4px;
  display: flex;
  flex-direction: column;
}

.model .left-icons {
  position: absolute;
  top: 5px;
  left: 10px;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.65);
}

.model .card__media .icon {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.floating-action {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1;
}
</style>
