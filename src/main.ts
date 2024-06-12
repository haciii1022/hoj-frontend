import { createApp } from "vue";
import App from "./App.vue";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import router from "./router";
import store from "./store";
import "./access";
// 额外引入图标库
import ArcoVueIcon from "@arco-design/web-vue/es/icon";

const app = createApp(App);
app.use(ArcoVue);
app.use(router);
app.use(store);
app.use(ArcoVueIcon);
app.mount("#app");
