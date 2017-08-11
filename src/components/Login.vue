<template>
  <div>
    <div id="firebaseui-auth-container" v-show="!$store.state.currentUser"></div>
  </div>
</template>

<script>
import { startLoginUI } from '@/utils/firebase';

export default {
  name: 'login',
  mounted() {
    startLoginUI();
  },
};
</script>

<style>

</style>
