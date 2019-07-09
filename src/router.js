import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/Home";
import Learn from "@/components/Learn";
import Play from "@/components/Play";
import About from "@/components/About";
import Login from "@/components/Login";
import BMC from "@/components/BMC";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { title: "Home" }
    },
    {
      path: "/login/:inviteCode?",
      name: "login",
      component: Login,
      meta: { title: "Login" }
    },
    {
      path: "/favorites",
      name: "favorites",
      component: Home,
      meta: { title: "Favorites" }
    },
    {
      path: "/inspire",
      name: "inspire",
      component: Home,
      meta: { title: "Inspire" }
    },
    {
      path: "/learn",
      name: "learn",
      component: Learn,
      meta: { title: "Learn" }
    },
    {
      path: "/play",
      name: "play",
      component: Play,
      meta: { title: "Play" }
    },
    {
      path: "/about",
      name: "about",
      component: About,
      meta: { title: "Ideas & Feedback" }
    },
    {
      path: "/bmc/:id/:zoom1?/:zoom2?",
      name: "bmc",
      component: BMC,
      meta: { title: "" }
    },
    {
      path: "/print/:id",
      name: "print",
      component: BMC,
      meta: { title: "" }
    }
  ]
});
