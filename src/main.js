import { createApp } from 'vue';
import App from './App.vue';
import './firebase'; 
import router from './router';

createApp(App).use(router).mount('#app');
