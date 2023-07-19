import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import "primevue/resources/primevue.min.css";
import "primeflex/primeflex.min.css";
import "primeicons/primeicons.css";
import "@/assets/w3.css";

import { QBApi } from "@/lib/qb/qb-api";
import { QBLogic } from "@/lib/qb/qb-logic";
import { QBStorage } from "@/lib/qb/qb-storage";
import { QBDs } from "@/lib/qb/qb-ds";

const  app = createApp(App)

console.log(window.location.origin)
console.log(window.location.host)
console.log(window.location.hostname)

app.config.globalProperties.$pv_origin = window.location.origin;
app.config.globalProperties.$pv_hostname = window.location.hostname;
app.config.globalProperties.$pv_port = window.location.port;

app.config.globalProperties.$pv_qb_api_port = "5556";
app.config.globalProperties.$pv_qb_logic_port = "6019";
app.config.globalProperties.$pv_qb_storage_port = "6002";
app.config.globalProperties.$pv_qb_ds_port = "2002";

app.config.globalProperties.$qb_api = new QBApi(app.config.globalProperties.$pv_hostname, app.config.globalProperties.$pv_qb_api_port);
app.config.globalProperties.$qb_logic = new QBLogic(app.config.globalProperties.$pv_hostname, app.config.globalProperties.$pv_qb_logic_port);
app.config.globalProperties.$qb_storage = new QBStorage(app.config.globalProperties.$pv_hostname, app.config.globalProperties.$pv_qb_storage_port);
app.config.globalProperties.$qb_ds = new QBDs(app.config.globalProperties.$pv_hostname, app.config.globalProperties.$pv_qb_ds_port);
app.use(createPinia())
    .use(router)
    .use(ToastService)
    .use(PrimeVue, { ripple: true })
    .directive("tooltip", Tooltip)
    .mount('body')