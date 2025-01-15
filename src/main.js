import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const app = createApp(App);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is authenticated:", user);
    if (router.currentRoute.value.path === "/login" || router.currentRoute.value.path === "/signup") {
      router.push("/dashboard"); // Redirect to dashboard if authenticated
    }
  } else {
    console.log("User is not authenticated");
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push("/login"); // Redirect to login if route requires authentication
    }
  }
});


app.use(router).mount("#app");
