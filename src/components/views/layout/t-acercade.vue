<template>
  <div class="about-page">
    <div
      v-show="showContent"
      class="z-10 relative bg-white px-4 sm:px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
    >
      <theader></theader>
    </div>

    <div id="acercade" class="about-background" aria-hidden="true"></div>

    <div
      class="hero-globe"
      :class="{ 'intro-globe--docked': globeDocked }"
      aria-hidden="true"
    >
      <div class="planet-shell">
        <span class="seismic-wave seismic-wave--one"></span>
        <span class="seismic-wave seismic-wave--two"></span>
        <span class="seismic-wave seismic-wave--three"></span>
        <span class="fault-trace fault-trace--one"></span>
        <span class="fault-trace fault-trace--two"></span>
        <span class="fault-trace fault-trace--three"></span>
        <span class="quake-ping quake-ping--one"></span>
        <span class="quake-ping quake-ping--two"></span>
        <span class="quake-ping quake-ping--three"></span>
        <span class="planet-orbit planet-orbit--one"></span>
        <span class="planet-orbit planet-orbit--two"></span>
        <span class="planet-orbit planet-orbit--three"></span>
        <img src="/img/globo.gif" alt="" class="globe-image" decoding="async" />
      </div>
    </div>

    <!-- Contenido que aparece con efecto de barras aleatorias -->
    <main
      v-show="showContent"
      class="about-main grid grid-cols-12 transition-opacity duration-1000 relative z-[2]"
    >
      <div
        class="about-copy-section col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6 w-full min-w-0 px-8 sm:px-16 md:px-10 lg:px-12 xl:px-20 2xl:px-32 bg-center bg-cover order-2 sm:order-2 md:order-1 lg:order-1 xl:order-1 1xl:order-1 flex justify-center items-start sm:items-start md:items-center lg:items-center xl:items-center 2xl:items-center"
      >
        <div
          class="about-copy grid grid-cols-12 w-full max-w-[680px] min-w-0 pt-16 md:pt-0 rounded-2xl select-none bg-center bg-cover"
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
              class="bg-igp-white font-semibold text-igp-blue px-10 sm:px-16 md:px-20 border-igp-white border hover:text-igp-white hover:border-igp-blue hover:bg-igp-blue shadow-lg rounded-lg items-center text-center justify-center flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-lg py-2 mb-6 transition-colors"
            >
              Iniciar
            </router-link>
          </div>
        </div>
      </div>
      <div
        class="about-visual-section col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6 flex justify-center items-center order-1 sm:order-1 md:order-2 lg:order-2 xl:order-2 2xl:order-2"
      >
        <div class="visual-anchor" aria-hidden="true"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import theader from "@/components/ui/atoms/t-header.vue";
import { ref, onMounted } from "vue";
import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();

const showContent = ref(false); // Controla el contenido principal
const globeDocked = ref(false);

onMounted(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    showContent.value = true;
    globeDocked.value = true;
  } else {
    setTimeout(() => {
      globeDocked.value = true;
    }, 650);

    setTimeout(() => {
      showContent.value = true;
    }, 1250);
  }

  // Cargar datos en segundo plano sin bloquear la animación
  if (dataStore.combinedData.length === 0) {
    dataStore.fetchDataPeru();
  }
});
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  background: #02081a;
}

.about-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: linear-gradient(
      90deg,
      rgba(0, 7, 23, 0.72) 0%,
      rgba(0, 18, 52, 0.54) 46%,
      rgba(0, 4, 17, 0.76) 100%
    ),
    url("/img/bg1.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.about-main {
  min-height: calc(100vh - 4.25rem);
}

.about-copy {
  max-width: 680px;
  min-width: 0;
  width: 100%;
}

.about-visual-section {
  min-height: calc(100vh - 4.25rem);
  min-width: 0;
}

.visual-anchor {
  aspect-ratio: 1;
  width: min(88%, 740px);
}

.hero-globe {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 16px 34px rgba(0, 0, 0, 0.34));
  contain: layout paint;
  left: 50vw;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  top: 50vh;
  transform: translate3d(-50%, -50%, 0) scale(0.56);
  transition: left 1.55s cubic-bezier(0.22, 1, 0.36, 1),
    top 1.55s cubic-bezier(0.22, 1, 0.36, 1),
    width 1.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 1.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease;
  width: clamp(320px, 45vw, 700px);
  will-change: left, top, transform, width, opacity;
  z-index: 3;
  animation: globeFadeIn 0.55s ease-out forwards;
}

.intro-globe--docked {
  left: 75vw;
  top: calc(50vh + 2.125rem);
  transform: translate3d(-50%, -50%, 0) scale(1);
  width: clamp(420px, 44vw, 760px);
}

.planet-shell {
  aspect-ratio: 1;
  isolation: isolate;
  position: relative;
  width: 100%;
}

.globe-image {
  display: block;
  height: 100%;
  position: relative;
  width: 100%;
  z-index: 4;
}

.globe-image {
  object-fit: contain;
  object-position: center;
  transform: translateZ(0);
}

.planet-orbit {
  border: 1px solid rgba(109, 213, 255, 0.32);
  border-left-color: transparent;
  border-right-color: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  inset: 8%;
  opacity: 0;
  position: absolute;
  transform: rotate(-16deg) scale(1.02);
  z-index: 3;
  animation: orbitReveal 1.1s ease 1.45s forwards,
    orbitDrift 9s linear 1.45s infinite;
}

.planet-orbit--one {
  inset: 6%;
}

.planet-orbit--two {
  animation-duration: 1.1s, 13s;
  border-color: rgba(72, 225, 255, 0.22);
  border-bottom-color: transparent;
  inset: 12%;
  transform: rotate(28deg) scaleX(1.2) scaleY(0.72);
}

.planet-orbit--three {
  animation-duration: 1.1s, 16s;
  border-color: rgba(255, 255, 255, 0.14);
  border-top-color: rgba(72, 225, 255, 0.35);
  inset: 1%;
  transform: rotate(56deg) scaleX(1.08) scaleY(0.86);
}

.seismic-wave {
  --ring-rotate: 0deg;
  animation: seismicWave 4.8s ease-out infinite;
  border: 1px solid rgba(74, 221, 255, 0.32);
  border-radius: 50%;
  box-shadow: 0 0 24px rgba(37, 173, 255, 0.16);
  inset: -10%;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transform: scale(0.72) rotate(var(--ring-rotate));
  z-index: 0;
}

.seismic-wave--two {
  --ring-rotate: 18deg;
  animation-delay: 1.35s;
  border-color: rgba(0, 224, 181, 0.26);
  inset: -18%;
}

.seismic-wave--three {
  --ring-rotate: -24deg;
  animation-delay: 2.6s;
  border-color: rgba(255, 255, 255, 0.2);
  inset: -27%;
}

.fault-trace {
  animation: faultSweep 7s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 72, 72, 0.8),
    rgba(89, 232, 255, 0.44),
    transparent
  );
  background-size: 220% 100%;
  height: 1px;
  opacity: 0.28;
  pointer-events: none;
  position: absolute;
  width: 70%;
  z-index: 1;
}

.fault-trace--one {
  left: 9%;
  top: 35%;
  transform: rotate(-28deg);
}

.fault-trace--two {
  animation-delay: 1.7s;
  right: 4%;
  top: 62%;
  transform: rotate(20deg);
  width: 58%;
}

.fault-trace--three {
  animation-delay: 3.2s;
  left: 18%;
  top: 76%;
  transform: rotate(-9deg);
  width: 50%;
}

.quake-ping {
  animation: quakePing 3.7s ease-out infinite;
  border: 1px solid rgba(255, 74, 74, 0.72);
  border-radius: 50%;
  height: 3.8%;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  width: 3.8%;
  z-index: 2;
}

.quake-ping--one {
  left: 28%;
  top: 36%;
}

.quake-ping--two {
  animation-delay: 1.25s;
  border-color: rgba(0, 224, 181, 0.76);
  right: 23%;
  top: 58%;
}

.quake-ping--three {
  animation-delay: 2.45s;
  border-color: rgba(74, 117, 255, 0.78);
  left: 55%;
  top: 25%;
}

.fade-bar {
  opacity: 0;
  transform: translateY(50px); /* Efecto de barra hacia arriba */
  animation: fadeInBars 1.5s ease forwards;
  animation-delay: var(--delay);
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

@keyframes globeFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes orbitReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8;
  }
}

@keyframes orbitDrift {
  to {
    rotate: 360deg;
  }
}

@keyframes seismicWave {
  0% {
    opacity: 0;
    transform: scale(0.72) rotate(var(--ring-rotate));
  }
  16% {
    opacity: 0.62;
  }
  68% {
    opacity: 0.16;
  }
  100% {
    opacity: 0;
    transform: scale(1.12) rotate(var(--ring-rotate));
  }
}

@keyframes faultSweep {
  0%,
  100% {
    background-position: 0% 50%;
    opacity: 0.16;
  }
  45% {
    background-position: 100% 50%;
    opacity: 0.72;
  }
}

@keyframes quakePing {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  18% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: scale(5.4);
  }
}

@media (max-width: 767px) {
  .about-page {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .about-main {
    min-height: auto;
  }

  .about-copy-section {
    padding-top: 0;
    padding-bottom: 3rem;
  }

  .about-copy {
    padding-top: 0 !important;
  }

  .about-visual-section {
    display: none;
  }

  .hero-globe {
    margin: clamp(1.75rem, 5vh, 3rem) auto clamp(2rem, 5vh, 3rem);
    left: 50%;
    position: relative;
    top: auto;
    transform: none;
    width: clamp(260px, 78vw, 380px);
    z-index: 1;
  }

  .intro-globe--docked {
    left: auto;
    top: auto;
    transform: none;
    width: clamp(275px, 78vw, 380px);
  }

  .visual-anchor {
    width: min(74vw, 370px);
  }

  .planet-orbit {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-globe,
  .planet-orbit,
  .seismic-wave,
  .fault-trace,
  .quake-ping,
  .fade-bar,
  .theader-animation {
    animation: none;
    transition: none;
  }

  .fade-bar,
  .theader-animation {
    opacity: 1;
    transform: none;
  }

  .hero-globe {
    opacity: 1;
  }

  .planet-orbit {
    opacity: 0.42;
  }

  .seismic-wave {
    opacity: 0.18;
    transform: scale(1) rotate(var(--ring-rotate));
  }

  .fault-trace {
    opacity: 0.26;
  }
}
</style>
