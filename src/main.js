// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueTimeago from 'vue-timeago';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import App from './App';
import router from './router';
import store from './store';

Vue.use(Vuetify);
Vue.use(VueTimeago, {
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    // eslint-disable-next-line
    'en-US': require('vue-timeago/locales/en-US.json'),
  },
});

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
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error. html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
    ],
    ignoreUrls: [
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i,  // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],
  })
  .addPlugin(RavenVue, Vue)
  .install();

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
