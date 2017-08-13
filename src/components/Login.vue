<template>
  <div>
    <v-layout row>
      <v-flex md6 offset-md3>
        <v-card>
          <v-alert info :value="hasInviteToken">
            Login or create an account to which you want to add the shared Business Model Canvas.
          </v-alert>
          <div id="firebaseui-auth-container" v-show="!$store.state.currentUser"></div>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { startLoginUI } from '@/utils/firebase';

export default {
  name: 'login',
  data() {
    return {
      hasInviteToken: false,
    };
  },
  mounted() {
    this.hasInviteToken = localStorage.getItem('inviteToken');
    startLoginUI();
  },
};
</script>

<style>
.mdl-card.mdl-shadow--2dp.firebaseui-container.firebaseui-id-page-sign-in {
  box-shadow: none;
}
</style>
