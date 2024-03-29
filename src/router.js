import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/components/Home";
import Learn from "@/components/Learn";
import Play from "@/components/Play";
import About from "@/components/About";
import Login from "@/components/Login";
import BMC from "@/components/BMC";
import CustomCanvas from "@/components/CustomCanvas";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
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
      path: "/canvas/:id",
      name: "canvas",
      component: CustomCanvas,
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
