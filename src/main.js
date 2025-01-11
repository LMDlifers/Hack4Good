import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const app = createApp(App);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    app.provide("currentUser", user); // Provide user globally
  } else {
    console.log("User is logged out.");
    app.provide("currentUser", null); // Clear global user
  }
});

app.use(router).mount("#app");
