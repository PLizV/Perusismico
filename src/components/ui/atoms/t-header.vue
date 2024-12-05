<template>
  <div>
    <div
      class="gap-x-1 h-[3rem] sm:h-[3.25rem] md:h-[3.75rem] lg:h-[4rem] xl:h-[4.25rem] 2xl:h-[4.25rem] flex items-center cursor-default select-none"
    >
      <div>
        <img
          alt="logo_minam"
          class="w-[8.2rem] sm:w-[8.5rem] md:w-[8.5rem] lg:w-[9rem] xl:w-[10rem] 2xl:w-[11rem]"
          src="/img/logo_minam.png"
        />
      </div>
      <div class="ml-4">
        <img
          alt="logo_minam"
          class="w-[5.5rem] sm:w-[5.5rem] md:w-[5.6rem] lg:w-[6rem] xl:w-[6.5rem] 2xl:w-[7.3rem]"
          src="/img/logo_igp.png"
        />
      </div>
      <router-link
        :to="{ name: 'acercade' }"
        class="text-md sm:text-md md:text-md lg:text-md xl:text-lg 2xl:text-lg hidden h-full items-center justify-center ml-10 cursor-pointer z-50 outline-none font-light sm:hidden md:hidden lg:flex xl:flex 2xl:flex"
        :class="{
          ' bg-igp-blue bg-opacity-10 text-igp-blue px-3 border-igp-blue cursor-default':
            $route.name === 'acercade',
          ' hover:bg-igp-blue hover:bg-opacity-10 h-full px-3 cursor-pointer text-igp-dark-500 hover:text-igp-blue hover:border-igp-blue ':
            $route.name !== 'acercade',
        }"
      >
        <iconthome class="h-4 mr-3"></iconthome>
        Acerca de PerúSis
      </router-link>
      <router-link
        :to="{ name: 'geovisor' }"
        class="text-md sm:text-md md:text-md lg:text-md xl:text-lg 2xl:text-lg hidden h-full items-center justify-center ml-8 outline-none font-light sm:hidden md:hidden lg:flex xl:flex 2xl:flex"
        :class="{
          ' bg-igp-blue bg-opacity-10 text-igp-blue px-3 border-igp-blue cursor-default':
            $route.name === 'geovisor',
          ' hover:bg-igp-blue hover:bg-opacity-10 px-3 h-full cursor-pointer text-igp-dark-500 hover:text-igp-blue hover:border-igp-blue ':
            $route.name !== 'geovisor',
        }"
      >
        <iconworld class="h-5 mr-3"></iconworld>
        Visor PerúSis
      </router-link>
      <button
        @click="showModal"
        class="text-md sm:text-md md:text-md lg:text-md xl:text-lg 2xl:text-lg hidden h-full items-center justify-center ml-8 outline-none font-light sm:hidden md:hidden lg:flex xl:flex 2xl:flex hover:bg-igp-blue hover:bg-opacity-10 px-3 cursor-pointer text-igp-dark-500 hover:text-igp-blue hover:border-igp-blue"
      >
        <iconteam class="h-5 mr-3"></iconteam>
        Creditos
      </button>
      <div class="ml-auto">
        <button
          @click="toggleContent"
          type="button"
          class="inline-flex border-2 border-igp-muted ml-auto items-center p-2 w-8 h-8 sm:w-9 sm:h-9 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <svg
            class="sm:w-4 sm:h-4 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div
          v-show="showContent"
          class="fixed right-4 sm:right-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
        >
          <ul class="py-1" id="contenido">
            <li class="px-2 py-1 text-gray-700 hover:bg-gray-100">
              <router-link
                :to="{ name: 'acercade' }"
                class="text-xs flex items-center cursor-pointer outline-none font-light sm:flex md:flex lg:hidden xl:hidden 2xl:hidden"
                :class="{
                  'text-igp-blue cursor-default': $route.name === 'acercade',
                  '  h-full cursor-pointer text-igp-dark-500 hover:text-igp-blue  ':
                    $route.name !== 'acercade',
                }"
              >
                <iconthome class="h-3 mr-2"></iconthome>
                Acerca de PerúSis
              </router-link>
            </li>
            <li class="px-2 py-1 text-gray-700 hover:bg-gray-100">
              <router-link
                :to="{ name: 'geovisor' }"
                class="text-xs flex h-full items-center outline-none font-light sm:flex md:flex lg:hidden xl:hidden 2xl:hidden"
                :class="{
                  'text-igp-blue cursor-default': $route.name === 'geovisor',
                  '  h-full cursor-pointer text-igp-dark-500 hover:text-igp-blue  ':
                    $route.name !== 'geovisor',
                }"
              >
                <iconworld class="h-[14px] mr-[7px]"></iconworld>
                Visor PerúSis
              </router-link>
            </li>
            <li class="px-2 py-1 text-gray-700 hover:bg-gray-100">
              <button
                @click="showModal"
                class="text-xs flex items-center outline-none font-light sm:flex md:flex lg:hidden xl:hidden 2xl:hidden hover:bg-igp-blue hover:bg-opacity-10 h-full cursor-pointer text-igp-dark-500 hover:text-igp-blue hover:border-igp-blue"
              >
                <iconteam class="h-[14px] mr-[7px]"></iconteam>
                Creditos
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="text-lg roun"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import iconthome from "@/assets/icons/iconhome.vue";
import iconworld from "@/assets/icons/world.vue";
import iconteam from "@/assets/icons/team.vue";
import Swal from "sweetalert2";

const showContent = ref(false);

function toggleContent() {
  showContent.value = !showContent.value;
}
function handleClickOutside(event) {
  const menu = document.getElementById("contenido");
  if (menu && !menu.contains(event.target) && !event.target.closest("button")) {
    showContent.value = false;
  }
}
function handleWheel(event) {
  showContent.value = false;
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("wheel", handleWheel);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("wheel", handleWheel);
});

const showModal = () => {
  Swal.fire({
    title:
      '<span class="text-igp-blue text-2xl font-semibold">Créditos de PerúSis</span>', // Título con color personalizado
    html: `
      <p class="text-start text-sm">Perú Sísmico es una plataforma desarrollada bajo la dirección del <strong>Dr. Hernando Tavera</strong>, investigador científico, 
      junto con el equipo de innovación digital del Instituto Geofísico del Perú (IGP). Este proyecto busca reducir el riesgo de desastres y contribuir a la educación en el país.</p>

      <p class="text-start text-sm pt-2">La plataforma integra datos del Centro Sismológico Nacional (CENSIS) a cargo del IGP y del National Earthquake Information 
      Center (NEIC) de la U.S. Geological Survey (USGS) de los EEUU.</p>
      <p class="text-start text-sm pt-2" >Lima, diciembre de 2024.</p>
    `,
    width: "400px",

    confirmButtonText: "Aceptar", // Cambiar el texto del botón a "Aceptar"
    confirmButtonColor: "#0032FF",
  });
};
</script>
<style>
.swal2-popup.swal2-modal.animate__animated.animate__fadeInUp.animate__faster {
  border-color: blue;
  box-shadow: 0px 0px 20px 0px #00255e1a;
  width: 800px !important;
  border-radius: 1rem;
}
</style>