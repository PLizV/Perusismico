<template>
  <div>
    <div
      v-show="showContent"
      class="z-10 relative bg-white px-4 sm:px-10 md:px-10 lg:px-10 xl:px-10 2xl:px-10 shadow-[0px_4px_4px_0px_#00000024]"
    >
      <theader></theader>
    </div>
    <div
      class="fixed inset-0 bg-cover bg-[url(//unpkg.com/three-globe/example/img/night-sky.png)] h-full w-full flex items-center bg-no-repeat"
      style="background-position: center bottom 80%"
    >
      <!-- Imagen central pequeña con efecto de zoom y movimiento a la derecha -->
      <div
        v-if="!showContent"
        class="absolute inset-0 flex justify-center items-center"
      >
        <img
          src="https://s3-alpha-sig.figma.com/img/682a/9f8d/19703eb90dc816e2f5d89e658917d25f?Expires=1732492800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b6xZM~P3W88TRSPhyATrizo9ozx8Xi7-fiZLvDcZ-X9simYH3tPLhNhiuf6l6uLvQ66Cow43RCAm-oEchv7pY6Idbql7yVAGJEErZ0rTXgwWOQfiUrQMqted~z4~uz0D87SyqDjEffdhzdpKII4rcXke2YrDcM0c9ZbXyF2-hN3YU3vPe8LlM3~CIn-2EHBh63D3dRlZ~VhVPfClhV4SNhOnuRiSU2qH5bvSGzPJzTpWRRKjpb2oLwFgsAF99SxVFsMvxz8c3aph2E3ap5WN9Tyt-Ou6gn0~clb1LJRR7JRxyrUk35-1-3HNm8Ao6-5b~ZClzIxKI3LZXQrbIWXomQ__"
          alt="Descripción del GIF"
          :class="imageClass"
        />
      </div>
    </div>
    <!-- Contenido que aparece con efecto de barras aleatorias -->
    <main
      v-show="showContent"
      class="grid grid-cols-1 md:grid-cols-12 transition-opacity duration-1000 relative"
      style="height: calc(100vh - 4.25rem)"
    >
      <div
        class="col-span-12 md:col-span-5 py-8 px-4 md:px-20 bg-center bg-cover"
      >
        <div
          class="grid grid-cols-12 px-4 py-4 rounded-2xl select-none bg-center bg-cover"
        >
          <!-- Texto de bienvenida con animación de barras -->
          <p
            class="col-span-12 text-igp-white text-7xl md:text-8xl font-bold leading-none fade-bar"
            style="--delay: 0.1s"
          >
            Perú
            <br />
            <span
              class="italic font-medium block"
              style="
                background: linear-gradient(to top, grey, white);
                background-clip: text;
                -webkit-text-fill-color: transparent;
              "
              >Sísmico</span
            >
          </p>
          <p
            class="col-span-12 font-light pt-4 text-igp-white text-sm sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3 fade-bar"
            style="line-height: 2; --delay: 0.3s"
          >
            <span class="font-medium">PerúSis </span>es una plataforma digital
            de observación sísmica desarrollada por el
            <span class="font-medium">Instituto Geofísico del Perú (IGP)</span>,
            que ofrece acceso espacio-temporal a la actividad sísmica ocurrida
            en el Perú y en el mundo, de manera visual e interactiva.
          </p>
          <p
            class="col-span-12 font-light pt-4 text-igp-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3 fade-bar"
            style="line-height: 2; --delay: 0.5s"
          >
            Con una interfaz intuitiva, PerúSis permite filtrar sismos por
            fecha, región, magnitud y profundidad, facilitando el análisis y
            consulta de eventos sísmicos. Esto la convierte en una herramienta
            clave para conocer las regiones potencialmente sísmicas y gestionar
            la educación del riesgo.
          </p>
          <p
            class="col-span-12 font-light pt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3 fade-bar"
            style="line-height: 2; --delay: 0.7s"
          >
            En Perú utiliza información del
            <span class="font-medium"
              >Centro Sismológico Nacional (CENSIS)</span
            >
            y, a nivel mundial, del
            <span class="font-medium"
              >National Earthquake Information Center (NEIC)</span
            >
            de la U.S
            <span class="font-medium">U.S Geological Survey (USGS)</span>
          </p>

          <div
            class="col-span-12 flex flex-col md:flex-row py-6 mt-4 fade-bar"
            style="--delay: 0.9s"
          >
            <router-link
              to="/visor"
              class="bg-igp-blue text-igp-white px-16 hover:bg-igp-blue-600 shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Iniciar
            </router-link>
            <router-link
              to="/creditos"
              class="bg-igp-white text-igp-blue px-16 hover:bg-igp-dark-50 border ml-4 border-igp-blue shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Créditos
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-7 flex justify-center items-center">
        <img
          v-show="showContent"
          src="https://s3-alpha-sig.figma.com/img/682a/9f8d/19703eb90dc816e2f5d89e658917d25f?Expires=1732492800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b6xZM~P3W88TRSPhyATrizo9ozx8Xi7-fiZLvDcZ-X9simYH3tPLhNhiuf6l6uLvQ66Cow43RCAm-oEchv7pY6Idbql7yVAGJEErZ0rTXgwWOQfiUrQMqted~z4~uz0D87SyqDjEffdhzdpKII4rcXke2YrDcM0c9ZbXyF2-hN3YU3vPe8LlM3~CIn-2EHBh63D3dRlZ~VhVPfClhV4SNhOnuRiSU2qH5bvSGzPJzTpWRRKjpb2oLwFgsAF99SxVFsMvxz8c3aph2E3ap5WN9Tyt-Ou6gn0~clb1LJRR7JRxyrUk35-1-3HNm8Ao6-5b~ZClzIxKI3LZXQrbIWXomQ__"
          alt="Descripción del GIF"
          style="width: 75%"
          class="h-auto rounded-lg mb-4"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import theader from "@/components/ui/atoms/t-header.vue";
import { ref, onMounted } from "vue";

const showContent = ref(false);
const imageClass = ref("zoom-animation");

onMounted(() => {
  setTimeout(() => {
    imageClass.value = "zoom-right-large"; // Activa el zoom y movimiento de la imagen
    setTimeout(() => {
      showContent.value = true; // Muestra el contenido al completar el zoom
    }, 2000); // Sincroniza el tiempo con el efecto de zoom
  }, 1000); // Inicia la animación de zoom después de 1 segundo
});
</script>

<style scoped>
.zoom-animation {
  transform: scale(0.5); /* Imagen pequeña centrada */
  transition: transform 2s ease;
}

.zoom-right-large {
  transform: scale(1.2) translateX(50%); /* Zoom a tamaño completo y mueve a la derecha */
  transition: transform 2s ease;
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
</style>