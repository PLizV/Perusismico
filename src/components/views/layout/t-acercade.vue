<template>
  <div>
    <div
      v-show="showContent"
      class="z-10 relative bg-white px-4 sm:px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
    >
      <theader></theader>
    </div>
    <div
      id="acercade"
      class="fixed inset-0 bg-cover h-full w-full flex items-center bg-no-repeat"
    >
      <div class="points-container absolute inset-0 z-0">
        <div
          v-for="(dot, index) in dots"
          :key="index"
          class="dot bg-igp-white"
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
      class="grid grid-cols-12 transition-opacity duration-1000 relative"
      style="height: calc(100vh - 4.25rem)"
    >
      <div
        class="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6 px-10 sm:px-20 md:px-10 lg:px-12 xl:px-20 2xl:px-32 bg-center bg-cover order-2 sm:order-2 md:order-1 lg:order-1 xl:order-1 1xl:order-1 flex justify-center items-start sm:items-start md:items-center lg:items-center xl:items-center 2xl:items-center"
      >
        <div
          class="grid grid-cols-12 pt-16 rounded-2xl select-none bg-center bg-cover"
        >
          <!-- Texto de bienvenida con animación de barras -->
          <p
            class="col-span-12 text-igp-white text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-none fade-bar mb-6"
            style="--delay: 0.1s"
          >
            PeruSis
          </p>
          <p
            class="col-span-12 text-igp-white text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal italic leading-none fade-bar"
            style="--delay: 0.1s"
          >
            Perú Sísmico
          </p>
          <p
            class="col-span-12 font-semibold pt-4 text-igp-white text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-lg mt-3 fade-bar"
            style="line-height: 2; --delay: 0.3s"
          >
            PeruSis es una plataforma digital de observación sísmica
            desarrollada por el Instituto Geofísico del Perú (IGP), para ofrecer
            acceso espacio-tiempo a la actividad sísmica ocurrida en el Perú y
            el mundo de manera visual e interactiva.
          </p>
          <p
            class="col-span-12 font-semibold pt-4 text-igp-white text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-lg mt-3 fade-bar"
            style="line-height: 2; --delay: 0.5s"
          >
            Con una interfaz intuitiva, PeruSis permite seleccionar sismos por
            región, fecha, magnitud y profundidad, lo cual facilita su análisis.
            Esto la convierte en una herramienta clave para identificar regiones
            potencialmente sísmicas y contribuir con información para fortalecer
            la educación en temas sísmicos.
          </p>

          <div
            class="col-span-12 flex flex-col md:flex-row mt-10 fade-bar"
            style="--delay: 0.9s"
          >
            <router-link
              to="/visor"
              class="bg-igp-white font-semibold text-igp-blue px-[5.6rem] boder-igp-white border hover:text-igp-white hover:border-igp-blue hover:bg-igp-blue shadow-lg rounded-lg items-center text-center justify-center flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-lg py-2 mb-6"
            >
              Iniciar
            </router-link>
          </div>
        </div>
      </div>
      <div
        class="mt-10 sm:mt-10 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0 col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6 flex justify-center items-center order-1 sm:order-1 md:order-2 lg:order-2 xl:order-2 2xl:order-2"
      >
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
import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();
const dots = reactive([]);

const showContent = ref(false); // Controla el contenido principal
const showImageInGlobe = ref(false); // Controla cuándo mostrar la imagen final en el globo
const imageClass = ref("zoom-animation");

function generateDots(count) {
  for (let i = 0; i < count; i++) {
    const randomX = Math.random() * 100; // Porcentaje para posición horizontal
    const randomY = Math.random() * 100; // Porcentaje para posición vertical
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
        zIndex: 10,
      },
    });
  }
}

onMounted(async () => {
  // Ejecutar la animación primero
  await generateDots(100);
  setTimeout(() => {
    imageClass.value = "zoom-right-large";
    setTimeout(() => {
      showContent.value = true;
      showImageInGlobe.value = true;
    }, 2000); // Tiempo para que aparezca el contenido
  }, 1000);

  // Cargar datos en segundo plano sin bloquear la animación
  if (dataStore.combinedData.length === 0) {
    dataStore.fetchDataPeru();
  }
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
  margin-top: 199px;
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
  z-index: 10;
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
#acercade {
  background: linear-gradient(to right, #0b0d92 50%, #000000 120%);
}
</style>
