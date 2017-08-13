<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-btn v-if="$store.state.currentUser" fab primary dark class="floating-action" @click.native="createNewCanvas">
        <v-icon>add</v-icon>
      </v-btn>
      <v-flex sm6 md4 xl3 v-for="({info, settings}, key) in user.projects" :key="key" v-if="isShown(info, settings)">
        <v-card class="model">
          <v-card-media @click.native="$router.push({name:'bmc', params: {id: key}})" :contain="!!info.logoImage" :class="{'default-background': !info.logoImage}" :style="{'background-color': info.logoColor ? info.logoColor : colorHash(info.name)}" :src="info.logoImage ? info.logoImage : require('@/assets/default_bmc_logo_background.jpg')">
            <div class="left-icons" v-if="info.updatedAt">
              <v-icon>
                event_note
              </v-icon>
              <timeago :since="info.updatedAt"></timeago>
            </div>
            <div class="right-icons">
              <v-icon v-badge="{value: info.itemsCount || 0, overlap: true, bottom: true}">
                note
              </v-icon>
              <v-icon v-badge="{value: info.usersCount || 1, overlap: true, bottom: true}">
                account_box
              </v-icon>
            </div>
            <v-container fill-height fluid>
              <v-layout fill-height>
                <v-flex xs12 align-end flexbox>
                  <span class="headline white--text">{{info.name}}</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-media>
          <v-card-actions class="white">
            <v-btn icon light @click.native="toggleFav(key, !settings.fav)">
              <v-icon :primary="settings.fav">favorite</v-icon>
            </v-btn>
            <v-btn icon light>
              <v-icon>share</v-icon>
            </v-btn>
            <v-btn icon light v-if="info.public">
              <v-icon primary>public</v-icon>
            </v-btn>
            <v-btn icon light v-if="!info.public">
              <v-icon>lock</v-icon>
            </v-btn>
            <v-btn icon light>
              <v-icon>content_copy</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn flat primary :to="{name:'bmc', params: {id: key}}">Open</v-btn>
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
  },
  methods: {
    ...mapActions(['createNewCanvas', 'canvasUserSettingsUpdate']),
    colorHash(input) {
      return colorHash.hex(input);
    },
    isShown(info, settings) {
      if (this.$route.name === 'favorites') {
        return settings.fav;
      }
      return true;
    },
    toggleFav(key, fav) {
      this.canvasUserSettingsUpdate({
        fav,
        key,
      });
    },
  },
};
</script>

<style>

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

.model .badge--overlap.badge--bottom:after {
  font-size: 12px;
  height: 18px;
  width: 18px;
}

.model .right-icons {
  position: absolute;
  top: 0px;
  right: 15px;
  display: flex;
  flex-direction: column;
}

.model .left-icons {
  position: absolute;
  top: 5px;
  left: 10px;
  color: #fff;
}

.model .card__media .icon {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.7);
}

.floating-action {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1;
}
</style>
