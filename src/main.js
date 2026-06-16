import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

import router from "./router/router.js";
import { createPinia } from "pinia";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

function setupGoogleAnalytics(router) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const enabled = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

  if (!enabled || !gaId) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    gaId
  )}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag("js", new Date());

  // Evita doble page_view inicial en SPA
  gtag("config", gaId, {
    send_page_view: false,
  });

  router.afterEach((to) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");

    gtag("event", "page_view", {
      page_title: document.title,
      page_path: `${base}${to.fullPath}`,
      page_location: window.location.href,
    });
  });
}

const app = createApp(App);
const pinia = createPinia();

setupGoogleAnalytics(router);

app.use(pinia);
app.use(router);

app.component("VueDatePicker", VueDatePicker);

router.isReady().then(() => {
  app.mount("#app");
});