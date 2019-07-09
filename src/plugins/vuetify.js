import Vue from "vue";
import Vuetify from "vuetify/lib";
import "./theme.styl";
import colors from "vuetify/es5/util/colors";

Vue.use(Vuetify, {
  iconfont: "md",
  theme: {
    primary: colors.teal.lighten1,
    accent: colors.blue.accent2,
    secondary: colors.grey.darken3,
    info: colors.blue.base,
    warning: colors.amber.base,
    error: colors.red.accent2,
    success: colors.green.base
  }
});
