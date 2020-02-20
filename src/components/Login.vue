<template>
  <v-row>
    <v-col md="6" offset-md="3" class="mt-3">
      <v-card>
        <v-alert type="info" :value="hasInviteToken && !$store.state.currentUser">
          Login or create an account to which you want to add the shared
          Business Model Canvas.
        </v-alert>
        <v-alert type="success" :value="hasInviteToken && !!$store.state.currentUser">
          Please wait you will be redirected to your new canvas.
        </v-alert>
        <div
          id="firebaseui-auth-container"
          v-show="!$store.state.currentUser"
        ></div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { startLoginUI } from "@/utils/firebase";

export default {
  name: "login",
  data() {
    return {
      hasInviteToken: false
    };
  },
  mounted() {
    this.hasInviteToken = !!localStorage.getItem("inviteToken");
    startLoginUI();
  }
};
</script>

<style>
.mdl-card.mdl-shadow--2dp.firebaseui-container {
  box-shadow: none;
}
</style>
