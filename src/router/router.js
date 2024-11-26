import { createRouter, createWebHistory } from "vue-router";
//ACERCA DE
import acercade from "@/components/views/layout/t-acercade.vue";
// GEOVISOR
import geovisor from "@/components/views/layout/t-geovisor.vue";
// CREDITOS
// PAGINAS DE ERROR
import errorNotFound from "@/components/views/pages/errorNotFound.vue";
import accessDenied from "@/components/views/pages/accessDenied.vue";

const linkAccess = import.meta.env.VITE_PUBLIC_PATH;
const routes = [
  { path: "/", name: "acercade", component: acercade },
  { path: "/visor", name: "geovisor", component: geovisor },
  { path: "/:catchAll(.*)*", component: errorNotFound },
  { path: "/acceso-denegado", component: accessDenied },
];
const router = createRouter({
  history: createWebHistory(linkAccess),
  routes,
  pathToRegexpOptions: {
    sensitive: true,
  },
});

// router.beforeEach(async (to, from, next) => {
//     const requireAuth = to.meta.auth;
//     const requiredRole = to.meta.role;
//     const userStore = useUserStore();

//     if (!userStore.token) {
//         await userStore.refreshToken();
//     }

//     if (!userStore.token) {
//         if (requireAuth || sessionStorage.getItem('user')) {
//             return next("/"); // Redirigir a la página de inicio si no hay token de autenticación
//         } else {
//             return next();
//         }
//     }

//     await userStore.listOneUser();

//     const userRole = userStore.userRango;

//     if (requiredRole && userRole !== requiredRole) {
//         return next("/acceso-denegado");
//     }

//     return next();
// });

export default router;
