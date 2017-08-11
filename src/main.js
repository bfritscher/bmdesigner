// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueTimeago from 'vue-timeago';
import humanFormat from 'human-format';
import { auth, db } from '@/utils/firebase';
/*
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
*/

import App from './App';
import router from './router';
import store from './store';

Vue.use(Vuetify);
Vue.use(VueTimeago, {
  locale: 'en-US',
  locales: {
    // eslint-disable-next-line
    'en-US': require('vue-timeago/locales/en-US.json'),
  },
});

Vue.filter('humanformat', input => (isNaN(input) ? input : humanFormat(input)));
/*
Raven
  .config('https://a3e9d60494a249d4bba6e6244380e411@sentry.j42.org/15', {
    environment: process.env.NODE_ENV,
    release: 'TODO',
    shouldSendCallback: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(data);
        return false;
      }
      return true;
    },
  })
  .addPlugin(RavenVue, Vue)
  .install();
  */

Vue.config.productionTip = false;


const INVITE_TOKEN = 'inviteToken';

router.afterEach((to) => {
  if (to.name === 'login' && to.params.inviteCode) {
    localStorage.setItem(INVITE_TOKEN, to.params.inviteCode);
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  // Our earliest lifecycle hook
  beforeCreate() {
    auth.onAuthStateChanged((user) => {
      this.$store.commit('CURRENT_USER', user);
      if (user) {
        this.$store.dispatch('setUserRef', db.child('users').child(user.uid));
        const inviteCode = localStorage.getItem(INVITE_TOKEN);
        if (inviteCode) {
          const [projectUid, token] = inviteCode.split(':');
          const body = {
            userUid: user.uid,
            projectUid,
            token,
          };
          fetch('https://us-central1-bmdesigner-50d6c.cloudfunctions.net/acceptInvite',
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              method: 'POST',
              body: JSON.stringify(body),
            })
            .then((res) => {
              if (res.status === 200) {
                this.$router.push({ name: 'bmc', params: { id: projectUid } });
                localStorage.removeItem(INVITE_TOKEN);
              }
            });
        } else if (this.$route.name === 'login') {
          this.$router.push({ name: 'home' });
        }
      }
    });
  },
});
