// Import necessary modules and components
import { createApp } from 'vue';
import App from './App.vue'; // Main App component
import router from './router'; // Vue Router

// Create and mount the Vue application
const app = createApp(App);

// Use the router
app.use(router);

// Mount the app to the DOM
app.mount('#app');
