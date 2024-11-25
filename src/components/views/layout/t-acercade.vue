<template>
  <div>
    <div
      v-show="showContent"
      class="z-10 relative bg-white px-4 sm:px-20 md:px-20 lg:px-20 xl:px-20 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
    >
      <theader></theader>
    </div>
    <div
      class="fixed inset-0 bg-cover bg-[#14212b] h-full w-full flex items-center bg-no-repeat"
    >
      <div class="points-container absolute inset-0 z-0">
        <div
          v-for="(dot, index) in dots"
          :key="index"
          class="dot absolute"
          :style="dot.style"
        ></div>
      </div>
      <!-- Imagen central pequeña con efecto de zoom y movimiento a la derecha -->
      <div class="globe zoom-animation" :class="imageClass">
        <img
          v-show="!showImageInGlobe"
          src="/img/globo.gif"
          alt="Descripción del GIF"
          class="object-cover large-image"
        />
      </div>
    </div>
    <!-- Contenido que aparece con efecto de barras aleatorias -->
    <main
      v-show="showContent"
      class="grid grid-cols-12 md:grid-cols-12 transition-opacity duration-1000 relative"
      style="height: calc(100vh - 4.25rem)"
    >
      <div class="col-span-6 py-8 pl-28 bg-center bg-cover">
        <div
          class="grid grid-cols-12 pt-16 rounded-2xl select-none bg-center bg-cover"
        >
          <!-- Texto de bienvenida con animación de barras -->
          <p
            class="col-span-12 text-igp-white text-7xl md:text-8xl font-bold leading-none fade-bar"
            style="--delay: 0.1s"
          >
            Perú Sísmico
            <br />
        
          </p>

          <p
            class="col-span-12 font-semibold pt-4 text-igp-white text-sm sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3 fade-bar"
            style="line-height: 2; --delay: 0.3s"
          >
            PerúSis es una plataforma digital de observación sísmica
            desarrollada por el Instituto Geofísico del Perú (IGP) a fin de ofrecer
            el acceso espacio-temporal a la actividad sísmica ocurrida en el Perú y
            en el mundo, de manera visual e interactiva.
          </p>
          <p
            class="col-span-12 font-semibold pt-4 text-igp-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3 fade-bar"
            style="line-height: 2; --delay: 0.5s"
          >
            Con una interfaz intuitiva, PerúSis permite filtrar sismos por
            fecha, región, magnitud y profundidad, facilitando el análisis y
            consulta de eventos sísmicos. Esto la convierte en una herramienta
            clave para conocer las regiones potencialmente sísmicas y aportar a la
            gestión del riesgo de desastres y a la educación.
          </p>
         
          <div
            class="col-span-12 flex flex-col md:flex-row py-6 mt-10 fade-bar"
            style="--delay: 0.9s"
          >
            <router-link
              to="/visor"
              class="bg-[#001EB2] text-igp-white px-[5.6rem] hover:text-[#001EB2] hover:border-[#001EB2] hover:bg-igp-white shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Iniciar
            </router-link>
            <router-link
              to="/creditos"
              class="bg-none text-igp-white px-20 hover:bg-igp-white hover:border-[#001EB2] hover:text-[#001EB2] border ml-4 border-igp-white shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Créditos
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-span-6 flex justify-center items-center">
        <div class="globe w-full h-full" ref="globeContainer">
          <!-- Imagen final que aparece en el globo -->
          <img
            v-show="showImageInGlobe"
            src="/img/globo.gif"
            alt="Imagen Final en Globo"
            class="w-full h-full large-image"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import theader from "@/components/ui/atoms/t-header.vue";
import { ref, onMounted, reactive } from "vue";

const dots = reactive([]);

const showContent = ref(false); // Controla el contenido principal
const showImageInGlobe = ref(false); // Controla cuándo mostrar la imagen final en el globo
const imageClass = ref("zoom-animation");

function generateDots(count) {
  for (let i = 0; i < count; i++) {
    const randomX = Math.random() * 100; // Porcentaje para posición horizontal
    const randomY = Math.random() * 100; // Porcentaje para posición vertical
    const randomSize = Math.random() * 10 + 5; // Tamaño aleatorio entre 5px y 15px
    const imageUrl = "https://via.placeholder.com/10"; // URL de fondo

    dots.push({
      style: {
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: `3px`,
        height: `3px`,
        position: "absolute",
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        borderRadius: "50%",
      },
    });
  }
}

onMounted(() => {
  generateDots(100);
  setTimeout(() => {
    imageClass.value = "zoom-right-large";
    setTimeout(() => {
      showContent.value = true;
      showImageInGlobe.value = true;
    }, 2000); // Tiempo para que aparezca el contenido
  }, 1000);
});
</script>

<style scoped>
.globe {
  /* Asegura que el contenedor sea cuadrado para que el borde redondeado forme un círculo */
  width: fit-content;
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  width: 70%;
}

.zoom-animation {
  transform: scale(0.3); /* Imagen pequeña centrada */
  transition: transform 1s ease;
  width: 80%;
  margin-top:199px ;

}

.zoom-right-large {
  transform: scale(1) translateX(43%); /* Zoom a tamaño completo y mueve a la derecha */
  transition: transform 2s ease;
}

.fade-bar {
  opacity: 0;
  transform: translateY(50px); /* Efecto de barra hacia arriba */
  animation: fadeInBars 1.5s ease forwards;
  animation-delay: var(--delay);
}

.large-image {
  transform: scale(1); /* Ajusta el valor para hacerlo más grande */
  transition: transform 0.5s ease; /* Añade una transición si deseas suavizar el efecto */
}

@keyframes fadeInBars {
  from {
    opacity: 0;
    transform: translateY(30px); /* Empieza más abajo */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* Posición final */
  }
}
.dot {
  transition: transform 0.5s ease-in-out;
}

.theader-animation {
  opacity: 0;
  transform: translateY(-100px); /* Comienza fuera de la pantalla */
  animation: slideDown 1.5s ease forwards; /* Duración y efecto */
  animation-delay: 0s; /* Sincroniza con el globo */
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-80px);
  }
  to {
    opacity: 1;
    transform: translateY(0); /* Posición final */
  }
}
</style>
